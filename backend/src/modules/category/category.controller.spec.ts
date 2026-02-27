import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { CategoryController } from "./category.controller.js";
import { CategoryService } from "./category.service.js";

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

function mockReq(userId = "user-uuid-1") {
  return { user: { id: userId } } as any;
}

describe("CategoryController", () => {
  let controller: CategoryController;

  const mockCategory = {
    id: "cat-uuid-1",
    name: "Alimentação",
    icon: "utensils",
    color: "#f97316",
    isActive: true,
    userId: "user-uuid-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    jest.clearAllMocks();
  });

  describe("POST /categories", () => {
    it("should create a category", async () => {
      mockService.create.mockResolvedValue(mockCategory);

      const dto = {
        name: "Alimentação",
        icon: "utensils",
        color: "#f97316",
      };

      const result = await controller.create(mockReq(), dto);

      expect(result).toEqual(mockCategory);
      expect(mockService.create).toHaveBeenCalledWith("user-uuid-1", dto);
    });
  });

  describe("GET /categories", () => {
    it("should return list of active categories", async () => {
      mockService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll(mockReq(), undefined);

      expect(result).toEqual([mockCategory]);
      expect(mockService.findAll).toHaveBeenCalledWith("user-uuid-1", false);
    });

    it("should return all categories when includeInactive=true", async () => {
      const inactiveCat = { ...mockCategory, isActive: false };
      mockService.findAll.mockResolvedValue([mockCategory, inactiveCat]);

      const result = await controller.findAll(mockReq(), "true");

      expect(result).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledWith("user-uuid-1", true);
    });
  });

  describe("PUT /categories/:id", () => {
    it("should update a category", async () => {
      mockService.update.mockResolvedValue({
        ...mockCategory,
        name: "Alimentação Atualizada",
      });

      const result = await controller.update(mockReq(), "cat-uuid-1", {
        name: "Alimentação Atualizada",
      });

      expect(result.name).toBe("Alimentação Atualizada");
      expect(mockService.update).toHaveBeenCalledWith(
        "user-uuid-1",
        "cat-uuid-1",
        { name: "Alimentação Atualizada" },
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException("Category not found"),
      );

      await expect(
        controller.update(mockReq(), "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("DELETE /categories/:id", () => {
    it("should soft-delete a category", async () => {
      mockService.remove.mockResolvedValue({
        ...mockCategory,
        isActive: false,
      });

      const result = await controller.remove(mockReq(), "cat-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockService.remove).toHaveBeenCalledWith(
        "user-uuid-1",
        "cat-uuid-1",
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException("Category not found"),
      );

      await expect(
        controller.remove(mockReq(), "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
