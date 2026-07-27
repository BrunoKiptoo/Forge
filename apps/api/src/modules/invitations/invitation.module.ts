import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { InvitationService } from "./invitation.service";
import { InvitationRepository } from "../../core/database/repositories";
import { MembershipRepository } from "../../core/database/repositories";
import { UserRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule],
  providers: [InvitationService, InvitationRepository, MembershipRepository, UserRepository],
  exports: [InvitationService],
})
export class InvitationModule {}
