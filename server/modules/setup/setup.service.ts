import sql from "mssql";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface DbConnectionParams {
  server: string;
  authType?: "windows" | "sql";
  username?: string;
  password?: string;
  database?: string;
}

export function parseServerString(serverStr: string) {
  let server = (serverStr || ".").trim();
  let instanceName: string | undefined = undefined;
  let port: number | undefined = undefined;

  // Handle "." or "(local)" or "localhost"
  if (server === "." || server === "(local)") {
    server = "localhost";
  }

  // Handle instance name: e.g. "localhost\SQLEXPRESS" or ".\SQLEXPRESS"
  if (server.includes("\\")) {
    const parts = server.split("\\");
    server = parts[0] === "." || parts[0] === "(local)" ? "localhost" : parts[0];
    instanceName = parts[1];
  } else if (server.includes(",")) {
    // Handle host,port format e.g. "127.0.0.1,1433"
    const parts = server.split(",");
    server = parts[0];
    port = parseInt(parts[1], 10);
  } else if (server.includes(":") && !server.startsWith("http")) {
    // Handle host:port format e.g. "127.0.0.1:1433"
    const parts = server.split(":");
    server = parts[0];
    port = parseInt(parts[1], 10);
  }

  return { server, instanceName, port: port || (instanceName ? undefined : 1433) };
}

export function buildPrismaUrl(params: DbConnectionParams) {
  const { server, instanceName, port } = parseServerString(params.server);
  const dbName = params.database || "GPERP_Enterprise";
  const authType = params.authType || (params.username ? "sql" : "windows");

  let hostPart = server;
  if (port) {
    hostPart += `:${port}`;
  }

  if (authType === "windows" || !params.username) {
    if (instanceName) {
      return `sqlserver://${server};instanceName=${instanceName};database=${dbName};integratedSecurity=true;trustServerCertificate=true;encrypt=false`;
    }
    return `sqlserver://${hostPart};database=${dbName};integratedSecurity=true;trustServerCertificate=true;encrypt=false`;
  }

  const user = encodeURIComponent(params.username || "sa");
  const password = encodeURIComponent(params.password || "");

  let url = `sqlserver://${hostPart};database=${dbName};user=${user};password=${password};encrypt=false;trustServerCertificate=true`;
  if (instanceName) {
    url = `sqlserver://${server};instanceName=${instanceName};database=${dbName};user=${user};password=${password};encrypt=false;trustServerCertificate=true`;
  }

  return url;
}

async function testWindowsAuth(params: DbConnectionParams) {
  const { server, instanceName, port } = parseServerString(params.server);
  const serverTarget = instanceName
    ? `${server}\\${instanceName}`
    : port
    ? `${server},${port}`
    : server === "localhost"
    ? "."
    : server;

  const cmd = `sqlcmd -S "${serverTarget}" -E -Q "SELECT @@VERSION as version; SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') ORDER BY name ASC;"`;

  try {
    const { stdout } = await execAsync(cmd);
    const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let version = "Microsoft SQL Server (Windows Authentication)";
    const databases: string[] = [];

    let inDbSection = false;
    for (const line of lines) {
      if (line.startsWith("Microsoft SQL Server")) {
        version = line;
      }
      if (line === "name") {
        inDbSection = true;
        continue;
      }
      if (inDbSection) {
        if (
          line.startsWith("---") ||
          line.startsWith("(") ||
          line.includes("rows affected") ||
          line.startsWith("version")
        ) {
          continue;
        }
        const dbName = line.split(/\s+/)[0];
        if (dbName && !databases.includes(dbName)) {
          databases.push(dbName);
        }
      }
    }

    return {
      success: true,
      message: "Kết nối máy chủ SQL Server thành công (Windows Authentication)!",
      version,
      databases,
      currentSelected:
        params.database || (databases.length > 0 ? databases[0] : "GPERP_Enterprise"),
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Không thể kết nối SQL Server qua Windows Authentication: ${error.message}`,
      databases: [],
    };
  }
}

export async function testDbConnection(params: DbConnectionParams) {
  const authType = params.authType || (params.username ? "sql" : "windows");

  // If Windows Authentication is selected or username is empty
  if (authType === "windows" || !params.username) {
    return testWindowsAuth(params);
  }

  // SQL Server Authentication with username & password
  const { server, instanceName, port } = parseServerString(params.server);

  const config: sql.config = {
    server,
    user: params.username,
    password: params.password || "",
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName,
      port,
      connectTimeout: 10000,
    },
  };

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(config);

    // Get SQL Server version
    const versionRes = await pool.request().query("SELECT @@VERSION as version");
    const version = versionRes.recordset[0]?.version || "Microsoft SQL Server";

    // Get list of existing user databases
    const dbRes = await pool
      .request()
      .query(
        "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') ORDER BY name ASC"
      );

    const databases = dbRes.recordset.map((row: any) => row.name);

    return {
      success: true,
      message: "Kết nối máy chủ SQL Server thành công (SQL Server Authentication)!",
      version,
      databases,
      currentSelected:
        params.database || (databases.length > 0 ? databases[0] : "GPERP_Enterprise"),
    };
  } catch (error: any) {
    console.error("SQL Server Connection Error:", error);
    return {
      success: false,
      message: `Không thể kết nối máy chủ SQL Server: ${error.message || "Lỗi không xác định"}`,
      databases: [],
    };
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export async function saveAndInitializeDatabase(params: DbConnectionParams) {
  const authType = params.authType || (params.username ? "sql" : "windows");
  const testRes = await testDbConnection(params);
  if (!testRes.success) {
    throw new Error(testRes.message);
  }

  const { server, instanceName, port } = parseServerString(params.server);
  const targetDb = params.database || "GPERP_Enterprise";

  if (authType === "windows" || !params.username) {
    // Create DB via sqlcmd with Windows Auth
    const serverTarget = instanceName
      ? `${server}\\${instanceName}`
      : port
      ? `${server},${port}`
      : server === "localhost"
      ? "."
      : server;

    const createDbCmd = `sqlcmd -S "${serverTarget}" -E -Q "IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${targetDb.replace(/\]/g, "]]")}') CREATE DATABASE [${targetDb.replace(/\]/g, "]]")}];"`;
    try {
      console.log(`Đang kiểm tra/tạo CSDL [${targetDb}] qua Windows Auth...`);
      await execAsync(createDbCmd);
      console.log(`CSDL [${targetDb}] đã sẵn sàng.`);
    } catch (err: any) {
      console.warn("Lưu ý khi tạo database:", err.message);
    }
  } else {
    // Check if database exists via mssql pool
    const config: sql.config = {
      server,
      user: params.username,
      password: params.password || "",
      options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName,
        port,
      },
    };

    let pool: sql.ConnectionPool | null = null;
    try {
      pool = await sql.connect(config);
      const checkDb = await pool
        .request()
        .input("dbName", targetDb)
        .query("SELECT database_id FROM sys.databases WHERE name = @dbName");

      if (!checkDb.recordset || checkDb.recordset.length === 0) {
        console.log(`Database [${targetDb}] chưa tồn tại. Đang tự động tạo...`);
        await pool.request().query(`CREATE DATABASE [${targetDb.replace(/\]/g, "]]")}]`);
        console.log(`Đã tạo CSDL [${targetDb}] thành công!`);
      }
    } catch (err: any) {
      console.warn("Notice during CREATE DATABASE check:", err.message);
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }

  // Update .env file
  const prismaUrl = buildPrismaUrl(params);
  const envPath = path.join(process.cwd(), ".env");

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const dbUrlRegex = /^DATABASE_URL=.*$/m;
  if (dbUrlRegex.test(envContent)) {
    envContent = envContent.replace(dbUrlRegex, `DATABASE_URL="${prismaUrl}"`);
  } else {
    envContent += `\nDATABASE_URL="${prismaUrl}"\n`;
  }

  fs.writeFileSync(envPath, envContent, "utf-8");
  process.env.DATABASE_URL = prismaUrl;

  console.log("Đã lưu DATABASE_URL vào .env:", prismaUrl);

    // Push schema to database
    console.log("Đang đồng bộ Schema 22 bảng lên SQL Server (prisma db push)...");
    try {
      await execAsync("npx prisma db push --accept-data-loss", { cwd: process.cwd() });
      console.log("Đã tạo cấu trúc 22 bảng Schema sạch sẽ thành công!");
    } catch (pushErr: any) {
      console.error("Lỗi khi prisma db push:", pushErr.message);
      throw new Error(`Đã kết nối được SQL Server nhưng lỗi khi khởi tạo bảng: ${pushErr.message}`);
    }

  return {
    success: true,
    message: `Đã lưu cấu hình và khởi tạo thành công CSDL [${targetDb}] với đầy đủ 22 bảng dữ liệu!`,
    databaseUrl: prismaUrl,
  };
}

export async function getDbStatus() {
  let currentUrl = process.env.DATABASE_URL || "";
  const envPath = path.join(process.cwd(), ".env");
  if (!currentUrl && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) {
      currentUrl = match[1];
      process.env.DATABASE_URL = currentUrl;
    }
  }

  let currentDb = "GPERP_Enterprise";
  let currentServer = ".";
  let currentAuthType: "windows" | "sql" = "windows";
  let currentUsername = "sa";

  if (currentUrl) {
    const dbMatch = currentUrl.match(/database=([^;?&]+)/i);
    if (dbMatch) {
      currentDb = dbMatch[1];
    }
    if (currentUrl.includes("integratedSecurity=true")) {
      currentAuthType = "windows";
    } else {
      currentAuthType = "sql";
      const userMatch = currentUrl.match(/user(?:name)?=([^;?&]+)/i);
      if (userMatch) currentUsername = userMatch[1];
    }
    const serverMatch = currentUrl.match(/sqlserver:\/\/([^;:/]+)/i);
    if (serverMatch) {
      currentServer = serverMatch[1] === "localhost" ? "." : serverMatch[1];
    }
  }

  let databases: string[] = [];
  try {
    const test = await testDbConnection({
      server: currentServer,
      authType: currentAuthType,
      username: currentAuthType === "sql" ? currentUsername : undefined,
    });
    if (test.success && test.databases) {
      databases = test.databases;
    }
  } catch (e: any) {
    console.warn("Could not query databases list for status:", e.message);
  }

  if (!currentUrl) {
    return {
      connected: false,
      message: "Chưa cấu hình chuỗi kết nối DATABASE_URL",
      currentDb,
      currentServer,
      currentAuthType,
      currentUsername,
      databases,
    };
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    const testPrisma = new PrismaClient();
    await testPrisma.$queryRaw`SELECT 1 AS ping`;
    await testPrisma.$disconnect();

    return {
      connected: true,
      message: `Cơ sở dữ liệu [${currentDb}] đang kết nối thành công`,
      databaseUrl: currentUrl.replace(/:[^:@]*@/, ":****@"),
      currentDb,
      currentServer,
      currentAuthType,
      currentUsername,
      databases,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Không thể truy vấn CSDL [${currentDb}]: ${err.message}`,
      databaseUrl: currentUrl ? currentUrl.replace(/:[^:@]*@/, ":****@") : undefined,
      currentDb,
      currentServer,
      currentAuthType,
      currentUsername,
      databases,
    };
  }
}
