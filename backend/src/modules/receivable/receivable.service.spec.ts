import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ReceivableService } from "./receivable.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

function decimal(value: string) {
  return { toString: () => value, toNumber: () => parseFloat(value) };
}

const mockPrisma = {
  receivable: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  receivablePayment: {
    create: jest.fn(),
  },
};

describe("ReceivableService", () => {
  let service: ReceivableService;
  const userId = "user-uuid-1";

  const mockReceivable = {
    id: "rec-uuid-1",
    splitId: "split-uuid-1",
    personId: "person-uuid-1",
    amount: decimal("100.00"),
    paidAmount: decimal("0"),
    status: "pending",
    split: {
      transaction: { userId, id: "tx-uuid-1" },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceivableService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReceivableService>(ReceivableService);
    jest.clearAllMocks();
  });

  describe("createPayment", () => {
    it("should create payment and update receivable to paid", async () => {
      mockPrisma.receivable.findFirst.mockResolvedValue(mockReceivable);
      const mockPayment = {
        id: "pay-1",
        receivableId: "rec-uuid-1",
        amount: decimal("100.00"),
        paidAt: new Date("2026-03-04"),
      };
      mockPrisma.receivablePayment.create.mockResolvedValue(mockPayment);
      mockPrisma.receivable.update.mockResolvedValue({});

      const result = await service.createPayment(userId, "rec-uuid-1", {
        amount: "100.00",
        paidAt: "2026-03-04",
      });

      expect(result).toEqual(mockPayment);
      expect(mockPrisma.receivable.update).toHaveBeenCalledWith({
        where: { id: "rec-uuid-1" },
        data: { paidAmount: "100.00", status: "paid" },
      });
    });

    it("should create partial payment and update status to partial", async () => {
      mockPrisma.receivable.findFirst.mockResolvedValue(mockReceivable);
      const mockPayment = {
        id: "pay-2",
        receivableId: "rec-uuid-1",
        amount: decimal("50.00"),
        paidAt: new Date("2026-03-04"),
      };
      mockPrisma.receivablePayment.create.mockResolvedValue(mockPayment);
      mockPrisma.receivable.update.mockResolvedValue({});

      const result = await service.createPayment(userId, "rec-uuid-1", {
        amount: "50.00",
        paidAt: "2026-03-04",
      });

      expect(result).toEqual(mockPayment);
      expect(mockPrisma.receivable.update).toHaveBeenCalledWith({
        where: { id: "rec-uuid-1" },
        data: { paidAmount: "50.00", status: "partial" },
      });
    });

    it("should throw NotFoundException when receivable not found", async () => {
      mockPrisma.receivable.findFirst.mockResolvedValue(null);

      await expect(
        service.createPayment(userId, "nonexistent", {
          amount: "50.00",
          paidAt: "2026-03-04",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when overpaying", async () => {
      mockPrisma.receivable.findFirst.mockResolvedValue(mockReceivable);

      await expect(
        service.createPayment(userId, "rec-uuid-1", {
          amount: "150.00",
          paidAt: "2026-03-04",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should handle second partial payment completing the receivable", async () => {
      const partiallyPaid = {
        ...mockReceivable,
        paidAmount: decimal("50.00"),
        status: "partial",
      };
      mockPrisma.receivable.findFirst.mockResolvedValue(partiallyPaid);
      mockPrisma.receivablePayment.create.mockResolvedValue({
        id: "pay-3",
        amount: decimal("50.00"),
      });
      mockPrisma.receivable.update.mockResolvedValue({});

      await service.createPayment(userId, "rec-uuid-1", {
        amount: "50.00",
        paidAt: "2026-03-04",
      });

      expect(mockPrisma.receivable.update).toHaveBeenCalledWith({
        where: { id: "rec-uuid-1" },
        data: { paidAmount: "100.00", status: "paid" },
      });
    });
  });

  describe("findByPerson", () => {
    it("should return receivables for a person", async () => {
      const mockList = [
        {
          id: "rec-1",
          personId: "person-uuid-1",
          amount: decimal("100.00"),
          paidAmount: decimal("0"),
          status: "pending",
          split: {
            transaction: {
              id: "tx-1",
              description: "Restaurante",
              date: new Date(),
              amount: decimal("300.00"),
            },
          },
          payments: [],
        },
      ];
      mockPrisma.receivable.findMany.mockResolvedValue(mockList);

      const result = await service.findByPerson(userId, "person-uuid-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("rec-1");
    });
  });

  describe("getSummary", () => {
    it("should return consolidated summary by person", async () => {
      mockPrisma.receivable.findMany.mockResolvedValue([
        {
          id: "rec-1",
          personId: "person-1",
          amount: decimal("100.00"),
          paidAmount: decimal("50.00"),
          person: { id: "person-1", name: "Joao" },
        },
        {
          id: "rec-2",
          personId: "person-1",
          amount: decimal("200.00"),
          paidAmount: decimal("0"),
          person: { id: "person-1", name: "Joao" },
        },
        {
          id: "rec-3",
          personId: "person-2",
          amount: decimal("75.00"),
          paidAmount: decimal("75.00"),
          person: { id: "person-2", name: "Maria" },
        },
      ]);

      const result = await service.getSummary(userId);

      expect(result).toHaveLength(2);

      const joao = result.find((r) => r.personId === "person-1");
      expect(joao?.totalPending).toBe("250.00");
      expect(joao?.totalPaid).toBe("50.00");

      const maria = result.find((r) => r.personId === "person-2");
      expect(maria?.totalPending).toBe("0.00");
      expect(maria?.totalPaid).toBe("75.00");
    });
  });
});
