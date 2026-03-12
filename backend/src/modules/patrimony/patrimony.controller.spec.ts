import { Test, TestingModule } from "@nestjs/testing";
import { PatrimonyController } from "./patrimony.controller";
import { PatrimonyService } from "./patrimony.service";

const mockReq = (userId = "user-1") => ({ user: { id: userId } });

const mockSummary = {
  totalBankAccounts: "15000.00",
  totalInvestments: "50000.00",
  totalAssets: "65000.00",
  futureInstallments: "8000.00",
  netPatrimony: "57000.00",
};

const mockDistribution = {
  items: [
    { type: "checking", label: "Conta Corrente", total: "5000.00", percentage: 7.69 },
  ],
  grandTotal: "65000.00",
};

const mockEvolution = {
  snapshots: [
    { cycleName: "Jan 2026", snapshotDate: "2026-01-31T00:00:00.000Z", totalAssets: "60000.00", netPatrimony: "52000.00" },
  ],
};

describe("PatrimonyController", () => {
  let controller: PatrimonyController;
  let service: {
    getSummary: jest.Mock;
    getDistribution: jest.Mock;
    getEvolution: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getSummary: jest.fn(),
      getDistribution: jest.fn(),
      getEvolution: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatrimonyController],
      providers: [{ provide: PatrimonyService, useValue: service }],
    }).compile();

    controller = module.get<PatrimonyController>(PatrimonyController);
  });

  it("should get summary", async () => {
    service.getSummary.mockResolvedValue(mockSummary);
    const result = await controller.getSummary(mockReq() as any);
    expect(service.getSummary).toHaveBeenCalledWith("user-1");
    expect(result).toEqual(mockSummary);
  });

  it("should get distribution", async () => {
    service.getDistribution.mockResolvedValue(mockDistribution);
    const result = await controller.getDistribution(mockReq() as any);
    expect(service.getDistribution).toHaveBeenCalledWith("user-1");
    expect(result).toEqual(mockDistribution);
  });

  it("should get evolution with default last=6", async () => {
    service.getEvolution.mockResolvedValue(mockEvolution);
    const result = await controller.getEvolution(mockReq() as any);
    expect(service.getEvolution).toHaveBeenCalledWith("user-1", 6);
    expect(result).toEqual(mockEvolution);
  });

  it("should parse last query parameter", async () => {
    service.getEvolution.mockResolvedValue(mockEvolution);
    await controller.getEvolution(mockReq() as any, "3");
    expect(service.getEvolution).toHaveBeenCalledWith("user-1", 3);
  });

  it("should fallback to 6 when last is non-numeric", async () => {
    service.getEvolution.mockResolvedValue(mockEvolution);
    await controller.getEvolution(mockReq() as any, "abc");
    expect(service.getEvolution).toHaveBeenCalledWith("user-1", 6);
  });

  it("should fallback to 6 when last is negative", async () => {
    service.getEvolution.mockResolvedValue(mockEvolution);
    await controller.getEvolution(mockReq() as any, "-5");
    expect(service.getEvolution).toHaveBeenCalledWith("user-1", 6);
  });
});
