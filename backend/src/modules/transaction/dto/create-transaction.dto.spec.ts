import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateTransactionDto } from "./create-transaction.dto.js";

function toDto(data: Record<string, unknown>): CreateTransactionDto {
  return plainToInstance(CreateTransactionDto, data);
}

const validData = {
  description: "Supermercado",
  amount: "125.50",
  date: "2026-03-01T00:00:00.000Z",
  billingCycleId: "550e8400-e29b-41d4-a716-446655440000",
  categoryId: "550e8400-e29b-41d4-a716-446655440001",
  paymentMethodId: "550e8400-e29b-41d4-a716-446655440002",
};

describe("CreateTransactionDto", () => {
  it("should pass with all required fields", async () => {
    const errors = await validate(toDto(validData));
    expect(errors).toHaveLength(0);
  });

  it("should pass with optional id (client-generated UUID)", async () => {
    const errors = await validate(
      toDto({ ...validData, id: "550e8400-e29b-41d4-a716-446655440099" }),
    );
    expect(errors).toHaveLength(0);
  });

  it("should fail when description is empty", async () => {
    const errors = await validate(toDto({ ...validData, description: "" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("description");
  });

  it("should fail when description is missing", async () => {
    const { description, ...rest } = validData;
    const errors = await validate(toDto(rest));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when amount is not a number string", async () => {
    const errors = await validate(toDto({ ...validData, amount: "abc" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("amount");
  });

  it("should fail when date is not a valid date string", async () => {
    const errors = await validate(toDto({ ...validData, date: "not-a-date" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("date");
  });

  it("should fail when billingCycleId is not a UUID", async () => {
    const errors = await validate(
      toDto({ ...validData, billingCycleId: "not-uuid" }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("billingCycleId");
  });

  it("should fail when categoryId is not a UUID", async () => {
    const errors = await validate(
      toDto({ ...validData, categoryId: "not-uuid" }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("categoryId");
  });

  it("should fail when paymentMethodId is not a UUID", async () => {
    const errors = await validate(
      toDto({ ...validData, paymentMethodId: "not-uuid" }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("paymentMethodId");
  });

  it("should pass with optional installment fields", async () => {
    const errors = await validate(
      toDto({ ...validData, installmentNumber: 1, totalInstallments: 3 }),
    );
    expect(errors).toHaveLength(0);
  });
});
