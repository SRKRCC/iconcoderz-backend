import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { prisma } from "@/utils/prisma";
import { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@generated/prisma/client.js";
import { QRService } from "@/services/qr.service";

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

vi.mock("@/services/email.service");
vi.mock("@/services/qr.service");
vi.mock("uuid", () => ({ v4: () => "11111111-2222-3333-4444-555555555555" }));

vi.mock("@/utils/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return {
    prisma: mockDeep(),
  };
});

import { app } from "@/app";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("POST /api/v1/registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    fullName: "Jane Doe",
    registrationNumber: "9876543210",
    email: "jane@test.com",
    phone: "9876543210",
    yearOfStudy: "THIRD_YEAR",
    branch: "IT",
    gender: "FEMALE",
    transactionId: "txn_complete_123",
    screenshotUrl: "http://test.com/img.png",
    confirmInfo: true,
  };

  /**
   * Verifies that a valid user registration payload is processed correctly.
   * Checks for 201 Created status, proper response structure, and verifies that
   * the user ID and registration code are returned as expected.
   */
  it("should register user successfully", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-2",
      ...validPayload,
      registrationCode: "IC2K26-11111111",
      paymentStatus: "PENDING",
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post("/api/v1/registration")
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id", "user-2");
    expect(res.body.data.registrationCode).toBe("IC2K26-11111111");
  });

  /**
   * Verifies that the API imposes validation rules on input fields.
   * Specifically tests an invalid email format to ensure it returns a 400 Bad Request
   * with appropriate error messages detailing the validation failure.
   */
  it("should return 400 for invalid email", async () => {
    const invalidPayload = { ...validPayload, email: "not-an-email" };
    const res = await request(app)
      .post("/api/v1/registration")
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Validation Error");
    expect(res.body.error).toContain("Invalid email");
  });

  /**
   * Verifies conflict handling when registering a user that already exists.
   * Mocks a database finding for the email and expects a 409 Conflict status
   * with a message indicating the email is already registered.
   */
  it("should return 409 if user already exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      email: "jane@test.com",
      registrationNumber: "other",
    } as any);

    const res = await request(app)
      .post("/api/v1/registration")
      .send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already registered");
  });
});
