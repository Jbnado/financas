import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateBillingCycleDto } from "./dto/create-billing-cycle.dto.js";
import type { UpdateBillingCycleDto } from "./dto/update-billing-cycle.dto.js";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

@Injectable()
export class BillingCycleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBillingCycleDto) {
    return this.prisma.billingCycle.create({
      data: {
        userId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        salary: dto.salary,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.billingCycle.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          include: {
            splits: true,
            category: true,
            paymentMethod: true,
          },
          orderBy: { date: "desc" },
        },
        fixedExpenseEntries: {
          include: { fixedExpense: true },
        },
        taxEntries: {
          include: { tax: true },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    // totalCards = sum of user's share per transaction (amount - splits)
    const totalCards = cycle.transactions.reduce((sum, tx) => {
      const txAmount = toNum(tx.amount);
      const splitsTotal = tx.splits.reduce((s, sp) => s + toNum(sp.amount), 0);
      return sum + (txAmount - splitsTotal);
    }, 0);

    // totalFixed = sum of actualAmount from entries (or estimatedAmount as fallback)
    const fixedExpenses = await this.prisma.fixedExpense.findMany({
      where: { userId, isActive: true },
      include: { entries: { where: { billingCycleId: id } } },
    });
    const totalFixed = fixedExpenses.reduce((sum, fe) => {
      const entry = fe.entries[0];
      return sum + (entry ? toNum(entry.actualAmount) : toNum(fe.estimatedAmount));
    }, 0);

    // totalTaxes = sum of actualAmount from entries (or estimatedAmount as fallback)
    const taxes = await this.prisma.tax.findMany({
      where: { userId, isActive: true },
      include: { entries: { where: { billingCycleId: id } } },
    });
    const totalTaxes = taxes.reduce((sum, t) => {
      const entry = t.entries[0];
      return sum + (entry ? toNum(entry.actualAmount) : toNum(t.estimatedAmount));
    }, 0);

    // totalReceivables = sum of pending receivable amounts for this user
    const receivables = await this.prisma.receivable.findMany({
      where: {
        status: { not: "paid" },
        split: { transaction: { userId, billingCycleId: id } },
      },
    });
    const totalReceivables = receivables.reduce(
      (sum, r) => sum + (toNum(r.amount) - toNum(r.paidAmount)),
      0,
    );

    const salary = toNum(cycle.salary);
    const totalExpenses = totalCards + totalFixed + totalTaxes;
    const netResult = salary - totalExpenses + totalReceivables;

    // categoryBreakdown: aggregate user's share per category
    const catMap = new Map<
      string,
      { categoryId: string; categoryName: string; categoryColor: string | null; total: number }
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
    const categoryBreakdown = Array.from(catMap.values())
      .map((e) => ({ ...e, total: e.total.toFixed(2) }))
      .sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

    // recentTransactions: last 5 with userAmount (already ordered desc by date)
    const recentTransactions = cycle.transactions.slice(0, 5).map((tx) => {
      const txAmount = toNum(tx.amount);
      const splitsTotal = tx.splits.reduce((s, sp) => s + toNum(sp.amount), 0);
      return {
        id: tx.id,
        description: tx.description,
        amount: txAmount.toFixed(2),
        userAmount: (txAmount - splitsTotal).toFixed(2),
        date: tx.date,
        isPaid: tx.isPaid,
        category: { id: tx.category.id, name: tx.category.name, color: tx.category.color },
        paymentMethod: { id: tx.paymentMethod.id, name: tx.paymentMethod.name },
      };
    });

    return {
      ...cycle,
      transactions: undefined,
      fixedExpenseEntries: undefined,
      taxEntries: undefined,
      summary: {
        salary: salary.toFixed(2),
        totalCards: totalCards.toFixed(2),
        totalFixed: totalFixed.toFixed(2),
        totalTaxes: totalTaxes.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        totalReceivables: totalReceivables.toFixed(2),
        netResult: netResult.toFixed(2),
      },
      categoryBreakdown,
      recentTransactions,
    };
  }

  async update(userId: string, id: string, dto: UpdateBillingCycleDto) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id, userId },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    if (cycle.status === "closed") {
      throw new BadRequestException("Cannot edit a closed billing cycle");
    }

    return this.prisma.billingCycle.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.salary !== undefined && { salary: dto.salary }),
      },
    });
  }

  async close(userId: string, id: string) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id, userId },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    if (cycle.status === "closed") {
      throw new BadRequestException("Ciclo já está fechado");
    }

    return this.prisma.billingCycle.update({
      where: { id },
      data: {
        status: "closed",
        closedAt: new Date(),
      },
    });
  }

  async reopen(userId: string, id: string) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id, userId },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    if (cycle.status !== "closed") {
      throw new BadRequestException("Ciclo já está aberto");
    }

    return this.prisma.billingCycle.update({
      where: { id },
      data: {
        status: "open",
        closedAt: null,
      },
    });
  }

  async ensureCycleExists(userId: string, targetDate: Date) {
    // Normalize to start of day — cycle boundaries are midnight, so time is irrelevant
    targetDate = new Date(
      Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
      ),
    );

    // Check if a cycle already contains the target date
    const existing = await this.prisma.billingCycle.findFirst({
      where: {
        userId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (existing) {
      return existing;
    }

    // Find the closest cycle that ends before the target date
    const baseCycle = await this.prisma.billingCycle.findFirst({
      where: { userId, endDate: { lt: targetDate } },
      orderBy: { endDate: "desc" },
    });

    const refCycle =
      baseCycle ??
      (await this.prisma.billingCycle.findFirst({
        where: { userId },
        orderBy: { startDate: "desc" },
      }));

    if (!refCycle) {
      // No cycles at all — create one 30-day cycle covering targetDate
      return this.prisma.billingCycle.create({
        data: {
          userId,
          name: this.cycleName(targetDate),
          startDate: targetDate,
          endDate: new Date(
            targetDate.getTime() + 30 * 24 * 60 * 60 * 1000,
          ),
          salary: 0,
        },
      });
    }

    const refEnd = new Date(refCycle.endDate);
    const anchorDay = refEnd.getUTCDate();
    const salary = refCycle.salary.toString();

    let newStartDate = baseCycle
      ? this.nextDay(new Date(baseCycle.endDate))
      : this.nextDay(refEnd);

    // Safety limit: only create up to 24 cycles (~2 years)
    const MAX_CYCLES = 24;
    for (let i = 0; i < MAX_CYCLES; i++) {
      // End date = anchorDay of the next calendar month
      const newEndDate = this.nextMonthAnchor(newStartDate, anchorDay);

      // Re-check if another concurrent request already created a cycle covering this range
      const alreadyExists = await this.prisma.billingCycle.findFirst({
        where: {
          userId,
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
      });
      if (alreadyExists) {
        return alreadyExists;
      }

      const created = await this.prisma.billingCycle.create({
        data: {
          userId,
          name: this.cycleName(newStartDate),
          startDate: newStartDate,
          endDate: newEndDate,
          salary,
        },
      });

      if (newStartDate <= targetDate && newEndDate >= targetDate) {
        return created;
      }

      newStartDate = this.nextDay(newEndDate);
    }

    throw new BadRequestException(
      "Unable to create cycle: target date is too far from the last cycle",
    );
  }

  private nextDay(date: Date): Date {
    return new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Returns the next occurrence of anchorDay relative to `start`.
   * If anchorDay > start day → same month (clamped to last day).
   * If anchorDay <= start day → next month (clamped to last day).
   * E.g. anchorDay=9, start=Apr 10 → May 9; anchorDay=31, start=Apr 1 → Apr 30.
   */
  private nextMonthAnchor(start: Date, anchorDay: number): Date {
    const startDay = start.getUTCDate();
    let year = start.getUTCFullYear();
    let month = start.getUTCMonth();

    if (anchorDay <= startDay) {
      // Anchor already passed this month → go to next month
      month += 1;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const day = Math.min(anchorDay, lastDay);
    return new Date(Date.UTC(year, month, day));
  }

  private cycleName(date: Date): string {
    const monthNames = [
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
    return `Ciclo ${monthNames[date.getMonth()]}/${date.getFullYear()}`;
  }
}
