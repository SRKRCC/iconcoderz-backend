import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrationService } from "@/services/registration.service";
import { prisma } from "@/utils/prisma";
import { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@generated/prisma/client.js";
import { QRService } from "@/services/qr.service";
import { EmailService } from "@/services/email.service";

vi.mock("@/services/qr.service");
vi.mock("@/services/email.service");
vi.mock("uuid", () => ({
  v4: () => "11111111-2222-3333-4444-555555555555",
}));

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

describe("RegistrationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    const mockUserData = {
      fullName: "John Doe",
      registrationNumber: "1234567890",
      email: "john@test.com",
      phone: "1234567890",
      yearOfStudy: "IV" as any,
      branch: "CSE" as any,
      gender: "Male" as any,
      transactionId: "txn_12345",
      screenshotUrl: "http://example.com/image.jpg",
      confirmInfo: true,
    };

    /**
     * Verifies that a user can register successfully.
     * Mocks no existing user checks, mocks creation of the user, QR generation,
     * and email sending. Expects the user object to be returned with an ID.
     */
    it("should register a new user successfully", async () => {
      // No existing users on any unique checks
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Registration now performs an atomic transaction (user + outbox)
      prismaMock.$transaction.mockResolvedValue({
        id: "user-id-1",
        ...mockUserData,
        registrationCode: "IC2K26-11111111",
        paymentStatus: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        attended: false,
      } as any);

      const result = await RegistrationService.register(mockUserData);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(4);
      expect(prismaMock.$transaction).toHaveBeenCalled();
      // QR/email should NOT be called synchronously anymore
      expect(QRService.generate).not.toHaveBeenCalled();
      expect(EmailService.sendConfirmation).not.toHaveBeenCalled();
      expect(result.id).toBe("user-id-1");
    });

    /**
     * Verifies duplicate email handling.
     * Mocks an existing user returned by findFirst matching the email.
     * Expects an error preventing registration.
     */
    it("should throw error if email already exists", async () => {
      // Simulate email conflict: first findUnique (email) returns a record
      prismaMock.user.findUnique.mockResolvedValueOnce({
        email: "john@test.com",
        registrationNumber: "other",
        phone: "other",
        transactionId: "other",
      } as any);

      await expect(RegistrationService.register(mockUserData)).rejects.toThrow(
        "Email already registered",
      );
    });

    /**
     * Verifies duplicate registration number handling.
     * Mocks an existing user returned by findFirst matching the registration number.
     * Expects an error preventing registration.
     */
    it("should throw error if registration number already exists", async () => {
      // Simulate registration number conflict: second findUnique (registrationNumber) returns a record
      prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
        email: "other@test.com",
        registrationNumber: "1234567890",
        phone: "other",
        transactionId: "other",
      } as any);

      await expect(RegistrationService.register(mockUserData)).rejects.toThrow(
        "Registration number already registered",
      );
    });

    /**
     * Verifies duplicate phone number handling.
     * Mocks an existing user returned by findFirst matching the phone number.
     * Expects an error preventing registration.
     */
    it("should throw error if phone already exists", async () => {
      // Simulate phone conflict: first two checks null, third (phone) returns record
      prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({
        email: "other@test.com",
        registrationNumber: "other",
        phone: "1234567890",
        transactionId: "other",
      } as any);

      await expect(RegistrationService.register(mockUserData)).rejects.toThrow(
        "Phone number already registered",
      );
    });

    /**
     * Verifies duplicate transaction ID handling.
     * Mocks an existing user returned by findFirst matching the transaction ID.
     * Expects an error preventing double use of payment proofs.
     */
    it("should throw error if transactionId already exists", async () => {
      // Simulate transactionId conflict: first three checks null, fourth returns record
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          email: "other@test.com",
          registrationNumber: "other",
          phone: "other",
          transactionId: "txn_12345",
        } as any);

      await expect(RegistrationService.register(mockUserData)).rejects.toThrow(
        "Transaction ID already used",
      );
    });
  });
});
