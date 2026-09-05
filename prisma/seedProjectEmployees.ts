import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function run() {
  console.log("Syncing project employees and accounts into SQL Server...");

  // 1. User kcs01
  const existingKcs = await prisma.user.findMany({ where: { username: "kcs01" } });
  if (existingKcs.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("123456", salt);
    await prisma.$executeRaw`
      INSERT INTO [NguoiDung] (id, username, passwordHash, fullName, email, phone, role, status, createdAt, updatedAt)
      VALUES ('usr-kcs-01', 'kcs01', ${hash}, N'Lê Văn Tuấn (Giám Sát KCS)', 'kcs@vitinhgiaphuc.com', '0933777888', N'Giám Sát KCS', 'active', GETDATE(), GETDATE())
    `;
    console.log("Added user kcs01 into NguoiDung");
  } else {
    console.log("User kcs01 already exists in NguoiDung");
  }

  // 2. Employees emp-5 to emp-8
  const employees = [
    {
      id: "emp-5",
      code: "NV-005",
      name: "Đỗ Minh Khang",
      role: "Kỹ Thuật Viên Thi Công",
      phone: "0933 888 999",
      email: "khang.do@gperp.vn",
      baseSalary: 11000000,
      shiftSchedule: "Thi công hiện trường",
    },
    {
      id: "emp-6",
      code: "NV-006",
      name: "Lê Văn Tuấn",
      role: "Giám Sát KCS / QA-QC",
      phone: "0933 777 888",
      email: "tuan.le@gperp.vn",
      baseSalary: 14000000,
      shiftSchedule: "Giám sát kỹ thuật",
    },
    {
      id: "emp-7",
      code: "NV-007",
      name: "Trần Quốc Bảo",
      role: "Quản Lý Dự Án / PM",
      phone: "0914 665 994",
      email: "bao.tran@gperp.vn",
      baseSalary: 22000000,
      shiftSchedule: "Chỉ huy trưởng dự án",
    },
    {
      id: "emp-8",
      code: "NV-008",
      name: "Phạm Ngọc Thơm",
      role: "Tổng Giám Đốc",
      phone: "0985 862 609",
      email: "thom.pham@gperp.vn",
      baseSalary: 35000000,
      shiftSchedule: "Ban Điều Hành",
    },
  ];

  for (const emp of employees) {
    const existingEmp = await prisma.employee.findMany({ where: { code: emp.code } });
    if (existingEmp.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [NhanVien] (id, code, name, role, phone, email, baseSalary, salesKpiTarget, currentSales, commissionRate, status, joinedDate, shiftSchedule)
        VALUES (${emp.id}, ${emp.code}, ${emp.name}, ${emp.role}, ${emp.phone}, ${emp.email}, ${emp.baseSalary}, 0, 0, 0, 'active', GETDATE(), ${emp.shiftSchedule})
      `;
      console.log(`Inserted employee ${emp.code} - ${emp.name}`);
    } else {
      console.log(`Employee ${emp.code} already exists`);
    }
  }

  console.log("Done syncing project employees and users into SQL Server!");
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error("Error syncing project data:", e);
  process.exit(1);
});
