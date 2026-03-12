import { Test, TestingModule } from "@nestjs/testing";
import { BankAccountController } from "./bank-account.controller";
import { BankAccountService } from "./bank-account.service";

const mockReq = (userId = "user-1") => ({ user: { id: userId } });

const mockAccount = {
  id: "ba-1",
  name: "Nubank",
  institution: "Nubank",
  type: "checking",
  balance: "5000.00",
  isActive: true,
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("BankAccountController", () => {
  let controller: BankAccountController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    updateBalance: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankAccountController],
      providers: [{ provide: BankAccountService, useValue: service }],
    }).compile();

    controller = module.get<BankAccountController>(BankAccountController);
  });

  it("should create a bank account", async () => {
    service.create.mockResolvedValue(mockAccount);
    const dto = { name: "Nubank", institution: "Nubank", type: "checking" as const };
    const result = await controller.create(mockReq() as any, dto as any);
    expect(service.create).toHaveBeenCalledWith("user-1", dto);
    expect(result).toEqual(mockAccount);
  });

  it("should list bank accounts", async () => {
    service.findAll.mockResolvedValue([mockAccount]);
    const result = await controller.findAll(mockReq() as any);
    expect(service.findAll).toHaveBeenCalledWith("user-1");
    expect(result).toHaveLength(1);
  });

  it("should update a bank account", async () => {
    service.update.mockResolvedValue(mockAccount);
    const dto = { name: "Nubank CC" };
    const result = await controller.update(mockReq() as any, "ba-1", dto as any);
    expect(service.update).toHaveBeenCalledWith("user-1", "ba-1", dto);
    expect(result).toEqual(mockAccount);
  });

  it("should remove a bank account", async () => {
    service.remove.mockResolvedValue({ ...mockAccount, isActive: false });
    const result = await controller.remove(mockReq() as any, "ba-1");
    expect(service.remove).toHaveBeenCalledWith("user-1", "ba-1");
    expect(result.isActive).toBe(false);
  });

  it("should update balance", async () => {
    service.updateBalance.mockResolvedValue({ ...mockAccount, balance: "10000.00" });
    const dto = { balance: 10000 };
    const result = await controller.updateBalance(mockReq() as any, "ba-1", dto as any);
    expect(service.updateBalance).toHaveBeenCalledWith("user-1", "ba-1", dto);
    expect(result.balance).toBe("10000.00");
  });
});
