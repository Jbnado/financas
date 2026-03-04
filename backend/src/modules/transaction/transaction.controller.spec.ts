import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { TransactionController } from "./transaction.controller.js";
import { TransactionService } from "./transaction.service.js";

const mockService = {
  create: jest.fn(),
  findAllByCycle: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  togglePaid: jest.fn(),
};

function mockReq(userId = "user-uuid-1") {
  return { user: { id: userId } } as any;
}

describe("TransactionController", () => {
  let controller: TransactionController;

  const mockTransaction = {
    id: "tx-uuid-1",
    description: "Supermercado",
    amount: "125.50",
    date: new Date("2026-03-01"),
    isPaid: false,
    userId: "user-uuid-1",
    billingCycleId: "cycle-uuid-1",
    categoryId: "cat-uuid-1",
    paymentMethodId: "pm-uuid-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [{ provide: TransactionService, useValue: mockService }],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    jest.clearAllMocks();
  });

  describe("POST /transactions", () => {
    it("should create a transaction", async () => {
      mockService.create.mockResolvedValue(mockTransaction);
      const dto = {
        description: "Supermercado",
        amount: "125.50",
        date: "2026-03-01T00:00:00.000Z",
        billingCycleId: "cycle-uuid-1",
        categoryId: "cat-uuid-1",
        paymentMethodId: "pm-uuid-1",
      };

      const result = await controller.create(mockReq(), dto);

      expect(result).toEqual(mockTransaction);
      expect(mockService.create).toHaveBeenCalledWith("user-uuid-1", dto);
    });

    it("should propagate BadRequestException for closed cycle", async () => {
      mockService.create.mockRejectedValue(
        new BadRequestException("Cannot add transaction to a closed billing cycle"),
      );

      await expect(
        controller.create(mockReq(), {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("GET /billing-cycles/:cycleId/transactions", () => {
    it("should return transactions for a cycle", async () => {
      mockService.findAllByCycle.mockResolvedValue([mockTransaction]);

      const result = await controller.findAllByCycle(
        mockReq(),
        "cycle-uuid-1",
        {},
      );

      expect(result).toEqual([mockTransaction]);
      expect(mockService.findAllByCycle).toHaveBeenCalledWith(
        "user-uuid-1",
        "cycle-uuid-1",
        {},
      );
    });

    it("should pass filters to service", async () => {
      mockService.findAllByCycle.mockResolvedValue([]);

      await controller.findAllByCycle(mockReq(), "cycle-uuid-1", {
        categoryId: "cat-uuid-1",
        isPaid: "true",
      });

      expect(mockService.findAllByCycle).toHaveBeenCalledWith(
        "user-uuid-1",
        "cycle-uuid-1",
        { categoryId: "cat-uuid-1", isPaid: true },
      );
    });
  });

  describe("GET /transactions/:id", () => {
    it("should return a transaction by id", async () => {
      mockService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(mockReq(), "tx-uuid-1");

      expect(result).toEqual(mockTransaction);
      expect(mockService.findOne).toHaveBeenCalledWith(
        "user-uuid-1",
        "tx-uuid-1",
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException("Transaction not found"),
      );

      await expect(
        controller.findOne(mockReq(), "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("PUT /transactions/:id", () => {
    it("should update a transaction", async () => {
      const updated = { ...mockTransaction, description: "Atualizado" };
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update(mockReq(), "tx-uuid-1", {
        description: "Atualizado",
      });

      expect(result.description).toBe("Atualizado");
      expect(mockService.update).toHaveBeenCalledWith(
        "user-uuid-1",
        "tx-uuid-1",
        { description: "Atualizado" },
      );
    });
  });

  describe("DELETE /transactions/:id", () => {
    it("should delete a transaction", async () => {
      mockService.remove.mockResolvedValue(mockTransaction);

      const result = await controller.remove(mockReq(), "tx-uuid-1");

      expect(result).toEqual(mockTransaction);
      expect(mockService.remove).toHaveBeenCalledWith(
        "user-uuid-1",
        "tx-uuid-1",
      );
    });
  });

  describe("PATCH /transactions/:id/toggle-paid", () => {
    it("should toggle paid status", async () => {
      const toggled = { ...mockTransaction, isPaid: true };
      mockService.togglePaid.mockResolvedValue(toggled);

      const result = await controller.togglePaid(mockReq(), "tx-uuid-1");

      expect(result.isPaid).toBe(true);
      expect(mockService.togglePaid).toHaveBeenCalledWith(
        "user-uuid-1",
        "tx-uuid-1",
      );
    });
  });
});
