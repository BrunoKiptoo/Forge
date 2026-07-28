import { IsString, IsIn, IsOptional } from "class-validator";
import { MEMBERSHIP_ROLES } from "../../../core/database/schemas";
import type { MembershipRole } from "../../../core/database/schemas";

export class CreateMembershipDto {
  @IsString()
  organizationId: string;

  @IsString()
  userId: string;

  @IsIn(MEMBERSHIP_ROLES)
  role: MembershipRole;

  @IsOptional()
  @IsString()
  invitedBy?: string;
}
