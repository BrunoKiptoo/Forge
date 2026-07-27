import { Module } from "@nestjs/common";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";
import { DatabaseModule } from "../../core/database/database.module";
import { SessionRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
