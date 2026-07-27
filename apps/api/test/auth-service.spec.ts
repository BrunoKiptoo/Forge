import "reflect-metadata";

jest.mock("argon2", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  verify: jest.fn().mockImplementation(async (_hash: string, password: string) => {
    return password === "password123";
  }),
}));

import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../src/modules/auth/auth.service";
import type { Response } from "express";

describe("AuthService", () => {
  let service: AuthService;
  let userRepo: { findByEmail: jest.Mock; findByEmailWithPassword: jest.Mock; findById: jest.Mock; create: jest.Mock };
  let sessionRepo: { findAll: jest.Mock; create: jest.Mock; hardDelete: jest.Mock; deleteAllForUser: jest.Mock };
  let jwtService: JwtService;

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(() => {
    userRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    sessionRepo = {
      findAll: jest.fn(),
      create: jest.fn(),
      hardDelete: jest.fn(),
      deleteAllForUser: jest.fn(),
    };

    jwtService = new JwtService({ secret: "test-secret" });

    service = new AuthService(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userRepo as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionRepo as any,
      jwtService,
    );
  });

  describe("register", () => {
    it("should create user and return tokens", async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue({
        _id: "user1",
        email: "test@example.com",
        name: "Test User",
        avatar: null,
        emailVerified: false,
      });
      sessionRepo.create.mockResolvedValue({ _id: "session1" });

      const result = await service.register(
        { email: "test@example.com", password: "password123", name: "Test User" },
        mockResponse,
      );

      expect(result.accessToken).toBeTruthy();
      expect(result.user.email).toBe("test@example.com");
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it("should throw ConflictException if email exists", async () => {
      userRepo.findByEmail.mockResolvedValue({ _id: "existing" });
      await expect(
        service.register(
          { email: "existing@example.com", password: "password123", name: "Test" },
          mockResponse,
        ),
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("validateUser", () => {
    it("should return user for valid credentials", async () => {
      userRepo.findByEmailWithPassword.mockResolvedValue({
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      const result = await service.validateUser("test@example.com", "password123");
      expect(result).toBeTruthy();
    });

    it("should return null for invalid credentials", async () => {
      userRepo.findByEmailWithPassword.mockResolvedValue(null);
      const result = await service.validateUser("test@example.com", "wrong");
      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("should clear cookie", async () => {
      sessionRepo.findAll.mockResolvedValue([]);
      const result = await service.logout("some-token", mockResponse);
      expect(result.message).toBe("Logged out successfully");
      expect(mockResponse.clearCookie).toHaveBeenCalled();
    });
  });

  describe("getMe", () => {
    it("should return user profile", async () => {
      userRepo.findById.mockResolvedValue({
        _id: "user1",
        email: "test@example.com",
        name: "Test",
        avatar: null,
        emailVerified: true,
        githubId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result = await service.getMe("user1");
      expect(result.email).toBe("test@example.com");
    });

    it("should throw UnauthorizedException if user not found", async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.getMe("nonexistent")).rejects.toThrow("User not found");
    });
  });
});
