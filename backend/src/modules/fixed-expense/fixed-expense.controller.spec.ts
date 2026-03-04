import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { FixedExpenseController } from "./fixed-expense.controller";
import { FixedExpenseService } from "./fixed-expense.service";

const mockReq = (userId = "user-1") => ({ user: { id: userId } });

const mockExpense = {
  id: "exp-1",
  name: "Aluguel",
  estimatedAmount: "1500.00",
  dueDay: 10,
  isActive: true,
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEntry = {
  id: "entry-1",
  fixedExpenseId: "exp-1",
  billingCycleId: "cycle-1",
  actualAmount: "1450.00",
  isPaid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("FixedExpenseController", () => {
  let controller: FixedExpenseController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    createEntry: jest.Mock;
    toggleEntryPaid: jest.Mock;
    findByCycle: jest.Mock;
    findHistory: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createEntry: jest.fn(),
      toggleEntryPaid: jest.fn(),
      findByCycle: jest.fn(),
      findHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FixedExpenseController],
      providers: [{ provide: FixedExpenseService, useValue: service }],
    }).compile();

    controller = module.get(FixedExpenseController);
  });

  it("should create a fixed expense", async () => {
    service.create.mockResolvedValue(mockExpense);
    const result = await controller.create(mockReq(), {
      name: "Aluguel",
      estimatedAmount: "1500.00",
      dueDay: 10,
    });
    expect(result).toEqual(mockExpense);
    expect(service.create).toHaveBeenCalledWith("user-1", {
      name: "Aluguel",
      estimatedAmount: "1500.00",
      dueDay: 10,
    });
  });

  it("should list fixed expenses", async () => {
    service.findAll.mockResolvedValue([mockExpense]);
    const result = await controller.findAll(mockReq());
    expect(result).toEqual([mockExpense]);
  });

  it("should update a fixed expense", async () => {
    service.update.mockResolvedValue({ ...mockExpense, name: "Internet" });
    const result = await controller.update(mockReq(), "exp-1", { name: "Internet" });
    expect(result.name).toBe("Internet");
  });

  it("should soft-delete a fixed expense", async () => {
    service.remove.mockResolvedValue({ ...mockExpense, isActive: false });
    const result = await controller.remove(mockReq(), "exp-1");
    expect(result.isActive).toBe(false);
  });

  it("should create an entry", async () => {
    service.createEntry.mockResolvedValue(mockEntry);
    const result = await controller.createEntry(mockReq(), "exp-1", {
      billingCycleId: "cycle-1",
      actualAmount: "1450.00",
    });
    expect(result).toEqual(mockEntry);
  });

  it("should toggle entry paid", async () => {
    service.toggleEntryPaid.mockResolvedValue({ ...mockEntry, isPaid: true });
    const result = await controller.togglePaid(mockReq(), "entry-1");
    expect(result.isPaid).toBe(true);
  });

  it("should list expenses by cycle", async () => {
    service.findByCycle.mockResolvedValue([{ ...mockExpense, entry: mockEntry }]);
    const result = await controller.findByCycle(mockReq(), "cycle-1");
    expect(result).toHaveLength(1);
  });

  it("should get history", async () => {
    service.findHistory.mockResolvedValue([mockEntry]);
    const result = await controller.findHistory(mockReq(), "exp-1");
    expect(result).toEqual([mockEntry]);
  });

  it("should propagate NotFoundException", async () => {
    service.findAll.mockRejectedValue(new NotFoundException());
    await expect(controller.findAll(mockReq())).rejects.toThrow(NotFoundException);
  });
});
