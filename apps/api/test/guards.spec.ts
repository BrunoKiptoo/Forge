import "reflect-metadata";
import { JwtAuthGuard } from "../src/modules/auth/guards/jwt-auth.guard";

describe("JwtAuthGuard", () => {
  it("should be defined", () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
  });

  it("should extend AuthGuard('jwt')", () => {
    const guard = new JwtAuthGuard();
    expect(typeof guard.canActivate).toBe("function");
  });
});


import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { Reflector } from "@nestjs/core";
import type { ExecutionContext } from "@nestjs/common";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createContext(role?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { membershipRole: role },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it("should allow if no roles required", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it("should allow if user has required role", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    expect(guard.canActivate(createContext("admin"))).toBe(true);
  });

  it("should deny if user does not have required role", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    expect(guard.canActivate(createContext("viewer"))).toBe(false);
  });

  it("should deny if user has no membershipRole", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    expect(guard.canActivate(createContext())).toBe(false);
  });
});
