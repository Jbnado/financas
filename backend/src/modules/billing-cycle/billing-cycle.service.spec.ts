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

  describe("close", () => {
    it("should close an open cycle and set closedAt", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(mockCycle);
      const closedCycle = {
        ...mockCycle,
        status: "closed",
        closedAt: new Date(),
      };
      mockPrisma.billingCycle.update.mockResolvedValue(closedCycle);

      const result = await service.close(userId, "cycle-uuid-1");

      expect(result.status).toBe("closed");
      expect(result.closedAt).toBeDefined();
      expect(mockPrisma.billingCycle.update).toHaveBeenCalledWith({
        where: { id: "cycle-uuid-1" },
        data: {
          status: "closed",
          closedAt: expect.any(Date),
        },
      });
    });

    it("should throw BadRequestException when cycle is already closed", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue({
        ...mockCycle,
        status: "closed",
      });

      await expect(
        service.close(userId, "cycle-uuid-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when cycle not found", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValue(null);

      await expect(
        service.close(userId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("ensureCycleExists", () => {
    it("should return existing cycle that contains the target date", async () => {
      mockPrisma.billingCycle.findFirst.mockResolvedValueOnce(mockCycle);

      const result = await service.ensureCycleExists(
        userId,
        new Date("2026-02-01"),
      );

      expect(result.id).toBe("cycle-uuid-1");
      expect(mockPrisma.billingCycle.create).not.toHaveBeenCalled();
    });

    it("should create a new cycle when no cycle contains the target date", async () => {
      mockPrisma.billingCycle.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCycle);

      const newCycle = {
        id: "cycle-uuid-2",
        userId,
        name: "Ciclo Fevereiro/2026",
        startDate: new Date("2026-02-25"),
        endDate: new Date("2026-03-27"),
        salary: decimal("7300.00"),
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.billingCycle.create.mockResolvedValue(newCycle);

      const result = await service.ensureCycleExists(
        userId,
        new Date("2026-03-01"),
      );

      expect(result).toBeDefined();
      expect(mockPrisma.billingCycle.create).toHaveBeenCalled();
    });

    it("should copy salary from previous cycle", async () => {
      mockPrisma.billingCycle.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCycle);

      const newCycle = {
        ...mockCycle,
        id: "cycle-uuid-new",
        startDate: new Date("2026-02-25"),
        endDate: new Date("2026-03-27"),
      };
      mockPrisma.billingCycle.create.mockResolvedValue(newCycle);

      await service.ensureCycleExists(userId, new Date("2026-03-01"));

      expect(mockPrisma.billingCycle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            salary: "7300.00",
          }),
        }),
      );
    });

    it("should create cycle with salary 0 when no previous cycle exists", async () => {
      mockPrisma.billingCycle.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const targetDate = new Date("2026-03-01");
      const newCycle = {
        ...mockCycle,
        id: "cycle-uuid-new",
        salary: decimal("0"),
        startDate: targetDate,
        endDate: new Date(targetDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      };
      mockPrisma.billingCycle.create.mockResolvedValue(newCycle);

      await service.ensureCycleExists(userId, targetDate);

      expect(mockPrisma.billingCycle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            salary: 0,
          }),
        }),
      );
    });
  });
});
