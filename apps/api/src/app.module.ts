import { OnModuleInit } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "./core/database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { MembershipsModule } from "./modules/memberships/memberships.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { ActivityModule } from "./modules/activities/activity.module";
import { AgentsModule } from "./modules/agents/agents.module";
import { PlannerModule } from "./modules/planner/planner.module";
import { OrchestratorModule } from "./modules/orchestrator/orchestrator.module";
import { GitModule } from "./modules/git/git.module";
import { RepositoryModule } from "./modules/repository/repository.module";
import { WorkspaceModule } from "./modules/workspace/workspace.module";
import { GoalModule } from "./modules/goals/goal.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { TerminalModule } from "./modules/terminal/terminal.module";
import { DeploymentModule } from "./modules/deployments/deployment.module";
import { AIModule } from "./core/ai/ai.module";
import { GatewayModule } from "./core/gateway/gateway.module";
import { BrowserAgentModule } from "./modules/browser/browser-agent.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { ApprovalsModule } from "./modules/approvals/approvals.module";
import { EnvironmentsModule } from "./modules/environments/environments.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MembershipsModule,
    ProjectsModule,
    SessionsModule,
    TasksModule,
    ActivityModule,
    AgentsModule,
    PlannerModule,
    OrchestratorModule,
    GitModule,
    RepositoryModule,
    WorkspaceModule,
    GoalModule,
    AnalyticsModule,
    TerminalModule,
    DeploymentModule,
    AIModule,
    GatewayModule,
    BrowserAgentModule,
    CommentsModule,
    ApprovalsModule,
    EnvironmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    const state = this.connection.readyState;
    const status = state === 1 ? "connected" : state === 2 ? "connecting" : "disconnected";
    console.log(`MongoDB: ${status}`);
  }
}
