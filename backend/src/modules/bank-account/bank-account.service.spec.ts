import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { BankAccountService } from "./bank-account.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const mockPrisma = {
  bankAccount: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe("BankAccountService", () => {
  let service: BankAccountService;
  const userId = "user-uuid-1";

  const mockAccount = {
    id: "ba-uuid-1",
    name: "Nubank CC",
    institution: "Nubank",
    type: "checking",
    balance: 5000,
    isActive: true,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BankAccountService>(BankAccountService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a bank account", async () => {
      mockPrisma.bankAccount.create.mockResolvedValue(mockAccount);

      const dto = {
        name: "Nubank CC",
        institution: "Nubank",
        type: "checking" as const,
        balance: 5000,
      };

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockAccount);
      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          institution: dto.institution,
          type: dto.type,
          balance: dto.balance,
        },
      });
    });

    it("should create a bank account with default balance 0", async () => {
      const accountZero = { ...mockAccount, balance: 0 };
      mockPrisma.bankAccount.create.mockResolvedValue(accountZero);

      const dto = {
        name: "Nubank CC",
        institution: "Nubank",
        type: "checking" as const,
      };

      await service.create(userId, dto);

      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          institution: dto.institution,
          type: dto.type,
          balance: 0,
        },
      });
    });
  });

  describe("findAll", () => {
    it("should return active bank accounts ordered by name", async () => {
      mockPrisma.bankAccount.findMany.mockResolvedValue([mockAccount]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockAccount]);
      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("update", () => {
    it("should update a bank account", async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(mockAccount);
      mockPrisma.bankAccount.update.mockResolvedValue({
        ...mockAccount,
        name: "Nubank Atualizado",
      });

      const result = await service.update(userId, "ba-uuid-1", {
        name: "Nubank Atualizado",
      });

      expect(result.name).toBe("Nubank Atualizado");
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: "ba-uuid-1" },
        data: { name: "Nubank Atualizado" },
      });
    });

    it("should throw NotFoundException when account not found for update", async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove (soft-delete)", () => {
    it("should soft-delete a bank account", async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(mockAccount);
      mockPrisma.bankAccount.update.mockResolvedValue({
        ...mockAccount,
        isActive: false,
      });

      const result = await service.remove(userId, "ba-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: "ba-uuid-1" },
        data: { isActive: false },
      });
    });

    it("should throw NotFoundException when account not found for remove", async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateBalance", () => {
    it("should update balance of a bank account", async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(mockAccount);
      mockPrisma.bankAccount.update.mockResolvedValue({
        ...mockAccount,
        balance: 7500,
      });

      const result = await service.updateBalance(userId, "ba-uuid-1", {
        balance: 7500,
      });

      expect(result.balance).toBe(7500);
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: "ba-uuid-1" },
        data: { balance: 7500 },
      });
    });

    it("should throw NotFoundException when account not found for updateBalance", async () => {
      mockPrisma.bankAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.updateBalance(userId, "nonexistent", { balance: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
