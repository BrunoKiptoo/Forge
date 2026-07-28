import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type ExecutionPlanDocument = HydratedDocument<ExecutionPlan>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ExecutionPlan {
  @Prop({ type: Types.ObjectId, ref: "Task", required: true, unique: true })
  taskId: Types.ObjectId;

  @Prop({
    type: [
      {
        order: Number,
        agentType: String,
        description: String,
        status: { type: String, default: "pending" },
        result: { type: Object, default: {} },
      },
    ],
    default: [],
  })
  steps: {
    order: number;
    agentType: string;
    description: string;
    status: string;
    result: Record<string, unknown>;
  }[];

  @Prop({ type: String, enum: ["pending", "running", "completed", "failed"], default: "pending" })
  status: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ExecutionPlanSchema = SchemaFactory.createForClass(ExecutionPlan);
