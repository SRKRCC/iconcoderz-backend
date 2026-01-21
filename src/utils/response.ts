import { Response } from 'express';

type ResponseStatus = 'success' | 'error';

interface ApiResponse<T = any> {
  status: ResponseStatus;
  message: string;
  data?: T;
  error?: any;
}

export const sendResponse = <T>(res: Response, statusCode: number, message: string, data?: T) => {
  const response: ApiResponse<T> = {
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string, error?: any) => {
  const response: ApiResponse = {
    status: 'error',
    message,
    error,
  };
  return res.status(statusCode).json(response);
};
