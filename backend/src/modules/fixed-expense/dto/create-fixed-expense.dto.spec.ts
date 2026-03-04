import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateFixedExpenseDto } from "./create-fixed-expense.dto";

function toDto(data: Record<string, unknown>) {
  return plainToInstance(CreateFixedExpenseDto, data);
}

describe("CreateFixedExpenseDto", () => {
  it("should pass with valid data", async () => {
    const errors = await validate(toDto({ name: "Aluguel", estimatedAmount: "1500.00", dueDay: 10 }));
    expect(errors).toHaveLength(0);
  });

  it("should fail without name", async () => {
    const errors = await validate(toDto({ estimatedAmount: "1500.00", dueDay: 10 }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail without estimatedAmount", async () => {
    const errors = await validate(toDto({ name: "Aluguel", dueDay: 10 }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail with dueDay < 1", async () => {
    const errors = await validate(toDto({ name: "Aluguel", estimatedAmount: "1500.00", dueDay: 0 }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail with dueDay > 31", async () => {
    const errors = await validate(toDto({ name: "Aluguel", estimatedAmount: "1500.00", dueDay: 32 }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail without dueDay", async () => {
    const errors = await validate(toDto({ name: "Aluguel", estimatedAmount: "1500.00" }));
    expect(errors.length).toBeGreaterThan(0);
  });
});
