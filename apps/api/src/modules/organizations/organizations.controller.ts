import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { InviteMemberDto, AcceptInvitationDto } from "./dto/invitation.dto";
import { UpdateMemberRoleDto } from "./dto/update-member.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { OrganizationAdminGuard } from "./guards/organization.guard";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: { id: string },
  ) {
    dto.ownerId = user.id;
    const org = await this.organizationsService.create(dto);
    return {
      data: org,
      message: "Organization created",
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: { id: string }) {
    const orgs = await this.organizationsService.getUserOrganizations(user.id);
    return {
      data: orgs,
      message: "Organizations retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("invitations/accept")
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.organizationsService.acceptInvitation(
      dto.token,
      user.id,
    );
    return {
      data: result,
      message: "Invitation accepted",
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findById(@Param("id") id: string) {
    const org = await this.organizationsService.findById(id);
    return {
      data: org,
      message: "Organization retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  async update(@Param("id") id: string, @Body() dto: UpdateOrganizationDto) {
    const org = await this.organizationsService.update(id, dto);
    return {
      data: org,
      message: "Organization updated",
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.organizationsService.remove(id);
  }

  @Post(":id/invite")
  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  async inviteMember(
    @Param("id") id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: { id: string },
  ) {
    const invitation = await this.organizationsService.inviteMember(
      id,
      user.id,
      dto,
    );
    return {
      data: invitation,
      message: "Invitation sent",
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id/invitations")
  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  async getInvitations(@Param("id") id: string) {
    const invitations =
      await this.organizationsService.getPendingInvitations(id);
    return {
      data: invitations,
      message: "Invitations retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id/members")
  @UseGuards(JwtAuthGuard)
  async getMembers(@Param("id") id: string) {
    const members = await this.organizationsService.getMembers(id);
    return {
      data: members,
      message: "Members retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(":id/members/:memberId")
  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  async updateMemberRole(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const result = await this.organizationsService.updateMemberRole(
      id,
      memberId,
      dto,
    );
    return {
      data: result,
      message: "Member role updated",
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":id/members/:memberId")
  @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
  ) {
    await this.organizationsService.removeMember(id, memberId);
  }
}
