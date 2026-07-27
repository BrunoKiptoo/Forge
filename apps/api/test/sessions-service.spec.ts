import "reflect-metadata";
import { SessionsService } from "../src/modules/sessions/sessions.service";

describe("SessionsService", () => {
  let service: SessionsService;
  let repo: { findAll: jest.Mock; findById: jest.Mock; findByUser: jest.Mock; create: jest.Mock; hardDelete: jest.Mock; deleteAllForUser: jest.Mock };

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      create: jest.fn(),
      hardDelete: jest.fn(),
      deleteAllForUser: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new SessionsService(repo as any);
  });

  describe("findByUser", () => {
    it("should return user sessions", async () => {
      const sessions = [{ _id: "1", userId: "user1" }];
      repo.findByUser.mockResolvedValue(sessions);
      const result = await service.findByUser("user1");
      expect(result).toEqual(sessions);
    });
  });

  describe("remove", () => {
    it("should throw NotFoundException if session not found", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove("nonexistent")).rejects.toThrow("Session not found");
    });

    it("should hardDelete session", async () => {
      repo.findById.mockResolvedValue({ _id: "1" });
      repo.hardDelete.mockResolvedValue({ _id: "1" });
      await service.remove("1");
      expect(repo.hardDelete).toHaveBeenCalledWith("1");
    });
  });

  describe("hashToken", () => {
    it("should produce a sha256 hex hash", () => {
      const hash = service.hashToken("test-token");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should be deterministic", () => {
      const hash1 = service.hashToken("same-token");
      const hash2 = service.hashToken("same-token");
      expect(hash1).toBe(hash2);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a 96-char hex string", () => {
      const token = service.generateRefreshToken();
      expect(token).toHaveLength(96);
      expect(token).toMatch(/^[a-f0-9]{96}$/);
    });
  });
});
