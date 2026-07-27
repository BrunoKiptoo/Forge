import { OnModuleInit } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import mongoose from "mongoose";
import {
  User,
  UserSchema,
  Organization,
  OrganizationSchema,
  Membership,
  MembershipSchema,
  Project,
  ProjectSchema,
  Session,
  SessionSchema,
  Invitation,
  InvitationSchema,
  Task,
  TaskSchema,
  TaskExecution,
  TaskExecutionSchema,
  Activity,
  ActivitySchema,
  Agent,
  AgentSchema,
  ExecutionPlan,
  ExecutionPlanSchema,
  AgentExecution,
  AgentExecutionSchema,
  Artifact,
  ArtifactSchema,
  GitCredential,
  GitCredentialSchema,
  CodeChunk,
  CodeChunkSchema,
  Workspace,
  WorkspaceSchema,
  Goal,
  GoalSchema,
  WorkspaceMemory,
  WorkspaceMemorySchema,
  AgentMessage,
  AgentMessageSchema,
  TerminalSession,
  TerminalSessionSchema,
  Deployment,
  DeploymentSchema,
  BrowserSession,
  BrowserSessionSchema,
  Comment,
  CommentSchema,
  Approval,
  ApprovalSchema,
  Environment,
  EnvironmentSchema,
} from "./schemas";

const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Organization.name, schema: OrganizationSchema },
  { name: Membership.name, schema: MembershipSchema },
  { name: Project.name, schema: ProjectSchema },
  { name: Session.name, schema: SessionSchema },
  { name: Invitation.name, schema: InvitationSchema },
  { name: Task.name, schema: TaskSchema },
  { name: TaskExecution.name, schema: TaskExecutionSchema },
  { name: Activity.name, schema: ActivitySchema },
  { name: Agent.name, schema: AgentSchema },
  { name: ExecutionPlan.name, schema: ExecutionPlanSchema },
  { name: AgentExecution.name, schema: AgentExecutionSchema },
  { name: Artifact.name, schema: ArtifactSchema },
  { name: GitCredential.name, schema: GitCredentialSchema },
  { name: CodeChunk.name, schema: CodeChunkSchema },
  { name: Workspace.name, schema: WorkspaceSchema },
  { name: Goal.name, schema: GoalSchema },
  { name: WorkspaceMemory.name, schema: WorkspaceMemorySchema },
  { name: AgentMessage.name, schema: AgentMessageSchema },
  { name: TerminalSession.name, schema: TerminalSessionSchema },
  { name: Deployment.name, schema: DeploymentSchema },
  { name: BrowserSession.name, schema: BrowserSessionSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Approval.name, schema: ApprovalSchema },
  { name: Environment.name, schema: EnvironmentSchema },
];

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/forge",
      }),
    }),
    MongooseModule.forFeature(schemas),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  async onModuleInit() {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err: Error) => {
      console.error("MongoDB connection error:", err.message);
    });
  }
}
