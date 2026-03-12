import { Test, TestingModule } from "@nestjs/testing";
import { InvestmentController } from "./investment.controller";
import { InvestmentService } from "./investment.service";

const mockReq = (userId = "user-1") => ({ user: { id: userId } });

const mockInvestment = {
  id: "inv-1",
  name: "CDB Banco Inter",
  type: "fixed_income",
  institution: "Banco Inter",
  appliedAmount: "10000.00",
  currentValue: "10500.00",
  liquidity: "daily",
  maturityDate: null,
  isActive: true,
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("InvestmentController", () => {
  let controller: InvestmentController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    updateValue: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateValue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentController],
      providers: [{ provide: InvestmentService, useValue: service }],
    }).compile();

    controller = module.get<InvestmentController>(InvestmentController);
  });

  it("should create an investment", async () => {
    service.create.mockResolvedValue(mockInvestment);
    const dto = {
      name: "CDB Banco Inter",
      type: "fixed_income" as const,
      institution: "Banco Inter",
      appliedAmount: 10000,
      currentValue: 10500,
      liquidity: "daily" as const,
    };
    const result = await controller.create(mockReq() as any, dto as any);
    expect(service.create).toHaveBeenCalledWith("user-1", dto);
    expect(result).toEqual(mockInvestment);
  });

  it("should list investments", async () => {
    service.findAll.mockResolvedValue([mockInvestment]);
    const result = await controller.findAll(mockReq() as any);
    expect(service.findAll).toHaveBeenCalledWith("user-1");
    expect(result).toHaveLength(1);
  });

  it("should update an investment", async () => {
    service.update.mockResolvedValue(mockInvestment);
    const dto = { name: "CDB Inter Atualizado" };
    const result = await controller.update(mockReq() as any, "inv-1", dto as any);
    expect(service.update).toHaveBeenCalledWith("user-1", "inv-1", dto);
    expect(result).toEqual(mockInvestment);
  });

  it("should remove an investment", async () => {
    service.remove.mockResolvedValue({ ...mockInvestment, isActive: false });
    const result = await controller.remove(mockReq() as any, "inv-1");
    expect(service.remove).toHaveBeenCalledWith("user-1", "inv-1");
    expect(result.isActive).toBe(false);
  });

  it("should update value", async () => {
    service.updateValue.mockResolvedValue({ ...mockInvestment, currentValue: "11000.00" });
    const dto = { currentValue: 11000 };
    const result = await controller.updateValue(mockReq() as any, "inv-1", dto as any);
    expect(service.updateValue).toHaveBeenCalledWith("user-1", "inv-1", dto);
    expect(result.currentValue).toBe("11000.00");
  });
});
