import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateFixedExpenseEntryDto } from "./create-fixed-expense-entry.dto";

function toDto(data: Record<string, unknown>) {
  return plainToInstance(CreateFixedExpenseEntryDto, data);
}

describe("CreateFixedExpenseEntryDto", () => {
  it("should pass with valid data", async () => {
    const errors = await validate(
      toDto({
        billingCycleId: "550e8400-e29b-41d4-a716-446655440000",
        actualAmount: "1450.00",
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it("should fail with invalid UUID", async () => {
    const errors = await validate(toDto({ billingCycleId: "bad", actualAmount: "100.00" }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail without actualAmount", async () => {
    const errors = await validate(
      toDto({ billingCycleId: "550e8400-e29b-41d4-a716-446655440000" }),
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should pass with isPaid boolean", async () => {
    const errors = await validate(
      toDto({
        billingCycleId: "550e8400-e29b-41d4-a716-446655440000",
        actualAmount: "1450.00",
        isPaid: true,
      }),
    );
    expect(errors).toHaveLength(0);
  });
});
