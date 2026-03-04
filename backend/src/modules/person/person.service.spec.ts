import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PersonService } from "./person.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

const mockPrisma = {
  person: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe("PersonService", () => {
  let service: PersonService;
  const userId = "user-uuid-1";

  const mockPerson = {
    id: "person-uuid-1",
    name: "Fulano",
    isActive: true,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a person with isActive true", async () => {
      mockPrisma.person.create.mockResolvedValue(mockPerson);

      const result = await service.create(userId, { name: "Fulano" });

      expect(result).toEqual(mockPerson);
      expect(mockPrisma.person.create).toHaveBeenCalledWith({
        data: { userId, name: "Fulano" },
      });
    });
  });

  describe("findAll", () => {
    it("should return active persons ordered by name", async () => {
      mockPrisma.person.findMany.mockResolvedValue([mockPerson]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockPerson]);
      expect(mockPrisma.person.findMany).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a person by id", async () => {
      mockPrisma.person.findFirst.mockResolvedValue(mockPerson);

      const result = await service.findOne(userId, "person-uuid-1");

      expect(result).toEqual(mockPerson);
      expect(mockPrisma.person.findFirst).toHaveBeenCalledWith({
        where: { id: "person-uuid-1", userId },
      });
    });

    it("should throw NotFoundException when person not found", async () => {
      mockPrisma.person.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a person", async () => {
      mockPrisma.person.findFirst.mockResolvedValue(mockPerson);
      mockPrisma.person.update.mockResolvedValue({
        ...mockPerson,
        name: "Fulano Atualizado",
      });

      const result = await service.update(userId, "person-uuid-1", {
        name: "Fulano Atualizado",
      });

      expect(result.name).toBe("Fulano Atualizado");
      expect(mockPrisma.person.update).toHaveBeenCalledWith({
        where: { id: "person-uuid-1" },
        data: { name: "Fulano Atualizado" },
      });
    });

    it("should throw NotFoundException when person not found for update", async () => {
      mockPrisma.person.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove (soft-delete)", () => {
    it("should soft-delete a person by setting isActive to false", async () => {
      mockPrisma.person.findFirst.mockResolvedValue(mockPerson);
      mockPrisma.person.update.mockResolvedValue({
        ...mockPerson,
        isActive: false,
      });

      const result = await service.remove(userId, "person-uuid-1");

      expect(result.isActive).toBe(false);
      expect(mockPrisma.person.update).toHaveBeenCalledWith({
        where: { id: "person-uuid-1" },
        data: { isActive: false },
      });
    });

    it("should throw NotFoundException when person not found for remove", async () => {
      mockPrisma.person.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
