import { Test, TestingModule } from "@nestjs/testing";
import { PatrimonyService } from "./patrimony.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { Decimal } from "@prisma/client/runtime/client";

// Helper to create Decimal values for test data
function decimal(value: string | number) {
  return new Decimal(value);
}

const mockPrisma = {
  bankAccount: {
    findMany: jest.fn(),
  },
  investment: {
    findMany: jest.fn(),
  },
  patrimonySnapshot: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe("PatrimonyService", () => {
  let service: PatrimonyService;
  const userId = "user-uuid-1";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatrimonyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PatrimonyService>(PatrimonyService);
    jest.clearAllMocks();
  });

  describe("getSummary", () => {
    it("should return summary with accounts and investments", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([
        { balance: decimal("5000.00") },
        { balance: decimal("3000.00") },
      ]);
      mockPrisma.investment.findMany.mockResolvedValue([
        { currentValue: decimal("20000.00") },
        { currentValue: decimal("10000.00") },
      ]);

      const result = await service.getSummary(userId);

      expect(result.totalBankAccounts).toBe("8000.00");
      expect(result.totalInvestments).toBe("30000.00");
      expect(result.totalAssets).toBe("38000.00");
      expect(result.futureInstallments).toBe("0.00");
      expect(result.netPatrimony).toBe("38000.00");

      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        select: { balance: true },
      });
      expect(mockPrisma.investment.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        select: { currentValue: true },
      });
    });

    it("should return all zeros when no data exists", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([]);
      mockPrisma.investment.findMany.mockResolvedValue([]);

      const result = await service.getSummary(userId);

      expect(result.totalBankAccounts).toBe("0.00");
      expect(result.totalInvestments).toBe("0.00");
      expect(result.totalAssets).toBe("0.00");
      expect(result.futureInstallments).toBe("0.00");
      expect(result.netPatrimony).toBe("0.00");
    });
  });

  describe("getDistribution", () => {
    it("should return distribution with mixed types", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([
        { type: "checking", balance: decimal("5000.00") },
        { type: "savings", balance: decimal("3000.00") },
      ]);
      mockPrisma.investment.findMany.mockResolvedValue([
        { type: "fixed_income", currentValue: decimal("12000.00") },
        { type: "variable_income", currentValue: decimal("5000.00") },
      ]);

      const result = await service.getDistribution(userId);

      expect(result.items).toHaveLength(4);
      expect(result.grandTotal).toBe("25000.00");

      // Items should be sorted by total descending
      expect(Number(result.items[0].total)).toBeGreaterThanOrEqual(
        Number(result.items[1].total),
      );

      // Check labels
      const checkingItem = result.items.find((i) => i.type === "checking");
      expect(checkingItem).toBeDefined();
      expect(checkingItem!.label).toBe("Conta Corrente");

      // Check percentages sum to ~100
      const totalPercentage = result.items.reduce(
        (sum, i) => sum + i.percentage,
        0,
      );
      expect(totalPercentage).toBeCloseTo(100, 0);
    });

    it("should return empty distribution with no data", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([]);
      mockPrisma.investment.findMany.mockResolvedValue([]);

      const result = await service.getDistribution(userId);

      expect(result.items).toHaveLength(0);
      expect(result.grandTotal).toBe("0.00");
    });
  });

  describe("createSnapshot", () => {
    it("should create a snapshot from current summary", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([
        { balance: decimal("5000.00") },
      ]);
      mockPrisma.investment.findMany.mockResolvedValue([
        { currentValue: decimal("20000.00") },
      ]);

      const mockSnapshot = {
        id: "snapshot-1",
        userId,
        billingCycleId: "cycle-1",
        totalBankAccounts: decimal("5000.00"),
        totalInvestments: decimal("20000.00"),
        totalAssets: decimal("25000.00"),
        futureInstallments: decimal("0.00"),
        netPatrimony: decimal("25000.00"),
        snapshotDate: new Date(),
      };
      mockPrisma.patrimonySnapshot.create.mockResolvedValue(mockSnapshot);

      const result = await service.createSnapshot(userId, "cycle-1");

      expect(result).toEqual(mockSnapshot);
      expect(mockPrisma.patrimonySnapshot.create).toHaveBeenCalledWith({
        data: {
          userId,
          billingCycleId: "cycle-1",
          totalBankAccounts: "5000.00",
          totalInvestments: "20000.00",
          totalAssets: "25000.00",
          futureInstallments: "0.00",
          netPatrimony: "25000.00",
          snapshotDate: expect.any(Date),
        },
      });
    });
  });

  describe("getEvolution", () => {
    it("should return snapshots in chronological order", async () => {
      const snapshots = [
        {
          id: "snap-2",
          userId,
          billingCycleId: "cycle-2",
          totalAssets: decimal("70000.00"),
          netPatrimony: decimal("62000.00"),
          snapshotDate: new Date("2026-02-28"),
          billingCycle: { name: "Fevereiro 2026" },
        },
        {
          id: "snap-1",
          userId,
          billingCycleId: "cycle-1",
          totalAssets: decimal("60000.00"),
          netPatrimony: decimal("52000.00"),
          snapshotDate: new Date("2026-01-31"),
          billingCycle: { name: "Janeiro 2026" },
        },
      ];
      mockPrisma.patrimonySnapshot.findMany.mockResolvedValue(snapshots);

      const result = await service.getEvolution(userId, 6);

      expect(result.snapshots).toHaveLength(2);
      // Should be reversed (chronological order)
      expect(result.snapshots[0].cycleName).toBe("Janeiro 2026");
      expect(result.snapshots[1].cycleName).toBe("Fevereiro 2026");
      expect(result.snapshots[0].totalAssets).toBe("60000");
      expect(result.snapshots[0].netPatrimony).toBe("52000");

      expect(mockPrisma.patrimonySnapshot.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { billingCycle: { select: { name: true } } },
        orderBy: { snapshotDate: "desc" },
        take: 6,
      });
    });

    it("should return empty array when no snapshots exist", async () => {
      mockPrisma.patrimonySnapshot.findMany.mockResolvedValue([]);

      const result = await service.getEvolution(userId);

      expect(result.snapshots).toHaveLength(0);
      expect(result.snapshots).toEqual([]);
    });
  });
});
