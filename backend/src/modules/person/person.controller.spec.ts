import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PersonController } from "./person.controller.js";
import { PersonService } from "./person.service.js";

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

describe("PersonController", () => {
  let controller: PersonController;

  const mockPerson = {
    id: "person-uuid-1",
    name: "Fulano",
    isActive: true,
    userId: "user-uuid-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [{ provide: PersonService, useValue: mockService }],
    }).compile();

    controller = module.get<PersonController>(PersonController);
    jest.clearAllMocks();
  });

  describe("POST /persons", () => {
    it("should create a person", async () => {
      mockService.create.mockResolvedValue(mockPerson);

      const dto = { name: "Fulano" };
      const result = await controller.create(mockReq(), dto);

      expect(result).toEqual(mockPerson);
      expect(mockService.create).toHaveBeenCalledWith("user-uuid-1", dto);
    });
  });

  describe("GET /persons", () => {
    it("should return list of active persons", async () => {
      mockService.findAll.mockResolvedValue([mockPerson]);

      const result = await controller.findAll(mockReq());

      expect(result).toEqual([mockPerson]);
      expect(mockService.findAll).toHaveBeenCalledWith("user-uuid-1");
    });
  });

  describe("PUT /persons/:id", () => {
    it("should update a person", async () => {
      mockService.update.mockResolvedValue({
        ...mockPerson,
        name: "Fulano Atualizado",
      });

      const result = await controller.update(mockReq(), "person-uuid-1", {
        name: "Fulano Atualizado",
      });

      expect(result.name).toBe("Fulano Atualizado");
      expect(mockService.update).toHaveBeenCalledWith(
        "user-uuid-1",
        "person-uuid-1",
        { name: "Fulano Atualizado" },
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException("Person not found"),
      );

      await expect(
        controller.update(mockReq(), "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("DELETE /persons/:id", () => {
    it("should soft-delete a person", async () => {
      mockService.remove.mockResolvedValue({
        ...mockPerson,
        isActive: false,
      });

      const result = await controller.remove(mockReq(), "person-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockService.remove).toHaveBeenCalledWith(
        "user-uuid-1",
        "person-uuid-1",
      );
    });

    it("should propagate NotFoundException", async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException("Person not found"),
      );

      await expect(
        controller.remove(mockReq(), "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
