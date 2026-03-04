import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreatePersonDto } from "./create-person.dto.js";

function toDto(data: Record<string, unknown>): CreatePersonDto {
  return plainToInstance(CreatePersonDto, data);
}

describe("CreatePersonDto", () => {
  it("should pass with valid name", async () => {
    const errors = await validate(toDto({ name: "Fulano" }));
    expect(errors).toHaveLength(0);
  });

  it("should fail when name is empty", async () => {
    const errors = await validate(toDto({ name: "" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("name");
  });

  it("should fail when name is missing", async () => {
    const errors = await validate(toDto({}));
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when name is not a string", async () => {
    const errors = await validate(toDto({ name: 123 }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("name");
  });
});
