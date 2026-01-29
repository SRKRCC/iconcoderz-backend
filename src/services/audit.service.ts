import { prisma } from "../utils/prisma.js";

export class AuditService {
  static async create(event: string, payload: any, userId?: string) {
    try {
      await prisma.audit.create({
        data: {
          event: event as any,
          payload: payload ?? {},
          userId,
        },
      });
    } catch (err) {
      console.warn("[AuditService] Failed to write audit record", err);
    }
  }
}
