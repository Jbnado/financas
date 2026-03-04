import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { FixedExpenseService } from "./fixed-expense.service";
import { PrismaService } from "../../prisma/prisma.service";

function decimal(value: string) {
  return { toString: () => value, toNumber: () => parseFloat(value) };
}

const userId = "user-1";
const expenseId = "exp-1";
const entryId = "entry-1";
const cycleId = "cycle-1";

const mockExpense = {
  id: expenseId,
  name: "Aluguel",
  estimatedAmount: decimal("1500.00"),
  dueDay: 10,
  isActive: true,
  userId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEntry = {
  id: entryId,
  fixedExpenseId: expenseId,
  billingCycleId: cycleId,
  actualAmount: decimal("1450.00"),
  isPaid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("FixedExpenseService", () => {
  let service: FixedExpenseService;
  let prisma: {
    fixedExpense: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    fixedExpenseEntry: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      fixedExpense: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      fixedExpenseEntry: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FixedExpenseService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FixedExpenseService);
  });

  describe("create", () => {
    it("should create a fixed expense", async () => {
      prisma.fixedExpense.create.mockResolvedValue(mockExpense);
      const result = await service.create(userId, {
        name: "Aluguel",
        estimatedAmount: "1500.00",
        dueDay: 10,
      });
      expect(result).toEqual(mockExpense);
      expect(prisma.fixedExpense.create).toHaveBeenCalledWith({
        data: { name: "Aluguel", estimatedAmount: "1500.00", dueDay: 10, userId },
      });
    });
  });

  describe("findAll", () => {
    it("should return active fixed expenses", async () => {
      prisma.fixedExpense.findMany.mockResolvedValue([mockExpense]);
      const result = await service.findAll(userId);
      expect(result).toEqual([mockExpense]);
      expect(prisma.fixedExpense.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a fixed expense", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(mockExpense);
      const result = await service.findOne(userId, expenseId);
      expect(result).toEqual(mockExpense);
    });

    it("should throw NotFoundException if not found", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(null);
      await expect(service.findOne(userId, "bad")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a fixed expense", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(mockExpense);
      prisma.fixedExpense.update.mockResolvedValue({ ...mockExpense, name: "Internet" });
      const result = await service.update(userId, expenseId, { name: "Internet" });
      expect(result.name).toBe("Internet");
    });

    it("should throw NotFoundException if not found", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(null);
      await expect(service.update(userId, "bad", { name: "X" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should soft-delete a fixed expense", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(mockExpense);
      prisma.fixedExpense.update.mockResolvedValue({ ...mockExpense, isActive: false });
      const result = await service.remove(userId, expenseId);
      expect(result.isActive).toBe(false);
      expect(prisma.fixedExpense.update).toHaveBeenCalledWith({
        where: { id: expenseId },
        data: { isActive: false },
      });
    });
  });

  describe("createEntry", () => {
    it("should create an entry for a billing cycle", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(mockExpense);
      prisma.fixedExpenseEntry.create.mockResolvedValue(mockEntry);
      const result = await service.createEntry(userId, expenseId, {
        billingCycleId: cycleId,
        actualAmount: "1450.00",
      });
      expect(result).toEqual(mockEntry);
    });

    it("should throw NotFoundException if expense not found", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(null);
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
      prisma.fixedExpenseEntry.findFirst.mockResolvedValue(mockEntry);
      prisma.fixedExpenseEntry.update.mockResolvedValue({ ...mockEntry, isPaid: true });
      const result = await service.toggleEntryPaid(userId, entryId);
      expect(result.isPaid).toBe(true);
    });

    it("should throw NotFoundException if entry not found", async () => {
      prisma.fixedExpenseEntry.findFirst.mockResolvedValue(null);
      await expect(service.toggleEntryPaid(userId, "bad")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByCycle", () => {
    it("should return expenses with entry for cycle", async () => {
      prisma.fixedExpense.findMany.mockResolvedValue([
        { ...mockExpense, entries: [mockEntry] },
      ]);
      const result = await service.findByCycle(userId, cycleId);
      expect(result).toHaveLength(1);
      expect(result[0].entry).not.toBeNull();
      expect(result[0].difference).toBe("-50.00");
    });

    it("should return null entry when no entry exists", async () => {
      prisma.fixedExpense.findMany.mockResolvedValue([
        { ...mockExpense, entries: [] },
      ]);
      const result = await service.findByCycle(userId, cycleId);
      expect(result[0].entry).toBeNull();
      expect(result[0].difference).toBeNull();
    });
  });

  describe("findHistory", () => {
    it("should return entry history", async () => {
      prisma.fixedExpense.findFirst.mockResolvedValue(mockExpense);
      prisma.fixedExpenseEntry.findMany.mockResolvedValue([mockEntry]);
      const result = await service.findHistory(userId, expenseId);
      expect(result).toEqual([mockEntry]);
    });
  });
});
