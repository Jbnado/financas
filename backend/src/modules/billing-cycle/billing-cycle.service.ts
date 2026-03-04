import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { PatrimonyService } from "../patrimony/patrimony.service.js";
import type { CreateBillingCycleDto } from "./dto/create-billing-cycle.dto.js";
import type { UpdateBillingCycleDto } from "./dto/update-billing-cycle.dto.js";

@Injectable()
export class BillingCycleService {
  private readonly logger = new Logger(BillingCycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly patrimonyService: PatrimonyService,
  ) {}

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

  async close(userId: string, id: string) {
    const cycle = await this.prisma.billingCycle.findFirst({
      where: { id, userId },
    });

    if (!cycle) {
      throw new NotFoundException("Billing cycle not found");
    }

    if (cycle.status === "closed") {
      throw new BadRequestException("Ciclo já está fechado");
    }

    const closed = await this.prisma.billingCycle.update({
      where: { id },
      data: {
        status: "closed",
        closedAt: new Date(),
      },
    });

    try {
      await this.patrimonyService.createSnapshot(userId, id);
    } catch (error) {
      this.logger.error(
        `Failed to create patrimony snapshot for cycle ${id}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return closed;
  }

  async ensureCycleExists(userId: string, targetDate: Date) {
    // Check if a cycle already contains the target date
    const existing = await this.prisma.billingCycle.findFirst({
      where: {
        userId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (existing) {
      return existing;
    }

    // Find the most recent cycle to base the new one on
    const lastCycle = await this.prisma.billingCycle.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    let newStartDate: Date;
    let durationMs: number;
    let salary: string | number = 0;

    if (lastCycle) {
      const lastStart = new Date(lastCycle.startDate);
      const lastEnd = new Date(lastCycle.endDate);
      durationMs = lastEnd.getTime() - lastStart.getTime();
      salary = lastCycle.salary.toString();

      // Start from the day after the last cycle's endDate
      newStartDate = new Date(lastEnd.getTime() + 24 * 60 * 60 * 1000);
    } else {
      // No previous cycle: create a 30-day cycle starting from targetDate
      durationMs = 30 * 24 * 60 * 60 * 1000;
      newStartDate = targetDate;
    }

    // Create sequential cycles until we cover the target date
    const MAX_CYCLES = 120; // safety limit: ~10 years of monthly cycles
    let created;
    for (let i = 0; i < MAX_CYCLES; i++) {
      const newEndDate = new Date(newStartDate.getTime() + durationMs);
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      const name = `Ciclo ${monthNames[newStartDate.getMonth()]}/${newStartDate.getFullYear()}`;

      created = await this.prisma.billingCycle.create({
        data: {
          userId,
          name,
          startDate: newStartDate,
          endDate: newEndDate,
          salary,
        },
      });

      if (newStartDate <= targetDate && newEndDate >= targetDate) {
        return created;
      }

      newStartDate = new Date(newEndDate.getTime() + 24 * 60 * 60 * 1000);
    }

    throw new BadRequestException(
      "Unable to create cycle: target date is too far from the last cycle",
    );
  }
}
