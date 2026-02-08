import { Request, Response, NextFunction } from "express";
import { AdminLoginSchema } from "../dtos/admin.dto.js";
import { AdminService } from "../services/admin.service.js";
import { sendResponse } from "../utils/response.js";

export class AdminController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AdminLoginSchema.parse(req.body);
      const result = await AdminService.login(data);
      sendResponse(res, 200, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardStats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const stats = await AdminService.getDashboardStats();
      sendResponse(res, 200, "Dashboard stats retrieved", stats);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentStatus, branch, yearOfStudy, search, collegeName, isCodingClubAffiliate } = req.query;

      const users = await AdminService.getAllUsers({
        paymentStatus: paymentStatus as string,
        branch: branch as string,
        yearOfStudy: yearOfStudy as string,
        collegeName: collegeName as string,
        isCodingClubAffiliate: isCodingClubAffiliate as string,
        search: search as string,
      });

      sendResponse(res, 200, "Users retrieved successfully", users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id as string);
      sendResponse(res, 200, "User retrieved successfully", user);
    } catch (error) {
      next(error);
    }
  }

  static async updatePaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
        return sendResponse(res, 400, "Invalid payment status");
      }

      const user = await AdminService.updatePaymentStatus(id as string, status);
      return sendResponse(
        res,
        200,
        "Payment status updated successfully",
        user,
      );
    } catch (error) {
      return next(error);
    }
  }

  static async getAllOutbox(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const outboxEntries = await AdminService.getAllOutbox(status as string);
      sendResponse(res, 200, "Outbox entries retrieved successfully", outboxEntries);
    } catch (error) {
      next(error);
    }
  }

  static async sendOutboxEmails(req: Request, res: Response, next: NextFunction) {
    try {
      const { outboxIds } = req.body;
      
      if (!outboxIds || !Array.isArray(outboxIds) || outboxIds.length === 0) {
        return sendResponse(res, 400, "outboxIds array is required");
      }

      const result = await AdminService.sendOutboxEmails(outboxIds);
      return sendResponse(res, 200, "Email sending completed", result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteOutbox(req: Request, res: Response, next: NextFunction) {
    try {
      const { outboxIds } = req.body;
      if (!outboxIds || !Array.isArray(outboxIds) || outboxIds.length === 0) {
        return sendResponse(res, 400, "outboxIds array is required");
      }

      const result = await AdminService.deleteOutbox(outboxIds);
      return sendResponse(res, 200, "Outbox deletion completed", result);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return sendResponse(res, 400, "userIds array is required");
      }

      const result = await AdminService.deleteUsers(userIds);
      return sendResponse(res, 200, "Users deletion completed", result);
    } catch (error) {
      return next(error);
    }
  }
}
