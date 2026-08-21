import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(2, "Tên đăng nhập tối thiểu 2 ký tự"),
  password: z.string().min(4, "Mật khẩu tối thiểu 4 ký tự"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự").max(50),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().nullable(),
  role: z.enum(["admin", "manager", "cashier", "warehouse", "accountant", "technician"]).default("cashier"),
  avatar: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(4, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
