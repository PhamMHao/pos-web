import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db";
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from "../../core/errors/AppError";
import { LoginInput, RegisterInput, ChangePasswordInput } from "./auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "gp_erp_enterprise_super_secret_jwt_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const INITIAL_ROLES = [
  {
    roleKey: "admin",
    roleNameVi: "Quản Trị Viên (Admin)",
    description: "Toàn quyền tối cao quản trị hệ thống, dữ liệu, tài khoản và cấu hình phân quyền",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    gradient: "from-rose-600 to-red-600",
    defaultTab: "pos",
    permissions: JSON.stringify([
      "pos", "quotes", "suppliers", "costing", "inventory", "assets", "warranties",
      "accounting", "einvoices", "contracts", "orders", "hr", "ai", "customers",
      "promotions", "analytics", "accounts", "masterdata", "settings",
      "scanner_printer_hub", "quick_stock", "ai_copilot", "cash_shift", "doc_ocr",
      "digital_signature", "database_config", "fraud_alerts"
    ]),
  },
  {
    roleKey: "manager",
    roleNameVi: "Quản Lý Cửa Hàng / Giám Đốc",
    description: "Giám sát hoạt động bán hàng, kho, doanh thu, phê duyệt báo giá và đánh giá KPI nhân sự",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    gradient: "from-blue-600 to-indigo-600",
    defaultTab: "analytics",
    permissions: JSON.stringify([
      "pos", "quotes", "suppliers", "costing", "inventory", "assets", "warranties",
      "accounting", "einvoices", "contracts", "orders", "hr", "ai", "customers",
      "promotions", "analytics", "masterdata", "scanner_printer_hub", "quick_stock",
      "ai_copilot", "cash_shift", "doc_ocr", "digital_signature", "fraud_alerts"
    ]),
  },
  {
    roleKey: "cashier",
    roleNameVi: "Nhân Viên Thu Ngân POS",
    description: "Bán hàng tại quầy, quản lý két tiền ca làm việc, in hóa đơn, đổi trả hàng tại quầy",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    gradient: "from-emerald-600 to-teal-600",
    defaultTab: "pos",
    permissions: JSON.stringify([
      "pos", "orders", "customers", "warranties", "promotions", "quotes",
      "scanner_printer_hub", "cash_shift"
    ]),
  },
  {
    roleKey: "warehouse",
    roleNameVi: "Thủ Kho Vật Tư & Nhập Hàng",
    description: "Quản lý tồn kho, nhập/xuất/kiểm kê kho, mua hàng PO, quản lý nhà cung cấp, in tem mã vạch",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    gradient: "from-amber-600 to-orange-600",
    defaultTab: "inventory",
    permissions: JSON.stringify([
      "inventory", "suppliers", "costing", "assets", "orders",
      "scanner_printer_hub", "quick_stock", "doc_ocr"
    ]),
  },
  {
    roleKey: "accountant",
    roleNameVi: "Kế Toán Trưởng & Tài Chính",
    description: "Quản lý sổ quỹ, thu chi công nợ, hóa đơn điện tử TT78, hợp đồng lao động, tính lương và ký số CA",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    gradient: "from-purple-600 to-fuchsia-600",
    defaultTab: "accounting",
    permissions: JSON.stringify([
      "accounting", "einvoices", "contracts", "hr", "analytics", "ai", "suppliers",
      "orders", "costing", "assets", "masterdata", "digital_signature", "doc_ocr",
      "ai_copilot", "fraud_alerts"
    ]),
  },
  {
    roleKey: "sales",
    roleNameVi: "Nhân Viên Kinh Doanh / Bán Hàng",
    description: "Lập báo giá khách hàng, quản lý CRM khách hàng, theo dõi đơn hàng và khuyến mãi",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    gradient: "from-cyan-600 to-blue-600",
    defaultTab: "quotes",
    permissions: JSON.stringify([
      "quotes", "customers", "promotions", "orders"
    ]),
  },
  {
    roleKey: "technician",
    roleNameVi: "Kỹ Thuật Viên & Bảo Hành",
    description: "Tiếp nhận xử lý bảo hành, sửa chữa thiết bị, tra cứu serial/IMEI và quản lý vật tư thay thế",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    gradient: "from-teal-600 to-emerald-600",
    defaultTab: "warranties",
    permissions: JSON.stringify([
      "warranties", "scanner_printer_hub"
    ]),
  },
];

const INITIAL_MODULES = [
  { id: "pos", label: "Quản Lý Bán Hàng (POS)", category: "core", description: "Bán hàng thu ngân tại quầy, tính tiền nhanh, mở/đóng ca két tiền", orderIndex: 1 },
  { id: "quotes", label: "Quản Lý Báo Giá", category: "operation", description: "Lập báo giá chuyên nghiệp cho khách hàng cá nhân / doanh nghiệp", orderIndex: 2 },
  { id: "suppliers", label: "Nhà Cung Ứng & Mua Hàng", category: "operation", description: "Quản lý danh sách nhà cung cấp, bảng giá đối tác và đơn mua hàng PO", orderIndex: 3 },
  { id: "costing", label: "Tính Giá Thành & BOM", category: "operation", description: "Định mức linh kiện vật tư BOM, chi phí nhân công, khấu hao máy móc", orderIndex: 4 },
  { id: "inventory", label: "Quản Lý Kho Hàng", category: "operation", description: "Quản lý tồn kho, xuất nhập kho, kiểm kho, chuyển kho nội bộ", orderIndex: 5 },
  { id: "assets", label: "Tài Sản & Thiết Bị", category: "management", description: "Quản lý trang thiết bị doanh nghiệp, tài sản cố định và khấu hao", orderIndex: 6 },
  { id: "warranties", label: "Bảo Hành & Bảo Trì", category: "operation", description: "Tiếp nhận phiếu bảo hành, sửa chữa, theo dõi Serial/IMEI thiết bị", orderIndex: 7 },
  { id: "accounting", label: "Kế Toán & Công Nợ", category: "finance", description: "Quản lý phiếu thu chi, sổ quỹ tiền mặt, công nợ khách hàng và NCC", orderIndex: 8 },
  { id: "einvoices", label: "Hóa Đơn Điện Tử (TT78)", category: "finance", description: "Phát hành HĐĐT kết nối Tổng Cục Thuế, đồng bộ XML đầu vào", orderIndex: 9 },
  { id: "contracts", label: "Hợp Đồng Lao Động Online", category: "management", description: "Soạn thảo hợp đồng lao động điện tử và ký số nhân sự", orderIndex: 10 },
  { id: "orders", label: "Quản Lý Đơn Hàng & Vận Chuyển", category: "core", description: "Theo dõi đơn hàng đa kênh, trạng thái giao vận và đổi trả RMA", orderIndex: 11 },
  { id: "hr", label: "Chấm Công & HR & Lương", category: "management", description: "Hồ sơ nhân viên, chấm công ca, đánh giá KPI và tính hoa hồng doanh số", orderIndex: 12 },
  { id: "ai", label: "Dashboard AI Phân Tích", category: "management", description: "Trợ lý AI phân tích doanh số bán hàng, dự báo tồn kho và cảnh báo gian lận", orderIndex: 13 },
  { id: "customers", label: "Khách Hàng & CRM", category: "core", description: "Quản lý thông tin khách hàng, tích điểm thưởng, phân hạng thành viên", orderIndex: 14 },
  { id: "promotions", label: "Khuyến Mãi & Voucher", category: "operation", description: "Thiết lập chương trình khuyến mãi, mã giảm giá và voucher quà tặng", orderIndex: 15 },
  { id: "analytics", label: "Báo Cáo & Doanh Thu", category: "finance", description: "Báo cáo trực quan doanh thu, lợi nhuận, biểu đồ dòng tiền và top bán chạy", orderIndex: 16 },
  { id: "accounts", label: "Quản Lý Tài Khoản & RBAC", category: "system", description: "Quản lý tài khoản người dùng, đổi mật khẩu và tùy biến ma trận phân quyền", orderIndex: 17 },
  { id: "masterdata", label: "Dữ Liệu Cơ Bản & MDM", category: "system", description: "Quản lý danh mục gốc: Khách hàng, NCC, ĐVT quy đổi, Phòng ban, Chức vụ, Vị trí ô kệ, Nhóm hàng & VAT", orderIndex: 18 },
  { id: "settings", label: "Cài Đặt & Cấu Hình", category: "system", description: "Cấu hình thông tin cửa hàng, máy in, kết nối cơ sở dữ liệu SQL Server", orderIndex: 19 },
];

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
      INSERT INTO [NguoiDung] (id, username, passwordHash, fullName, email, role, avatar, status, createdAt, updatedAt)
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
        phone: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return users;
  }

  static async updateUser(userId: string, data: any) {
    const dt = new Date();
    await prisma.user.updateMany({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role,
        status: data.status || "active",
        updatedAt: dt,
      },
    });
    return this.getMe(userId);
  }

  static async deleteUser(userId: string) {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    return { message: "Xóa người dùng thành công" };
  }

  // ===================== RBAC DATABASE OPERATIONS =====================

  static async getRoles() {
    let roles: any[] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM [PhanQuyenVaiTro] ORDER BY [createdAt] ASC`
    ).catch(() => []);

    if (roles.length === 0) {
      // Auto seed into database
      const dt = new Date();
      for (const r of INITIAL_ROLES) {
        const id = `role-${r.roleKey}`;
        await prisma.$executeRaw`
          INSERT INTO [PhanQuyenVaiTro] (id, roleKey, roleNameVi, description, badgeColor, gradient, defaultTab, permissions, createdAt, updatedAt)
          VALUES (${id}, ${r.roleKey}, ${r.roleNameVi}, ${r.description}, ${r.badgeColor}, ${r.gradient}, ${r.defaultTab}, ${r.permissions}, ${dt}, ${dt})
        `;
      }
      roles = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM [PhanQuyenVaiTro] ORDER BY [createdAt] ASC`
      ).catch(() => []);
    }

    return roles.map((r) => ({
      id: r.roleKey,
      label: r.roleNameVi ? r.roleNameVi.split(" (")[0] : r.roleKey,
      nameVi: r.roleNameVi || r.roleKey,
      description: r.description || "",
      badgeColor: r.badgeColor || "bg-blue-500/20 text-blue-300 border-blue-500/40",
      gradient: r.gradient || "from-blue-600 to-indigo-600",
      defaultTab: r.defaultTab || "pos",
      permissions: (() => {
        try {
          return typeof r.permissions === 'string' ? JSON.parse(r.permissions) : (r.permissions || []);
        } catch {
          return [];
        }
      })(),
    }));
  }

  static async getModules() {
    let modules: any[] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM [DanhMucPhanHe] ORDER BY [orderIndex] ASC`
    ).catch(() => []);

    if (modules.length === 0) {
      const dt = new Date();
      for (const m of INITIAL_MODULES) {
        await prisma.$executeRaw`
          INSERT INTO [DanhMucPhanHe] (id, label, category, description, orderIndex, createdAt, updatedAt)
          VALUES (${m.id}, ${m.label}, ${m.category}, ${m.description}, ${m.orderIndex}, ${dt}, ${dt})
        `;
      }
      modules = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM [DanhMucPhanHe] ORDER BY [orderIndex] ASC`
      ).catch(() => []);
    }

    return modules;
  }

  static async getMatrix(): Promise<Record<string, string[]>> {
    const roles = await this.getRoles();
    const matrix: Record<string, string[]> = {};
    for (const r of roles) {
      matrix[r.id] = r.permissions;
    }
    return matrix;
  }

  static async saveMatrix(matrix: Record<string, string[]>) {
    const dt = new Date();
    for (const [roleKey, perms] of Object.entries(matrix)) {
      const permJson = JSON.stringify(perms);
      const existing = await prisma.rolePermission.findMany({
        where: { roleKey },
      });

      if (existing.length > 0) {
        await prisma.rolePermission.updateMany({
          where: { roleKey },
          data: {
            permissions: permJson,
            updatedAt: dt,
          },
        });
      } else {
        const id = `role-${roleKey}`;
        await prisma.$executeRaw`
          INSERT INTO [PhanQuyenVaiTro] (id, roleKey, roleNameVi, description, defaultTab, permissions, createdAt, updatedAt)
          VALUES (${id}, ${roleKey}, ${roleKey}, '', 'pos', ${permJson}, ${dt}, ${dt})
        `;
      }
    }

    return this.getMatrix();
  }

  static async saveRole(roleData: any) {
    const { roleKey, roleNameVi, description, badgeColor, gradient, defaultTab, permissions } = roleData;
    const dt = new Date();
    const permJson = Array.isArray(permissions) ? JSON.stringify(permissions) : (permissions || "[]");

    const existing = await prisma.rolePermission.findMany({
      where: { roleKey },
    });

    if (existing.length > 0) {
      await prisma.rolePermission.updateMany({
        where: { roleKey },
        data: {
          roleNameVi,
          description: description || null,
          badgeColor: badgeColor || null,
          gradient: gradient || null,
          defaultTab: defaultTab || "pos",
          permissions: permJson,
          updatedAt: dt,
        },
      });
    } else {
      const id = `role-${roleKey}-${Date.now()}`;
      await prisma.$executeRaw`
        INSERT INTO [PhanQuyenVaiTro] (id, roleKey, roleNameVi, description, badgeColor, gradient, defaultTab, permissions, createdAt, updatedAt)
        VALUES (${id}, ${roleKey}, ${roleNameVi}, ${description || null}, ${badgeColor || null}, ${gradient || null}, ${defaultTab || "pos"}, ${permJson}, ${dt}, ${dt})
      `;
    }

    return this.getRoles();
  }

  static async deleteRole(roleKey: string) {
    if (roleKey === "admin") {
      throw new BadRequestError("Không thể xóa vai trò Admin hệ thống");
    }

    await prisma.rolePermission.deleteMany({
      where: { roleKey },
    });

    return { message: "Xóa vai trò thành công" };
  }
}
