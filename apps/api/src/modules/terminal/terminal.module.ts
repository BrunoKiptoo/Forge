import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { SandboxModule } from "../../core/sandbox/sandbox.module";
import { TerminalController } from "./terminal.controller";
import { TerminalService } from "./terminal.service";
import { TerminalSession, TerminalSessionSchema } from "../../core/database/schemas";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    DatabaseModule,
    SandboxModule,
    MongooseModule.forFeature([{ name: TerminalSession.name, schema: TerminalSessionSchema }]),
  ],
  controllers: [TerminalController],
  providers: [TerminalService],
  exports: [TerminalService, SandboxModule],
})
export class TerminalModule {}
