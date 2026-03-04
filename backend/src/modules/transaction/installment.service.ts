import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { BillingCycleService } from "../billing-cycle/billing-cycle.service.js";

export interface InstallmentParent {
  id: string;
  description: string;
  date: Date;
  categoryId: string;
  paymentMethodId: string;
}

@Injectable()
export class InstallmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingCycleService: BillingCycleService,
  ) {}

  async createInstallments(
    userId: string,
    parent: InstallmentParent,
    totalAmount: string,
    totalInstallments: number,
    parentCycleId: string,
  ) {
    const amounts = this.distributeAmount(totalAmount, totalInstallments);

    // Get the parent cycle to start chaining from
    let prevCycle = await this.prisma.billingCycle.findFirstOrThrow({
      where: { id: parentCycleId },
    });

    const children = [];
    for (let i = 1; i < totalInstallments; i++) {
      // Chain: find the NEXT cycle after the previous one's end date
      const dayAfterPrev = new Date(
        new Date(prevCycle.endDate).getTime() + 24 * 60 * 60 * 1000,
      );
      const nextCycle =
        await this.billingCycleService.ensureCycleExists(userId, dayAfterPrev);

      // Compute installment date (i months from parent), clamped to cycle range
      const futureDate = new Date(parent.date);
      futureDate.setUTCMonth(futureDate.getUTCMonth() + i);
      const originalDay = new Date(parent.date).getUTCDate();
      if (futureDate.getUTCDate() !== originalDay) {
        futureDate.setUTCDate(0);
      }
      const cycleStart = new Date(nextCycle.startDate);
      const cycleEnd = new Date(nextCycle.endDate);
      if (futureDate < cycleStart) futureDate.setTime(cycleStart.getTime());
      if (futureDate > cycleEnd) futureDate.setTime(cycleEnd.getTime());

      const child = await this.prisma.transaction.create({
        data: {
          description: parent.description,
          amount: amounts[i],
          date: futureDate,
          userId,
          billingCycleId: nextCycle.id,
          categoryId: parent.categoryId,
          paymentMethodId: parent.paymentMethodId,
          parentTransactionId: parent.id,
          installmentNumber: i + 1,
          totalInstallments,
        },
      });

      children.push(child);
      prevCycle = nextCycle;
    }

    return children;
  }

  /**
   * Distributes a total amount across N installments with cent-precise arithmetic.
   * Works in cents (integers) to avoid floating point issues.
   * First installment absorbs the remainder.
   */
  distributeAmount(totalAmount: string, installments: number): string[] {
    const totalCents = Math.round(parseFloat(totalAmount) * 100);
    const baseCents = Math.floor(totalCents / installments);
    const remainderCents = totalCents - baseCents * installments;
    const firstCents = baseCents + remainderCents;

    const amounts: string[] = [(firstCents / 100).toFixed(2)];
    for (let i = 1; i < installments; i++) {
      amounts.push((baseCents / 100).toFixed(2));
    }

    return amounts;
  }
}
