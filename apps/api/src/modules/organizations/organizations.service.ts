import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { OrganizationRepository } from "../../core/database/repositories";
import { MembershipRepository } from "../../core/database/repositories";
import { InvitationService } from "../invitations/invitation.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { InviteMemberDto } from "./dto/invitation.dto";
import { UpdateMemberRoleDto } from "./dto/update-member.dto";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly invitationService: InvitationService,
  ) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.organizationRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException("Organization with this slug already exists");
    }

    const org = await this.organizationRepository.create({
      name: dto.name,
      slug: dto.slug.toLowerCase(),
      ownerId: dto.ownerId,
    });

    await this.membershipRepository.create({
      organizationId: String(org._id),
      userId: dto.ownerId,
      role: "owner",
      joinedAt: new Date(),
    });

    return org;
  }

  async findAll() {
    return this.organizationRepository.findAll();
  }

  async findById(id: string) {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundException("Organization not found");
    }
    return org;
  }

  async findBySlug(slug: string) {
    return this.organizationRepository.findBySlug(slug);
  }

  async findByOwnerId(ownerId: string) {
    return this.organizationRepository.findByOwnerId(ownerId);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundException("Organization not found");
    }
    return this.organizationRepository.update(id, dto);
  }

  async remove(id: string) {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundException("Organization not found");
    }
    return this.organizationRepository.softDelete(id);
  }

  async getMembers(organizationId: string) {
    return this.membershipRepository.findOrganizationMembers(organizationId);
  }

  async inviteMember(organizationId: string, invitedBy: string, dto: InviteMemberDto) {
    return this.invitationService.invite(organizationId, invitedBy, dto);
  }

  async acceptInvitation(token: string, userId: string) {
    return this.invitationService.accept(token, userId);
  }

  async rejectInvitation(token: string) {
    return this.invitationService.reject(token);
  }

  async getPendingInvitations(organizationId: string) {
    return this.invitationService.findByOrg(organizationId);
  }

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const membership = await this.membershipRepository.findById(memberId);
    if (!membership) {
      throw new NotFoundException("Membership not found");
    }

    if (String(membership.organizationId) !== organizationId) {
      throw new ForbiddenException("Membership does not belong to this organization");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException("Cannot change the owner's role");
    }

    if (dto.role === "owner") {
      throw new ForbiddenException("Cannot promote to owner through role change");
    }

    return this.membershipRepository.update(memberId, { role: dto.role });
  }

  async removeMember(organizationId: string, memberId: string) {
    const membership = await this.membershipRepository.findById(memberId);
    if (!membership) {
      throw new NotFoundException("Membership not found");
    }

    if (String(membership.organizationId) !== organizationId) {
      throw new ForbiddenException("Membership does not belong to this organization");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException("Cannot remove the organization owner");
    }

    return this.membershipRepository.softDelete(memberId);
  }

  async getUserOrganizations(userId: string) {
    return this.membershipRepository.findUserOrganizations(userId);
  }
}
