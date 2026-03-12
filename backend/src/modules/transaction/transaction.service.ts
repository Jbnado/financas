import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { InstallmentService } from "./installment.service.js";
import type { CreateTransactionDto } from "./dto/create-transaction.dto.js";
import type { UpdateTransactionDto } from "./dto/update-transaction.dto.js";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly installmentService: InstallmentService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id: dto.billingCycleId, userId },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    if (cycle.status === "closed") {
      throw new BadRequestException("Cannot add transaction to a closed billing cycle");
    }

    const isInstallment =
      dto.totalInstallments !== undefined && dto.totalInstallments > 1;

    // For installments, calculate the first installment amount
    let amount = dto.amount;
    let installmentNumber: number | undefined = dto.installmentNumber;
    let totalInstallments: number | undefined = dto.totalInstallments;

    if (isInstallment && !dto.parentTransactionId) {
      const amounts = this.installmentService.distributeAmount(
        dto.amount,
        dto.totalInstallments!,
      );
      amount = amounts[0];
      installmentNumber = 1;
      totalInstallments = dto.totalInstallments;
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        ...(dto.id && { id: dto.id }),
        description: dto.description,
        amount,
        date: new Date(dto.date),
        userId,
        billingCycleId: dto.billingCycleId,
        categoryId: dto.categoryId,
        paymentMethodId: dto.paymentMethodId,
        ...(installmentNumber !== undefined && { installmentNumber }),
        ...(totalInstallments !== undefined && { totalInstallments }),
        ...(dto.parentTransactionId !== undefined && {
          parentTransactionId: dto.parentTransactionId,
        }),
      },
      include: {
        category: true,
        paymentMethod: true,
      },
    });

    // Create child installments in future cycles
    if (isInstallment && !dto.parentTransactionId) {
      await this.installmentService.createInstallments(
        userId,
        {
          id: transaction.id,
          description: dto.description,
          date: new Date(dto.date),
          categoryId: dto.categoryId,
          paymentMethodId: dto.paymentMethodId,
        },
        dto.amount,
        dto.totalInstallments!,
        dto.billingCycleId,
      );
    }

    return transaction;
  }

  async findAllByCycle(
    userId: string,
    billingCycleId: string,
    filters?: { categoryId?: string; paymentMethodId?: string; isPaid?: boolean; personId?: string; search?: string },
  ) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        billingCycleId,
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.paymentMethodId && {
          paymentMethodId: filters.paymentMethodId,
        }),
        ...(filters?.isPaid !== undefined && { isPaid: filters.isPaid }),
        ...(filters?.personId && {
          splits: { some: { personId: filters.personId } },
        }),
        ...(filters?.search && {
          description: { contains: filters.search, mode: "insensitive" as const },
        }),
      },
      include: {
        category: true,
        paymentMethod: true,
        splits: {
          select: {
            id: true,
            amount: true,
            person: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        paymentMethod: true,
        splits: {
          include: {
            person: { select: { id: true, name: true } },
            receivables: {
              select: { id: true, amount: true, paidAmount: true, status: true },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    const splitsTotal = transaction.splits.reduce(
      (sum, s) => sum + toNum(s.amount),
      0,
    );
    const userAmount = (toNum(transaction.amount) - splitsTotal).toFixed(2);

    return { ...transaction, userAmount };
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { billingCycle: true },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.billingCycle.status === "closed") {
      throw new BadRequestException(
        "Cannot edit transaction in a closed billing cycle",
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.paymentMethodId !== undefined && {
          paymentMethodId: dto.paymentMethodId,
        }),
      },
      include: {
        category: true,
        paymentMethod: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { billingCycle: true },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.billingCycle.status === "closed") {
      throw new BadRequestException(
        "Cannot delete transaction from a closed billing cycle",
      );
    }

    // If this is a parent transaction with installments, delete unpaid future children
    if (
      transaction.totalInstallments &&
      transaction.totalInstallments > 1 &&
      !transaction.parentTransactionId
    ) {
      await this.prisma.transaction.deleteMany({
        where: {
          parentTransactionId: id,
          isPaid: false,
        },
      });
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async togglePaid(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { isPaid: !transaction.isPaid },
      include: {
        category: true,
        paymentMethod: true,
      },
    });
  }
}
