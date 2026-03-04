import { Test, TestingModule } from "@nestjs/testing";
import { ProjectionService } from "./projection.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const dec = (v: string) => ({ toString: () => v, toNumber: () => parseFloat(v) });

describe("ProjectionService", () => {
  let service: ProjectionService;
  let prisma: {
    billingCycle: { findFirst: jest.Mock; findMany: jest.Mock };
    fixedExpense: { findMany: jest.Mock };
    tax: { findMany: jest.Mock };
    transaction: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      billingCycle: { findFirst: jest.fn(), findMany: jest.fn() },
      fixedExpense: { findMany: jest.fn() },
      tax: { findMany: jest.fn() },
      transaction: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProjectionService>(ProjectionService);
  });

  describe("getProjection", () => {
    it("should return empty projections with zeros when no data exists", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue(null);
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 3);

      expect(result.projections).toHaveLength(3);
      expect(result.alerts).toHaveLength(0);
      for (const p of result.projections) {
        expect(p.projectedSalary).toBe("0.00");
        expect(p.projectedFixedExpenses).toBe("0.00");
        expect(p.projectedTaxes).toBe("0.00");
        expect(p.projectedInstallments).toBe("0.00");
        expect(p.projectedNetResult).toBe("0.00");
      }
    });

    it("should project salary from latest cycle", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue({
        id: "c1",
        salary: dec("7000.00"),
      });
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 1);

      expect(result.projections[0].projectedSalary).toBe("7000.00");
      expect(result.projections[0].projectedNetResult).toBe("7000.00");
    });

    it("should project fixed expenses from active entries", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue({
        id: "c1",
        salary: dec("7000.00"),
      });
      prisma.fixedExpense.findMany.mockResolvedValue([
        { estimatedAmount: dec("1500.00") },
        { estimatedAmount: dec("800.00") },
      ]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 1);

      expect(result.projections[0].projectedFixedExpenses).toBe("2300.00");
      expect(result.projections[0].projectedNetResult).toBe("4700.00");
    });

    it("should project taxes from active entries", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue({
        id: "c1",
        salary: dec("7000.00"),
      });
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([
        { estimatedAmount: dec("500.00") },
        { estimatedAmount: dec("300.00") },
      ]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 1);

      expect(result.projections[0].projectedTaxes).toBe("800.00");
      expect(result.projections[0].projectedNetResult).toBe("6200.00");
    });

    it("should generate deficit alerts when netResult < 0", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue({
        id: "c1",
        salary: dec("2000.00"),
      });
      prisma.fixedExpense.findMany.mockResolvedValue([
        { estimatedAmount: dec("2500.00") },
      ]);
      prisma.tax.findMany.mockResolvedValue([
        { estimatedAmount: dec("600.00") },
      ]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 2);

      expect(result.alerts).toHaveLength(2);
      expect(result.alerts[0].deficit).toBe("-1100.00");
      expect(result.alerts[1].deficit).toBe("-1100.00");
    });

    it("should clamp months to max 12", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue(null);
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 20);

      expect(result.projections).toHaveLength(12);
    });

    it("should clamp months to min 1", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue(null);
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 0);

      expect(result.projections).toHaveLength(1);
    });

    it("should include future unpaid installments in projection", async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);

      prisma.billingCycle.findFirst.mockResolvedValue({
        id: "c1",
        salary: dec("7000.00"),
      });
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([
        {
          id: "t2",
          amount: dec("300.00"),
          totalInstallments: 6,
          installmentNumber: 2,
          parentTransactionId: "t1",
          isPaid: false,
          date: nextMonth,
        },
      ]);

      const result = await service.getProjection("user1", 6);

      // First month should have installment
      expect(parseFloat(result.projections[0].projectedInstallments)).toBe(300);
    });

    it("should include cycleName in Portuguese format", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue(null);
      prisma.fixedExpense.findMany.mockResolvedValue([]);
      prisma.tax.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 1);

      // cycleName should be in format "Mês Ano"
      expect(result.projections[0].cycleName).toMatch(/^\w+ \d{4}$/);
    });

    it("should combine all expense types in net result", async () => {
      prisma.billingCycle.findFirst.mockResolvedValue({
        id: "c1",
        salary: dec("10000.00"),
      });
      prisma.fixedExpense.findMany.mockResolvedValue([
        { estimatedAmount: dec("3000.00") },
      ]);
      prisma.tax.findMany.mockResolvedValue([
        { estimatedAmount: dec("1000.00") },
      ]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getProjection("user1", 1);

      // net = 10000 - 3000 - 1000 = 6000
      expect(result.projections[0].projectedNetResult).toBe("6000.00");
    });
  });

  describe("getInstallmentCommitments", () => {
    it("should return empty commitments when no installments", async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getInstallmentCommitments("user1");

      expect(result.commitments).toHaveLength(0);
    });

    it("should group commitments by future cycle month", async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
      const twoMonths = new Date(now.getFullYear(), now.getMonth() + 2, 15);

      prisma.transaction.findMany.mockResolvedValue([
        {
          id: "t2",
          amount: dec("500.00"),
          totalInstallments: 5,
          installmentNumber: 2,
          parentTransactionId: "t1",
          isPaid: false,
          date: nextMonth,
        },
        {
          id: "t3",
          amount: dec("500.00"),
          totalInstallments: 5,
          installmentNumber: 3,
          parentTransactionId: "t1",
          isPaid: false,
          date: twoMonths,
        },
      ]);

      const result = await service.getInstallmentCommitments("user1");

      expect(result.commitments.length).toBe(2);
      for (const c of result.commitments) {
        expect(c.totalCommitted).toBe("500.00");
        expect(c.installmentCount).toBe(1);
        expect(c.cycleName).toMatch(/^\w+ \d{4}$/);
      }
    });

    it("should include installment count per month with multiple transactions", async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 10);

      prisma.transaction.findMany.mockResolvedValue([
        {
          id: "t2",
          amount: dec("200.00"),
          totalInstallments: 10,
          installmentNumber: 2,
          parentTransactionId: "t1",
          isPaid: false,
          date: nextMonth,
        },
        {
          id: "t5",
          amount: dec("300.00"),
          totalInstallments: 6,
          installmentNumber: 3,
          parentTransactionId: "t4",
          isPaid: false,
          date: nextMonth,
        },
      ]);

      const result = await service.getInstallmentCommitments("user1");

      expect(result.commitments.length).toBe(1);
      expect(result.commitments[0].installmentCount).toBe(2);
      expect(result.commitments[0].totalCommitted).toBe("500.00");
    });
  });
});
