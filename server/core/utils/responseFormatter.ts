import { Response } from "express";

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: any;
  timestamp: string;
}

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: PaginationMeta
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T = any>(res: Response, data: T, message: string = "Tạo mới thành công") {
  return sendSuccess(res, data, message, 201);
}

export function sendPaginated<T = any>(
  res: Response,
  data: T,
  total: number,
  page: number,
  limit: number,
  message?: string
) {
  const totalPages = Math.ceil(total / (limit || 1));
  return sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
}

export function sendError(
  res: Response,
  message: string = "Đã xảy ra lỗi",
  statusCode: number = 500,
  errors?: any
) {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}
