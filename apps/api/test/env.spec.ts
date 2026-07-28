import { envSchema } from "@forge/config/env";

describe("Environment Validation", () => {
  const validEnv = {
    NODE_ENV: "development",
    MONGODB_URI: "mongodb://localhost:27017/forge",
    JWT_SECRET: "this-is-a-32-character-long-secret!!",
    JWT_REFRESH_SECRET: "this-is-a-refresh-secret-that-is-long",
    FRONTEND_URL: "http://localhost:3000",
  };

  it("should accept valid environment", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it("should use defaults for optional fields", () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: undefined as unknown as string });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3001);
      expect(result.data.FRONTEND_URL).toBe("http://localhost:3000");
    }
  });

  it("should reject invalid URL in MONGODB_URI", () => {
    const result = envSchema.safeParse({ ...validEnv, MONGODB_URI: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("should accept missing optional MONGODB_URI", () => {
    const env = { ...validEnv } as Record<string, string>;
    delete env.MONGODB_URI;
    const result = envSchema.safeParse(env);
    expect(result.success).toBe(true);
  });

  it("should reject missing JWT_SECRET with too-short value", () => {
    const result = envSchema.safeParse({ ...validEnv, JWT_SECRET: "short" });
    expect(result.success).toBe(false);
  });
});
