import { IsString, MinLength, MaxLength, IsOptional } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  slug: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
