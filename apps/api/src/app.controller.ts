import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import type { ApiResponse } from "@forge/types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  health(): ApiResponse<{ status: string; database: string }> {
    return this.appService.health();
  }
}
