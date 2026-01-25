import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminService } from "@/services/admin.service";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@generated/prisma/client.js";

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("@/utils/cache", () => ({
  cache: {
    getOrCompute: vi.fn((key, ttl, compute) => compute()),
  },
  CacheKeys: { DASHBOARD_STATS: "dashboard_stats" },
  CacheTTL: { DASHBOARD_STATS: 300 },
}));

vi.mock("@/utils/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return {
    prisma: mockDeep(),
  };
});

vi.mock("@/config/index", () => ({
  config: {
    jwt: { secret: "test-secret" },
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("AdminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    /**
     * Verifies successful admin login.
     * Mocks finding the admin user and validating the password hash.
     * key check: Returns a JWT token and correct admin profile.
     */
    it("should login successfully with valid credentials", async () => {
      const mockAdmin = {
        id: "1",
        email: "admin@test.com",
        password: "hashed-password",
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue("test-token");

      const result = await AdminService.login({
        email: "admin@test.com",
        password: "password",
      });

      expect(result).toHaveProperty("token", "test-token");
      expect(result.admin.email).toBe("admin@test.com");
    });

    /**
     * Verifies login failure when email does not exist.
     * Ensures an 'Invalid credentials' error is thrown to avoid leaking user existence.
     */
    it("should throw error for non-existent email", async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);

      await expect(
        AdminService.login({ email: "wrong@test.com", password: "password" }),
      ).rejects.toThrow("Invalid credentials");
    });

    /**
     * Verifies login failure when password is incorrect.
     * Mocks a failed bcrypt comparison and expects an 'Invalid credentials' error.
     */
    it("should throw error for invalid password", async () => {
      const mockAdmin = {
        id: "1",
        email: "admin@test.com",
        password: "hashed-password",
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        AdminService.login({ email: "admin@test.com", password: "wrong" }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("verifyToken", () => {
    /**
     * Verifies that a valid JWT token is decoded correctly.
     * Mocks jwt.verify to return the expected payload.
     */
    it("should return decoded token if valid", async () => {
      const mockDecoded = { id: "1", role: "admin" };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      const result = await AdminService.verifyToken("valid-token");
      expect(result).toEqual(mockDecoded);
    });

    /**
     * Verifies that invalid tokens raise an error.
     * Mocks jwt.verify to throw an exception, ensuring the service wraps it correctly.
     */
    it("should throw error if token is invalid", async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(AdminService.verifyToken("invalid")).rejects.toThrow(
        "Invalid or expired token",
      );
    });
  });

  describe("getUserById", () => {
    /**
     * Verifies fetching a user ID.
     * Mocks prisma.findUnique to return a user object.
     */
    it("should return user if found", async () => {
      const mockUser = { id: "1", fullName: "John Doe" } as any;
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await AdminService.getUserById("1");
      expect(result).toEqual(mockUser);
    });

    /**
     * Verifies error handling when a user ID does not exist.
     * Mocks returning null and expects a 'User not found' error.
     */
    it("should throw error if user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(AdminService.getUserById("999")).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("updatePaymentStatus", () => {
    /**
     * Verifies that payment status updates are persisted.
     * Checks if prisma.update is called with the correct ID and status.
     */
    it("should update payment status", async () => {
      const mockUser = { id: "1", paymentStatus: "VERIFIED" } as any;
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await AdminService.updatePaymentStatus("1", "VERIFIED");
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { paymentStatus: "VERIFIED" },
      });
    });
  });
});
