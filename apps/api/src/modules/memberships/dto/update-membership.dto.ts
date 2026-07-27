import { IsIn, IsOptional } from "class-validator";
import { MEMBERSHIP_ROLES } from "../../../core/database/schemas";
import type { MembershipRole } from "../../../core/database/schemas";

export class UpdateMembershipDto {
  @IsOptional()
  @IsIn(MEMBERSHIP_ROLES)
  role?: MembershipRole;
}
