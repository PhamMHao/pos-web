import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "./products.schema";
import { Prisma } from "@prisma/client";

export class ProductsService {
  static async getProducts(query: ProductQueryInput) {
    const {
      search,
      category,
      warehouse,
      lowStockOnly,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { sku: { contains: term } },
        { barcode: { contains: term } },
        { uomConversions: { some: { barcode: { contains: term } } } },
      ];
    }

    if (category && category !== "all" && category !== "Tất cả") {
      where.category = category;
    }

    if (warehouse && warehouse !== "all") {
      where.warehouse = warehouse;
    }

    if (lowStockOnly === "true") {
      where.stock = { lte: 5 };
    }

    const allItems = await prisma.product.findMany({
      where,
      include: {
        uomConversions: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "sellingPrice") {
        return sortOrder === "asc"
          ? Number(a.sellingPrice) - Number(b.sellingPrice)
          : Number(b.sellingPrice) - Number(a.sellingPrice);
      }
      if (sortBy === "stock") {
        return sortOrder === "asc"
          ? Number(a.stock) - Number(b.stock)
          : Number(b.stock) - Number(a.stock);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formattedItems = items.map((item) => ({
      ...item,
      costPrice: Number(item.costPrice),
      sellingPrice: Number(item.sellingPrice),
      stock: Number(item.stock),
      minStock: Number(item.minStock),
      uomConversions: (item.uomConversions || []).map((uom) => ({
        ...uom,
        ratioToBase: Number(uom.ratioToBase),
        costPrice: Number(uom.costPrice),
        sellingPrice: Number(uom.sellingPrice),
      })),
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getProductById(id: string) {
    const items = await prisma.product.findMany({
      where: { id },
      include: {
        uomConversions: true,
      },
    });

    const product = items[0];
    if (!product) {
      throw new NotFoundError(`Không tìm thấy sản phẩm với ID: ${id}`);
    }

    return {
      ...product,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
      stock: Number(product.stock),
      minStock: Number(product.minStock),
      uomConversions: (product.uomConversions || []).map((uom) => ({
        ...uom,
        ratioToBase: Number(uom.ratioToBase),
        costPrice: Number(uom.costPrice),
        sellingPrice: Number(uom.sellingPrice),
      })),
    };
  }

  static async getProductByBarcode(code: string) {
    const cleanCode = code.trim();
    // 1. Look for direct barcode or SKU match
    const directMatches = await prisma.product.findMany({
      where: {
        OR: [{ barcode: cleanCode }, { sku: cleanCode }],
      },
      include: {
        uomConversions: true,
      },
    });

    let product = directMatches[0] || null;

    // 2. If not found, check secondary unit barcode
    if (!product) {
      const uomMatches = await prisma.productUOMConversion.findMany({
        where: { barcode: cleanCode },
        include: { product: { include: { uomConversions: true } } },
      });
      if (uomMatches[0] && uomMatches[0].product) {
        product = uomMatches[0].product;
      }
    }

    if (!product) {
      throw new NotFoundError(`Không tìm thấy sản phẩm với mã quét: "${cleanCode}"`);
    }

    return {
      ...product,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
      stock: Number(product.stock),
      minStock: Number(product.minStock),
      uomConversions: (product.uomConversions || []).map((uom) => ({
        ...uom,
        ratioToBase: Number(uom.ratioToBase),
        costPrice: Number(uom.costPrice),
        sellingPrice: Number(uom.sellingPrice),
      })),
    };
  }

  static async createProduct(input: CreateProductInput) {
    const existing = await prisma.product.findMany({
      where: { sku: input.sku },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Mã SKU "${input.sku}" đã tồn tại trong hệ thống`);
    }

    const { uomConversions, ...productData } = input;
    const id = (input as any).id || `prod-${Date.now()}`;
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [SanPham] (id, sku, barcode, name, category, unit, costPrice, sellingPrice, stock, minStock, image, warehouse, storageLocation, description, isFeatured, weightOrVolume, createdAt, updatedAt)
      VALUES (${id}, ${productData.sku}, ${productData.barcode || ""}, ${productData.name}, ${productData.category}, ${productData.unit}, ${productData.costPrice}, ${productData.sellingPrice}, ${productData.stock}, ${productData.minStock || 5}, ${productData.image || null}, ${productData.warehouse || "Kho Chính"}, ${productData.storageLocation || null}, ${productData.description || null}, ${productData.isFeatured ? 1 : 0}, ${productData.weightOrVolume || null}, ${dt}, ${dt})
    `;

    if (uomConversions && uomConversions.length > 0) {
      for (let i = 0; i < uomConversions.length; i++) {
        const uom = uomConversions[i] as any;
        const uomId = `uom-${Date.now()}-${i}`;
        await prisma.$executeRaw`
          INSERT INTO [QuyDoiDonViTinh] (id, productId, unit, ratioToBase, costPrice, sellingPrice, barcode, isBase, referenceUnit, conversionRate, description)
          VALUES (${uomId}, ${id}, ${uom.unit}, ${uom.ratioToBase}, ${uom.costPrice}, ${uom.sellingPrice}, ${uom.barcode || null}, ${uom.isBase ? 1 : 0}, ${uom.referenceUnit || null}, ${uom.conversionRate || null}, ${uom.description || null})
        `;
      }
    }

    return this.getProductById(id);
  }

  static async updateProduct(id: string, input: UpdateProductInput) {
    await this.getProductById(id);

    if (input.sku) {
      const existingSku = await prisma.product.findMany({
        where: {
          sku: input.sku,
          NOT: { id },
        },
      });
      if (existingSku.length > 0) {
        throw new ConflictError(`Mã SKU "${input.sku}" đã được sử dụng bởi sản phẩm khác`);
      }
    }

    const { uomConversions, ...productData } = input;

    const updateData: any = { ...productData };
    if (productData.costPrice !== undefined) {
      updateData.costPrice = new Prisma.Decimal(productData.costPrice);
    }
    if (productData.sellingPrice !== undefined) {
      updateData.sellingPrice = new Prisma.Decimal(productData.sellingPrice);
    }
    if (productData.stock !== undefined) {
      updateData.stock = new Prisma.Decimal(productData.stock);
    }
    if (productData.minStock !== undefined) {
      updateData.minStock = new Prisma.Decimal(productData.minStock);
    }

    await prisma.product.updateMany({
      where: { id },
      data: updateData,
    });

    if (uomConversions !== undefined) {
      await prisma.productUOMConversion.deleteMany({
        where: { productId: id },
      });

      if (uomConversions.length > 0) {
        for (let i = 0; i < uomConversions.length; i++) {
          const uom = uomConversions[i] as any;
          const uomId = `uom-${Date.now()}-${i}`;
          await prisma.$executeRaw`
            INSERT INTO [QuyDoiDonViTinh] (id, productId, unit, ratioToBase, costPrice, sellingPrice, barcode, isBase, referenceUnit, conversionRate, description)
            VALUES (${uomId}, ${id}, ${uom.unit}, ${uom.ratioToBase}, ${uom.costPrice}, ${uom.sellingPrice}, ${uom.barcode || null}, ${uom.isBase ? 1 : 0}, ${uom.referenceUnit || null}, ${uom.conversionRate || null}, ${uom.description || null})
          `;
        }
      }
    }

    return this.getProductById(id);
  }

  static async deleteProduct(id: string) {
    await this.getProductById(id);
    await prisma.productUOMConversion.deleteMany({
      where: { productId: id },
    });
    await prisma.product.deleteMany({
      where: { id },
    });
    return { message: "Xóa sản phẩm thành công" };
  }

  static async bulkImport(products: CreateProductInput[]) {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const p of products) {
      try {
        const existing = await prisma.product.findMany({
          where: { sku: p.sku },
        });

        if (existing.length > 0) {
          await this.updateProduct(existing[0].id, p);
        } else {
          await this.createProduct(p);
        }
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`SKU ${p.sku}: ${err.message}`);
      }
    }

    return {
      total: products.length,
      successCount,
      failedCount,
      errors,
    };
  }

  static async getCategories() {
    const products = await prisma.product.findMany();
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }
}
