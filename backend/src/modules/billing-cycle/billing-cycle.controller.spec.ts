import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { BillingCycleController } from "./billing-cycle.controller.js";
import { BillingCycleService } from "./billing-cycle.service.js";

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

function mockReq(userId = "user-uuid-1") {
  return { user: { id: userId } } as any;
}

describe("BillingCycleController", () => {
  let controller: BillingCycleController;

  const mockCycle = {
    id: "cycle-uuid-1",
    userId: "user-uuid-1",
    name: "Fevereiro 2026",
    startDate: new Date("2026-01-25"),
    endDate: new Date("2026-02-24"),
    salary: "7300.00",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingCycleController],
      providers: [{ provide: BillingCycleService, useValue: mockService }],
    }).compile();

    controller = module.get<BillingCycleController>(BillingCycleController);
    jest.clearAllMocks();
  });

  describe("POST /billing-cycles", () => {
    it("should create a billing cycle", async () => {
      mockService.create.mockResolvedValue(mockCycle);

      const dto = {
        name: "Fevereiro 2026",
        startDate: "2026-01-25T00:00:00.000Z",
        endDate: "2026-02-24T00:00:00.000Z",
        salary: "7300.00",
      };

      const result = await controller.create(mockReq(), dto);

      expect(result).toEqual(mockCycle);
      expect(mockService.create).toHaveBeenCalledWith("user-uuid-1", dto);
    });
  });

  describe("GET /billing-cycles", () => {
    it("should return list of cycles", async () => {
      mockService.findAll.mockResolvedValue([mockCycle]);

      const result = await controller.findAll(mockReq());

      expect(result).toEqual([mockCycle]);
      expect(mockService.findAll).toHaveBeenCalledWith("user-uuid-1");
    });
  });

  describe("GET /billing-cycles/:id", () => {
    it("should return cycle with summary", async () => {
      const cycleWithSummary = {
        ...mockCycle,
        summary: {
          salary: "7300.00",
          totalCards: "0.00",
          totalFixed: "0.00",
          totalTaxes: "0.00",
          totalReceivables: "0.00",
          netResult: "7300.00",
        },
      };
      mockService.findOne.mockResolvedValue(cycleWithSummary);

      const result = await controller.findOne(mockReq(), "cycle-uuid-1");

      expect(result.summary).toBeDefined();
      expect(mockService.findOne).toHaveBeenCalledWith(
        "user-uuid-1",
        "cycle-uuid-1",
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException("Billing cycle not found"),
      );

      await expect(
        controller.findOne(mockReq(), "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("PUT /billing-cycles/:id", () => {
    it("should update an open cycle", async () => {
      mockService.update.mockResolvedValue({
        ...mockCycle,
        name: "Março 2026",
      });

      const result = await controller.update(mockReq(), "cycle-uuid-1", {
        name: "Março 2026",
      });

      expect(result.name).toBe("Março 2026");
    });

    it("should propagate BadRequestException for closed cycle", async () => {
      mockService.update.mockRejectedValue(
        new BadRequestException("Cannot edit a closed billing cycle"),
      );

      await expect(
        controller.update(mockReq(), "cycle-uuid-1", { name: "Test" }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
