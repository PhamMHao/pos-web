import { Request, Response } from "express";
import {
  testDbConnection,
  saveAndInitializeDatabase,
  getDbStatus,
  DbConnectionParams,
} from "./setup.service";

export async function testDbConnectionHandler(req: Request, res: Response) {
  try {
    const { server, authType, username, password, database } = req.body as DbConnectionParams;

    if (!server || !server.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập Tên máy chủ (Server Name), ví dụ: . hoặc localhost",
      });
    }

    const isWindowsAuth = authType === "windows" || !username;
    if (!isWindowsAuth && !username) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập Tên đăng nhập cho chế độ SQL Server Authentication",
      });
    }

    const result = await testDbConnection({
      server: server.trim(),
      authType: isWindowsAuth ? "windows" : "sql",
      username: isWindowsAuth ? undefined : username,
      password: isWindowsAuth ? undefined : (password || ""),
      database,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Error in testDbConnectionHandler:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi kiểm tra kết nối SQL Server",
    });
  }
}

export async function saveDbConnectionHandler(req: Request, res: Response) {
  try {
    const { server, authType, username, password, database } = req.body as DbConnectionParams;

    if (!server || !database) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ: Tên máy chủ và Cơ sở dữ liệu (Database)",
      });
    }

    const isWindowsAuth = authType === "windows" || !username;
    if (!isWindowsAuth && !username) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập Tên đăng nhập cho chế độ SQL Server Authentication",
      });
    }

    const result = await saveAndInitializeDatabase({
      server: server.trim(),
      authType: isWindowsAuth ? "windows" : "sql",
      username: isWindowsAuth ? undefined : username,
      password: isWindowsAuth ? undefined : (password || ""),
      database: database.trim(),
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Error in saveDbConnectionHandler:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lưu và khởi tạo CSDL",
    });
  }
}

export async function getDbStatusHandler(req: Request, res: Response) {
  try {
    const status = await getDbStatus();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({
      connected: false,
      message: error.message || "Lỗi khi kiểm tra trạng thái CSDL",
    });
  }
}
