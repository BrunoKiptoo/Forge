import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";
import { ActivityRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository],
  exports: [ActivityService],
})
export class ActivityModule {}
