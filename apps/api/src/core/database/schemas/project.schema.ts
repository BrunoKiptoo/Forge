import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type ProjectDocument = HydratedDocument<Project>;

export const PROJECT_VISIBILITY = ["private", "public"] as const;
export type ProjectVisibility = (typeof PROJECT_VISIBILITY)[number];

export const PROJECT_STATUS = ["active", "archived", "paused", "draft"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, lowercase: true })
  slug: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: "folder" })
  icon: string;

  @Prop({ default: "#6366f1" })
  color: string;

  @Prop({ type: String, enum: PROJECT_VISIBILITY, default: "private" })
  visibility: ProjectVisibility;

  @Prop({ type: String, enum: PROJECT_STATUS, default: "active" })
  status: ProjectStatus;

  @Prop({ default: false })
  archived: boolean;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
  favoritedBy: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ name: "text", description: "text" });
