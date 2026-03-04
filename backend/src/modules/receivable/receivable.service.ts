import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreatePaymentDto } from "./dto/create-payment.dto.js";

function toNum(v: unknown): number {
  return typeof v === "object" && v !== null && "toNumber" in v
    ? (v as { toNumber(): number }).toNumber()
    : Number(v);
}

@Injectable()
export class ReceivableService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(userId: string, receivableId: string, dto: CreatePaymentDto) {
    const receivable = await this.prisma.receivable.findFirst({
      where: {
        id: receivableId,
        split: { transaction: { userId } },
      },
      include: { split: { include: { transaction: true } } },
    });

    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }

    const amount = parseFloat(dto.amount);
    const currentPaid = toNum(receivable.paidAmount);
    const total = toNum(receivable.amount);
    const remaining = total - currentPaid;

    if (amount <= 0) {
      throw new BadRequestException("Payment amount must be positive");
    }

    if (amount > remaining + 0.001) {
      throw new BadRequestException(
        "Payment amount exceeds remaining balance",
      );
    }

    const newPaidAmount = (currentPaid + amount).toFixed(2);
    const newStatus =
      parseFloat(newPaidAmount) >= total ? "paid" : "partial";

    const payment = await this.prisma.receivablePayment.create({
      data: {
        receivableId,
        amount: dto.amount,
        paidAt: new Date(dto.paidAt),
      },
    });

    await this.prisma.receivable.update({
      where: { id: receivableId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });

    return payment;
  }

  async findByPerson(userId: string, personId: string, billingCycleId?: string) {
    return this.prisma.receivable.findMany({
      where: {
        personId,
        split: { transaction: { userId, ...(billingCycleId && { billingCycleId }) } },
      },
      include: {
        split: {
          include: {
            transaction: {
              select: { id: true, description: true, date: true, amount: true },
            },
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSummary(userId: string, billingCycleId?: string) {
    const receivables = await this.prisma.receivable.findMany({
      where: {
        split: { transaction: { userId, ...(billingCycleId && { billingCycleId }) } },
      },
      include: {
        person: { select: { id: true, name: true } },
      },
    });

    const byPerson = new Map<
      string,
      { personId: string; personName: string; totalPending: number; totalPaid: number }
    >();

    for (const r of receivables) {
      const key = r.personId;
      if (!byPerson.has(key)) {
        byPerson.set(key, {
          personId: r.personId,
          personName: r.person.name,
          totalPending: 0,
          totalPaid: 0,
        });
      }
      const entry = byPerson.get(key)!;
      const amount = toNum(r.amount);
      const paid = toNum(r.paidAmount);
      entry.totalPending += amount - paid;
      entry.totalPaid += paid;
    }

    return Array.from(byPerson.values()).map((e) => ({
      personId: e.personId,
      personName: e.personName,
      totalPending: e.totalPending.toFixed(2),
      totalPaid: e.totalPaid.toFixed(2),
    }));
  }
}
