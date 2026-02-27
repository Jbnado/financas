import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
  };

  const mockResponse = () => {
    const res: Record<string, jest.Mock> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("POST /auth/register", () => {
    it("should return 201 with accessToken and set refreshToken cookie", async () => {
      authService.register.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      const res = mockResponse();

      const result = await controller.register(
        { email: "test@example.com", password: "password123" },
        res as any,
      );

      expect(result).toEqual({ accessToken: "access-token" });
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.objectContaining({ httpOnly: true, path: "/api/auth" }),
      );
    });
  });

  describe("POST /auth/login", () => {
    it("should return 200 with accessToken and set refreshToken cookie", async () => {
      authService.login.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      const res = mockResponse();

      const result = await controller.login(
        { email: "test@example.com", password: "password123" },
        res as any,
      );

      expect(result).toEqual({ accessToken: "access-token" });
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe("POST /auth/refresh", () => {
    it("should return 200 with new accessToken and set new refreshToken cookie", async () => {
      authService.refresh.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      const res = mockResponse();
      const req = { user: { id: "user-uuid", email: "test@example.com" } };

      const result = await controller.refresh(req as any, res as any);

      expect(result).toEqual({ accessToken: "new-access-token" });
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe("POST /auth/logout", () => {
    it("should return 200 and clear refreshToken cookie", () => {
      const res = mockResponse();

      const result = controller.logout(res as any);

      expect(result).toEqual({ message: "Logged out" });
      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({ httpOnly: true, path: "/api/auth" }),
      );
    });
  });
});
