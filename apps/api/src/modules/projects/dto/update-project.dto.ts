import { IsString, IsIn, IsOptional, MaxLength, IsBoolean } from "class-validator";
import { PROJECT_VISIBILITY, PROJECT_STATUS } from "../../../core/database/schemas";
import type { ProjectVisibility, ProjectStatus } from "../../../core/database/schemas";

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @IsOptional()
  @IsIn(PROJECT_VISIBILITY)
  visibility?: ProjectVisibility;

  @IsOptional()
  @IsIn(PROJECT_STATUS)
  status?: ProjectStatus;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
