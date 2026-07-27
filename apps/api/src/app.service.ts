import { Injectable } from "@nestjs/common";
import type { ApiResponse } from "@forge/types";

@Injectable()
export class AppService {
  health(): ApiResponse<{ status: string }> {
    return {
      data: { status: "ok" },
      message: "API is healthy",
      timestamp: new Date().toISOString(),
    };
  }
}
