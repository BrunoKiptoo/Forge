import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, res);
    return {
      data: result,
      message: "Registration successful",
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user! as Record<string, unknown>;
    const result = await this.authService.loginUser(
      {
        _id: user._id,
        email: user.email as string,
        name: user.name as string,
        avatar: user.avatar as string | null,
        emailVerified: user.emailVerified as boolean,
        githubId: user.githubId as string | undefined,
      },
      res,
    );
    return {
      data: result,
      message: "Login successful",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.["refresh_token"] as string | undefined;
    const result = await this.authService.logout(refreshToken ?? "", res);
    return {
      data: result,
      message: "Logout successful",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.["refresh_token"] as string | undefined;
    const result = await this.authService.refresh(refreshToken ?? "", res);
    return {
      data: result,
      message: "Token refreshed",
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: { id: string }) {
    const result = await this.authService.getMe(user.id);
    return {
      data: result,
      message: "Current user retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("github")
  @UseGuards(AuthGuard("github"))
  githubLogin() {
    // Passport redirects to GitHub
  }

  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const githubUser = req.user as {
      githubId: string;
      email: string;
      name: string;
      avatar?: string;
    };

    const tokens = await this.authService.githubSignIn(
      {
        githubId: githubUser.githubId,
        email: githubUser.email,
        name: githubUser.name,
        avatar: githubUser.avatar,
      },
      res,
    );

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}`,
    );
  }
}
