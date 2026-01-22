import { Request, Response, NextFunction } from 'express';
import { AdminLoginSchema } from '../dtos/admin.dto.js';
import { AdminService } from '../services/admin.service.js';
import { sendResponse } from '../utils/response.js';

export class AdminController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AdminLoginSchema.parse(req.body);
      const result = await AdminService.login(data);
      sendResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      sendResponse(res, 200, 'Dashboard stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentStatus, branch, yearOfStudy, search } = req.query;
      
      const users = await AdminService.getAllUsers({
        paymentStatus: paymentStatus as string,
        branch: branch as string,
        yearOfStudy: yearOfStudy as string,
        search: search as string,
      });

      sendResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id);
      sendResponse(res, 200, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
        return sendResponse(res, 400, 'Invalid payment status');
      }

      const user = await AdminService.updatePaymentStatus(id, status);
      sendResponse(res, 200, 'Payment status updated successfully', user);
    } catch (error) {
      next(error);
    }
  }
}
