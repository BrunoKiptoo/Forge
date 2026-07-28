import "reflect-metadata";

jest.mock("argon2", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  verify: jest.fn().mockImplementation(async (_hash: string, password: string) => {
    return password === "password123";
  }),
}));

import { UsersService } from "../src/modules/users/users.service";

describe("UsersService", () => {
  let service: UsersService;
  let repo: { findById: jest.Mock; findByEmail: jest.Mock; findByEmailWithPassword: jest.Mock; findAll: jest.Mock; create: jest.Mock; update: jest.Mock; softDelete: jest.Mock };

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new UsersService(repo as any);
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const user = { _id: "1", email: "test@example.com", name: "Test" };
      repo.findById.mockResolvedValue(user);
      const result = await service.findById("1");
      expect(result).toEqual(user);
    });

    it("should throw NotFoundException when user not found", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById("nonexistent")).rejects.toThrow("User not found");
    });
  });

  describe("validateCredentials", () => {
    it("should return user on valid credentials", async () => {
      repo.findByEmailWithPassword.mockResolvedValue({
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      const result = await service.validateCredentials("test@example.com", "password123");
      expect(result).toBeTruthy();
    });

    it("should return null on invalid password", async () => {
      repo.findByEmailWithPassword.mockResolvedValue({
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      const result = await service.validateCredentials("test@example.com", "wrong");
      expect(result).toBeNull();
    });

    it("should return null when user not found", async () => {
      repo.findByEmailWithPassword.mockResolvedValue(null);
      const result = await service.validateCredentials("test@example.com", "password123");
      expect(result).toBeNull();
    });
  });
});
