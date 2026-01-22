import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { sendError } from '../utils/response.js';

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'Authentication required');
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await AdminService.verifyToken(token);
      req.admin = decoded;
      next();
    } catch (error) {
      sendError(res, 401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};
