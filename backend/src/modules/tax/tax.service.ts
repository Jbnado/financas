import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateTaxDto } from "./dto/create-tax.dto";
import type { CreateTaxEntryDto } from "./dto/create-tax-entry.dto";
import type { UpdateTaxDto } from "./dto/update-tax.dto";

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaxDto) {
    return this.prisma.tax.create({
      data: {
        name: dto.name,
        rate: dto.rate,
        estimatedAmount: dto.estimatedAmount,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.tax.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(userId: string, id: string) {
    const tax = await this.prisma.tax.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!tax) throw new NotFoundException("Tax not found");
    return tax;
  }

  async update(userId: string, id: string, dto: UpdateTaxDto) {
    await this.findOne(userId, id);
    return this.prisma.tax.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
        ...(dto.estimatedAmount !== undefined && { estimatedAmount: dto.estimatedAmount }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.tax.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createEntry(userId: string, id: string, dto: CreateTaxEntryDto) {
    await this.findOne(userId, id);
    return this.prisma.taxEntry.create({
      data: {
        taxId: id,
        billingCycleId: dto.billingCycleId,
        actualAmount: dto.actualAmount,
        isPaid: dto.isPaid ?? false,
      },
    });
  }

  async toggleEntryPaid(userId: string, entryId: string) {
    const entry = await this.prisma.taxEntry.findFirst({
      where: { id: entryId, tax: { userId } },
    });
    if (!entry) throw new NotFoundException("Tax entry not found");
    return this.prisma.taxEntry.update({
      where: { id: entryId },
      data: { isPaid: !entry.isPaid },
    });
  }

  async findByCycle(userId: string, cycleId: string) {
    const taxes = await this.prisma.tax.findMany({
      where: { userId, isActive: true },
      include: {
        entries: { where: { billingCycleId: cycleId } },
      },
      orderBy: { name: "asc" },
    });

    return taxes.map((t) => {
      const entry = t.entries[0] ?? null;
      return {
        id: t.id,
        name: t.name,
        rate: t.rate,
        estimatedAmount: t.estimatedAmount,
        entry: entry
          ? {
              id: entry.id,
              taxId: entry.taxId,
              billingCycleId: entry.billingCycleId,
              actualAmount: entry.actualAmount,
              isPaid: entry.isPaid,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt,
            }
          : null,
      };
    });
  }
}
