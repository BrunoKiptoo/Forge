import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";
import { InvitationModule } from "../invitations/invitation.module";
import { OrganizationRepository } from "../../core/database/repositories";
import { MembershipRepository } from "../../core/database/repositories";
import { OrganizationRoleGuard, OrganizationOwnerGuard, OrganizationAdminGuard } from "./guards/organization.guard";

@Module({
  imports: [DatabaseModule, InvitationModule],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    OrganizationRepository,
    MembershipRepository,
    OrganizationRoleGuard,
    OrganizationOwnerGuard,
    OrganizationAdminGuard,
  ],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
