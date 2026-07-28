import "reflect-metadata";

jest.mock("argon2", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  verify: jest.fn(),
}));

import { InvitationService } from "../src/modules/invitations/invitation.service";

describe("InvitationService", () => {
  let service: InvitationService;
  let invitationRepo: { create: jest.Mock; findByToken: jest.Mock; findPendingByOrgAndEmail: jest.Mock; findPendingByOrg: jest.Mock; update: jest.Mock };
  let membershipRepo: { findAll: jest.Mock; create: jest.Mock };
  let userRepo: { findById: jest.Mock };

  beforeEach(() => {
    invitationRepo = {
      create: jest.fn(),
      findByToken: jest.fn(),
      findPendingByOrgAndEmail: jest.fn(),
      findPendingByOrg: jest.fn(),
      update: jest.fn(),
    };
    membershipRepo = {
      findAll: jest.fn(),
      create: jest.fn(),
    };
    userRepo = {
      findById: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new InvitationService(invitationRepo as any, membershipRepo as any, userRepo as any);
  });

  describe("invite", () => {
    it("should create an invitation", async () => {
      membershipRepo.findAll.mockResolvedValue([]);
      invitationRepo.findPendingByOrgAndEmail.mockResolvedValue([]);
      invitationRepo.create.mockResolvedValue({ _id: "inv1", token: "abc123" });

      const result = await service.invite("org1", "user1", {
        email: "test@example.com",
        role: "developer",
      });

      expect(result._id).toBe("inv1");
      expect(invitationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com", role: "developer" }),
      );
    });

    it("should throw if pending invitation exists", async () => {
      membershipRepo.findAll.mockResolvedValue([]);
      invitationRepo.findPendingByOrgAndEmail.mockResolvedValue([{ _id: "existing" }]);

      await expect(
        service.invite("org1", "user1", { email: "test@example.com", role: "developer" }),
      ).rejects.toThrow("An invitation is already pending for this email");
    });
  });

  describe("accept", () => {
    it("should accept a valid invitation", async () => {
      invitationRepo.findByToken.mockResolvedValue({
        _id: "inv1",
        organizationId: "org1",
        invitedBy: "user2",
        role: "developer",
        status: "pending",
        expiresAt: new Date(Date.now() + 86400000),
      });
      userRepo.findById.mockResolvedValue({ _id: "user1", email: "test@example.com" });
      membershipRepo.findAll.mockResolvedValue([]);
      membershipRepo.create.mockResolvedValue({ _id: "mem1" });

      const result = await service.accept("abc123", "user1");
      expect(result.message).toBe("Invitation accepted");
      expect(membershipRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: "developer" }),
      );
    });

    it("should throw if invitation not found", async () => {
      invitationRepo.findByToken.mockResolvedValue(null);
      await expect(service.accept("bad-token", "user1")).rejects.toThrow("Invitation not found");
    });

    it("should throw if invitation expired", async () => {
      invitationRepo.findByToken.mockResolvedValue({
        _id: "inv1",
        organizationId: "org1",
        invitedBy: "user2",
        role: "developer",
        status: "pending",
        expiresAt: new Date(Date.now() - 86400000),
      });
      await expect(service.accept("expired", "user1")).rejects.toThrow("Invitation has expired");
    });
  });

  describe("reject", () => {
    it("should reject an invitation", async () => {
      invitationRepo.findByToken.mockResolvedValue({ _id: "inv1" });
      const result = await service.reject("abc123");
      expect(result.message).toBe("Invitation rejected");
    });
  });
});
