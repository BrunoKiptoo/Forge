import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { GatewayModule } from "../../core/gateway/gateway.module";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { CommentRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, GatewayModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
