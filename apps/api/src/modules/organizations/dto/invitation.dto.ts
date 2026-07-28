import { IsString, IsIn, IsEmail } from "class-validator";

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsIn(["admin", "developer", "viewer"])
  role: string;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;
}
