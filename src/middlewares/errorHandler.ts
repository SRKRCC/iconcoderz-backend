import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';
import { config } from '../config/index.js';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  Logger.error(err);

  if (err instanceof z.ZodError) {
    const message = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return sendError(res, 400, 'Validation Error', message);
  }

  if (err.message === 'Email already registered' || 
      err.message === 'Registration number already registered' || 
      err.message === 'Phone number already registered' ||
      err.message === 'Transaction ID already used' ||
      err.message === 'Invalid credentials' ||
      err.message === 'User not found') {
    return sendError(res, err.message === 'Invalid credentials' ? 401 : 409, err.message);
  }

  const statusCode = err.statusCode || 500;
  const message = config.env === 'production' && statusCode === 500 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';

  return sendError(res, statusCode, message);
};
