import { AttendanceService } from "@/services/attendance.service";
import { QRService } from "@/services/qr.service";
import { prisma } from "@/utils/prisma";
import type { PrismaClient } from "@generated/prisma/client.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy } from "vitest-mock-extended";

vi.mock("@/services/qr.service");
vi.mock("@/utils/cache");

vi.mock("@/config/index", () => ({
  config: {
    env: "test",
    services: {
      smtp: { host: "test-host", user: "test-user", pass: "test-pass" },
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

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("AttendanceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanQR", () => {
    const mockPayload = {
      registrationCode: "IC2K26-TEST",
      userId: "user-id-1",
      eventId: "iconcoderz-2k26",
      generatedAt: new Date().toISOString(),
      verificationHash: "hash",
    };
    const mockQRData = JSON.stringify(mockPayload);
    const adminId = "admin-id-1";

    /**
     * Verifies valid QR scan processing.
     * Mocks a valid user who is verified and not attended.
     * Expects success flag to be true and attendance log to be created.
     */
    it("should scan QR successfully", async () => {
      (QRService.verifyHash as any).mockReturnValue(true);
      prismaMock.user.findFirst.mockResolvedValue({
        id: "user-id-1",
        fullName: "Test User",
        registrationCode: "IC2K26-TEST",
        email: "test@test.com",
        phone: "1234567890",
        branch: "CSE",
        yearOfStudy: "IV",
        paymentStatus: "VERIFIED",
        attended: false,
      } as any);

      prismaMock.user.update.mockResolvedValue({
        id: "user-id-1",
        fullName: "Test User",
        registrationCode: "IC2K26-TEST",
        email: "test@test.com",
        phone: "1234567890",
        branch: "CSE",
        yearOfStudy: "IV",
        attended: true,
        attendedAt: new Date(),
      } as any);

      const result = await AttendanceService.scanQR(mockQRData, adminId);

      expect(result.success).toBe(true);
      expect(result.alreadyAttended).toBe(false);
      expect(prismaMock.attendanceLog.create).toHaveBeenCalled();
    });

    /**
     * Verifies error handling for malformed QR data.
     * Expects an error when non-JSON string is passed.
     */
    it("should throw error for invalid QR format", async () => {
      await expect(
        AttendanceService.scanQR("invalid-json", adminId),
      ).rejects.toThrow("Invalid QR code format");
    });

    /**
     * Verifies security check for tampered QR codes.
     * Mocks hash verification failure and expects 'QR code verification failed'.
     */
    it("should throw error if hash verification fails", async () => {
      (QRService.verifyHash as any).mockReturnValue(false);
      await expect(
        AttendanceService.scanQR(mockQRData, adminId),
      ).rejects.toThrow("QR code verification failed");
    });

    /**
     * Verifies event validation.
     * Expects error if the QR code is for a different event ID.
     */
    it("should throw error if eventId mismatch", async () => {
      const badPayload = { ...mockPayload, eventId: "wrong-event" };
      (QRService.verifyHash as any).mockReturnValue(true);
      await expect(
        AttendanceService.scanQR(JSON.stringify(badPayload), adminId),
      ).rejects.toThrow("This QR code is not for IconCoderz-2K26 event");
    });

    /**
     * Verifies handling of users who have already checked in.
     * Mocks a user with 'attended: true' and expects specific success=false response.
     */
    it("should handle already checked in user", async () => {
      (QRService.verifyHash as any).mockReturnValue(true);
      prismaMock.user.findFirst.mockResolvedValue({
        id: "user-id-1",
        fullName: "Test User",
        paymentStatus: "VERIFIED",
        attended: true,
        attendedAt: new Date(),
      } as any);

      const result = await AttendanceService.scanQR(mockQRData, adminId);

      expect(result.success).toBe(false);
      expect(result.alreadyAttended).toBe(true);
      expect(result.message).toBe("Already checked in");
    });
  });

  describe("manualCheckIn", () => {
    /**
     * Verifies manual check-in functionality.
     * Mocks a valid user lookup and update.
     * Expects successful check-in and log creation.
     */
    it("should check in manually", async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: "user-id-1",
        fullName: "Test User",
        paymentStatus: "VERIFIED",
        attended: false,
      } as any);

      prismaMock.user.update.mockResolvedValue({
        id: "user-id-1",
        fullName: "Test User",
        attended: true,
        attendedAt: new Date(),
      } as any);

      const result = await AttendanceService.manualCheckIn(
        { registrationCode: "IC2K26-TEST" },
        "admin-id-1",
      );

      expect(result.success).toBe(true);
      expect(prismaMock.attendanceLog.create).toHaveBeenCalled();
    });
  });
});
