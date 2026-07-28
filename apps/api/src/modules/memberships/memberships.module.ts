import { Module } from "@nestjs/common";
import { MembershipsController } from "./memberships.controller";
import { MembershipsService } from "./memberships.service";
import { DatabaseModule } from "../../core/database/database.module";
import { MembershipRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule],
  controllers: [MembershipsController],
  providers: [MembershipsService, MembershipRepository],
  exports: [MembershipsService],
})
export class MembershipsModule {}
