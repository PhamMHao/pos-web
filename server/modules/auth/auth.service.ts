import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db";
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from "../../core/errors/AppError";
import { LoginInput, RegisterInput, ChangePasswordInput } from "./auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "gp_erp_enterprise_super_secret_jwt_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class AuthService {
  static async login(input: LoginInput) {
    const users = await prisma.user.findMany({
      where: { username: input.username },
    });

    const user = users[0];
    if (!user) {
      throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không chính xác");
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không chính xác");
    }

    // Update updatedAt
    await prisma.user.updateMany({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as any
    );

    const userProfile = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      createdAt: user.createdAt,
    };

    return {
      token,
      user: userProfile,
    };
  }

  static async register(input: RegisterInput) {
    const existing = await prisma.user.findMany({
      where: { username: input.username },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Tên đăng nhập "${input.username}" đã tồn tại`);
    }

    if (input.email) {
      const existingEmail = await prisma.user.findMany({
        where: { email: input.email },
      });
      if (existingEmail.length > 0) {
        throw new ConflictError(`Email "${input.email}" đã được sử dụng`);
      }
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const id = `user-${Date.now()}`;
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [User] (id, username, passwordHash, fullName, email, role, avatar, status, createdAt, updatedAt)
      VALUES (${id}, ${input.username}, ${hashedPassword}, ${input.fullName}, ${input.email || null}, ${input.role || "cashier"}, ${input.avatar || null}, 'active', ${dt}, ${dt})
    `;

    return this.getMe(id);
  }

  static async getMe(userId: string) {
    const users = await prisma.user.findMany({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    const user = users[0];
    if (!user) {
      throw new NotFoundError("Không tìm thấy thông tin người dùng");
    }

    return user;
  }

  static async changePassword(userId: string, input: ChangePasswordInput) {
    const users = await prisma.user.findMany({
      where: { id: userId },
    });

    const user = users[0];
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    const isMatch = await bcrypt.compare(input.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError("Mật khẩu hiện tại không đúng");
    }

    const newHashedPassword = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.updateMany({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });

    return { message: "Đổi mật khẩu thành công" };
  }

  static async listUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return users;
  }
}
