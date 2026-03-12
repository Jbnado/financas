import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { TransactionService } from "./transaction.service.js";
import { InstallmentService } from "./installment.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const mockPrisma = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  billingCycle: {
    findFirst: jest.fn(),
  },
};

const mockInstallmentService = {
  distributeAmount: jest.fn(),
  createInstallments: jest.fn(),
};

describe("TransactionService", () => {
  let service: TransactionService;
  const userId = "user-uuid-1";

  const mockCycleOpen = {
    id: "cycle-uuid-1",
    userId,
    name: "Marco 2026",
    status: "open",
  };

  const mockCycleClosed = {
    id: "cycle-uuid-2",
    userId,
    name: "Fevereiro 2026",
    status: "closed",
  };

  const mockTransaction = {
    id: "tx-uuid-1",
    description: "Supermercado",
    amount: "125.50",
    date: new Date("2026-03-01"),
    isPaid: false,
    installmentNumber: null,
    totalInstallments: null,
    userId,
    billingCycleId: "cycle-uuid-1",
    categoryId: "cat-uuid-1",
    paymentMethodId: "pm-uuid-1",
    parentTransactionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: "cat-uuid-1", name: "Alimentação" },
    paymentMethod: { id: "pm-uuid-1", name: "Nubank" },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: InstallmentService, useValue: mockInstallmentService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createDto = {
      description: "Supermercado",
      amount: "125.50",
      date: "2026-03-01T00:00:00.000Z",
      billingCycleId: "cycle-uuid-1",
      categoryId: "cat-uuid-1",
      paymentMethodId: "pm-uuid-1",
    };

    it("should create a transaction in an open cycle", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycleOpen);
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.billingCycle.findFirst).toHaveBeenCalledWith({
        where: { id: "cycle-uuid-1", userId },
      });
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: "Supermercado",
          amount: "125.50",
          userId,
          billingCycleId: "cycle-uuid-1",
          categoryId: "cat-uuid-1",
          paymentMethodId: "pm-uuid-1",
        }),
        include: { category: true, paymentMethod: true },
      });
    });

    it("should accept client-generated UUID", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycleOpen);
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      await service.create(userId, {
        ...createDto,
        id: "client-uuid-1",
      });

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: "client-uuid-1" }),
        include: { category: true, paymentMethod: true },
      });
    });

    it("should throw NotFoundException when cycle not found", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(null);

      await expect(service.create(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when cycle is closed", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycleClosed);

      await expect(service.create(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should create installments when totalInstallments > 1", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycleOpen);
      mockInstallmentService.distributeAmount.mockReturnValue([
        "333.34",
        "333.33",
        "333.33",
      ]);
      const parentTx = {
        ...mockTransaction,
        id: "tx-parent-1",
        installmentNumber: 1,
        totalInstallments: 3,
        amount: "333.34",
      };
      mockPrisma.transaction.create.mockResolvedValue(parentTx);
      mockInstallmentService.createInstallments.mockResolvedValue([]);

      const result = await service.create(userId, {
        ...createDto,
        amount: "1000.00",
        totalInstallments: 3,
      });

      expect(result).toEqual(parentTx);
      expect(mockInstallmentService.distributeAmount).toHaveBeenCalledWith(
        "1000.00",
        3,
      );
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: "333.34",
          installmentNumber: 1,
          totalInstallments: 3,
        }),
        include: { category: true, paymentMethod: true },
      });
      expect(mockInstallmentService.createInstallments).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ id: "tx-parent-1" }),
        "1000.00",
        3,
        "cycle-uuid-1",
      );
    });

    it("should not create installments for simple transactions", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycleOpen);
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      await service.create(userId, createDto);

      expect(mockInstallmentService.createInstallments).not.toHaveBeenCalled();
    });
  });

  describe("findAllByCycle", () => {
    const expectedInclude = {
      category: true,
      paymentMethod: true,
      splits: {
        select: {
          id: true,
          amount: true,
          person: { select: { id: true, name: true } },
        },
      },
    };

    it("should return transactions for a cycle ordered by date desc", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await service.findAllByCycle(userId, "cycle-uuid-1");

      expect(result).toEqual([mockTransaction]);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId, billingCycleId: "cycle-uuid-1" },
        include: expectedInclude,
        orderBy: { date: "desc" },
      });
    });

    it("should apply categoryId filter", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      await service.findAllByCycle(userId, "cycle-uuid-1", {
        categoryId: "cat-uuid-1",
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          billingCycleId: "cycle-uuid-1",
          categoryId: "cat-uuid-1",
        },
        include: expectedInclude,
        orderBy: { date: "desc" },
      });
    });

    it("should apply isPaid filter", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.findAllByCycle(userId, "cycle-uuid-1", {
        isPaid: true,
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          billingCycleId: "cycle-uuid-1",
          isPaid: true,
        },
        include: expectedInclude,
        orderBy: { date: "desc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a transaction by id with userAmount", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        splits: [],
      });

      const result = await service.findOne(userId, "tx-uuid-1");

      expect(result.id).toBe("tx-uuid-1");
      expect(result.userAmount).toBe("125.50");
      expect(result.splits).toEqual([]);
    });

    it("should throw NotFoundException when transaction not found", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    const updateDto = { description: "Supermercado Atualizado" };

    it("should update a transaction in an open cycle", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        billingCycle: mockCycleOpen,
      });
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        description: "Supermercado Atualizado",
      });

      const result = await service.update(userId, "tx-uuid-1", updateDto);

      expect(result.description).toBe("Supermercado Atualizado");
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: "tx-uuid-1" },
        data: { description: "Supermercado Atualizado" },
        include: { category: true, paymentMethod: true },
      });
    });

    it("should throw NotFoundException when transaction not found for update", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when cycle is closed", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        billingCycle: mockCycleClosed,
      });

      await expect(
        service.update(userId, "tx-uuid-1", updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("remove", () => {
    it("should hard-delete a simple transaction", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        billingCycle: mockCycleOpen,
      });
      mockPrisma.transaction.delete.mockResolvedValue(mockTransaction);

      const result = await service.remove(userId, "tx-uuid-1");

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: "tx-uuid-1" },
      });
      expect(mockPrisma.transaction.deleteMany).not.toHaveBeenCalled();
    });

    it("should delete unpaid children when removing parent installment", async () => {
      const parentTx = {
        ...mockTransaction,
        totalInstallments: 3,
        installmentNumber: 1,
        parentTransactionId: null,
        billingCycle: mockCycleOpen,
      };
      mockPrisma.transaction.findFirst.mockResolvedValue(parentTx);
      mockPrisma.transaction.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.transaction.delete.mockResolvedValue(parentTx);

      await service.remove(userId, "tx-uuid-1");

      expect(mockPrisma.transaction.deleteMany).toHaveBeenCalledWith({
        where: { parentTransactionId: "tx-uuid-1", isPaid: false },
      });
      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: "tx-uuid-1" },
      });
    });

    it("should throw BadRequestException when cycle is closed", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        billingCycle: mockCycleClosed,
      });

      await expect(service.remove(userId, "tx-uuid-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw NotFoundException when transaction not found", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("togglePaid", () => {
    it("should toggle isPaid from false to true", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        isPaid: true,
      });

      const result = await service.togglePaid(userId, "tx-uuid-1");

      expect(result.isPaid).toBe(true);
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: "tx-uuid-1" },
        data: { isPaid: true },
        include: { category: true, paymentMethod: true },
      });
    });

    it("should toggle isPaid from true to false", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        isPaid: true,
      });
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        isPaid: false,
      });

      const result = await service.togglePaid(userId, "tx-uuid-1");

      expect(result.isPaid).toBe(false);
    });

    it("should throw NotFoundException when transaction not found", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.togglePaid(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
