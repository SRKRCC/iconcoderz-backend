import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service.js';
import { EmailService } from '../services/email.service.js';
import { scanQRSchema, manualCheckInSchema, attendanceListSchema } from '../dtos/attendance.dto.js';
import { sendResponse, sendError } from '../utils/response.js';

export class AttendanceController {
  static async scanQR(req: Request, res: Response, _next: NextFunction) {
    try {
      const validatedData = scanQRSchema.parse(req.body);
      const adminId = (req as any).user.id;

      const result = await AttendanceService.scanQR(
        validatedData.qrData,
        adminId,
        validatedData.ipAddress || req.ip,
        validatedData.deviceInfo || req.get('User-Agent')
      );

      // Send confirmation email if new check-in
      if (result.success && !result.alreadyAttended) {
        EmailService.sendAttendanceConfirmation(
          result.user.email,
          result.user.fullName
        ).catch(err => console.error('Failed to send attendance confirmation:', err));
      }

      return sendResponse(res, 200, result.message, result);
    } catch (error: any) {
      return sendError(res, 400, error.message);
    }
  }

  static async manualCheckIn(req: Request, res: Response, _next: NextFunction) {
    try {
      const validatedData = manualCheckInSchema.parse(req.body);
      const adminId = (req as any).user.id;

      const result = await AttendanceService.manualCheckIn(validatedData, adminId);

      // Send confirmation email if new check-in
      if (result.success && !result.alreadyAttended) {
        EmailService.sendAttendanceConfirmation(
          result.user.email as string,
          result.user.fullName
        ).catch(err => console.error('Failed to send attendance confirmation:', err));
      }

      return sendResponse(res, 200, result.message, result);
    } catch (error: any) {
      return sendError(res, 400, error.message);
    }
  }

  static async getStats(_req: Request, res: Response, _next: NextFunction) {
    try {
      const stats = await AttendanceService.getStats();
      return sendResponse(res, 200, 'Stats fetched successfully', stats);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  static async getRecentScans(req: Request, res: Response, _next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentScans = await AttendanceService.getRecentScans(limit);
      return sendResponse(res, 200, 'Recent scans fetched successfully', recentScans);
    } catch (error: any) {
      return sendError(res, 500, error.message);
    }
  }

  static async getAttendanceList(req: Request, res: Response, _next: NextFunction) {
    try {
      const validatedParams = attendanceListSchema.parse({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search,
        attended: req.query.attended,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      });

      const result = await AttendanceService.getAttendanceList(validatedParams);
      return sendResponse(res, 200, 'Attendance list fetched successfully', result);
    } catch (error: any) {
      return sendError(res, 400, error.message);
    }
  }
}
