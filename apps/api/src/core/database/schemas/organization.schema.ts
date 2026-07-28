import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
