import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { InvitationRepository } from "../../core/database/repositories";
import { MembershipRepository } from "../../core/database/repositories";
import { UserRepository } from "../../core/database/repositories";
import { InviteMemberDto } from "../organizations/dto/invitation.dto";

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async invite(
    organizationId: string,
    invitedBy: string,
    dto: InviteMemberDto,
  ) {
    const email = dto.email.toLowerCase();

    const existingMembership = await this.membershipRepository.findAll();
    const alreadyMember = existingMembership.some(
      (m) =>
        String(m.organizationId) === organizationId &&
        (m as unknown as Record<string, unknown>).email === email,
    );
    if (alreadyMember) {
      throw new BadRequestException("User is already a member of this organization");
    }

    const pending = await this.invitationRepository.findPendingByOrgAndEmail(
      organizationId,
      email,
    );
    if (pending.length > 0) {
      throw new BadRequestException("An invitation is already pending for this email");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.invitationRepository.create({
      organizationId,
      email,
      role: dto.role,
      invitedBy,
      token,
      expiresAt,
      status: "pending",
    });
  }

  async accept(token: string, userId: string) {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new BadRequestException("Invitation has already been processed");
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "rejected";
      await this.invitationRepository.update(String(invitation._id), {
        status: "rejected",
      } as Record<string, unknown>);
      throw new BadRequestException("Invitation has expired");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const existingMembership = await this.membershipRepository.findAll();
    const alreadyMember = existingMembership.some(
      (m) =>
        String(m.organizationId) === String(invitation.organizationId) &&
        String(m.userId) === userId,
    );
    if (alreadyMember) {
      throw new BadRequestException("You are already a member of this organization");
    }

    await this.membershipRepository.create({
      organizationId: String(invitation.organizationId),
      userId,
      role: invitation.role,
      invitedBy: String(invitation.invitedBy),
      joinedAt: new Date(),
    });

    await this.invitationRepository.update(String(invitation._id), {
      status: "accepted",
    } as Record<string, unknown>);

    return { message: "Invitation accepted" };
  }

  async reject(token: string) {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    await this.invitationRepository.update(String(invitation._id), {
      status: "rejected",
    } as Record<string, unknown>);

    return { message: "Invitation rejected" };
  }

  async findByOrg(organizationId: string) {
    return this.invitationRepository.findPendingByOrg(organizationId);
  }
}
