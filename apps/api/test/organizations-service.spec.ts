import "reflect-metadata";

import { OrganizationsService } from "../src/modules/organizations/organizations.service";

describe("OrganizationsService", () => {
  let service: OrganizationsService;
  let orgRepo: { findBySlug: jest.Mock; create: jest.Mock; findAll: jest.Mock; findById: jest.Mock; update: jest.Mock; softDelete: jest.Mock };
  let memberRepo: { findAll: jest.Mock; create: jest.Mock; findById: jest.Mock; findOrganizationMembers: jest.Mock; findUserOrganizations: jest.Mock; update: jest.Mock; softDelete: jest.Mock };
  let invitationSvc: { invite: jest.Mock; accept: jest.Mock; reject: jest.Mock; findByOrg: jest.Mock };

  beforeEach(() => {
    orgRepo = {
      findBySlug: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    memberRepo = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findOrganizationMembers: jest.fn(),
      findUserOrganizations: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    invitationSvc = {
      invite: jest.fn(),
      accept: jest.fn(),
      reject: jest.fn(),
      findByOrg: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new OrganizationsService(orgRepo as any, memberRepo as any, invitationSvc as any);
  });

  describe("create", () => {
    it("should create org and owner membership", async () => {
      orgRepo.findBySlug.mockResolvedValue(null);
      orgRepo.create.mockResolvedValue({ _id: "org1", name: "Test", slug: "test" });
      memberRepo.create.mockResolvedValue({ _id: "mem1" });

      const result = await service.create({ name: "Test", slug: "test", ownerId: "user1" });
      expect(result._id).toBe("org1");
      expect(memberRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: "owner", userId: "user1" }),
      );
    });

    it("should throw on duplicate slug", async () => {
      orgRepo.findBySlug.mockResolvedValue({ _id: "existing" });
      await expect(
        service.create({ name: "Test", slug: "test", ownerId: "user1" }),
      ).rejects.toThrow("Organization with this slug already exists");
    });
  });

  describe("removeMember", () => {
    it("should throw if removing owner", async () => {
      memberRepo.findById.mockResolvedValue({
        _id: "mem1",
        organizationId: "org1",
        role: "owner",
      });
      await expect(service.removeMember("org1", "mem1")).rejects.toThrow(
        "Cannot remove the organization owner",
      );
    });

    it("should soft delete non-owner member", async () => {
      memberRepo.findById.mockResolvedValue({
        _id: "mem1",
        organizationId: "org1",
        role: "developer",
      });
      memberRepo.softDelete.mockResolvedValue({ _id: "mem1" });
      await service.removeMember("org1", "mem1");
      expect(memberRepo.softDelete).toHaveBeenCalledWith("mem1");
    });
  });
});
