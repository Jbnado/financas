import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { TaxController } from "./tax.controller";
import { TaxService } from "./tax.service";

const mockReq = (userId = "user-1") => ({ user: { id: userId } });

const mockTax = {
  id: "tax-1",
  name: "DAS",
  rate: "6.00",
  estimatedAmount: "500.00",
  isActive: true,
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEntry = {
  id: "entry-1",
  taxId: "tax-1",
  billingCycleId: "cycle-1",
  actualAmount: "480.00",
  isPaid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TaxController", () => {
  let controller: TaxController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    createEntry: jest.Mock;
    toggleEntryPaid: jest.Mock;
    findByCycle: jest.Mock;
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
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxController],
      providers: [{ provide: TaxService, useValue: service }],
    }).compile();

    controller = module.get(TaxController);
  });

  it("should create a tax", async () => {
    service.create.mockResolvedValue(mockTax);
    const result = await controller.create(mockReq(), {
      name: "DAS",
      rate: "6.00",
      estimatedAmount: "500.00",
    });
    expect(result).toEqual(mockTax);
    expect(service.create).toHaveBeenCalledWith("user-1", {
      name: "DAS",
      rate: "6.00",
      estimatedAmount: "500.00",
    });
  });

  it("should list taxes", async () => {
    service.findAll.mockResolvedValue([mockTax]);
    const result = await controller.findAll(mockReq());
    expect(result).toEqual([mockTax]);
  });

  it("should update a tax", async () => {
    service.update.mockResolvedValue({ ...mockTax, name: "ISS" });
    const result = await controller.update(mockReq(), "tax-1", { name: "ISS" });
    expect(result.name).toBe("ISS");
  });

  it("should soft-delete a tax", async () => {
    service.remove.mockResolvedValue({ ...mockTax, isActive: false });
    const result = await controller.remove(mockReq(), "tax-1");
    expect(result.isActive).toBe(false);
  });

  it("should create an entry", async () => {
    service.createEntry.mockResolvedValue(mockEntry);
    const result = await controller.createEntry(mockReq(), "tax-1", {
      billingCycleId: "cycle-1",
      actualAmount: "480.00",
    });
    expect(result).toEqual(mockEntry);
  });

  it("should toggle entry paid", async () => {
    service.toggleEntryPaid.mockResolvedValue({ ...mockEntry, isPaid: true });
    const result = await controller.togglePaid(mockReq(), "entry-1");
    expect(result.isPaid).toBe(true);
  });

  it("should list taxes by cycle", async () => {
    service.findByCycle.mockResolvedValue([{ ...mockTax, entry: mockEntry }]);
    const result = await controller.findByCycle(mockReq(), "cycle-1");
    expect(result).toHaveLength(1);
  });

  it("should propagate NotFoundException", async () => {
    service.findAll.mockRejectedValue(new NotFoundException());
    await expect(controller.findAll(mockReq())).rejects.toThrow(NotFoundException);
  });
});
