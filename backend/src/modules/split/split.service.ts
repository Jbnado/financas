import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateSplitsDto } from "./dto/create-splits.dto.js";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

@Injectable()
export class SplitService {
  constructor(private readonly prisma: PrismaService) {}

  async createSplits(userId: string, transactionId: string, dto: CreateSplitsDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Validate persons belong to user
    const personIds = dto.splits.map((s) => s.personId);
    const persons = await this.prisma.person.findMany({
      where: { id: { in: personIds }, userId },
    });

    if (persons.length !== personIds.length) {
      throw new BadRequestException("One or more persons not found");
    }

    // Validate sum of splits <= transaction amount
    const splitsTotal = dto.splits.reduce(
      (sum, s) => sum + parseFloat(s.amount),
      0,
    );
    const txAmount = toNum(transaction.amount);

    if (splitsTotal > txAmount) {
      throw new BadRequestException(
        "Sum of splits cannot exceed transaction amount",
      );
    }

    const userAmount = (txAmount - splitsTotal).toFixed(2);

    // Create splits and receivables in a transaction
    const splits = await this.prisma.$transaction(async (tx: any) => {
      const created = [];
      for (const item of dto.splits) {
        const split = await tx.split.create({
          data: {
            transactionId,
            personId: item.personId,
            amount: item.amount,
          },
          include: { person: true },
        });

        // Auto-create receivable for each split
        await tx.receivable.create({
          data: {
            splitId: split.id,
            personId: item.personId,
            amount: item.amount,
          },
        });

        created.push(split);
      }

      // Propagate splits to child installments (if this is a parent transaction)
      if (
        transaction.totalInstallments &&
        transaction.totalInstallments > 1 &&
        !transaction.parentTransactionId
      ) {
        const children = await tx.transaction.findMany({
          where: { parentTransactionId: transactionId },
          orderBy: { installmentNumber: "asc" },
        });

        for (const child of children) {
          const childAmount = toNum(child.amount);
          for (const item of dto.splits) {
            // Proportional split: maintain same ratio as parent
            const ratio = parseFloat(item.amount) / txAmount;
            const childSplitAmount = (ratio * childAmount).toFixed(2);

            const childSplit = await tx.split.create({
              data: {
                transactionId: child.id,
                personId: item.personId,
                amount: childSplitAmount,
              },
            });

            await tx.receivable.create({
              data: {
                splitId: childSplit.id,
                personId: item.personId,
                amount: childSplitAmount,
              },
            });
          }
        }
      }

      return created;
    });

    return { splits, userAmount };
  }

  async replaceSplits(userId: string, transactionId: string, dto: CreateSplitsDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Delete existing splits (cascade deletes receivables)
    await this.prisma.split.deleteMany({
      where: { transactionId },
    });

    // Create new splits
    return this.createSplits(userId, transactionId, dto);
  }

  async findByTransaction(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    const splits = await this.prisma.split.findMany({
      where: { transactionId },
      include: {
        person: { select: { id: true, name: true } },
        receivables: {
          select: { id: true, amount: true, paidAmount: true, status: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const splitsTotal = splits.reduce(
      (sum, s) => sum + toNum(s.amount),
      0,
    );
    const txAmount = toNum(transaction.amount);
    const userAmount = (txAmount - splitsTotal).toFixed(2);

    return { splits, userAmount };
  }
}
