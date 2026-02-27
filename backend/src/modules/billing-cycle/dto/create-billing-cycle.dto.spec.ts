import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateBillingCycleDto } from "./create-billing-cycle.dto.js";

function toDto(data: Record<string, unknown>): CreateBillingCycleDto {
  return plainToInstance(CreateBillingCycleDto, data);
}

describe("CreateBillingCycleDto", () => {
  const validData = {
    name: "Fevereiro 2026",
    startDate: "2026-01-25T00:00:00.000Z",
    endDate: "2026-02-24T00:00:00.000Z",
    salary: "7300.00",
  };

  it("should pass with valid data", async () => {
    const errors = await validate(toDto(validData));
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

  it("should fail when startDate is not ISO date", async () => {
    const errors = await validate(toDto({ ...validData, startDate: "not-a-date" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("startDate");
  });

  it("should fail when endDate is not ISO date", async () => {
    const errors = await validate(toDto({ ...validData, endDate: "25/02/2026" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("endDate");
  });

  it("should fail when salary is not a number string", async () => {
    const errors = await validate(toDto({ ...validData, salary: "abc" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("salary");
  });

  it("should pass with integer salary string", async () => {
    const errors = await validate(toDto({ ...validData, salary: "7300" }));
    expect(errors).toHaveLength(0);
  });
});
