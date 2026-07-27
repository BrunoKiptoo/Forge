import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { MembershipRepository } from "../../core/database/repositories";
import { CreateMembershipDto } from "./dto/create-membership.dto";
import { UpdateMembershipDto } from "./dto/update-membership.dto";

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async create(dto: CreateMembershipDto) {
    const existing = await this.membershipRepository.findByUserAndOrg(
      dto.userId,
      dto.organizationId,
    );
    if (existing) {
      throw new ConflictException("User is already a member of this organization");
    }

    return this.membershipRepository.create({
      organizationId: dto.organizationId,
      userId: dto.userId,
      role: dto.role,
      invitedBy: dto.invitedBy,
      joinedAt: new Date(),
    });
  }

  async findAll() {
    return this.membershipRepository.findAll();
  }

  async findById(id: string) {
    const membership = await this.membershipRepository.findById(id);
    if (!membership) {
      throw new NotFoundException("Membership not found");
    }
    return membership;
  }

  async findByUser(userId: string) {
    return this.membershipRepository.findByUser(userId);
  }

  async findByOrganization(organizationId: string) {
    return this.membershipRepository.findByOrganization(organizationId);
  }

  async findUserOrganizations(userId: string) {
    return this.membershipRepository.findUserOrganizations(userId);
  }

  async findOrganizationMembers(organizationId: string) {
    return this.membershipRepository.findOrganizationMembers(organizationId);
  }

  async update(id: string, dto: UpdateMembershipDto) {
    const membership = await this.membershipRepository.findById(id);
    if (!membership) {
      throw new NotFoundException("Membership not found");
    }
    return this.membershipRepository.update(id, dto);
  }

  async remove(id: string) {
    const membership = await this.membershipRepository.findById(id);
    if (!membership) {
      throw new NotFoundException("Membership not found");
    }
    return this.membershipRepository.softDelete(id);
  }
}
