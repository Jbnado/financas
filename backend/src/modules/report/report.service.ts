import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async categoryDistribution(userId: string, billingCycleId: string) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id: billingCycleId, userId },
      include: {
        transactions: {
          include: { splits: true, category: true },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    const catMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string | null;
        total: number;
      }
    >();

    for (const tx of cycle.transactions) {
      const txAmount = toNum(tx.amount);
      const splitsTotal = tx.splits.reduce((s, sp) => s + toNum(sp.amount), 0);
      const userShare = txAmount - splitsTotal;
      const cat = tx.category;
      const entry = catMap.get(cat.id);
      if (entry) {
        entry.total += userShare;
      } else {
        catMap.set(cat.id, {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryColor: cat.color,
          total: userShare,
        });
      }
    }

    const items = Array.from(catMap.values()).sort(
      (a, b) => b.total - a.total,
    );
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    return {
      items: items.map((item) => ({
        ...item,
        total: item.total.toFixed(2),
        percentage:
          grandTotal > 0
            ? parseFloat(((item.total / grandTotal) * 100).toFixed(1))
            : 0,
      })),
      grandTotal: grandTotal.toFixed(2),
    };
  }

  async cycleEvolution(userId: string, last: number) {
    const cycles = await this.prisma.billingCycle.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      take: last,
      include: {
        transactions: { include: { splits: true } },
        fixedExpenseEntries: true,
        taxEntries: true,
      },
    });

    const result = [];

    for (const cycle of cycles) {
      const salary = toNum(cycle.salary);

      const totalCards = cycle.transactions.reduce((sum, tx) => {
        const txAmount = toNum(tx.amount);
        const splitsTotal = tx.splits.reduce(
          (s, sp) => s + toNum(sp.amount),
          0,
        );
        return sum + (txAmount - splitsTotal);
      }, 0);

      // Fixed expenses for this cycle
      const fixedExpenses = await this.prisma.fixedExpense.findMany({
        where: { userId, isActive: true },
        include: {
          entries: { where: { billingCycleId: cycle.id } },
        },
      });
      const totalFixed = fixedExpenses.reduce((sum, fe) => {
        const entry = fe.entries[0];
        return sum + (entry ? toNum(entry.actualAmount) : toNum(fe.estimatedAmount));
      }, 0);

      // Taxes for this cycle
      const taxes = await this.prisma.tax.findMany({
        where: { userId, isActive: true },
        include: {
          entries: { where: { billingCycleId: cycle.id } },
        },
      });
      const totalTaxes = taxes.reduce((sum, t) => {
        const entry = t.entries[0];
        return sum + (entry ? toNum(entry.actualAmount) : toNum(t.estimatedAmount));
      }, 0);

      const totalExpenses = totalCards + totalFixed + totalTaxes;
      const netResult = salary - totalExpenses;

      result.push({
        cycleId: cycle.id,
        cycleName: cycle.name,
        salary: salary.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netResult: netResult.toFixed(2),
      });
    }

    return { cycles: result.reverse() };
  }

  async cycleComparison(userId: string, billingCycleId: string) {
    const currentCycle = await this.prisma.billingCycle.findFirst({
      where: { id: billingCycleId, userId },
    });

    if (!currentCycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    const previousCycle = await this.prisma.billingCycle.findFirst({
      where: {
        userId,
        startDate: { lt: currentCycle.startDate },
      },
      orderBy: { startDate: "desc" },
    });

    const current = await this.buildCycleSummary(userId, currentCycle.id);

    let previous = null;
    let diff = null;

    if (previousCycle) {
      previous = await this.buildCycleSummary(userId, previousCycle.id);
      const currentExpenses = parseFloat(current.totalExpenses);
      const previousExpenses = parseFloat(previous.totalExpenses);
      const currentNet = parseFloat(current.netResult);
      const previousNet = parseFloat(previous.netResult);

      diff = {
        expensesDiff: (currentExpenses - previousExpenses).toFixed(2),
        netResultDiff: (currentNet - previousNet).toFixed(2),
      };
    }

    return { current, previous, diff };
  }

  private async buildCycleSummary(userId: string, cycleId: string) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id: cycleId, userId },
      include: {
        transactions: {
          include: { splits: true, category: true },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    const salary = toNum(cycle.salary);

    const totalCards = cycle.transactions.reduce((sum, tx) => {
      const txAmount = toNum(tx.amount);
      const splitsTotal = tx.splits.reduce(
        (s, sp) => s + toNum(sp.amount),
        0,
      );
      return sum + (txAmount - splitsTotal);
    }, 0);

    const fixedExpenses = await this.prisma.fixedExpense.findMany({
      where: { userId, isActive: true },
      include: {
        entries: { where: { billingCycleId: cycleId } },
      },
    });
    const totalFixed = fixedExpenses.reduce((sum, fe) => {
      const entry = fe.entries[0];
      return sum + (entry ? toNum(entry.actualAmount) : toNum(fe.estimatedAmount));
    }, 0);

    const taxes = await this.prisma.tax.findMany({
      where: { userId, isActive: true },
      include: {
        entries: { where: { billingCycleId: cycleId } },
      },
    });
    const totalTaxes = taxes.reduce((sum, t) => {
      const entry = t.entries[0];
      return sum + (entry ? toNum(entry.actualAmount) : toNum(t.estimatedAmount));
    }, 0);

    const totalExpenses = totalCards + totalFixed + totalTaxes;
    const netResult = salary - totalExpenses;

    // Category breakdown
    const catMap = new Map<
      string,
      { categoryName: string; categoryColor: string | null; total: number }
    >();
    for (const tx of cycle.transactions) {
      const txAmount = toNum(tx.amount);
      const splitsTotal = tx.splits.reduce(
        (s, sp) => s + toNum(sp.amount),
        0,
      );
      const userShare = txAmount - splitsTotal;
      const cat = tx.category;
      const entry = catMap.get(cat.id);
      if (entry) {
        entry.total += userShare;
      } else {
        catMap.set(cat.id, {
          categoryName: cat.name,
          categoryColor: cat.color,
          total: userShare,
        });
      }
    }

    const categories = Array.from(catMap.values())
      .map((e) => ({ ...e, total: e.total.toFixed(2) }))
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

    return {
      cycleName: cycle.name,
      salary: salary.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netResult: netResult.toFixed(2),
      categories,
    };
  }
}
