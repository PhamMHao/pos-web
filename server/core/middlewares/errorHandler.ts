import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { sendError } from "../utils/responseFormatter";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Global Error Handler caught:", err);

  // App Error
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const issues = (err as any).issues || (err as any).errors || [];
    const formattedErrors = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : e.path,
      message: e.message,
    }));
    return sendError(res, "Dữ liệu gửi lên không đúng định dạng", 422, formattedErrors);
  }

  // Prisma Known Request Error
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      const target = err.meta?.target || "Dữ liệu";
      return sendError(
        res,
        `Đã tồn tại bản ghi với thông tin này (${Array.isArray(target) ? target.join(", ") : target})`,
        409
      );
    }
    if (err.code === "P2025") {
      return sendError(res, "Không tìm thấy bản ghi yêu cầu trong CSDL", 404);
    }
    if (err.code === "P2003") {
      return sendError(res, "Ràng buộc khóa ngoại không hợp lệ hoặc dữ liệu liên quan đã bị xóa", 400);
    }
    return sendError(res, `Lỗi Cơ sở dữ liệu (${err.code}): ${err.message}`, 400);
  }

  // Fallback 500
  const message = process.env.NODE_ENV === "production" ? "Lỗi máy chủ nội bộ" : err.message || "Lỗi không xác định";
  return sendError(res, message, 500);
}
