import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateSplitsDto, SplitItemDto } from "./create-splits.dto.js";

describe("CreateSplitsDto", () => {
  function createDto(data: Record<string, unknown>) {
    return plainToInstance(CreateSplitsDto, data);
  }

  it("should pass with valid splits array", async () => {
    const dto = createDto({
      splits: [
        { personId: "550e8400-e29b-41d4-a716-446655440000", amount: "100.00" },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when splits is empty", async () => {
    const dto = createDto({ splits: [] });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when splits is missing", async () => {
    const dto = createDto({});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when personId is not UUID", async () => {
    const dto = createDto({
      splits: [{ personId: "not-uuid", amount: "100.00" }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should fail when amount is not a number string", async () => {
    const dto = createDto({
      splits: [
        {
          personId: "550e8400-e29b-41d4-a716-446655440000",
          amount: "abc",
        },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should pass with multiple valid splits", async () => {
    const dto = createDto({
      splits: [
        { personId: "550e8400-e29b-41d4-a716-446655440000", amount: "100.00" },
        { personId: "550e8400-e29b-41d4-a716-446655440001", amount: "50.00" },
      ],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
