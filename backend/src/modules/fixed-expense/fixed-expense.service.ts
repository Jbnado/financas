import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateFixedExpenseDto } from "./dto/create-fixed-expense.dto";
import type { CreateFixedExpenseEntryDto } from "./dto/create-fixed-expense-entry.dto";
import type { UpdateFixedExpenseDto } from "./dto/update-fixed-expense.dto";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

@Injectable()
export class FixedExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFixedExpenseDto) {
    return this.prisma.fixedExpense.create({
      data: {
        name: dto.name,
        estimatedAmount: dto.estimatedAmount,
        dueDay: dto.dueDay,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.fixedExpense.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.fixedExpense.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!expense) throw new NotFoundException("Fixed expense not found");
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateFixedExpenseDto) {
    await this.findOne(userId, id);
    return this.prisma.fixedExpense.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.estimatedAmount !== undefined && { estimatedAmount: dto.estimatedAmount }),
        ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.fixedExpense.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createEntry(userId: string, id: string, dto: CreateFixedExpenseEntryDto) {
    await this.findOne(userId, id);
    return this.prisma.fixedExpenseEntry.create({
      data: {
        fixedExpenseId: id,
        billingCycleId: dto.billingCycleId,
        actualAmount: dto.actualAmount,
        isPaid: dto.isPaid ?? false,
      },
    });
  }

  async toggleEntryPaid(userId: string, entryId: string) {
    const entry = await this.prisma.fixedExpenseEntry.findFirst({
      where: { id: entryId, fixedExpense: { userId } },
    });
    if (!entry) throw new NotFoundException("Fixed expense entry not found");
    return this.prisma.fixedExpenseEntry.update({
      where: { id: entryId },
      data: { isPaid: !entry.isPaid },
    });
  }

  async findByCycle(userId: string, cycleId: string) {
    const expenses = await this.prisma.fixedExpense.findMany({
      where: { userId, isActive: true },
      include: {
        entries: { where: { billingCycleId: cycleId } },
      },
      orderBy: { name: "asc" },
    });

    return expenses.map((e) => {
      const entry = e.entries[0] ?? null;
      return {
        id: e.id,
        name: e.name,
        estimatedAmount: e.estimatedAmount,
        dueDay: e.dueDay,
        entry: entry
          ? {
              id: entry.id,
              fixedExpenseId: entry.fixedExpenseId,
              billingCycleId: entry.billingCycleId,
              actualAmount: entry.actualAmount,
              isPaid: entry.isPaid,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt,
            }
          : null,
        difference: entry
          ? (toNum(entry.actualAmount) - toNum(e.estimatedAmount)).toFixed(2)
          : null,
      };
    });
  }

  async findHistory(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.fixedExpenseEntry.findMany({
      where: { fixedExpenseId: id },
      include: { billingCycle: { select: { id: true, name: true, startDate: true, endDate: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
