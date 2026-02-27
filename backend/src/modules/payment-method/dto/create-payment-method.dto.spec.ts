import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreatePaymentMethodDto } from "./create-payment-method.dto.js";

function toDto(data: Record<string, unknown>): CreatePaymentMethodDto {
  return plainToInstance(CreatePaymentMethodDto, data);
}

describe("CreatePaymentMethodDto", () => {
  const validData = {
    name: "Nubank",
    type: "credit",
  };

  it("should pass with valid data (credit without dueDay)", async () => {
    const errors = await validate(toDto(validData));
    expect(errors).toHaveLength(0);
  });

  it("should pass with valid data including dueDay", async () => {
    const errors = await validate(toDto({ ...validData, dueDay: 15 }));
    expect(errors).toHaveLength(0);
  });

  it("should pass with type debit", async () => {
    const errors = await validate(toDto({ ...validData, type: "debit" }));
    expect(errors).toHaveLength(0);
  });

  it("should fail when name is empty", async () => {
    const errors = await validate(toDto({ ...validData, name: "" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("name");
  });

  it("should fail when name is missing", async () => {
    const { name, ...rest } = validData;
    const errors = await validate(toDto(rest));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when type is invalid", async () => {
    const errors = await validate(toDto({ ...validData, type: "pix" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("type");
  });

  it("should fail when type is missing", async () => {
    const { type, ...rest } = validData;
    const errors = await validate(toDto(rest));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when dueDay is less than 1", async () => {
    const errors = await validate(toDto({ ...validData, dueDay: 0 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("dueDay");
  });

  it("should fail when dueDay is greater than 31", async () => {
    const errors = await validate(toDto({ ...validData, dueDay: 32 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("dueDay");
  });

  it("should fail when dueDay is not an integer", async () => {
    const errors = await validate(toDto({ ...validData, dueDay: 15.5 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("dueDay");
  });

  it("should pass with dueDay at boundary 1", async () => {
    const errors = await validate(toDto({ ...validData, dueDay: 1 }));
    expect(errors).toHaveLength(0);
  });

  it("should pass with dueDay at boundary 31", async () => {
    const errors = await validate(toDto({ ...validData, dueDay: 31 }));
    expect(errors).toHaveLength(0);
  });
});
