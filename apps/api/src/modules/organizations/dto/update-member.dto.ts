import { IsIn } from "class-validator";

export class UpdateMemberRoleDto {
  @IsIn(["admin", "developer", "viewer"])
  role: string;
}
