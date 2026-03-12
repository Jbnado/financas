import { Test, TestingModule } from "@nestjs/testing";
import { ProjectionController } from "./projection.controller";
import { ProjectionService } from "./projection.service";

const mockReq = (userId = "user-1") => ({ user: { id: userId } });

const mockProjectionResult = {
  projections: [
    {
      cycleName: "Abril 2026",
      projectedSalary: "7000.00",
      projectedFixedExpenses: "3200.00",
      projectedTaxes: "800.00",
      projectedInstallments: "500.00",
      projectedNetResult: "2500.00",
    },
  ],
  alerts: [],
};

const mockCommitmentsResult = {
  commitments: [
    { cycleName: "Abril 2026", totalCommitted: "1500.00", installmentCount: 3 },
  ],
};

describe("ProjectionController", () => {
  let controller: ProjectionController;
  let service: {
    getProjection: jest.Mock;
    getInstallmentCommitments: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getProjection: jest.fn(),
      getInstallmentCommitments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectionController],
      providers: [{ provide: ProjectionService, useValue: service }],
    }).compile();

    controller = module.get<ProjectionController>(ProjectionController);
  });

  describe("getProjection", () => {
    it("should call service with userId and default months", async () => {
      service.getProjection.mockResolvedValue(mockProjectionResult);

      const result = await controller.getProjection(mockReq() as any);

      expect(service.getProjection).toHaveBeenCalledWith("user-1", 6);
      expect(result).toEqual(mockProjectionResult);
    });

    it("should parse months query parameter", async () => {
      service.getProjection.mockResolvedValue(mockProjectionResult);

      const result = await controller.getProjection(mockReq() as any, "3");

      expect(service.getProjection).toHaveBeenCalledWith("user-1", 3);
      expect(result).toEqual(mockProjectionResult);
    });

    it("should fallback to default 6 when months is non-numeric", async () => {
      service.getProjection.mockResolvedValue(mockProjectionResult);

      await controller.getProjection(mockReq() as any, "abc");

      expect(service.getProjection).toHaveBeenCalledWith("user-1", 6);
    });

    it("should return projections with alerts", async () => {
      const withAlerts = {
        ...mockProjectionResult,
        alerts: [{ month: "Julho 2026", deficit: "-1200.00" }],
      };
      service.getProjection.mockResolvedValue(withAlerts);

      const result = await controller.getProjection(mockReq() as any, "6");

      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].deficit).toBe("-1200.00");
    });
  });

  describe("getInstallmentCommitments", () => {
    it("should call service with userId", async () => {
      service.getInstallmentCommitments.mockResolvedValue(mockCommitmentsResult);

      const result = await controller.getInstallmentCommitments(mockReq() as any);

      expect(service.getInstallmentCommitments).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockCommitmentsResult);
    });

    it("should return empty commitments", async () => {
      service.getInstallmentCommitments.mockResolvedValue({ commitments: [] });

      const result = await controller.getInstallmentCommitments(mockReq() as any);

      expect(result.commitments).toHaveLength(0);
    });
  });
});
