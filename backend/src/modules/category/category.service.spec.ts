import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { CategoryService } from "./category.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const mockPrisma = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe("CategoryService", () => {
  let service: CategoryService;
  const userId = "user-uuid-1";

  const mockCategory = {
    id: "cat-uuid-1",
    name: "Alimentação",
    icon: "utensils",
    color: "#f97316",
    isActive: true,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a category with isActive true", async () => {
      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const dto = {
        name: "Alimentação",
        icon: "utensils",
        color: "#f97316",
      };

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          icon: dto.icon,
          color: dto.color,
        },
      });
    });

    it("should create a category with only name", async () => {
      const catWithoutOptionals = {
        ...mockCategory,
        icon: null,
        color: null,
      };
      mockPrisma.category.create.mockResolvedValue(catWithoutOptionals);

      const dto = { name: "Transporte" };

      await service.create(userId, dto);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: dto.name,
          icon: undefined,
          color: undefined,
        },
      });
    });
  });

  describe("findAll", () => {
    it("should return active categories ordered by name", async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockCategory]);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      });
    });

    it("should return all categories when includeInactive is true", async () => {
      const inactiveCat = { ...mockCategory, isActive: false };
      mockPrisma.category.findMany.mockResolvedValue([
        mockCategory,
        inactiveCat,
      ]);

      const result = await service.findAll(userId, true);

      expect(result).toHaveLength(2);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a category by id", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(userId, "cat-uuid-1");

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: "cat-uuid-1", userId },
      });
    });

    it("should throw NotFoundException when category not found", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a category", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.category.update.mockResolvedValue({
        ...mockCategory,
        name: "Alimentação Atualizada",
      });

      const result = await service.update(userId, "cat-uuid-1", {
        name: "Alimentação Atualizada",
      });

      expect(result.name).toBe("Alimentação Atualizada");
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "cat-uuid-1" },
        data: { name: "Alimentação Atualizada" },
      });
    });

    it("should throw NotFoundException when category not found for update", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove (soft-delete)", () => {
    it("should soft-delete a category by setting isActive to false", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.category.update.mockResolvedValue({
        ...mockCategory,
        isActive: false,
      });

      const result = await service.remove(userId, "cat-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: "cat-uuid-1" },
        data: { isActive: false },
      });
    });

    it("should throw NotFoundException when category not found for remove", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
