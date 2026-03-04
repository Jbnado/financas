import { Test, TestingModule } from "@nestjs/testing";
import { ReceivableController } from "./receivable.controller.js";
import { ReceivableService } from "./receivable.service.js";

const mockService = {
  createPayment: jest.fn(),
  findByPerson: jest.fn(),
  getSummary: jest.fn(),
};

describe("ReceivableController", () => {
  let controller: ReceivableController;
  const userId = "user-uuid-1";
  const mockReq = { user: { id: userId } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceivableController],
      providers: [{ provide: ReceivableService, useValue: mockService }],
    }).compile();

    controller = module.get<ReceivableController>(ReceivableController);
    jest.clearAllMocks();
  });

  describe("POST /receivables/:id/payments", () => {
    it("should create a payment and return it", async () => {
      const dto = { amount: "50.00", paidAt: "2026-03-04" };
      const expected = { id: "pay-1", receivableId: "rec-1", amount: "50.00" };
      mockService.createPayment.mockResolvedValue(expected);

      const result = await controller.createPayment(mockReq, "rec-1", dto);

      expect(result).toEqual(expected);
      expect(mockService.createPayment).toHaveBeenCalledWith(
        userId,
        "rec-1",
        dto,
      );
    });
  });

  describe("GET /persons/:personId/receivables", () => {
    it("should return receivables for a person", async () => {
      const expected = [
        { id: "rec-1", personId: "person-1", amount: "100.00", status: "pending" },
      ];
      mockService.findByPerson.mockResolvedValue(expected);

      const result = await controller.findByPerson(mockReq, "person-1");

      expect(result).toEqual(expected);
      expect(mockService.findByPerson).toHaveBeenCalledWith(userId, "person-1", undefined);
    });
  });

  describe("GET /receivables/summary", () => {
    it("should return summary consolidated by person", async () => {
      const expected = [
        {
          personId: "person-1",
          personName: "Joao",
          totalPending: "250.00",
          totalPaid: "50.00",
        },
      ];
      mockService.getSummary.mockResolvedValue(expected);

      const result = await controller.getSummary(mockReq);

      expect(result).toEqual(expected);
      expect(mockService.getSummary).toHaveBeenCalledWith(userId, undefined);
    });
  });
});
