import prisma from "../../config/db";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError";
import {
  CreateCustomerContractInput,
  CreateFromQuoteInput,
  UpdateCustomerContractInput,
  SignCustomerContractInput,
  CreateHandoverNoteInput,
  CreateLiquidationInput,
  ContractQueryInput,
  ContractMilestoneInput,
} from "./contracts.schema";

export class ContractsService {
  /**
   * Tính toán cấp duyệt theo hạn mức giá trị
   */
  private static calculateApprovalLevel(finalTotal: number): number {
    if (finalTotal > 200000000) return 3; // > 200 triệu: Tổng Giám Đốc
    if (finalTotal > 50000000) return 2;  // 50tr - 200tr: Khối Quản lý / Kế toán trưởng
    return 1;                             // < 50 triệu: Trưởng phòng / PM
  }

  /**
   * Lấy danh sách hợp đồng kèm bộ lọc & phân trang
   */
  static async getContracts(query: ContractQueryInput) {
    const {
      search,
      status,
      contractType,
      customerId,
      projectId,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { contractNumber: { contains: term } },
        { title: { contains: term } },
        { customerName: { contains: term } },
        { customerTaxCode: { contains: term } },
        { projectCode: { contains: term } },
      ];
    }

    if (status && status !== "all" && status !== "Tất cả") {
      where.status = status;
    }
    if (contractType && contractType !== "all") {
      where.contractType = contractType;
    }
    if (customerId) where.customerId = customerId;
    if (projectId) where.projectId = projectId;

    const allContracts = await prisma.customerContract.findMany({
      where,
      include: {
        items: true,
        milestones: true,
        handovers: true,
        liquidation: true,
      },
    });

    // In-memory sort để an toàn tuyệt đối với SQL Server 2008
    allContracts.sort((a, b) => {
      if (sortBy === "finalTotal") {
        return sortOrder === "asc"
          ? Number(a.finalTotal) - Number(b.finalTotal)
          : Number(b.finalTotal) - Number(a.finalTotal);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allContracts.length;
    const items = allContracts.slice(skip, skip + limit);

    return {
      items: items.map((c) => this.formatContract(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết 1 hợp đồng
   */
  static async getContractById(id: string) {
    const contracts = await prisma.customerContract.findMany({
      where: { id },
      include: {
        items: true,
        milestones: true,
        handovers: true,
        liquidation: true,
      },
    });

    if (contracts.length === 0) {
      throw new NotFoundError("Không tìm thấy hợp đồng kinh tế");
    }

    return this.formatContract(contracts[0]);
  }

  /**
   * Tạo mới hợp đồng thủ công
   */
  static async createContract(input: CreateCustomerContractInput) {
    const year = new Date().getFullYear();
    const contractNumber =
      input.contractNumber ||
      `HĐKT-${year}/GP-${Date.now().toString().slice(-4)}`;

    const id = `contract-${Date.now()}`;
    const approvalLevel = this.calculateApprovalLevel(input.finalTotal);
    const depositAmount = input.depositAmount || 0;
    const remainingAmount = input.finalTotal - depositAmount;

    await prisma.$executeRaw`
      INSERT INTO [HopDongKinhTe] (
        id, contractNumber, title, contractType, customerId, customerName, customerTaxCode,
        customerRepresentative, customerPosition, customerAddress, customerPhone, customerEmail,
        customerBankName, customerBankAccount, companyRepresentative, companyPosition,
        quoteId, quoteCode, projectId, projectCode, totalAmount, discountPercent, taxRate, taxAmount,
        finalTotal, depositAmount, paidAmount, remainingAmount, signedDate, effectiveDate, expiryDate,
        warrantyMonths, termsAndConditions, status, approvalLevel, approvalStatus, notes, createdAt, updatedAt
      ) VALUES (
        ${id}, ${contractNumber}, ${input.title}, ${input.contractType}, ${input.customerId || null},
        ${input.customerName}, ${input.customerTaxCode || null}, ${input.customerRepresentative || null},
        ${input.customerPosition || null}, ${input.customerAddress || null}, ${input.customerPhone || null},
        ${input.customerEmail || null}, ${input.customerBankName || null}, ${input.customerBankAccount || null},
        ${input.companyRepresentative || "Phạm Ngọc Thơm"}, ${input.companyPosition || "Tổng Giám Đốc"},
        ${input.quoteId || null}, ${input.quoteCode || null}, ${input.projectId || null}, ${input.projectCode || null},
        ${input.totalAmount}, ${input.discountPercent}, ${input.taxRate}, ${input.taxAmount}, ${input.finalTotal},
        ${depositAmount}, 0, ${remainingAmount}, ${input.signedDate ? new Date(input.signedDate) : null},
        ${input.effectiveDate ? new Date(input.effectiveDate) : null}, ${input.expiryDate ? new Date(input.expiryDate) : null},
        ${input.warrantyMonths}, ${input.termsAndConditions || null}, 'draft', ${approvalLevel}, 'pending',
        ${input.notes || null}, GETDATE(), GETDATE()
      )
    `;

    // Insert Items
    for (let i = 0; i < input.items.length; i++) {
      const it = input.items[i];
      const itemId = `item-${id}-${i + 1}`;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, productId, sku, productName, unit, quantity, unitPrice, discountPercent, total, notes)
        VALUES (${itemId}, ${id}, ${it.productId || null}, ${it.sku}, ${it.productName}, ${it.unit || "Cái"}, ${it.quantity}, ${it.unitPrice}, ${it.discountPercent || 0}, ${it.total}, ${it.notes || null})
      `;
    }

    // Insert Milestones
    const defaultMilestones: ContractMilestoneInput[] = [
      { milestoneOrder: 1, milestoneName: "Đợt 1: Tạm ứng 30%", percentage: 30, plannedAmount: Math.round(input.finalTotal * 0.3), status: "pending", paidAmount: 0 },
      { milestoneOrder: 2, milestoneName: "Đợt 2: Giao hàng & Nghiệm thu 70%", percentage: 70, plannedAmount: Math.round(input.finalTotal * 0.7), status: "pending", paidAmount: 0 },
    ];
    const milestones: ContractMilestoneInput[] = input.milestones && input.milestones.length > 0
      ? input.milestones
      : defaultMilestones;

    for (let m = 0; m < milestones.length; m++) {
      const ms = milestones[m];
      const msId = `ms-${id}-${m + 1}`;
      await prisma.$executeRaw`
        INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, dueDate, status, paidAmount)
        VALUES (${msId}, ${id}, ${ms.milestoneOrder || m + 1}, ${ms.milestoneName}, ${ms.percentage}, ${ms.plannedAmount}, ${ms.dueDate ? new Date(ms.dueDate) : null}, 'pending', 0)
      `;
    }

    return this.getContractById(id);
  }

  /**
   * Tạo Hợp đồng kế thừa từ Báo giá
   */
  static async createFromQuote(input: CreateFromQuoteInput) {
    const quotes = await prisma.priceQuote.findMany({
      where: { id: input.quoteId },
      include: { items: true },
    });

    if (quotes.length === 0) {
      throw new NotFoundError("Không tìm thấy Báo giá nguồn");
    }

    const quote = quotes[0];
    const finalTotal = Number(quote.finalTotal);
    const totalAmount = Number(quote.totalAmount);
    const taxRate = 10;
    const taxAmount = Math.round(finalTotal * 0.1);

    const contractInput: CreateCustomerContractInput = {
      contractNumber: input.contractNumber,
      title: `Hợp đồng kinh tế theo Báo giá [${quote.code}]`,
      contractType: input.contractType || "commercial_goods",
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerRepresentative: quote.customerName,
      customerAddress: quote.customerCompany || undefined,
      companyRepresentative: "Phạm Ngọc Thơm",
      companyPosition: "Tổng Giám Đốc",
      quoteId: quote.id,
      quoteCode: quote.code,
      totalAmount,
      discountPercent: Number(quote.discountPercent),
      taxRate,
      taxAmount,
      finalTotal: finalTotal + taxAmount,
      depositAmount: Math.round((finalTotal + taxAmount) * 0.3),
      warrantyMonths: input.warrantyMonths || 12,
      termsAndConditions: input.termsAndConditions || "Thanh toán theo đúng đợt thỏa thuận. Bảo hành chính hãng 12 tháng.",
      items: (quote.items || []).map((it) => ({
        sku: it.sku,
        productName: it.productName,
        unit: it.unit,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        discountPercent: 0,
        total: Number(it.total),
      })),
      milestones: input.milestones && input.milestones.length > 0
        ? input.milestones
        : [
            { milestoneOrder: 1, milestoneName: "Đợt 1: Tạm ứng 30% sau ký kết", percentage: 30, plannedAmount: Math.round((finalTotal + taxAmount) * 0.3), status: "pending", paidAmount: 0 },
            { milestoneOrder: 2, milestoneName: "Đợt 2: Thanh toán 70% sau bàn giao", percentage: 70, plannedAmount: Math.round((finalTotal + taxAmount) * 0.7), status: "pending", paidAmount: 0 },
          ],
    };

    const newContract = await this.createContract(contractInput);

    // Cập nhật Báo giá thành converted_to_contract
    await prisma.$executeRaw`
      UPDATE [BaoGia]
      SET status = 'completed', notes = ${'Đã chuyển thành Hợp đồng: ' + newContract.contractNumber}
      WHERE id = ${quote.id}
    `;

    return newContract;
  }

  /**
   * Ký số điện tử (Viettel SmartCA, FaceID, USB Token, PIN)
   */
  static async signContract(id: string, input: SignCustomerContractInput) {
    const contract = await this.getContractById(id);
    const dt = new Date();

    if (input.signSide === "partyB" || input.signSide === "both") {
      const sigB = `${input.signedBy} (${input.signerRole || "Tổng Giám Đốc"})`;
      const sigDetails = JSON.stringify(input.signatureDetails || {
        provider: input.provider || "viettel_smartca",
        method: input.method,
        signedAt: dt.toISOString(),
        sha256: "SHA256-" + Date.now(),
      });

      await prisma.$executeRaw`
        UPDATE [HopDongKinhTe]
        SET digitalSignatureB = ${sigB},
            signatureBDetails = ${sigDetails},
            approvalStatus = 'approved',
            status = 'active',
            signedDate = ${dt},
            effectiveDate = ${dt},
            updatedAt = ${dt}
        WHERE id = ${id}
      `;
    }

    if (input.signSide === "partyA" || input.signSide === "both") {
      const sigA = `${input.signedBy} (Đại diện Bên A)`;
      await prisma.$executeRaw`
        UPDATE [HopDongKinhTe]
        SET digitalSignatureA = ${sigA},
            status = 'active',
            updatedAt = ${dt}
        WHERE id = ${id}
      `;
    }

    return this.getContractById(id);
  }

  /**
   * Lập phiếu bàn giao hàng hóa / thiết bị
   */
  static async createHandover(contractId: string, input: CreateHandoverNoteInput) {
    const contract = await this.getContractById(contractId);
    const handoverCode =
      input.handoverCode ||
      `BG-${contract.contractNumber.replace("HĐKT-", "")}-${Date.now().toString().slice(-3)}`;

    const hId = `handover-${Date.now()}`;
    const hDate = input.handoverDate ? new Date(input.handoverDate) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [PhieuBanGiaoHopDong] (id, handoverCode, contractId, handoverDate, handoverLocation, delivererName, receiverName, content, status, signatureDeliverer, signatureReceiver, notes, createdAt)
      VALUES (${hId}, ${handoverCode}, ${contractId}, ${hDate}, ${input.handoverLocation || null}, ${input.delivererName}, ${input.receiverName}, ${input.content}, 'signed', ${input.delivererName}, ${input.receiverName}, ${input.notes || null}, GETDATE())
    `;

    // Cập nhật trạng thái hợp đồng sang in_delivery hoặc accepted
    await prisma.$executeRaw`
      UPDATE [HopDongKinhTe]
      SET handoverDate = ${hDate}, status = 'in_delivery', updatedAt = GETDATE()
      WHERE id = ${contractId}
    `;

    return this.getContractById(contractId);
  }

  /**
   * Lập Biên bản nghiệm thu & Thanh lý hợp đồng ➔ Kích hoạt Hóa đơn VAT
   */
  static async createLiquidation(contractId: string, input: CreateLiquidationInput) {
    const contract = await this.getContractById(contractId);
    const liquidationCode =
      input.liquidationCode ||
      `TL-${contract.contractNumber.replace("HĐKT-", "")}-${Date.now().toString().slice(-3)}`;

    const lId = `liquidation-${Date.now()}`;
    const lDate = input.liquidationDate ? new Date(input.liquidationDate) : new Date();
    const originalAmount = Number(contract.finalTotal);
    const actualAmount = input.actualAmount;
    const paidAmount = Number(contract.paidAmount);
    const penaltyOrAdjustment = input.penaltyOrAdjustment || 0;
    const finalPaymentAmount = Math.max(0, actualAmount - paidAmount - penaltyOrAdjustment);

    // Xóa biên bản thanh lý cũ nếu có để tránh vi phạm khóa Unique 1-1
    await prisma.$executeRaw`
      DELETE FROM [ThanhLyHopDongKinhTe] WHERE contractId = ${contractId}
    `;

    await prisma.$executeRaw`
      INSERT INTO [ThanhLyHopDongKinhTe] (
        id, liquidationCode, contractId, liquidationDate, originalAmount, actualAmount,
        paidAmount, penaltyOrAdjustment, finalPaymentAmount, warrantyCommitment, conclusion,
        status, signatureA, signatureB, createdAt
      ) VALUES (
        ${lId}, ${liquidationCode}, ${contractId}, ${lDate}, ${originalAmount}, ${actualAmount},
        ${paidAmount}, ${penaltyOrAdjustment}, ${finalPaymentAmount}, ${input.warrantyCommitment},
        ${input.conclusion}, 'completed', ${input.signatureA || contract.customerName},
        ${input.signatureB || contract.companyRepresentative || "Phạm Ngọc Thơm"}, GETDATE()
      )
    `;

    // Cập nhật hợp đồng sang liquidated / completed
    await prisma.$executeRaw`
      UPDATE [HopDongKinhTe]
      SET liquidationDate = ${lDate}, status = 'liquidated', remainingAmount = ${finalPaymentAmount}, updatedAt = GETDATE()
      WHERE id = ${contractId}
    `;

    let generatedInvoiceCode = null;

    // Tự động sinh Hóa đơn VAT điện tử nếu user tích chọn
    if (input.autoTriggerEInvoice) {
      const invNum = Date.now().toString().slice(-6);
      generatedInvoiceCode = `1C26TGP-${invNum}`;
      const invId = `inv-${Date.now()}`;
      const sellerData = JSON.stringify({
        companyName: "CÔNG TY CỔ PHẦN GP-ERP VIỆT NAM",
        taxCode: "0318928172",
        address: "Tòa nhà GP-Tower, 180 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
        phone: "1900 888 999",
      });
      const buyerData = JSON.stringify({
        customerName: contract.customerName,
        taxCode: contract.customerTaxCode || "",
        address: contract.customerAddress || "",
        phone: contract.customerPhone || "",
      });

      await prisma.$executeRaw`
        INSERT INTO [HoaDonDienTu] (
          id, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate,
          invoiceType, lookupCode, lookupUrl, issueDate, status,
          sellerData, buyerData, subtotal, discountAmount, taxRate,
          taxAmount, totalAmount, amountInWords, paymentMethod, notes
        ) VALUES (
          ${invId}, ${generatedInvoiceCode}, ${invNum}, '1C26TGP', '1/001',
          'vat', ${'LK-' + invNum}, 'https://tracuu.gperp.vn', GETDATE(), 'draft',
          ${sellerData}, ${buyerData}, ${contract.totalAmount}, 0, 10,
          ${contract.taxAmount}, ${contract.finalTotal}, 'Thanh toán theo hợp đồng kinh tế', 'TM/CK',
          ${'Xuất tự động từ Thanh lý hợp đồng: ' + contract.contractNumber}
        )
      `;

      // Cập nhật mã hóa đơn vào Hợp đồng
      await prisma.$executeRaw`
        UPDATE [HopDongKinhTe]
        SET einvoiceCode = ${generatedInvoiceCode}, status = 'completed'
        WHERE id = ${contractId}
      `;
    }

    const updated = await this.getContractById(contractId);
    return {
      contract: updated,
      invoiceCode: generatedInvoiceCode,
    };
  }

  /**
   * Xóa hợp đồng
   */
  static async deleteContract(id: string) {
    await this.getContractById(id);
    await prisma.$executeRaw`DELETE FROM [HopDongKinhTe] WHERE id = ${id}`;
    return { success: true, message: "Đã xóa hợp đồng thành công" };
  }

  /**
   * Helper format kiểu dữ liệu số
   */
  private static formatContract(c: any) {
    return {
      ...c,
      totalAmount: Number(c.totalAmount || 0),
      discountPercent: Number(c.discountPercent || 0),
      taxRate: Number(c.taxRate || 0),
      taxAmount: Number(c.taxAmount || 0),
      finalTotal: Number(c.finalTotal || 0),
      depositAmount: Number(c.depositAmount || 0),
      paidAmount: Number(c.paidAmount || 0),
      remainingAmount: Number(c.remainingAmount || 0),
      items: (c.items || []).map((i: any) => ({
        ...i,
        quantity: Number(i.quantity || 0),
        unitPrice: Number(i.unitPrice || 0),
        discountPercent: Number(i.discountPercent || 0),
        total: Number(i.total || 0),
      })),
      milestones: (c.milestones || []).map((m: any) => ({
        ...m,
        percentage: Number(m.percentage || 0),
        plannedAmount: Number(m.plannedAmount || 0),
        paidAmount: Number(m.paidAmount || 0),
      })),
      handovers: c.handovers || [],
      liquidation: c.liquidation ? {
        ...c.liquidation,
        originalAmount: Number(c.liquidation.originalAmount || 0),
        actualAmount: Number(c.liquidation.actualAmount || 0),
        paidAmount: Number(c.liquidation.paidAmount || 0),
        penaltyOrAdjustment: Number(c.liquidation.penaltyOrAdjustment || 0),
        finalPaymentAmount: Number(c.liquidation.finalPaymentAmount || 0),
      } : null,
    };
  }
}
