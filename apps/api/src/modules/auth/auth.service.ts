import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as argon2 from "argon2";
import { randomBytes, createHash } from "node:crypto";
import { UserRepository } from "../../core/database/repositories";
import { SessionRepository } from "../../core/database/repositories";
import { OrganizationRepository } from "../../core/database/repositories";
import { MembershipRepository } from "../../core/database/repositories";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./types/jwt-payload";

export interface GithubProfile {
  githubId: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      emailVerified: false,
    });

    const tokens = await this.generateTokens(user.email, String(user._id));
    await this.createSession(String(user._id), tokens.refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);

    // Auto-provision a personal org and assign owner role
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + String(user._id).slice(-4);
    const org = await this.organizationRepository.create({
      name: dto.name,
      slug,
      ownerId: String(user._id),
    });
    await this.membershipRepository.create({
      organizationId: String(org._id),
      userId: String(user._id),
      role: "owner",
      joinedAt: new Date(),
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
    };
  }

  async loginUser(user: { _id: unknown; email: string; name?: string; avatar?: string | null; emailVerified?: boolean; githubId?: string }, res: Response) {
    const userId = String(user._id);
    const email = user.email;

    const tokens = await this.generateTokens(email, userId);
    await this.createSession(userId, tokens.refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified ?? false,
        githubId: user.githubId,
      },
    };
  }

  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }

    const tokenHash = this.hashToken(refreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (new Date(session.expiresAt as unknown as string) < new Date()) {
      await this.sessionRepository.hardDelete(String(session._id));
      throw new UnauthorizedException("Refresh token expired");
    }

    const user = await this.userRepository.findById(String(session.userId));
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    await this.sessionRepository.hardDelete(String(session._id));

    const tokens = await this.generateTokens(user.email, String(user._id));
    await this.createSession(String(user._id), tokens.refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
    };
  }

  async logout(refreshToken: string, res: Response) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      const session = await this.sessionRepository.findByTokenHash(tokenHash);
      if (session) {
        await this.sessionRepository.hardDelete(String(session._id));
      }
    }

    this.clearRefreshCookie(res);
    return { message: "Logged out successfully" };
  }

  async logoutAll(userId: string, res: Response) {
    await this.sessionRepository.deleteAllForUser(userId);
    this.clearRefreshCookie(res);
    return { message: "Logged out from all devices" };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      githubId: user.githubId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    return isValid ? user : null;
  }

  async validateGithubUser(profile: GithubProfile) {
    let user = await this.userRepository.findByGithubId(profile.githubId);

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);
    }

    if (user) {
      if (!user.githubId) {
        await this.userRepository.update(String(user._id), {
          githubId: profile.githubId,
          avatar: (profile.avatar ?? user.avatar),
          emailVerified: true,
        } as unknown as Record<string, unknown>);
      }
      return user;
    }

    const newUser = await this.userRepository.create({
      email: profile.email.toLowerCase(),
      githubId: profile.githubId,
      name: profile.name,
      avatar: profile.avatar,
      emailVerified: true,
    });

    return newUser;
  }

  async githubSignIn(
    profile: GithubProfile,
    res: Response,
  ) {
    const user = await this.validateGithubUser(profile);
    const tokens = await this.generateTokens(user.email, String(user._id));
    await this.createSession(String(user._id), tokens.refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(email: string, userId: string): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? "dev-secret-change-me-in-production-32chars",
      expiresIn: "15m",
    });

    const refreshToken = randomBytes(48).toString("hex");

    return { accessToken, refreshToken };
  }

  private async createSession(userId: string, refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.sessionRepository.create({
      userId,
      refreshTokenHash: tokenHash,
      expiresAt: expiresAt as unknown as Record<string, unknown>,
    });
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
}
