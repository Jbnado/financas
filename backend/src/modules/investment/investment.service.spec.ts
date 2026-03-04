import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { InvestmentService } from "./investment.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const mockPrisma = {
  investment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe("InvestmentService", () => {
  let service: InvestmentService;
  const userId = "user-uuid-1";

  const mockInvestment = {
    id: "inv-uuid-1",
    name: "Tesouro Selic 2029",
    type: "fixed_income",
    institution: "Tesouro Direto",
    appliedAmount: 20000,
    currentValue: 21500,
    liquidity: "daily",
    maturityDate: new Date("2029-01-01"),
    isActive: true,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create an investment", async () => {
      mockPrisma.investment.create.mockResolvedValue(mockInvestment);

      const dto = {
        name: "Tesouro Selic 2029",
        type: "fixed_income" as const,
        institution: "Tesouro Direto",
        appliedAmount: 20000,
        currentValue: 21500,
        liquidity: "daily" as const,
        maturityDate: "2029-01-01",
      };

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockInvestment);
      expect(mockPrisma.investment.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          type: dto.type,
          institution: dto.institution,
          appliedAmount: dto.appliedAmount,
          currentValue: dto.currentValue,
          liquidity: dto.liquidity,
          maturityDate: new Date("2029-01-01"),
        },
      });
    });

    it("should create an investment without maturity date", async () => {
      const invNoDate = { ...mockInvestment, maturityDate: null };
      mockPrisma.investment.create.mockResolvedValue(invNoDate);

      const dto = {
        name: "Bitcoin",
        type: "crypto" as const,
        institution: "Binance",
        appliedAmount: 5000,
        currentValue: 7800,
        liquidity: "daily" as const,
      };

      await service.create(userId, dto);

      expect(mockPrisma.investment.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          type: dto.type,
          institution: dto.institution,
          appliedAmount: dto.appliedAmount,
          currentValue: dto.currentValue,
          liquidity: dto.liquidity,
          maturityDate: null,
        },
      });
    });
  });

  describe("findAll", () => {
    it("should return active investments ordered by name", async () => {
      mockPrisma.investment.findMany.mockResolvedValue([mockInvestment]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockInvestment]);
      expect(mockPrisma.investment.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("update", () => {
    it("should update an investment", async () => {
      mockPrisma.investment.findFirst.mockResolvedValue(mockInvestment);
      mockPrisma.investment.update.mockResolvedValue({
        ...mockInvestment,
        name: "Tesouro IPCA 2035",
      });

      const result = await service.update(userId, "inv-uuid-1", {
        name: "Tesouro IPCA 2035",
      });

      expect(result.name).toBe("Tesouro IPCA 2035");
      expect(mockPrisma.investment.update).toHaveBeenCalledWith({
        where: { id: "inv-uuid-1" },
        data: { name: "Tesouro IPCA 2035" },
      });
    });

    it("should throw NotFoundException when investment not found for update", async () => {
      mockPrisma.investment.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove (soft-delete)", () => {
    it("should soft-delete an investment", async () => {
      mockPrisma.investment.findFirst.mockResolvedValue(mockInvestment);
      mockPrisma.investment.update.mockResolvedValue({
        ...mockInvestment,
        isActive: false,
      });

      const result = await service.remove(userId, "inv-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockPrisma.investment.update).toHaveBeenCalledWith({
        where: { id: "inv-uuid-1" },
        data: { isActive: false },
      });
    });

    it("should throw NotFoundException when investment not found for remove", async () => {
      mockPrisma.investment.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateValue", () => {
    it("should update current value of an investment", async () => {
      mockPrisma.investment.findFirst.mockResolvedValue(mockInvestment);
      mockPrisma.investment.update.mockResolvedValue({
        ...mockInvestment,
        currentValue: 25000,
      });

      const result = await service.updateValue(userId, "inv-uuid-1", {
        currentValue: 25000,
      });

      expect(result.currentValue).toBe(25000);
      expect(mockPrisma.investment.update).toHaveBeenCalledWith({
        where: { id: "inv-uuid-1" },
        data: { currentValue: 25000 },
      });
    });

    it("should throw NotFoundException when investment not found for updateValue", async () => {
      mockPrisma.investment.findFirst.mockResolvedValue(null);

      await expect(
        service.updateValue(userId, "nonexistent", { currentValue: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
