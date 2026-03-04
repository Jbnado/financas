import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreateBankAccountDto } from "./dto/create-bank-account.dto.js";
import type { UpdateBankAccountDto } from "./dto/update-bank-account.dto.js";
import type { UpdateBalanceDto } from "./dto/update-balance.dto.js";

@Injectable()
export class BankAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBankAccountDto) {
    return this.prisma.bankAccount.create({
      data: {
        userId,
        name: dto.name,
        institution: dto.institution,
        type: dto.type,
        balance: dto.balance ?? 0,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async update(userId: string, id: string, dto: UpdateBankAccountDto) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.institution !== undefined && { institution: dto.institution }),
        ...(dto.type !== undefined && { type: dto.type }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateBalance(userId: string, id: string, dto: UpdateBalanceDto) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException("Bank account not found");
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: { balance: dto.balance },
    });
  }
}
