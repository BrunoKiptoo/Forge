import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DatabaseModule } from "../../core/database/database.module";
import { UserRepository, SessionRepository, OrganizationRepository, MembershipRepository } from "../../core/database/repositories";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { GithubStrategy } from "./strategies/github.strategy";

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    SessionRepository,
    OrganizationRepository,
    MembershipRepository,
    LocalStrategy,
    JwtStrategy,
    GithubStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
