import { Test, TestingModule } from "@nestjs/testing";
import { InstallmentService } from "./installment.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { BillingCycleService } from "../billing-cycle/billing-cycle.service.js";

const mockPrisma = {
  billingCycle: {
    findFirst: jest.fn(),
    findFirstOrThrow: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
  },
};

const mockBillingCycleService = {
  ensureCycleExists: jest.fn(),
};

describe("InstallmentService", () => {
  let service: InstallmentService;
  const userId = "user-uuid-1";

  const mockCycle = {
    id: "cycle-uuid-1",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-31"),
    salary: "7300.00",
    status: "open",
  };

  const parentTx = {
    id: "tx-parent-1",
    description: "TV Parcelada",
    date: new Date("2026-03-15"),
    categoryId: "cat-uuid-1",
    paymentMethodId: "pm-uuid-1",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: BillingCycleService, useValue: mockBillingCycleService },
      ],
    }).compile();

    service = module.get<InstallmentService>(InstallmentService);
    jest.clearAllMocks();
  });

  describe("distributeAmount", () => {
    it("should distribute evenly when divisible", () => {
      const amounts = service.distributeAmount("300.00", 3);
      expect(amounts).toEqual(["100.00", "100.00", "100.00"]);
    });

    it("should put remainder in first installment", () => {
      const amounts = service.distributeAmount("1000.00", 3);
      // 1000/3 = 333.33, remainder = 0.01
      expect(amounts).toEqual(["333.34", "333.33", "333.33"]);
    });

    it("should handle large number of installments", () => {
      const amounts = service.distributeAmount("100.00", 7);
      // 100/7 = 14.28 base, remainder = 0.04
      expect(amounts[0]).toBe("14.32");
      for (let i = 1; i < 7; i++) {
        expect(amounts[i]).toBe("14.28");
      }
      // Verify total
      const total = amounts.reduce((sum, a) => sum + parseFloat(a), 0);
      expect(total.toFixed(2)).toBe("100.00");
    });

    it("should handle 2 installments", () => {
      const amounts = service.distributeAmount("99.99", 2);
      expect(amounts).toEqual(["50.00", "49.99"]);
    });
  });

  describe("createInstallments", () => {
    it("should create N-1 child transactions in sequential cycles", async () => {
      const futureCycle1 = {
        ...mockCycle,
        id: "cycle-future-1",
        endDate: new Date("2026-04-30"),
      };
      const futureCycle2 = {
        ...mockCycle,
        id: "cycle-future-2",
        endDate: new Date("2026-05-31"),
      };
      mockPrisma.billingCycle.findFirstOrThrow.mockResolvedValue(mockCycle);
      mockBillingCycleService.ensureCycleExists
        .mockResolvedValueOnce(futureCycle1)
        .mockResolvedValueOnce(futureCycle2);

      let createCallCount = 0;
      mockPrisma.transaction.create.mockImplementation((args: any) => {
        createCallCount++;
        return Promise.resolve({
          id: `tx-child-${createCallCount}`,
          ...args.data,
        });
      });

      const children = await service.createInstallments(
        userId,
        parentTx,
        "300.00",
        3,
        mockCycle.id,
      );

      expect(children).toHaveLength(2);
      expect(mockPrisma.billingCycle.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: mockCycle.id },
      });
      expect(mockBillingCycleService.ensureCycleExists).toHaveBeenCalledTimes(2);

      // Verify installment numbers and cycle assignment
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            installmentNumber: 2,
            totalInstallments: 3,
            parentTransactionId: "tx-parent-1",
            amount: "100.00",
            billingCycleId: "cycle-future-1",
          }),
        }),
      );
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            installmentNumber: 3,
            billingCycleId: "cycle-future-2",
          }),
        }),
      );
    });

    it("should chain cycles sequentially (day after prev end)", async () => {
      const parentCycle = {
        ...mockCycle,
        id: "cycle-parent",
        endDate: new Date("2026-03-31"),
      };
      const futureCycle1 = {
        ...mockCycle,
        id: "cycle-future-1",
        endDate: new Date("2026-04-30"),
      };
      mockPrisma.billingCycle.findFirstOrThrow.mockResolvedValue(parentCycle);
      mockBillingCycleService.ensureCycleExists.mockResolvedValue(futureCycle1);
      mockPrisma.transaction.create.mockImplementation((args: any) =>
        Promise.resolve({ id: "tx-child", ...args.data }),
      );

      await service.createInstallments(
        userId,
        parentTx,
        "200.00",
        2,
        parentCycle.id,
      );

      // ensureCycleExists should be called with Apr 1 (day after Mar 31)
      const callDate =
        mockBillingCycleService.ensureCycleExists.mock.calls[0][1] as Date;
      expect(callDate.getUTCMonth()).toBe(3); // April
      expect(callDate.getUTCDate()).toBe(1);
    });
  });
});
