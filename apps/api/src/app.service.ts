import { Injectable } from "@nestjs/common";
import { Connection } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { ApiResponse } from "@forge/types";

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  health(): ApiResponse<{ status: string; database: string }> {
    const dbState = this.connection.readyState;
    const dbStatus =
      dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

    return {
      data: { status: "ok", database: dbStatus },
      message: "API is healthy",
      timestamp: new Date().toISOString(),
    };
  }
}
