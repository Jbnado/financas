import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateCategoryDto } from "./create-category.dto.js";

function toDto(data: Record<string, unknown>): CreateCategoryDto {
  return plainToInstance(CreateCategoryDto, data);
}

describe("CreateCategoryDto", () => {
  const validData = {
    name: "Alimentação",
    icon: "utensils",
    color: "#f97316",
  };

  it("should pass with valid data (name + icon + color)", async () => {
    const errors = await validate(toDto(validData));
    expect(errors).toHaveLength(0);
  });

  it("should pass with only name (icon and color optional)", async () => {
    const errors = await validate(toDto({ name: "Transporte" }));
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

  it("should fail when name is not a string", async () => {
    const errors = await validate(toDto({ ...validData, name: 123 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("name");
  });

  it("should fail when icon is not a string", async () => {
    const errors = await validate(toDto({ ...validData, icon: 123 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("icon");
  });

  it("should fail when color is not a string", async () => {
    const errors = await validate(toDto({ ...validData, color: 123 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("color");
  });
});
