import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { LoginDto } from "./login.dto";

describe("LoginDto validation", () => {
  it("should pass with valid email and password >= 8 chars", async () => {
    const dto = plainToInstance(LoginDto, {
      email: "user@example.com",
      password: "password123",
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail with invalid email", async () => {
    const dto = plainToInstance(LoginDto, {
      email: "not-an-email",
      password: "password123",
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("email");
  });

  it("should fail with password shorter than 8 characters", async () => {
    const dto = plainToInstance(LoginDto, {
      email: "user@example.com",
      password: "short",
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === "password")).toBe(true);
  });

  it("should fail with missing fields", async () => {
    const dto = plainToInstance(LoginDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
