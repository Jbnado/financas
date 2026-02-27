import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateBillingCycleDto } from "./dto/create-billing-cycle.dto.js";
import type { UpdateBillingCycleDto } from "./dto/update-billing-cycle.dto.js";

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
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    return {
      ...cycle,
      summary: {
        salary: cycle.salary.toString(),
        totalCards: "0.00",
        totalFixed: "0.00",
        totalTaxes: "0.00",
        totalReceivables: "0.00",
        netResult: cycle.salary.toString(),
      },
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
}
