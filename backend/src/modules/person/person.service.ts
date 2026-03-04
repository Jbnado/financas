import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { CreatePersonDto } from "./dto/create-person.dto.js";
import type { UpdatePersonDto } from "./dto/update-person.dto.js";

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePersonDto) {
    return this.prisma.person.create({
      data: {
        userId,
        name: dto.name,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.person.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(userId: string, id: string) {
    const person = await this.prisma.person.findFirst({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException("Person not found");
    }

    return person;
  }

  async update(userId: string, id: string, dto: UpdatePersonDto) {
    const person = await this.prisma.person.findFirst({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException("Person not found");
    }

    return this.prisma.person.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const person = await this.prisma.person.findFirst({
      where: { id, userId },
    });

    if (!person) {
      throw new NotFoundException("Person not found");
    }

    return this.prisma.person.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
