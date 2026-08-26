import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateProductCostingInput,
  UpdateProductCostingInput,
  ProductCostingQueryInput,
} from "./costing.schema";
import { Prisma } from "@prisma/client";

export class CostingService {
  static async createCosting(input: CreateProductCostingInput) {
    const { bomItems, ...costingData } = input;

    const rawMaterialsCost = bomItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitCost),
      0
    );

    const laborCost = Number(costingData.laborCost || 0);
    const overheadCost = Number(costingData.machineryAndOverheadCost || 0);
    const totalStandardCost = rawMaterialsCost + laborCost + overheadCost;
    const currentSellingPrice = Number(costingData.currentSellingPrice || 0);
    const grossMarginPercent =
      currentSellingPrice > 0
        ? ((currentSellingPrice - totalStandardCost) / currentSellingPrice) * 100
        : 0;

    const id = `costing-${Date.now()}`;
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [DinhMucSanXuat] (id, productName, sku, rawMaterialsCost, laborCost, machineryAndOverheadCost, totalStandardCost, currentSellingPrice, grossMarginPercent, lastUpdated)
      VALUES (${id}, ${costingData.productName}, ${costingData.sku}, ${rawMaterialsCost}, ${laborCost}, ${overheadCost}, ${totalStandardCost}, ${currentSellingPrice}, ${grossMarginPercent}, ${dt})
    `;

    for (let idx = 0; idx < bomItems.length; idx++) {
      const item = bomItems[idx];
      const itemId = `bom-item-${Date.now()}-${idx}`;
      const totalCost = Number(item.quantity) * Number(item.unitCost);
      await prisma.$executeRaw`
        INSERT INTO [ChiTietDinhMucBOM] (id, costingId, materialName, quantity, unit, unitCost, totalCost)
        VALUES (${itemId}, ${id}, ${item.materialName}, ${item.quantity}, ${item.unit}, ${item.unitCost}, ${totalCost})
      `;
    }

    return this.getCostingById(id);
  }

  static async getCostings(query: ProductCostingQueryInput) {
    const {
      search,
      page = 1,
      limit = 50,
      sortBy = "lastUpdated",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ProductCostingWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { productName: { contains: term } },
        { sku: { contains: term } },
      ];
    }

    const allItems = await prisma.productCosting.findMany({
      where,
      include: {
        bomItems: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "totalStandardCost") {
        return sortOrder === "asc"
          ? Number(a.totalStandardCost) - Number(b.totalStandardCost)
          : Number(b.totalStandardCost) - Number(a.totalStandardCost);
      }
      return sortOrder === "asc"
        ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((c) => ({
      ...c,
      rawMaterialsCost: Number(c.rawMaterialsCost),
      laborCost: Number(c.laborCost),
      machineryAndOverheadCost: Number(c.machineryAndOverheadCost),
      totalStandardCost: Number(c.totalStandardCost),
      currentSellingPrice: Number(c.currentSellingPrice),
      grossMarginPercent: Number(c.grossMarginPercent),
      bomItems: (c.bomItems || []).map((b) => ({
        ...b,
        quantity: Number(b.quantity),
        unitCost: Number(b.unitCost),
        totalCost: Number(b.totalCost),
      })),
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getCostingById(id: string) {
    const items = await prisma.productCosting.findMany({
      where: { id },
      include: {
        bomItems: true,
      },
    });

    const costing = items[0];
    if (!costing) {
      throw new NotFoundError(`Không tìm thấy định mức BOM với ID: ${id}`);
    }

    return {
      ...costing,
      rawMaterialsCost: Number(costing.rawMaterialsCost),
      laborCost: Number(costing.laborCost),
      machineryAndOverheadCost: Number(costing.machineryAndOverheadCost),
      totalStandardCost: Number(costing.totalStandardCost),
      currentSellingPrice: Number(costing.currentSellingPrice),
      grossMarginPercent: Number(costing.grossMarginPercent),
      bomItems: (costing.bomItems || []).map((b) => ({
        ...b,
        quantity: Number(b.quantity),
        unitCost: Number(b.unitCost),
        totalCost: Number(b.totalCost),
      })),
    };
  }

  static async updateCosting(id: string, input: UpdateProductCostingInput) {
    const existing = await this.getCostingById(id);
    const { bomItems, ...costingData } = input;

    let rawMaterialsCost = existing.rawMaterialsCost;

    if (bomItems && bomItems.length > 0) {
      rawMaterialsCost = bomItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitCost),
        0
      );

      await prisma.costingBOMItem.deleteMany({
        where: { costingId: id },
      });

      for (let idx = 0; idx < bomItems.length; idx++) {
        const item = bomItems[idx];
        const itemId = `bom-item-${Date.now()}-${idx}`;
        const totalCost = Number(item.quantity) * Number(item.unitCost);
        await prisma.$executeRaw`
          INSERT INTO [ChiTietDinhMucBOM] (id, costingId, materialName, quantity, unit, unitCost, totalCost)
          VALUES (${itemId}, ${id}, ${item.materialName}, ${item.quantity}, ${item.unit}, ${item.unitCost}, ${totalCost})
        `;
      }
    }

    const laborCost =
      costingData.laborCost !== undefined
        ? Number(costingData.laborCost)
        : existing.laborCost;
    const overheadCost =
      costingData.machineryAndOverheadCost !== undefined
        ? Number(costingData.machineryAndOverheadCost)
        : existing.machineryAndOverheadCost;
    const totalStandardCost = rawMaterialsCost + laborCost + overheadCost;
    const currentSellingPrice =
      costingData.currentSellingPrice !== undefined
        ? Number(costingData.currentSellingPrice)
        : existing.currentSellingPrice;
    const grossMarginPercent =
      currentSellingPrice > 0
        ? ((currentSellingPrice - totalStandardCost) / currentSellingPrice) * 100
        : 0;

    const updateData: any = {
      productName: costingData.productName || existing.productName,
      sku: costingData.sku || existing.sku,
      rawMaterialsCost: new Prisma.Decimal(rawMaterialsCost),
      laborCost: new Prisma.Decimal(laborCost),
      machineryAndOverheadCost: new Prisma.Decimal(overheadCost),
      totalStandardCost: new Prisma.Decimal(totalStandardCost),
      currentSellingPrice: new Prisma.Decimal(currentSellingPrice),
      grossMarginPercent: new Prisma.Decimal(grossMarginPercent),
      lastUpdated: new Date(),
    };

    await prisma.productCosting.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getCostingById(id);
  }

  static async deleteCosting(id: string) {
    await this.getCostingById(id);
    await prisma.costingBOMItem.deleteMany({
      where: { costingId: id },
    });
    await prisma.productCosting.deleteMany({
      where: { id },
    });
    return { message: "Xóa định mức BOM thành công" };
  }

  static async assembleProduct(input: any) {
    const costing = await this.getCostingById(input.costingId);
    const assembleQty = Number(input.quantity);
    const dt = new Date();

    // 1. Process each BOM component: Deduct stock & create InventoryLog
    const deductedComponents: any[] = [];
    for (let idx = 0; idx < costing.bomItems.length; idx++) {
      const bom = costing.bomItems[idx];
      const requiredQty = Number(bom.quantity) * assembleQty;

      // Match product by materialName or similar
      const prods = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: bom.materialName } },
            { sku: { contains: bom.materialName } },
          ],
        },
      });

      if (prods.length > 0) {
        const compProd = prods[0];
        const oldStock = Number(compProd.stock);
        const newStock = Math.max(0, oldStock - requiredQty);

        await prisma.product.updateMany({
          where: { id: compProd.id },
          data: { stock: new Prisma.Decimal(newStock) },
        });

        const logId = `inv-bom-deduct-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
          VALUES (${logId}, ${compProd.id}, ${compProd.name}, ${compProd.sku}, 'bom_assembly_deduct', ${-requiredQty}, ${oldStock}, ${newStock}, ${`Xuất linh kiện lắp ráp ${assembleQty} bộ ${costing.productName}`}, ${input.technicianName || 'KTV Lắp Ráp'}, ${dt})
        `;

        deductedComponents.push({
          materialName: bom.materialName,
          productId: compProd.id,
          sku: compProd.sku,
          deductedQty: requiredQty,
          remainingStock: newStock,
        });
      } else {
        deductedComponents.push({
          materialName: bom.materialName,
          deductedQty: requiredQty,
          note: "Linh kiện xuất theo định mức BOM",
        });
      }
    }

    // 2. Increase Finished Product Stock (+assembleQty)
    let finishedProduct: any = null;
    const existingFinished = await prisma.product.findMany({
      where: {
        OR: [
          { sku: costing.sku },
          { name: costing.productName },
        ],
      },
    });

    if (existingFinished.length > 0) {
      finishedProduct = existingFinished[0];
      const oldStock = Number(finishedProduct.stock);
      const newStock = oldStock + assembleQty;

      await prisma.product.updateMany({
        where: { id: finishedProduct.id },
        data: {
          stock: new Prisma.Decimal(newStock),
          costPrice: new Prisma.Decimal(costing.totalStandardCost),
          sellingPrice: new Prisma.Decimal(costing.currentSellingPrice),
        },
      });

      const logId = `inv-bom-prod-${Date.now()}`;
      await prisma.$executeRaw`
        INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
        VALUES (${logId}, ${finishedProduct.id}, ${finishedProduct.name}, ${finishedProduct.sku}, 'bom_assembly_produce', ${assembleQty}, ${oldStock}, ${newStock}, ${`Nhập kho thành phẩm từ Lệnh lắp ráp BOM ${costing.sku}`}, ${input.technicianName || 'KTV Lắp Ráp'}, ${dt})
      `;
    } else {
      // Create new Finished Product if not exists
      const prodId = `prod-bom-${Date.now()}`;
      await prisma.$executeRaw`
        INSERT INTO [SanPham] (id, name, sku, barcode, category, unit, costPrice, sellingPrice, stock, minStock, image, warehouse, storageLocation, description, isFeatured, createdAt, updatedAt)
        VALUES (${prodId}, ${costing.productName}, ${costing.sku}, ${costing.sku}, 'Máy Tính Nguyên Bộ', 'Bộ', ${costing.totalStandardCost}, ${costing.currentSellingPrice}, ${assembleQty}, 2, null, ${input.warehouse || 'Kho Tổng Gia Phúc'}, null, 'Máy tính nguyên bộ xuất xưởng từ BOM', 0, ${dt}, ${dt})
      `;

      const logId = `inv-bom-prod-${Date.now()}`;
      await prisma.$executeRaw`
        INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
        VALUES (${logId}, ${prodId}, ${costing.productName}, ${costing.sku}, 'bom_assembly_produce', ${assembleQty}, 0, ${assembleQty}, ${`Khởi tạo & nhập kho thành phẩm từ Lệnh lắp ráp BOM ${costing.sku}`}, ${input.technicianName || 'KTV Lắp Ráp'}, ${dt})
      `;
    }

    return {
      success: true,
      message: `Đã hoàn tất xuất xưởng và nhập kho ${assembleQty} bộ "${costing.productName}" thành công!`,
      costingId: costing.id,
      productName: costing.productName,
      assembledQuantity: assembleQty,
      deductedComponents,
      standardCostPerUnit: costing.totalStandardCost,
      totalProductionCost: costing.totalStandardCost * assembleQty,
      assembledAt: dt.toISOString(),
    };
  }
}
