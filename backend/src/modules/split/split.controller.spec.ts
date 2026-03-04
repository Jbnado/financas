import { Test, TestingModule } from "@nestjs/testing";
import { SplitController } from "./split.controller.js";
import { SplitService } from "./split.service.js";

const mockService = {
  createSplits: jest.fn(),
  replaceSplits: jest.fn(),
  findByTransaction: jest.fn(),
};

describe("SplitController", () => {
  let controller: SplitController;
  const userId = "user-uuid-1";
  const transactionId = "tx-uuid-1";
  const mockReq = { user: { id: userId } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SplitController],
      providers: [{ provide: SplitService, useValue: mockService }],
    }).compile();

    controller = module.get<SplitController>(SplitController);
    jest.clearAllMocks();
  });

  describe("POST /transactions/:id/splits", () => {
    it("should create splits and return result", async () => {
      const dto = {
        splits: [{ personId: "person-1", amount: "100.00" }],
      };
      const expected = {
        splits: [{ id: "split-1", personId: "person-1", amount: "100.00" }],
        userAmount: "200.00",
      };

      mockService.createSplits.mockResolvedValue(expected);

      const result = await controller.createSplits(mockReq, transactionId, dto);

      expect(result).toEqual(expected);
      expect(mockService.createSplits).toHaveBeenCalledWith(
        userId,
        transactionId,
        dto,
      );
    });
  });

  describe("PUT /transactions/:id/splits", () => {
    it("should replace splits and return result", async () => {
      const dto = {
        splits: [{ personId: "person-1", amount: "150.00" }],
      };
      const expected = {
        splits: [{ id: "split-2", personId: "person-1", amount: "150.00" }],
        userAmount: "150.00",
      };

      mockService.replaceSplits.mockResolvedValue(expected);

      const result = await controller.replaceSplits(mockReq, transactionId, dto);

      expect(result).toEqual(expected);
      expect(mockService.replaceSplits).toHaveBeenCalledWith(
        userId,
        transactionId,
        dto,
      );
    });
  });

  describe("GET /transactions/:id/splits", () => {
    it("should return splits with userAmount", async () => {
      const expected = {
        splits: [
          {
            id: "split-1",
            personId: "person-1",
            amount: "100.00",
            person: { id: "person-1", name: "Joao" },
            receivables: [],
          },
        ],
        userAmount: "200.00",
      };

      mockService.findByTransaction.mockResolvedValue(expected);

      const result = await controller.findByTransaction(mockReq, transactionId);

      expect(result).toEqual(expected);
      expect(mockService.findByTransaction).toHaveBeenCalledWith(
        userId,
        transactionId,
      );
    });
  });
});
