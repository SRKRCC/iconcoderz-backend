export class AuditService {
  static async create(event: string, payload: any): Promise<void> {
    try {
      console.log("[AuditService]", event, payload);
    } catch (err) {
      console.warn("[AuditService] Failed to log audit record", err);
    }
  }
}
