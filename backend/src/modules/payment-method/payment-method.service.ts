import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreatePaymentMethodDto } from "./dto/create-payment-method.dto.js";
import type { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto.js";

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(userId: string, id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!paymentMethod) {
      throw new NotFoundException("Payment method not found");
    }

    return paymentMethod;
  }

  async update(userId: string, id: string, dto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!paymentMethod) {
      throw new NotFoundException("Payment method not found");
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if ("dueDay" in dto) data.dueDay = dto.dueDay ?? null;

    return this.prisma.paymentMethod.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!paymentMethod) {
      throw new NotFoundException("Payment method not found");
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
