import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUser(@CurrentUser() user: { id: string }) {
    const sessions = await this.sessionsService.findByUser(user.id);
    return {
      data: sessions,
      message: "Sessions retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const session = await this.sessionsService.findById(id);
    return {
      data: session,
      message: "Session retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async remove(@Param("id") id: string) {
    await this.sessionsService.remove(id);
  }
}
