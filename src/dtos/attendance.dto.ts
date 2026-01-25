import { z } from "zod";

export const scanQRSchema = z.object({
  qrData: z.string().min(1, "QR data is required"),
  ipAddress: z.string().optional(),
  deviceInfo: z.string().optional(),
});

export const manualCheckInSchema = z
  .object({
    registrationCode: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .refine((data) => data.registrationCode || data.email || data.phone, {
    message: "At least one of registrationCode, email, or phone is required",
  });

export const attendanceListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  attended: z.enum(["true", "false", "all"]).optional().default("all"),
  sortBy: z
    .enum(["createdAt", "attendedAt", "fullName"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ScanQRInput = z.infer<typeof scanQRSchema>;
export type ManualCheckInInput = z.infer<typeof manualCheckInSchema>;
export type AttendanceListInput = z.infer<typeof attendanceListSchema>;
