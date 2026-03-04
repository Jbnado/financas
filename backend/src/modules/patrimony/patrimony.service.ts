import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { Decimal } from "@prisma/client/runtime/client";

const TYPE_LABELS: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  wallet: "Carteira Digital",
  fixed_income: "Renda Fixa",
  variable_income: "Renda Variável",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  other: "Outros",
};

@Injectable()
export class PatrimonyService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      select: { balance: true },
    });

    const investments = await this.prisma.investment.findMany({
      where: { userId, isActive: true },
      select: { currentValue: true },
    });

    const totalBankAccounts = accounts.reduce(
      (sum, a) => sum.add(a.balance),
      new Decimal(0),
    );

    const totalInvestments = investments.reduce(
      (sum, i) => sum.add(i.currentValue),
      new Decimal(0),
    );

    const totalAssets = totalBankAccounts.add(totalInvestments);
    const futureInstallments = new Decimal(0); // No installment tables in this branch
    const netPatrimony = totalAssets.sub(futureInstallments);

    return {
      totalBankAccounts: totalBankAccounts.toFixed(2),
      totalInvestments: totalInvestments.toFixed(2),
      totalAssets: totalAssets.toFixed(2),
      futureInstallments: futureInstallments.toFixed(2),
      netPatrimony: netPatrimony.toFixed(2),
    };
  }

  async getDistribution(userId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      select: { type: true, balance: true },
    });

    const investments = await this.prisma.investment.findMany({
      where: { userId, isActive: true },
      select: { type: true, currentValue: true },
    });

    const typeMap = new Map<string, Decimal>();

    for (const a of accounts) {
      const current = typeMap.get(a.type) ?? new Decimal(0);
      typeMap.set(a.type, current.add(a.balance));
    }

    for (const i of investments) {
      const current = typeMap.get(i.type) ?? new Decimal(0);
      typeMap.set(i.type, current.add(i.currentValue));
    }

    let grandTotal = new Decimal(0);
    for (const val of typeMap.values()) {
      grandTotal = grandTotal.add(val);
    }

    const items = Array.from(typeMap.entries())
      .filter(([, val]) => val.greaterThan(0))
      .map(([type, total]) => ({
        type,
        label: TYPE_LABELS[type] || type,
        total: total.toFixed(2),
        percentage: grandTotal.isZero()
          ? 0
          : Number(total.div(grandTotal).mul(100).toFixed(2)),
      }))
      .sort((a, b) => Number(b.total) - Number(a.total));

    return {
      items,
      grandTotal: grandTotal.toFixed(2),
    };
  }

  async createSnapshot(userId: string, billingCycleId: string) {
    const summary = await this.getSummary(userId);

    return this.prisma.patrimonySnapshot.create({
      data: {
        userId,
        billingCycleId,
        totalBankAccounts: summary.totalBankAccounts,
        totalInvestments: summary.totalInvestments,
        totalAssets: summary.totalAssets,
        futureInstallments: summary.futureInstallments,
        netPatrimony: summary.netPatrimony,
        snapshotDate: new Date(),
      },
    });
  }

  async getEvolution(userId: string, last: number = 6) {
    const snapshots = await this.prisma.patrimonySnapshot.findMany({
      where: { userId },
      include: { billingCycle: { select: { name: true } } },
      orderBy: { snapshotDate: "desc" },
      take: last,
    });

    return {
      snapshots: snapshots.reverse().map((s) => ({
        cycleName: s.billingCycle.name,
        snapshotDate: s.snapshotDate.toISOString(),
        totalAssets: s.totalAssets.toString(),
        netPatrimony: s.netPatrimony.toString(),
      })),
    };
  }
}
