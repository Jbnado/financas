import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { BillingCycleService } from "./billing-cycle.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

// Minimal Decimal-like object for testing (Prisma returns Decimal instances)
function decimal(value: string) {
  return { toString: () => value, toNumber: () => parseFloat(value) };
}

const mockPrisma = {
  billingCycle: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe("BillingCycleService", () => {
  let service: BillingCycleService;
  const userId = "user-uuid-1";

  const mockCycle = {
    id: "cycle-uuid-1",
    userId,
    name: "Fevereiro 2026",
    startDate: new Date("2026-01-25"),
    endDate: new Date("2026-02-24"),
    salary: decimal("7300.00"),
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingCycleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BillingCycleService>(BillingCycleService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a billing cycle", async () => {
      mockPrisma.billingCycle.create.mockResolvedValue(mockCycle);

      const dto = {
        name: "Fevereiro 2026",
        startDate: "2026-01-25T00:00:00.000Z",
        endDate: "2026-02-24T00:00:00.000Z",
        salary: "7300.00",
      };

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockCycle);
      expect(mockPrisma.billingCycle.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          salary: dto.salary,
        },
      });
    });
  });

  describe("findAll", () => {
    it("should return cycles ordered by startDate desc", async () => {
      mockPrisma.billingCycle.findMany.mockResolvedValue([mockCycle]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockCycle]);
      expect(mockPrisma.billingCycle.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { startDate: "desc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return cycle with summary", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycle);

      const result = await service.findOne(userId, "cycle-uuid-1");

      expect(result.id).toBe("cycle-uuid-1");
      expect(result.summary).toEqual({
        salary: "7300.00",
        totalCards: "0.00",
        totalFixed: "0.00",
        totalTaxes: "0.00",
        totalReceivables: "0.00",
        netResult: "7300.00",
      });
    });

    it("should throw NotFoundException when cycle not found", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update an open cycle", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycle);
      mockPrisma.billingCycle.update.mockResolvedValue({
        ...mockCycle,
        name: "Março 2026",
      });

      const result = await service.update(userId, "cycle-uuid-1", {
        name: "Março 2026",
      });

      expect(result.name).toBe("Março 2026");
      expect(mockPrisma.billingCycle.update).toHaveBeenCalled();
    });

    it("should throw BadRequestException when updating closed cycle", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue({
        ...mockCycle,
        status: "closed",
      });

      await expect(
        service.update(userId, "cycle-uuid-1", { name: "Test" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when cycle not found", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
