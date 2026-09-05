import prisma from "../../config/db";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "../../core/errors/AppError";

export interface SignableDocumentDto {
  id: string;
  code: string;
  title: string;
  type: "einvoice" | "contract" | "quote" | "order" | "kpi_decision";
  typeLabel: string;
  createdAt: string;
  totalAmount: number;
  creatorName: string;
  recipientName: string;
  status: "pending" | "signed" | "rejected";
  legalStandard: string;
  signature?: any;
}

export const DEFAULT_GATEWAY_SEEDS = [
  {
    provider: "viettel_smartca",
    name: "Viettel SmartCA",
    tagline: "Ký số từ xa qua ứng dụng Viettel Money / Viettel CA",
    endpointUrl: "https://smartca-api.viettel.vn/v2/sign",
    clientId: "GP_ERP_VIETTEL_CA_PROD",
    clientSecretMasked: "••••••••••••••••••••3821",
    clientSecret: "VT_SECRET_PROD_3821",
    taxCode: "3702918234",
    environment: "production",
    isActive: true,
    pingLatencyMs: 38,
    lastPingStatus: "online",
    description: "Hỗ trợ xác thực vân tay/FaceID trên điện thoại, đạt chuẩn eIDAS & TT16/2019/TT-BTTTT.",
  },
  {
    provider: "vnpt_smartca",
    name: "VNPT SmartCA",
    tagline: "Chứng thực số đám mây tập đoàn VNPT & TSA RFC 3161",
    endpointUrl: "https://smartca.vnpt.vn/api/v1/remote-sign",
    clientId: "GP_ERP_VNPT_CA_ENTERPRISE",
    clientSecretMasked: "••••••••••••••••••••9942",
    clientSecret: "VNPT_SECRET_PROD_9942",
    taxCode: "3702918234",
    environment: "production",
    isActive: true,
    pingLatencyMs: 42,
    lastPingStatus: "online",
    description: "Tích hợp Dấu thời gian tin cậy VNPT-TSA, hỗ trợ ký hàng loạt tốc độ cao.",
  },
  {
    provider: "fpt_esign",
    name: "FPT.eSign",
    tagline: "Dịch vụ ký số số 1 cho Tài chính - Ngân hàng & ERP",
    endpointUrl: "https://esign-api.fpt.com.vn/v3/signature",
    clientId: "GP_ERP_FPT_ESIGN_GATEWAY",
    clientSecretMasked: "••••••••••••••••••••1054",
    clientSecret: "FPT_SECRET_PROD_1054",
    taxCode: "3702918234",
    environment: "sandbox",
    isActive: true,
    pingLatencyMs: 45,
    lastPingStatus: "online",
    description: "Chuẩn PAdES B-LT và CAdES, lưu vết bảo mật HSM Level 3.",
  },
  {
    provider: "misa_esign",
    name: "MISA eSign",
    tagline: "Ký số Hóa đơn điện tử TT78 & Kế toán MISA",
    endpointUrl: "https://esign.misa.vn/api/v2/integration",
    clientId: "GP_ERP_MISA_ESIGN_PRO",
    clientSecretMasked: "••••••••••••••••••••7712",
    clientSecret: "MISA_SECRET_PROD_7712",
    taxCode: "3702918234",
    environment: "sandbox",
    isActive: true,
    pingLatencyMs: 51,
    lastPingStatus: "online",
    description: "Chuyên dụng phát hành hóa đơn điện tử CQT và báo cáo thuế.",
  },
  {
    provider: "bkav_ca",
    name: "BKAV eSign",
    tagline: "Bảo mật an ninh mạng hàng đầu & Chữ ký số USB Token",
    endpointUrl: "https://ca.bkav.com.vn/api/v1/sign",
    clientId: "GP_ERP_BKAV_CA_SECURE",
    clientSecretMasked: "••••••••••••••••••••8390",
    clientSecret: "BKAV_SECRET_PROD_8390",
    taxCode: "3702918234",
    environment: "sandbox",
    isActive: true,
    pingLatencyMs: 49,
    lastPingStatus: "online",
    description: "Bảo vệ kép với phần cứng Token PKCS#11 và chữ ký số từ xa.",
  },
  {
    provider: "usb_token",
    name: "USB Token Phần Cứng (PKCS#11)",
    tagline: "Thiết bị khóa phần cứng cắm cổng USB trực tiếp máy tính",
    endpointUrl: "localhost:8989/pkcs11",
    clientId: "PKCS11_LOCAL_TOKEN_DRIVER",
    clientSecretMasked: "PIN_AUTH_PROTECTED",
    clientSecret: "PIN_AUTH_PROTECTED",
    taxCode: "3702918234",
    environment: "production",
    isActive: true,
    pingLatencyMs: 5,
    lastPingStatus: "online",
    description: "Ký cục bộ trực tiếp qua chứng thư số lưu trữ an toàn trong chip bảo mật Token.",
  },
];

export class SignaturesService {
  static async getSignableDocuments(filter?: { type?: string; status?: string; search?: string }) {
    const documents: SignableDocumentDto[] = [];

    try {
      const invoices = await prisma.eInvoice.findMany();
      for (const inv of invoices) {
        let sig = null;
        if (inv.digitalSignature) {
          try { sig = JSON.parse(inv.digitalSignature); } catch { sig = inv.digitalSignature; }
        }
        let buyerName = "Khách Hàng";
        if (inv.buyerData) {
          try {
            const b = JSON.parse(inv.buyerData);
            buyerName = b.buyerName || b.companyName || buyerName;
          } catch {}
        }

        documents.push({
          id: inv.id,
          code: inv.invoiceCode,
          title: `Hóa Đơn GTGT (Mẫu ${inv.invoiceTemplate} - Ký hiệu ${inv.invoiceSymbol})`,
          type: "einvoice",
          typeLabel: "Hóa Đơn Điện Tử",
          createdAt: inv.issueDate ? new Date(inv.issueDate).toISOString() : new Date().toISOString(),
          totalAmount: Number(inv.totalAmount || 0),
          creatorName: "Bộ phận Kế toán",
          recipientName: buyerName,
          status: inv.status === "signed" || inv.status === "sent_cqt" || inv.status === "cqt_approved" ? "signed" : "pending",
          legalStandard: "XML-DSig (TT 78/2021/TT-BTC & NĐ 123/2020/NĐ-CP)",
          signature: sig,
        });
      }
    } catch (err) {
      console.warn("Error fetching invoices for signature hub:", err);
    }

    try {
      const orders = await prisma.order.findMany({
        include: { customer: true },
      });
      for (const order of orders) {
        let sig = null;
        if (order.digitalSignature) {
          try { sig = JSON.parse(order.digitalSignature); } catch { sig = order.digitalSignature; }
        }

        documents.push({
          id: order.id,
          code: order.code,
          title: `Đơn Hàng Thương Mại ${order.code} - Kênh ${order.channel}`,
          type: "order",
          typeLabel: "Đơn Hàng Bán",
          createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
          totalAmount: Number(order.total || 0),
          creatorName: "Thu ngân POS / Quản trị đơn",
          recipientName: order.customerName || order.customer?.name || "Khách lẻ",
          status: sig ? "signed" : "pending",
          legalStandard: "PAdES B-LT (Luật Giao dịch điện tử 2023)",
          signature: sig,
        });
      }
    } catch (err) {
      console.warn("Error fetching orders for signature hub:", err);
    }

    try {
      const quotes = await prisma.priceQuote.findMany();
      for (const q of quotes) {
        let sig = null;
        if (q.digitalSignature) {
          try { sig = JSON.parse(q.digitalSignature); } catch { sig = q.digitalSignature; }
        }

        documents.push({
          id: q.id,
          code: q.code,
          title: `Bảng Báo Giá Dự Án & Thiết Bị - ${q.customerName}`,
          type: "quote",
          typeLabel: "Báo Giá Dự Án",
          createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString(),
          totalAmount: Number(q.finalTotal || q.totalAmount || 0),
          creatorName: "Phòng Kinh Doanh B2B",
          recipientName: q.customerCompany ? `${q.customerName} (${q.customerCompany})` : q.customerName,
          status: sig || q.status === "approved" ? "signed" : "pending",
          legalStandard: "PAdES B-LT (Luật Thương mại 2005 & Giao dịch điện tử)",
          signature: sig,
        });
      }
    } catch (err) {
      console.warn("Error fetching quotes for signature hub:", err);
    }

    try {
      const contracts = await prisma.laborContract.findMany();
      for (const c of contracts) {
        let sig = null;
        if (c.signaturesData) {
          try {
            const parsed = JSON.parse(c.signaturesData);
            sig = parsed.caSignature || parsed;
          } catch {}
        }

        documents.push({
          id: c.id,
          code: c.contractNumber,
          title: `Hợp Đồng Lao Động - ${c.employeeName} (${c.employeeRole})`,
          type: "contract",
          typeLabel: "Hợp Đồng Lao Động",
          createdAt: c.signDate ? new Date(c.signDate).toISOString() : new Date().toISOString(),
          totalAmount: 15000000,
          creatorName: "Phòng Nhân Sự HR",
          recipientName: c.employeeName,
          status: c.status === "signed" || c.status === "active" || sig ? "signed" : "pending",
          legalStandard: "PAdES B-LT (Điều 13 BLLĐ 2019 & Giao dịch điện tử)",
          signature: sig,
        });
      }
    } catch (err) {
      console.warn("Error fetching labor contracts for signature hub:", err);
    }

    documents.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return documents;
  }

  static async batchSign(docIds: string[], signatureData: any) {
    const results = [];
    const dt = new Date();

    for (const id of docIds) {
      const sigStr = typeof signatureData === "string" ? signatureData : JSON.stringify(signatureData);

      const orders = await prisma.order.findMany({ where: { id } });
      if (orders.length > 0) {
        await prisma.order.updateMany({
          where: { id },
          data: { digitalSignature: sigStr },
        });
        results.push({ id, type: "order", success: true });
        continue;
      }

      const invoices = await prisma.eInvoice.findMany({ where: { id } });
      if (invoices.length > 0) {
        await prisma.eInvoice.updateMany({
          where: { id },
          data: { status: "signed", signDate: dt, digitalSignature: sigStr },
        });
        results.push({ id, type: "einvoice", success: true });
        continue;
      }

      const quotes = await prisma.priceQuote.findMany({ where: { id } });
      if (quotes.length > 0) {
        await prisma.priceQuote.updateMany({
          where: { id },
          data: { digitalSignature: sigStr, status: "approved" },
        });
        results.push({ id, type: "quote", success: true });
        continue;
      }

      const contracts = await prisma.laborContract.findMany({ where: { id } });
      if (contracts.length > 0) {
        await prisma.laborContract.updateMany({
          where: { id },
          data: { status: "signed", signaturesData: sigStr },
        });
        results.push({ id, type: "contract", success: true });
        continue;
      }
    }

    return results;
  }

  static async getCaGateways() {
    let gateways = await prisma.caGatewayConfigRecord.findMany();

    if (gateways.length === 0) {
      for (const item of DEFAULT_GATEWAY_SEEDS) {
        const id = `ca-${item.provider}`;
        await prisma.$executeRaw`
          INSERT INTO [CauHinhCongCA] (id, provider, name, tagline, endpointUrl, clientId, clientSecretMasked, clientSecret, taxCode, environment, isActive, pingLatencyMs, lastPingStatus, lastPingAt, description, createdAt, updatedAt)
          VALUES (${id}, ${item.provider}, ${item.name}, ${item.tagline}, ${item.endpointUrl}, ${item.clientId}, ${item.clientSecretMasked}, ${item.clientSecret}, ${item.taxCode}, ${item.environment}, ${item.isActive ? 1 : 0}, ${item.pingLatencyMs}, ${item.lastPingStatus}, ${new Date()}, ${item.description}, ${new Date()}, ${new Date()})
        `;
      }
      gateways = await prisma.caGatewayConfigRecord.findMany();
    }

    return gateways.map((g) => ({
      ...g,
      isActive: Boolean(g.isActive),
      supportedMethods:
        g.provider === "usb_token"
          ? ["usb_token"]
          : g.provider === "vnpt_smartca"
          ? ["remote_signing", "cloud_hsm", "soft_cert"]
          : ["remote_signing", "cloud_hsm"],
      logo:
        g.provider === "viettel_smartca"
          ? "🔴"
          : g.provider === "vnpt_smartca"
          ? "🔵"
          : g.provider === "fpt_esign"
          ? "🟠"
          : g.provider === "misa_esign"
          ? "🟢"
          : g.provider === "bkav_ca"
          ? "🟡"
          : "🔑",
    }));
  }

  static async updateCaGateway(provider: string, data: any) {
    const existing = await prisma.caGatewayConfigRecord.findMany({ where: { provider } });
    if (existing.length === 0) {
      throw new NotFoundError(`Không tìm thấy cấu hình cổng CA: ${provider}`);
    }

    const maskedSecret = data.clientSecret
      ? `••••••••••••••••••••${data.clientSecret.slice(-4)}`
      : existing[0].clientSecretMasked;

    await prisma.caGatewayConfigRecord.updateMany({
      where: { provider },
      data: {
        endpointUrl: data.endpointUrl || existing[0].endpointUrl,
        clientId: data.clientId !== undefined ? data.clientId : existing[0].clientId,
        clientSecret: data.clientSecret !== undefined ? data.clientSecret : existing[0].clientSecret,
        clientSecretMasked: maskedSecret,
        taxCode: data.taxCode !== undefined ? data.taxCode : existing[0].taxCode,
        environment: data.environment || existing[0].environment,
        isActive: data.isActive !== undefined ? data.isActive : existing[0].isActive,
        pingLatencyMs: data.pingLatencyMs !== undefined ? data.pingLatencyMs : existing[0].pingLatencyMs,
        lastPingStatus: data.lastPingStatus || existing[0].lastPingStatus,
        lastPingAt: new Date(),
      },
    });

    const updated = await prisma.caGatewayConfigRecord.findMany({ where: { provider } });
    return updated[0];
  }
}
