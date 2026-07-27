import { Controller, Get } from "@nestjs/common";
import type { AppService } from "./app.service";
import type { ApiResponse } from "@forge/types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  health(): ApiResponse<{ status: string }> {
    return this.appService.health();
  }
}
