import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { signAsync: jest.Mock };

  beforeAll(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";
  });

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue("mock-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("should create user with hashed password and return tokens", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-uuid",
        email: "test@example.com",
        passwordHash: "hashed",
      });

      const result = await service.register({
        email: "test@example.com",
        password: "password123",
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          passwordHash: expect.any(String),
        },
      });
      // Verify password was hashed (not stored as plain text)
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toBe("password123");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw ConflictException for duplicate email", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "existing-uuid",
        email: "test@example.com",
      });

      await expect(
        service.register({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should return tokens for valid credentials", async () => {
      const hashedPassword = await service.hashPassword("password123");
      prisma.user.findUnique.mockResolvedValue({
        id: "user-uuid",
        email: "test@example.com",
        passwordHash: hashedPassword,
      });

      const result = await service.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw UnauthorizedException for non-existent email", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for wrong password", async () => {
      const hashedPassword = await service.hashPassword("correctpassword");
      prisma.user.findUnique.mockResolvedValue({
        id: "user-uuid",
        email: "test@example.com",
        passwordHash: hashedPassword,
      });

      await expect(
        service.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refresh", () => {
    it("should return new tokens for valid user", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-uuid",
        email: "test@example.com",
      });

      const result = await service.refresh("user-uuid", "test@example.com");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it("should throw UnauthorizedException if user no longer exists", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh("deleted-uuid", "deleted@example.com"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("generateTokens", () => {
    it("should return accessToken and refreshToken strings", async () => {
      const result = await service.generateTokens(
        "user-uuid",
        "test@example.com",
      );

      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: "user-uuid", email: "test@example.com" },
        expect.objectContaining({ expiresIn: "15m" }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: "user-uuid", email: "test@example.com" },
        expect.objectContaining({ expiresIn: "7d" }),
      );
    });
  });
});
