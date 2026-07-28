import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { SessionRepository } from "../../core/database/repositories";

@Injectable()
export class SessionsService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async create(userId: string, refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.sessionRepository.create({
      userId,
      refreshTokenHash: tokenHash,
      expiresAt: expiresAt,
    });
  }

  async findAll() {
    return this.sessionRepository.findAll();
  }

  async findById(id: string) {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    return session;
  }

  async findByUser(userId: string) {
    return this.sessionRepository.findByUser(userId);
  }

  async remove(id: string) {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    return this.sessionRepository.hardDelete(id);
  }

  async deleteAllForUser(userId: string) {
    return this.sessionRepository.deleteAllForUser(userId);
  }

  async findByTokenHash(tokenHash: string) {
    const sessions = await this.sessionRepository.findAll();
    return sessions.find((s) => {
      const hash = (s as unknown as Record<string, unknown>).refreshTokenHash as string;
      return hash === tokenHash;
    }) ?? null;
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString("hex");
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
