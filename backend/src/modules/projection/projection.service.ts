import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

export interface ProjectionEntry {
  cycleName: string;
  projectedSalary: string;
  projectedFixedExpenses: string;
  projectedTaxes: string;
  projectedInstallments: string;
  projectedNetResult: string;
}

export interface Alert {
  month: string;
  deficit: string;
}

export interface InstallmentCommitment {
  cycleName: string;
  totalCommitted: string;
  installmentCount: number;
}

@Injectable()
export class ProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjection(userId: string, months: number) {
    const clampedMonths = Math.min(Math.max(months, 1), 12);

    // Get latest cycle salary
    const latestCycle = await this.prisma.billingCycle.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    const projectedSalary = latestCycle ? toNum(latestCycle.salary) : 0;

    // Sum active fixed expenses
    const fixedExpenses = await this.prisma.fixedExpense.findMany({
      where: { userId, isActive: true },
    });
    const projectedFixedExpenses = fixedExpenses.reduce(
      (sum, fe) => sum + toNum(fe.estimatedAmount),
      0,
    );

    // Sum active taxes
    const taxes = await this.prisma.tax.findMany({
      where: { userId, isActive: true },
    });
    const projectedTaxes = taxes.reduce(
      (sum, t) => sum + toNum(t.estimatedAmount),
      0,
    );

    // Calculate future installments per month
    const { byMonth: installmentsByMonth } = await this.getFutureInstallments(
      userId,
      clampedMonths,
    );

    // Build projections for each future month
    const now = new Date();
    const projections: ProjectionEntry[] = [];
    const alerts: Alert[] = [];

    for (let i = 1; i <= clampedMonths; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const cycleName = this.formatCycleName(futureDate);
      const monthKey = this.getMonthKey(futureDate);
      const projectedInstallments = installmentsByMonth.get(monthKey) ?? 0;

      const netResult =
        projectedSalary -
        projectedFixedExpenses -
        projectedTaxes -
        projectedInstallments;

      const entry: ProjectionEntry = {
        cycleName,
        projectedSalary: projectedSalary.toFixed(2),
        projectedFixedExpenses: projectedFixedExpenses.toFixed(2),
        projectedTaxes: projectedTaxes.toFixed(2),
        projectedInstallments: projectedInstallments.toFixed(2),
        projectedNetResult: netResult.toFixed(2),
      };

      projections.push(entry);

      if (netResult < 0) {
        alerts.push({ month: cycleName, deficit: netResult.toFixed(2) });
      }
    }

    return { projections, alerts };
  }

  async getInstallmentCommitments(userId: string) {
    const { byMonth: installmentsByMonth, countByMonth: countsByMonth } =
      await this.getFutureInstallments(userId, 12);

    const commitments: InstallmentCommitment[] = [];

    const now = new Date();
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = this.getMonthKey(futureDate);
      const total = installmentsByMonth.get(monthKey);
      const count = countsByMonth.get(monthKey);

      if (total && total > 0) {
        commitments.push({
          cycleName: this.formatCycleName(futureDate),
          totalCommitted: total.toFixed(2),
          installmentCount: count ?? 0,
        });
      }
    }

    return { commitments };
  }

  private async getFutureInstallments(
    userId: string,
    months: number,
  ): Promise<{ byMonth: Map<string, number>; countByMonth: Map<string, number> }> {
    const now = new Date();
    const futureStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const futureEnd = new Date(
      now.getFullYear(),
      now.getMonth() + months + 1,
      0,
    );

    // Find all unpaid future installment transactions (children with parentTransactionId)
    const futureInstallments = await this.prisma.transaction.findMany({
      where: {
        userId,
        totalInstallments: { not: null },
        parentTransactionId: { not: null },
        isPaid: false,
        date: {
          gte: futureStart,
          lte: futureEnd,
        },
      },
    });

    const byMonth = new Map<string, number>();
    const countByMonth = new Map<string, number>();

    for (const tx of futureInstallments) {
      const txDate = new Date(tx.date);
      const monthKey = this.getMonthKey(txDate);
      const amount = toNum(tx.amount);
      byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + amount);
      countByMonth.set(monthKey, (countByMonth.get(monthKey) ?? 0) + 1);
    }

    return { byMonth, countByMonth };
  }

  private formatCycleName(date: Date): string {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
}
