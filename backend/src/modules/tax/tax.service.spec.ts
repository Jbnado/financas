import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { TaxService } from "./tax.service";
import { PrismaService } from "../../prisma/prisma.service";

function decimal(value: string) {
  return { toString: () => value, toNumber: () => parseFloat(value) };
}

const userId = "user-1";
const taxId = "tax-1";
const entryId = "entry-1";
const cycleId = "cycle-1";

const mockTax = {
  id: taxId,
  name: "DAS",
  rate: decimal("6.00"),
  estimatedAmount: decimal("500.00"),
  isActive: true,
  userId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEntry = {
  id: entryId,
  taxId,
  billingCycleId: cycleId,
  actualAmount: decimal("480.00"),
  isPaid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TaxService", () => {
  let service: TaxService;
  let prisma: {
    tax: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    taxEntry: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      tax: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      taxEntry: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TaxService);
  });

  describe("create", () => {
    it("should create a tax", async () => {
      prisma.tax.create.mockResolvedValue(mockTax);
      const result = await service.create(userId, {
        name: "DAS",
        rate: "6.00",
        estimatedAmount: "500.00",
      });
      expect(result).toEqual(mockTax);
      expect(prisma.tax.create).toHaveBeenCalledWith({
        data: { name: "DAS", rate: "6.00", estimatedAmount: "500.00", userId },
      });
    });
  });

  describe("findAll", () => {
    it("should return active taxes", async () => {
      prisma.tax.findMany.mockResolvedValue([mockTax]);
      const result = await service.findAll(userId);
      expect(result).toEqual([mockTax]);
    });
  });

  describe("findOne", () => {
    it("should return a tax", async () => {
      prisma.tax.findFirst.mockResolvedValue(mockTax);
      const result = await service.findOne(userId, taxId);
      expect(result).toEqual(mockTax);
    });

    it("should throw NotFoundException if not found", async () => {
      prisma.tax.findFirst.mockResolvedValue(null);
      await expect(service.findOne(userId, "bad")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a tax", async () => {
      prisma.tax.findFirst.mockResolvedValue(mockTax);
      prisma.tax.update.mockResolvedValue({ ...mockTax, name: "ISS" });
      const result = await service.update(userId, taxId, { name: "ISS" });
      expect(result.name).toBe("ISS");
    });

    it("should throw NotFoundException if not found", async () => {
      prisma.tax.findFirst.mockResolvedValue(null);
      await expect(service.update(userId, "bad", { name: "X" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should soft-delete a tax", async () => {
      prisma.tax.findFirst.mockResolvedValue(mockTax);
      prisma.tax.update.mockResolvedValue({ ...mockTax, isActive: false });
      const result = await service.remove(userId, taxId);
      expect(result.isActive).toBe(false);
    });
  });

  describe("createEntry", () => {
    it("should create an entry", async () => {
      prisma.tax.findFirst.mockResolvedValue(mockTax);
      prisma.taxEntry.create.mockResolvedValue(mockEntry);
      const result = await service.createEntry(userId, taxId, {
        billingCycleId: cycleId,
        actualAmount: "480.00",
      });
      expect(result).toEqual(mockEntry);
    });

    it("should throw NotFoundException if tax not found", async () => {
      prisma.tax.findFirst.mockResolvedValue(null);
      await expect(
        service.createEntry(userId, "bad", {
          billingCycleId: cycleId,
          actualAmount: "100.00",
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("toggleEntryPaid", () => {
    it("should toggle isPaid to true", async () => {
      prisma.taxEntry.findFirst.mockResolvedValue(mockEntry);
      prisma.taxEntry.update.mockResolvedValue({ ...mockEntry, isPaid: true });
      const result = await service.toggleEntryPaid(userId, entryId);
      expect(result.isPaid).toBe(true);
    });

    it("should throw NotFoundException if entry not found", async () => {
      prisma.taxEntry.findFirst.mockResolvedValue(null);
      await expect(service.toggleEntryPaid(userId, "bad")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByCycle", () => {
    it("should return taxes with entry for cycle", async () => {
      prisma.tax.findMany.mockResolvedValue([{ ...mockTax, entries: [mockEntry] }]);
      const result = await service.findByCycle(userId, cycleId);
      expect(result).toHaveLength(1);
      expect(result[0].entry).not.toBeNull();
    });

    it("should return null entry when no entry exists", async () => {
      prisma.tax.findMany.mockResolvedValue([{ ...mockTax, entries: [] }]);
      const result = await service.findByCycle(userId, cycleId);
      expect(result[0].entry).toBeNull();
    });
  });
});
