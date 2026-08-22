import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateFraudAlertInput,
  UpdateFraudAlertInput,
  FraudAlertQueryInput,
} from "./fraud-alerts.schema";
import { Prisma } from "@prisma/client";

export class FraudAlertsService {
  static async getAlerts(query: FraudAlertQueryInput) {
    const { search, severity, source, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.FraudAlertWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { suggestedAction: { contains: term } },
      ];
    }

    if (severity && severity !== "all") {
      where.severity = severity;
    }

    if (source && source !== "all") {
      where.source = source;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const allItems = await prisma.fraudAlert.findMany({ where });

    // In-memory sort by timestamp desc
    allItems.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getAlertById(id: string) {
    const items = await prisma.fraudAlert.findMany({
      where: { id },
    });

    const alert = items[0];
    if (!alert) {
      throw new NotFoundError(`Không tìm thấy cảnh báo gian lận ID: ${id}`);
    }

    return alert;
  }

  static async createAlert(input: CreateFraudAlertInput) {
    const id = (input as any).id || `fa-${Date.now()}`;
    const dt = input.timestamp ? new Date(input.timestamp) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [FraudAlert] (id, severity, title, description, timestamp, source, status, suggestedAction)
      VALUES (${id}, ${input.severity}, ${input.title}, ${input.description}, ${dt}, ${input.source}, ${input.status || "unresolved"}, ${input.suggestedAction})
    `;

    return this.getAlertById(id);
  }

  static async updateAlert(id: string, input: UpdateFraudAlertInput) {
    await this.getAlertById(id);

    const updateData: any = { ...input };
    if (input.timestamp) updateData.timestamp = new Date(input.timestamp);

    await prisma.fraudAlert.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getAlertById(id);
  }

  static async resolveAlert(id: string) {
    await this.getAlertById(id);

    await prisma.fraudAlert.updateMany({
      where: { id },
      data: { status: "resolved" },
    });

    return this.getAlertById(id);
  }

  static async deleteAlert(id: string) {
    await this.getAlertById(id);
    await prisma.fraudAlert.deleteMany({
      where: { id },
    });
    return { message: "Xóa cảnh báo gian lận thành công" };
  }
}
