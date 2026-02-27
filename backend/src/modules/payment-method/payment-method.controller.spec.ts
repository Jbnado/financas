import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PaymentMethodController } from "./payment-method.controller.js";
import { PaymentMethodService } from "./payment-method.service.js";

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

function mockReq(userId = "user-uuid-1") {
  return { user: { id: userId } } as any;
}

describe("PaymentMethodController", () => {
  let controller: PaymentMethodController;

  const mockPaymentMethod = {
    id: "pm-uuid-1",
    userId: "user-uuid-1",
    name: "Nubank",
    type: "credit",
    dueDay: 15,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodController],
      providers: [{ provide: PaymentMethodService, useValue: mockService }],
    }).compile();

    controller = module.get<PaymentMethodController>(PaymentMethodController);
    jest.clearAllMocks();
  });

  describe("POST /payment-methods", () => {
    it("should create a payment method", async () => {
      mockService.create.mockResolvedValue(mockPaymentMethod);

      const dto = { name: "Nubank", type: "credit" as const, dueDay: 15 };
      const result = await controller.create(mockReq(), dto);

      expect(result).toEqual(mockPaymentMethod);
      expect(mockService.create).toHaveBeenCalledWith("user-uuid-1", dto);
    });
  });

  describe("GET /payment-methods", () => {
    it("should return list of active payment methods", async () => {
      mockService.findAll.mockResolvedValue([mockPaymentMethod]);

      const result = await controller.findAll(mockReq());

      expect(result).toEqual([mockPaymentMethod]);
      expect(mockService.findAll).toHaveBeenCalledWith("user-uuid-1");
    });
  });

  describe("PUT /payment-methods/:id", () => {
    it("should update a payment method", async () => {
      mockService.update.mockResolvedValue({
        ...mockPaymentMethod,
        name: "Nubank Gold",
      });

      const result = await controller.update(mockReq(), "pm-uuid-1", {
        name: "Nubank Gold",
      });

      expect(result.name).toBe("Nubank Gold");
      expect(mockService.update).toHaveBeenCalledWith(
        "user-uuid-1",
        "pm-uuid-1",
        { name: "Nubank Gold" },
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException("Payment method not found"),
      );

      await expect(
        controller.update(mockReq(), "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("DELETE /payment-methods/:id", () => {
    it("should soft-delete a payment method", async () => {
      mockService.remove.mockResolvedValue({
        ...mockPaymentMethod,
        isActive: false,
      });

      const result = await controller.remove(mockReq(), "pm-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockService.remove).toHaveBeenCalledWith(
        "user-uuid-1",
        "pm-uuid-1",
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException("Payment method not found"),
      );

      await expect(
        controller.remove(mockReq(), "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
