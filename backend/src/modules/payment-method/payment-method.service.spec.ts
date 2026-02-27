import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PaymentMethodService } from "./payment-method.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const mockPrisma = {
  paymentMethod: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe("PaymentMethodService", () => {
  let service: PaymentMethodService;
  const userId = "user-uuid-1";

  const mockPaymentMethod = {
    id: "pm-uuid-1",
    userId,
    name: "Nubank",
    type: "credit",
    dueDay: 15,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentMethodService>(PaymentMethodService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a credit payment method with dueDay", async () => {
      mockPrisma.paymentMethod.create.mockResolvedValue(mockPaymentMethod);

      const dto = { name: "Nubank", type: "credit" as const, dueDay: 15 };
      const result = await service.create(userId, dto);

      expect(result).toEqual(mockPaymentMethod);
      expect(mockPrisma.paymentMethod.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: "Nubank",
          type: "credit",
          dueDay: 15,
        },
      });
    });

    it("should create a debit payment method without dueDay", async () => {
      const debitMethod = { ...mockPaymentMethod, type: "debit", dueDay: null };
      mockPrisma.paymentMethod.create.mockResolvedValue(debitMethod);

      const dto = { name: "Conta Corrente", type: "debit" as const };
      const result = await service.create(userId, dto);

      expect(result).toEqual(debitMethod);
      expect(mockPrisma.paymentMethod.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: "Conta Corrente",
          type: "debit",
        },
      });
    });
  });

  describe("findAll", () => {
    it("should return active payment methods ordered by name", async () => {
      mockPrisma.paymentMethod.findMany.mockResolvedValue([mockPaymentMethod]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockPaymentMethod]);
      expect(mockPrisma.paymentMethod.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a payment method by id", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(mockPaymentMethod);

      const result = await service.findOne(userId, "pm-uuid-1");

      expect(result).toEqual(mockPaymentMethod);
      expect(mockPrisma.paymentMethod.findFirst).toHaveBeenCalledWith({
        where: { id: "pm-uuid-1", userId },
      });
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a payment method", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(mockPaymentMethod);
      mockPrisma.paymentMethod.update.mockResolvedValue({
        ...mockPaymentMethod,
        name: "Nubank Gold",
      });

      const result = await service.update(userId, "pm-uuid-1", {
        name: "Nubank Gold",
      });

      expect(result.name).toBe("Nubank Gold");
      expect(mockPrisma.paymentMethod.update).toHaveBeenCalled();
    });

    it("should clear dueDay when set to null", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(mockPaymentMethod);
      mockPrisma.paymentMethod.update.mockResolvedValue({
        ...mockPaymentMethod,
        dueDay: null,
      });

      const result = await service.update(userId, "pm-uuid-1", {
        dueDay: null,
      });

      expect(result.dueDay).toBeNull();
      expect(mockPrisma.paymentMethod.update).toHaveBeenCalledWith({
        where: { id: "pm-uuid-1" },
        data: { dueDay: null },
      });
    });

    it("should throw NotFoundException when payment method not found", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove (soft-delete)", () => {
    it("should soft-delete a payment method", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(mockPaymentMethod);
      mockPrisma.paymentMethod.update.mockResolvedValue({
        ...mockPaymentMethod,
        isActive: false,
      });

      const result = await service.remove(userId, "pm-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockPrisma.paymentMethod.update).toHaveBeenCalledWith({
        where: { id: "pm-uuid-1" },
        data: { isActive: false },
      });
    });

    it("should throw NotFoundException when payment method not found", async () => {
      mockPrisma.paymentMethod.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
