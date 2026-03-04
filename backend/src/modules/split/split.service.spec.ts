import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SplitService } from "./split.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

// Minimal Decimal-like object for testing (Prisma returns Decimal instances)
function decimal(value: string) {
  return { toString: () => value, toNumber: () => parseFloat(value) };
}

const mockPrisma = {
  transaction: {
    findFirst: jest.fn(),
  },
  person: {
    findMany: jest.fn(),
  },
  split: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  receivable: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe("SplitService", () => {
  let service: SplitService;
  const userId = "user-uuid-1";
  const transactionId = "tx-uuid-1";

  const mockTransaction = {
    id: transactionId,
    description: "Restaurante",
    amount: decimal("300.00"),
    userId,
  };

  const mockPerson1 = {
    id: "person-uuid-1",
    name: "Joao",
    userId,
  };

  const mockPerson2 = {
    id: "person-uuid-2",
    name: "Maria",
    userId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SplitService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SplitService>(SplitService);
    jest.clearAllMocks();
  });

  describe("createSplits", () => {
    it("should create splits and receivables", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.person.findMany.mockResolvedValue([mockPerson1, mockPerson2]);

      const mockSplit1 = {
        id: "split-1",
        transactionId,
        personId: "person-uuid-1",
        amount: decimal("100.00"),
        person: mockPerson1,
      };
      const mockSplit2 = {
        id: "split-2",
        transactionId,
        personId: "person-uuid-2",
        amount: decimal("100.00"),
        person: mockPerson2,
      };

      mockPrisma.$transaction.mockImplementation(async (cb: Function) => {
        const tx = {
          split: {
            create: jest
              .fn()
              .mockResolvedValueOnce(mockSplit1)
              .mockResolvedValueOnce(mockSplit2),
          },
          receivable: { create: jest.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const result = await service.createSplits(userId, transactionId, {
        splits: [
          { personId: "person-uuid-1", amount: "100.00" },
          { personId: "person-uuid-2", amount: "100.00" },
        ],
      });

      expect(result.splits).toHaveLength(2);
      expect(result.userAmount).toBe("100.00");
    });

    it("should throw NotFoundException when transaction not found", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.createSplits(userId, "nonexistent", {
          splits: [{ personId: "person-uuid-1", amount: "100.00" }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when person not found", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.person.findMany.mockResolvedValue([]);

      await expect(
        service.createSplits(userId, transactionId, {
          splits: [{ personId: "nonexistent-person", amount: "100.00" }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when splits exceed transaction amount", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.person.findMany.mockResolvedValue([mockPerson1]);

      await expect(
        service.createSplits(userId, transactionId, {
          splits: [{ personId: "person-uuid-1", amount: "500.00" }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("replaceSplits", () => {
    it("should delete existing splits and create new ones", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.split.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.person.findMany.mockResolvedValue([mockPerson1]);

      const mockSplit = {
        id: "split-new",
        transactionId,
        personId: "person-uuid-1",
        amount: decimal("150.00"),
        person: mockPerson1,
      };

      mockPrisma.$transaction.mockImplementation(async (cb: Function) => {
        const tx = {
          split: { create: jest.fn().mockResolvedValue(mockSplit) },
          receivable: { create: jest.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const result = await service.replaceSplits(userId, transactionId, {
        splits: [{ personId: "person-uuid-1", amount: "150.00" }],
      });

      expect(mockPrisma.split.deleteMany).toHaveBeenCalledWith({
        where: { transactionId },
      });
      expect(result.splits).toHaveLength(1);
      expect(result.userAmount).toBe("150.00");
    });
  });

  describe("findByTransaction", () => {
    it("should return splits with userAmount", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrisma.split.findMany.mockResolvedValue([
        {
          id: "split-1",
          transactionId,
          personId: "person-uuid-1",
          amount: decimal("100.00"),
          person: { id: "person-uuid-1", name: "Joao" },
          receivables: [
            {
              id: "rec-1",
              amount: decimal("100.00"),
              paidAmount: decimal("0"),
              status: "pending",
            },
          ],
        },
      ]);

      const result = await service.findByTransaction(userId, transactionId);

      expect(result.splits).toHaveLength(1);
      expect(result.userAmount).toBe("200.00");
    });

    it("should throw NotFoundException when transaction not found", async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.findByTransaction(userId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
