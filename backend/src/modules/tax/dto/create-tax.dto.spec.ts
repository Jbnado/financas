import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateTaxDto } from "./create-tax.dto";

function toDto(data: Record<string, unknown>) {
  return plainToInstance(CreateTaxDto, data);
}

describe("CreateTaxDto", () => {
  it("should pass with valid data", async () => {
    const errors = await validate(toDto({ name: "DAS", rate: "6.00", estimatedAmount: "500.00" }));
    expect(errors).toHaveLength(0);
  });

  it("should fail without name", async () => {
    const errors = await validate(toDto({ rate: "6.00", estimatedAmount: "500.00" }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail without rate", async () => {
    const errors = await validate(toDto({ name: "DAS", estimatedAmount: "500.00" }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail without estimatedAmount", async () => {
    const errors = await validate(toDto({ name: "DAS", rate: "6.00" }));
    expect(errors.length).toBeGreaterThan(0);
  });
});
