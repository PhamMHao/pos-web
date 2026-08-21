export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(message: string, statusCode: number = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Dữ liệu yêu cầu không hợp lệ", errors?: any) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Bạn không có quyền thực hiện hành động này") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Không tìm thấy tài nguyên yêu cầu") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Dữ liệu đã tồn tại hoặc xảy ra xung đột") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Lỗi xác thực dữ liệu", errors?: any) {
    super(message, 422, errors);
  }
}
