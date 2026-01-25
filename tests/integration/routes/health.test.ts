import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@generated/prisma/client.js";

vi.mock("@/config/index", () => ({
  config: {
    env: "test",
    cors: { origin: "*", credentials: true },
    services: {
      smtp: { host: "test", user: "test", pass: "test" },
      cloudinary: { cloudName: "test", apiKey: "test", apiSecret: "test" },
    },
    qr: { secretKey: "test-secret" },
  },
}));

vi.mock("@/utils/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return {
    prisma: mockDeep(),
  };
});

import { app } from "@/app";

describe("Health Check API", () => {
  /**
   * Verifies that the health check endpoint returns a 200 OK status
   * and the expected JSON payload containing the environment and status.
   * This ensures the server is reachable and running.
   */
  it("GET /api/v1/health should return 200 OK", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("env", "test");
  });

  /**
   * Verifies that accessing an undefined route returns a 404 Not Found status.
   * This confirms that the global error handling or 404 middleware is functioning correctly.
   */
  it("GET /api/v1/unknown should return 404", async () => {
    const res = await request(app).get("/api/v1/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Route not found");
  });
});
