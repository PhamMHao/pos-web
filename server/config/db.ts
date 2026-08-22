import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function instantiatePrisma(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

let activePrisma: PrismaClient = global.prismaGlobal || instantiatePrisma();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = activePrisma;
}

export async function reloadPrismaClient(): Promise<PrismaClient> {
  try {
    if (activePrisma) {
      await activePrisma.$disconnect().catch(() => {});
    }
  } catch (err: any) {
    console.warn("Notice during Prisma disconnect:", err?.message);
  }

  activePrisma = instantiatePrisma();
  global.prismaGlobal = activePrisma;
  console.log("✅ Đã khởi tạo lại kết nối Prisma Client tới CSDL mới thành công!");
  return activePrisma;
}

// Proxy exports so that any module importing prisma always delegates to activePrisma
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const val = (activePrisma as any)[prop];
    if (typeof val === "function") {
      return val.bind(activePrisma);
    }
    return val;
  },
});

export default prisma;
