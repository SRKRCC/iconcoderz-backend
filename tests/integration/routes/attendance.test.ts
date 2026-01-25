import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { prisma } from "@/utils/prisma";
import { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@generated/prisma/client.js";
import jwt from "jsonwebtoken";
import { QRService } from "@/services/qr.service";

vi.mock("@/config/index", () => ({
  config: {
    env: "test",
    jwt: { secret: "test-secret" },
    cors: { origin: "*", credentials: true },
    services: {
      smtp: { host: "test", user: "test", pass: "test" },
      cloudinary: { cloudName: "test", apiKey: "test", apiSecret: "test" },
    },
    qr: { secretKey: "test-secret" },
  },
}));

vi.mock("jsonwebtoken");
vi.mock("@/services/qr.service");
vi.mock("@/services/email.service", () => ({
  EmailService: {
    sendAttendanceConfirmation: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("@/utils/cache", () => ({
  cache: { getOrCompute: vi.fn((key, ttl, compute) => compute()) },
  CacheKeys: { ATTENDANCE_STATS: "stats" },
  CacheTTL: { ATTENDANCE_STATS: 1 },
}));

vi.mock("@/utils/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return {
    prisma: mockDeep(),
  };
});

import { app } from "@/app";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Attendance API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (jwt.verify as any).mockReturnValue({ id: "admin-1", role: "admin" });
  });

  const validScanPayload = {
    qrData: JSON.stringify({
      registrationCode: "IC2K26-TEST",
      userId: "user-1",
      eventId: "iconcoderz-2k26",
    }),
    ipAddress: "127.0.0.1",
    deviceInfo: "Test Device",
  };

  /**
   * Verifies the QR code scanning endpoint for attendance.
   * Tests the full flow: Validating the hash, finding the user, updating their status
   * to 'attended', and correctly returning a success response.
   */
  it("POST /api/v1/attendance/scan should verify QR and check in", async () => {
    (QRService.verifyHash as any).mockReturnValue(true);
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      fullName: "Test",
      paymentStatus: "VERIFIED",
      attended: false,
    } as any);

    prismaMock.user.update.mockResolvedValue({
      id: "user-1",
      fullName: "Test",
      attended: true,
      attendedAt: new Date(),
    } as any);

    const res = await request(app)
      .post("/api/v1/attendance/scan")
      .set("Authorization", "Bearer valid-token")
      .send(validScanPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(res.body.message).toBe("Check-in successful");
  });

  /**
   * Verifies that the attendance scan endpoint is protected.
   * Ensures that requests without a valid authentication token are rejected
   * with a 401 Unauthorized status.
   */
  it("POST /api/v1/attendance/scan should fail without auth", async () => {
    (jwt.verify as any).mockImplementation(() => {
      throw new Error("Invalid");
    });

    const res = await request(app)
      .post("/api/v1/attendance/scan")
      .send(validScanPayload);

    expect(res.status).toBe(401);
  });
});
