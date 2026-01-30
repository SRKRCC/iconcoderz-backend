import { prisma } from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminLoginInput } from "../dtos/admin.dto.js";
import { config } from "../config/index.js";
import { cache, CacheKeys, CacheTTL } from "../utils/cache.js";
import { QRService } from "./qr.service.js";
import { EmailService } from "./email.service.js";

export class AdminService {
  static async login(data: AdminLoginInput) {
    const admin = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (!admin) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(data.password, admin.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      config.jwt.secret,
      { expiresIn: "7d" },
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async getAllUsers(filters?: {
    paymentStatus?: string;
    branch?: string;
    yearOfStudy?: string;
    search?: string;
  }) {
    if (filters?.search && filters.search.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).join(" & ");

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      conditions.push(
        `"searchVector" @@ to_tsquery('english', $${paramIndex})`,
      );
      params.push(searchTerms);
      paramIndex++;

      if (filters.paymentStatus) {
        conditions.push(`"paymentStatus" = $${paramIndex}::"PaymentStatus"`);
        params.push(filters.paymentStatus);
        paramIndex++;
      }
      if (filters.branch) {
        conditions.push(`"branch" = $${paramIndex}::"Branch"`);
        params.push(filters.branch);
        paramIndex++;
      }
      if (filters.yearOfStudy) {
        conditions.push(`"yearOfStudy" = $${paramIndex}::"YearOfStudy"`);
        params.push(filters.yearOfStudy);
        paramIndex++;
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Exclude searchVector from SELECT to avoid deserialization error
      const users = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id, "registrationCode", "fullName", "registrationNumber", email, phone, 
                "yearOfStudy", branch, gender, "codechefHandle", "leetcodeHandle", "codeforcesHandle",
                "transactionId", "screenshotUrl", "paymentStatus", attended, "attendedAt", 
                "attendedBy", "checkInCount", "createdAt", "updatedAt"
         FROM "User" ${whereClause} ORDER BY "createdAt" DESC`,
        ...params,
      );

      return users;
    }

    const where: any = {};

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.branch) {
      where.branch = filters.branch;
    }

    if (filters?.yearOfStudy) {
      where.yearOfStudy = filters.yearOfStudy;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return users;
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async updatePaymentStatus(
    userId: string,
    status: "PENDING" | "VERIFIED" | "REJECTED",
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { paymentStatus: status },
    });

    return user;
  }

  static async getDashboardStats() {
    return cache.getOrCompute(
      CacheKeys.DASHBOARD_STATS,
      CacheTTL.DASHBOARD_STATS,
      async () => {
        const [
          totalParticipants,
          verifiedPayments,
          pendingPayments,
          rejectedPayments,
          branchDistribution,
          yearDistribution,
          recentRegistrations,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { paymentStatus: "VERIFIED" } }),
          prisma.user.count({ where: { paymentStatus: "PENDING" } }),
          prisma.user.count({ where: { paymentStatus: "REJECTED" } }),
          prisma.user.groupBy({
            by: ["branch"],
            _count: { branch: true },
          }),
          prisma.user.groupBy({
            by: ["yearOfStudy"],
            _count: { yearOfStudy: true },
          }),
          prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              registrationCode: true,
              fullName: true,
              branch: true,
              yearOfStudy: true,
              paymentStatus: true,
              createdAt: true,
            },
          }),
        ]);

        return {
          totalParticipants,
          verifiedPayments,
          pendingPayments,
          rejectedPayments,
          branchDistribution: branchDistribution.reduce(
            (acc, item) => {
              acc[item.branch] = item._count.branch;
              return acc;
            },
            {} as Record<string, number>,
          ),
          yearDistribution: yearDistribution.reduce(
            (acc, item) => {
              acc[item.yearOfStudy] = item._count.yearOfStudy;
              return acc;
            },
            {} as Record<string, number>,
          ),
          recentRegistrations,
        };
      },
    );
  }

  static async getAllOutbox(status?: string) {
    const where: any = {};

    if (status && ["PENDING", "PROCESSING", "DONE", "FAILED"].includes(status)) {
      where.status = status;
    }

    const outboxEntries = await prisma.outbox.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return outboxEntries;
  }

  static async sendOutboxEmails(outboxIds: string[]) {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const outboxId of outboxIds) {
      try {
        const outboxEntry = await prisma.outbox.findUnique({
          where: { id: outboxId },
        });

        if (!outboxEntry) {
          results.failed.push({ id: outboxId, error: "Outbox entry not found" });
          continue;
        }

        if (outboxEntry.status === "DONE") {
          results.failed.push({ id: outboxId, error: "Already processed" });
          continue;
        }

        await prisma.outbox.update({
          where: { id: outboxId },
          data: {
            status: "PROCESSING",
            attempts: outboxEntry.attempts + 1,
          },
        });

        const payload = outboxEntry.payload as any;

        if (outboxEntry.type === "send_confirmation") {
          const { registrationCode, userId, email, fullName } = payload;

          const qrDataUrl = await QRService.generate(registrationCode, userId);

          await EmailService.sendConfirmationNow(email, fullName, registrationCode, qrDataUrl, {
            phone: payload.phone,
            registrationNumber: payload.registrationNumber,
            branch: payload.branch,
            yearOfStudy: payload.yearOfStudy,
            codechefHandle: payload.codechefHandle,
            leetcodeHandle: payload.leetcodeHandle,
            codeforcesHandle: payload.codeforcesHandle,
          });

          await prisma.outbox.update({
            where: { id: outboxId },
            data: {
              status: "DONE",
              processedAt: new Date(),
              lastError: null,
            },
          });

          results.success.push(outboxId);
        } else {
          results.failed.push({ id: outboxId, error: "Unknown outbox type" });
        }
      } catch (error) {
        console.error(`Failed to process outbox ${outboxId}:`, error);

        await prisma.outbox.update({
          where: { id: outboxId },
          data: {
            status: "PENDING",
            lastError: (error as Error).message || String(error),
          },
        });

        results.failed.push({
          id: outboxId,
          error: (error as Error).message || String(error),
        });
      }
    }

    return results;
  }
}
