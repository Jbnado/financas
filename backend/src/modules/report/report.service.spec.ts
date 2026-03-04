import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ReportService } from "./report.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

function decimal(value: string) {
  return { toString: () => value, toNumber: () => parseFloat(value) };
}

const userId = "user-uuid-1";
const mockCat1 = { id: "cat-1", name: "Alimentação", color: "#f97316" };
const mockCat2 = { id: "cat-2", name: "Transporte", color: "#3b82f6" };

const mockPrisma = {
  billingCycle: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  fixedExpense: {
    findMany: jest.fn(),
  },
  tax: {
    findMany: jest.fn(),
  },
};

describe("ReportService", () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    jest.clearAllMocks();
  });

  describe("categoryDistribution", () => {
    it("should return empty items for cycle without transactions", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue({
        id: "cycle-1",
        userId,
        transactions: [],
      });

      const result = await service.categoryDistribution(userId, "cycle-1");

      expect(result.items).toEqual([]);
      expect(result.grandTotal).toBe("0.00");
    });

    it("should calculate distribution with splits deducted", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue({
        id: "cycle-1",
        userId,
        transactions: [
          {
            amount: decimal("1000.00"),
            splits: [{ amount: decimal("300.00") }],
            category: mockCat1,
          },
          {
            amount: decimal("200.00"),
            splits: [],
            category: mockCat2,
          },
          {
            amount: decimal("500.00"),
            splits: [],
            category: mockCat1,
          },
        ],
      });

      const result = await service.categoryDistribution(userId, "cycle-1");

      // Cat1: (1000-300) + 500 = 1200, Cat2: 200 → total 1400
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        categoryId: "cat-1",
        categoryName: "Alimentação",
        categoryColor: "#f97316",
        total: "1200.00",
        percentage: 85.7,
      });
      expect(result.items[1]).toEqual({
        categoryId: "cat-2",
        categoryName: "Transporte",
        categoryColor: "#3b82f6",
        total: "200.00",
        percentage: 14.3,
      });
      expect(result.grandTotal).toBe("1400.00");
    });

    it("should throw NotFoundException when cycle not found", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(null);

      await expect(
        service.categoryDistribution(userId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should sort categories by total descending", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue({
        id: "cycle-1",
        userId,
        transactions: [
          { amount: decimal("100.00"), splits: [], category: mockCat2 },
          { amount: decimal("500.00"), splits: [], category: mockCat1 },
        ],
      });

      const result = await service.categoryDistribution(userId, "cycle-1");

      expect(result.items[0].categoryName).toBe("Alimentação");
      expect(result.items[1].categoryName).toBe("Transporte");
    });
  });

  describe("cycleEvolution", () => {
    it("should return evolution for recent cycles", async () => {
      mockPrisma.billingCycle.findMany.mockResolvedValue([
        {
          id: "cycle-2",
          name: "Fev 2026",
          salary: decimal("7300.00"),
          transactions: [
            {
              amount: decimal("2000.00"),
              splits: [{ amount: decimal("500.00") }],
            },
          ],
          fixedExpenseEntries: [],
          taxEntries: [],
        },
        {
          id: "cycle-1",
          name: "Jan 2026",
          salary: decimal("7300.00"),
          transactions: [
            { amount: decimal("3000.00"), splits: [] },
          ],
          fixedExpenseEntries: [],
          taxEntries: [],
        },
      ]);
      mockPrisma.fixedExpense.findMany.mockResolvedValue([]);
      mockPrisma.tax.findMany.mockResolvedValue([]);

      const result = await service.cycleEvolution(userId, 6);

      // Reversed → chronological order
      expect(result.cycles).toHaveLength(2);
      expect(result.cycles[0].cycleName).toBe("Jan 2026");
      expect(result.cycles[0].totalExpenses).toBe("3000.00");
      expect(result.cycles[0].netResult).toBe("4300.00");
      expect(result.cycles[1].cycleName).toBe("Fev 2026");
      expect(result.cycles[1].totalExpenses).toBe("1500.00");
      expect(result.cycles[1].netResult).toBe("5800.00");
    });

    it("should return empty cycles array when no cycles", async () => {
      mockPrisma.billingCycle.findMany.mockResolvedValue([]);

      const result = await service.cycleEvolution(userId, 6);

      expect(result.cycles).toEqual([]);
    });

    it("should include fixed expenses and taxes in totals", async () => {
      mockPrisma.billingCycle.findMany.mockResolvedValue([
        {
          id: "cycle-1",
          name: "Jan 2026",
          salary: decimal("7300.00"),
          transactions: [],
          fixedExpenseEntries: [],
          taxEntries: [],
        },
      ]);
      mockPrisma.fixedExpense.findMany.mockResolvedValue([
        {
          estimatedAmount: decimal("1000.00"),
          entries: [{ actualAmount: decimal("950.00") }],
        },
      ]);
      mockPrisma.tax.findMany.mockResolvedValue([
        {
          estimatedAmount: decimal("300.00"),
          entries: [{ actualAmount: decimal("280.00") }],
        },
      ]);

      const result = await service.cycleEvolution(userId, 6);

      // totalExpenses = 0 (cards) + 950 (fixed) + 280 (tax) = 1230
      expect(result.cycles[0].totalExpenses).toBe("1230.00");
      expect(result.cycles[0].netResult).toBe("6070.00");
    });
  });

  describe("cycleComparison", () => {
    it("should return null previous when no previous cycle", async () => {
      mockPrisma.billingCycle.findFirst
        .mockResolvedValueOnce({
          id: "cycle-1",
          userId,
          name: "Jan 2026",
          startDate: new Date("2026-01-01"),
        })
        .mockResolvedValueOnce(null) // no previous cycle
        .mockResolvedValueOnce({
          // buildCycleSummary call
          id: "cycle-1",
          userId,
          name: "Jan 2026",
          salary: decimal("7300.00"),
          transactions: [],
        });
      mockPrisma.fixedExpense.findMany.mockResolvedValue([]);
      mockPrisma.tax.findMany.mockResolvedValue([]);

      const result = await service.cycleComparison(userId, "cycle-1");

      expect(result.current.cycleName).toBe("Jan 2026");
      expect(result.previous).toBeNull();
      expect(result.diff).toBeNull();
    });

    it("should calculate diff between current and previous", async () => {
      mockPrisma.billingCycle.findFirst
        .mockResolvedValueOnce({
          id: "cycle-2",
          userId,
          name: "Fev 2026",
          startDate: new Date("2026-02-01"),
        })
        .mockResolvedValueOnce({
          id: "cycle-1",
          userId,
          name: "Jan 2026",
          startDate: new Date("2026-01-01"),
        })
        // buildCycleSummary for current
        .mockResolvedValueOnce({
          id: "cycle-2",
          userId,
          name: "Fev 2026",
          salary: decimal("7300.00"),
          transactions: [
            { amount: decimal("3000.00"), splits: [], category: mockCat1 },
          ],
        })
        // buildCycleSummary for previous
        .mockResolvedValueOnce({
          id: "cycle-1",
          userId,
          name: "Jan 2026",
          salary: decimal("7300.00"),
          transactions: [
            { amount: decimal("2000.00"), splits: [], category: mockCat1 },
          ],
        });
      mockPrisma.fixedExpense.findMany.mockResolvedValue([]);
      mockPrisma.tax.findMany.mockResolvedValue([]);

      const result = await service.cycleComparison(userId, "cycle-2");

      expect(result.current.totalExpenses).toBe("3000.00");
      expect(result.previous!.totalExpenses).toBe("2000.00");
      expect(result.diff!.expensesDiff).toBe("1000.00");
      expect(result.diff!.netResultDiff).toBe("-1000.00");
    });

    it("should throw NotFoundException when cycle not found", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(null);

      await expect(
        service.cycleComparison(userId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
