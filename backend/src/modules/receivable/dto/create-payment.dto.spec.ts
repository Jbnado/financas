import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreatePaymentDto } from "./create-payment.dto.js";

describe("CreatePaymentDto", () => {
  function createDto(data: Record<string, unknown>) {
    return plainToInstance(CreatePaymentDto, data);
  }

  it("should pass with valid amount and paidAt", async () => {
    const dto = createDto({ amount: "50.00", paidAt: "2026-03-04" });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when amount is missing", async () => {
    const dto = createDto({ paidAt: "2026-03-04" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when amount is not a number string", async () => {
    const dto = createDto({ amount: "abc", paidAt: "2026-03-04" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when paidAt is not a date string", async () => {
    const dto = createDto({ amount: "50.00", paidAt: "not-a-date" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when paidAt is missing", async () => {
    const dto = createDto({ amount: "50.00" });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
