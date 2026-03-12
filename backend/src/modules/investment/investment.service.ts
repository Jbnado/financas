import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateInvestmentDto } from "./dto/create-investment.dto.js";
import type { UpdateInvestmentDto } from "./dto/update-investment.dto.js";
import type { UpdateValueDto } from "./dto/update-value.dto.js";

@Injectable()
export class InvestmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateInvestmentDto) {
    return this.prisma.investment.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        institution: dto.institution,
        appliedAmount: dto.appliedAmount,
        currentValue: dto.currentValue,
        liquidity: dto.liquidity,
        maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async update(userId: string, id: string, dto: UpdateInvestmentDto) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!investment) {
      throw new NotFoundException("Investment not found");
    }

    return this.prisma.investment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.institution !== undefined && { institution: dto.institution }),
        ...(dto.liquidity !== undefined && { liquidity: dto.liquidity }),
        ...(dto.maturityDate !== undefined && {
          maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : null,
        }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!investment) {
      throw new NotFoundException("Investment not found");
    }

    return this.prisma.investment.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateValue(userId: string, id: string, dto: UpdateValueDto) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!investment) {
      throw new NotFoundException("Investment not found");
    }

    return this.prisma.investment.update({
      where: { id },
      data: { currentValue: dto.currentValue },
    });
  }
}
