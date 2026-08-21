import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import setupRoutes from "./server/modules/setup/setup.routes";
import authRoutes from "./server/modules/auth/auth.routes";
import productsRoutes from "./server/modules/products/products.routes";
import customersRoutes from "./server/modules/customers/customers.routes";
import posRoutes from "./server/modules/pos/pos.routes";
import warehouseRoutes from "./server/modules/warehouse/warehouse.routes";
import quotesRoutes from "./server/modules/quotes/quotes.routes";
import costingRoutes from "./server/modules/costing/costing.routes";
import warrantiesRoutes from "./server/modules/warranties/warranties.routes";
import financeRoutes from "./server/modules/finance/finance.routes";
import einvoicesRoutes from "./server/modules/einvoices/einvoices.routes";
import hrRoutes from "./server/modules/hr/hr.routes";
import promotionsRoutes from "./server/modules/promotions/promotions.routes";
import assetsRoutes from "./server/modules/assets/assets.routes";
import inboundInvoicesRoutes from "./server/modules/inbound-invoices/inbound-invoices.routes";
import settingsRoutes from "./server/modules/settings/settings.routes";
import { errorHandler } from "./server/core/middlewares/errorHandler";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.use("/api/setup", setupRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/customers", customersRoutes);
  app.use("/api/pos", posRoutes);
  app.use("/api/warehouse", warehouseRoutes);
  app.use("/api/quotes", quotesRoutes);
  app.use("/api/costing", costingRoutes);
  app.use("/api/warranties", warrantiesRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/einvoices", einvoicesRoutes);
  app.use("/api/hr", hrRoutes);
  app.use("/api/promotions", promotionsRoutes);
  app.use("/api/assets", assetsRoutes);
  app.use("/api/inbound-invoices", inboundInvoicesRoutes);
  app.use("/api/settings", settingsRoutes);

  // Helper for lazy initialized Gemini
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Sales Analysis and Strategy Endpoint
  app.post("/api/gemini/analyze-sales", async (req, res) => {
    try {
      const { summaryData, period, customFocus } = req.body;
      const ai = getGeminiClient();

      const prompt = `Bạn là một chuyên gia cao cấp về tối ưu hóa kinh doanh bán hàng, vận hành cửa hàng bán lẻ và thương mại điện tử đa kênh tại Việt Nam.
Hãy phân tích dữ liệu bán hàng sau đây và đưa ra báo cáo chi tiết, súc tích, thực tế kèm các đề xuất hành động cụ thể để tăng doanh số, tối ưu tồn kho và cải thiện lợi nhuận.

DỮ LIỆU BÁN HÀNG (${period || "Gần đây"}):
- Tổng doanh thu: ${summaryData?.totalRevenue?.toLocaleString("vi-VN")} đ
- Tổng lợi nhuận: ${summaryData?.totalProfit?.toLocaleString("vi-VN")} đ
- Tỷ suất lợi nhuận gộp: ${summaryData?.profitMargin || 0}%
- Tổng số đơn hàng: ${summaryData?.totalOrders || 0}
- Giá trị trung bình đơn (AOV): ${summaryData?.averageOrderValue?.toLocaleString("vi-VN")} đ
- Sản phẩm bán chạy hàng đầu: ${JSON.stringify(summaryData?.topProducts || [])}
- Sản phẩm sắp hết hàng / tồn kho thấp: ${JSON.stringify(summaryData?.lowStockProducts || [])}
- Tồn đọng công nợ khách hàng: ${summaryData?.totalDebt?.toLocaleString("vi-VN")} đ
${customFocus ? `Yêu cầu trọng tâm phân tích: ${customFocus}` : ""}

Yêu cầu trả về theo cấu trúc rõ ràng:
1. 📊 Đánh giá tổng quan hiệu suất kinh doanh (Điểm mạnh & Điểm nghẽn)
2. 💡 3-5 Chiến lược hành động cụ thể để bứt phá doanh thu trong 30 ngày tới
3. 📦 Đề xuất quản trị tồn kho & nhập hàng thông minh (đặc biệt các mã cảnh báo)
4. 🎯 Ý tưởng chương trình khuyến mãi / Upsell & Cross-sell phù hợp
5. ⚡ Mẹo tối ưu chi phí vận hành & nâng cao trải nghiệm khách hàng tại quầy / online`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      res.json({ analysis: response.text || "Không thể khởi tạo nội dung phân tích." });
    } catch (error: any) {
      console.error("Error in /api/gemini/analyze-sales:", error);
      res.status(500).json({ error: error?.message || "Lỗi khi phân tích dữ liệu bán hàng." });
    }
  });

  // Comprehensive GP-ERP Enterprise AI Assistant Endpoint
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const { query, category = "all", messages = [], systemContext } = req.body;
      const ai = getGeminiClient();

      const {
        products = [],
        customers = [],
        quotes = [],
        orders = [],
        warranties = [],
        eInvoices = [],
        laborContracts = [],
        employees = [],
        accountingRecords = [],
        metrics = {},
        storeSettings = {},
      } = systemContext || {};

      // Prepare structured compact context for Gemini
      const sanitizedProducts = products.slice(0, 40).map((p: any) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        baseUnit: p.unit,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        stock: p.stock,
        minStock: p.minStock,
        uomConversions: (p.uomConversions || []).map((u: any) => ({
          unit: u.unit,
          ratioToBase: u.ratioToBase,
          sellingPrice: u.sellingPrice,
          costPrice: u.costPrice,
          description: u.description,
        })),
      }));

      const sanitizedCustomers = customers.slice(0, 30).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        tier: c.tier,
        points: c.points,
        totalSpent: c.totalSpent,
        debt: c.debt,
      }));

      const sanitizedQuotes = quotes.slice(0, 15).map((q: any) => ({
        id: q.id,
        code: q.code,
        customerName: q.customerName,
        customerCompany: q.customerCompany,
        total: q.total,
        status: q.status,
        validUntil: q.validUntil,
        itemCount: q.items?.length || 0,
      }));

      const sanitizedWarranties = warranties.slice(0, 15).map((w: any) => ({
        id: w.id,
        code: w.code,
        type: w.type,
        status: w.status,
        productName: w.productName,
        serialNumber: w.serialNumber,
        customerName: w.customerName,
        customerPhone: w.customerPhone,
        issueDescription: w.issueDescription,
      }));

      const sanitizedEInvoices = eInvoices.slice(0, 15).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceSymbol: inv.invoiceSymbol,
        invoiceDate: inv.invoiceDate,
        buyerName: inv.buyerName,
        buyerTaxCode: inv.buyerTaxCode,
        buyerCompanyName: inv.buyerCompanyName,
        status: inv.status,
        cqtStatus: inv.cqtStatus,
        cqtCode: inv.cqtCode,
        totalAmount: inv.totalAmount,
        vatAmount: inv.vatAmount,
        totalPayment: inv.totalPayment,
        lookupCode: inv.lookupCode,
      }));

      const sanitizedContracts = laborContracts.slice(0, 15).map((ct: any) => ({
        id: ct.id,
        contractNumber: ct.contractNumber,
        contractType: ct.contractType,
        employeeName: ct.employeeName,
        position: ct.position,
        department: ct.department,
        baseSalary: ct.baseSalary,
        allowance: ct.allowance,
        startDate: ct.startDate,
        endDate: ct.endDate,
        status: ct.status,
        isSigned: ct.isSigned,
        signedDate: ct.signedDate,
      }));

      const sanitizedEmployees = employees.slice(0, 15).map((emp: any) => ({
        id: emp.id,
        code: emp.code,
        name: emp.name,
        role: emp.role,
        baseSalary: emp.baseSalary,
        commissionRate: emp.commissionRate,
        currentSales: emp.currentSales,
        status: emp.status,
      }));

      const systemInstruction = `Bạn là "GP-Copilot AI" - Trợ lý Doanh nghiệp & Quản trị Bán hàng Toàn diện của hệ thống ERP GP-Enterprise (Cửa hàng / Doanh nghiệp: ${
        storeSettings.storeName || "GP-ERP Enterprise"
      }).

Bạn có toàn quyền tra cứu dữ liệu ERP thời gian thực được cung cấp dưới đây:
1. DỮ LIỆU SẢN PHẨM & ĐƠN VỊ TÍNH (UOM) & GIÁ BÁN TƯƠNG ỨNG:
${JSON.stringify(sanitizedProducts, null, 2)}

2. DỮ LIỆU KHÁCH HÀNG, HẠNG THÀNH VIÊN & CÔNG NỢ:
${JSON.stringify(sanitizedCustomers, null, 2)}

3. DỮ LIỆU BÁO GIÁ ĐANG LƯU HÀNH:
${JSON.stringify(sanitizedQuotes, null, 2)}

4. DỮ LIỆU HÓA ĐƠN ĐIỆN TỬ (TT78/NĐ123) & TRẠNG THÁI CQT:
${JSON.stringify(sanitizedEInvoices, null, 2)}

5. DỮ LIỆU HỢP ĐỒNG LAO ĐỘNG & NHÂN SỰ HR:
${JSON.stringify(sanitizedContracts, null, 2)}
Danh sách nhân viên: ${JSON.stringify(sanitizedEmployees, null, 2)}

6. DỮ LIỆU BẢO HÀNH, BẢO TRÌ & SERIAL/QR:
${JSON.stringify(sanitizedWarranties, null, 2)}

7. CHỈ SỐ TỔNG QUAN HỆ THỐNG:
- Doanh thu: ${(metrics.totalRevenue || 0).toLocaleString("vi-VN")} đ
- Tổng đơn hàng: ${metrics.totalOrders || 0}
- Khách hàng: ${metrics.totalCustomers || 0}
- Tồn kho cảnh báo thấp: ${metrics.lowStockCount || 0} sản phẩm
- Tổng công nợ khách hàng cần thu: ${(metrics.totalDebt || 0).toLocaleString("vi-VN")} đ

NHIỆM VỤ CỦA BẠN (TÙY THEO YÊU CẦU CỦA NGƯỜI DÙNG):
1. **Tìm kiếm sản phẩm & Báo giá theo đơn vị tính**:
   - Khi người dùng hỏi tìm sản phẩm, tra cứu theo tên/SKU/chủng loại, hãy liệt kê rõ ràng thông tin: Tên sản phẩm, SKU, số lượng tồn kho (và cảnh báo nếu sắp hết), các đơn vị tính có sẵn (VD: Thùng, Cuộn, Mét, Kg, Gam, Hộp, Lon...) kèm GIÁ BÁN và GIÁ VỐN tương ứng cho từng đơn vị tính.
   - Hướng dẫn cách áp dụng đơn vị tính khi bán lẻ tại POS hoặc xuất kho.

2. **Hóa Đơn Điện Tử (E-Invoice TT78/NĐ123) & Kế Toán Thuế**:
   - Tra cứu số hóa đơn, ký hiệu mẫu số (1C26TAA), trạng thái CQT phê duyệt / cấp mã, mã tra cứu hóa đơn, thuế suất GTGT (8%, 10%), tổng tiền thanh toán.
   - Hướng dẫn xuất hóa đơn điện tử hợp lệ từ đơn hàng POS, ký số Token điện tử HSM/USB Token, truyền nhận dữ liệu Tổng Cục Thuế.

3. **Hợp Đồng Lao Động Điện Tử (eContract) & Quản Trị Nhân Sự HR**:
   - Tra cứu hợp đồng lao động theo nhân viên, thời hạn, chức danh, mức lương cơ bản, phụ cấp, tỷ lệ đóng BHXH.
   - Hướng dẫn thủ tục ký số điện tử hợp đồng lao động, bảng tính hoa hồng bán hàng và bảng lương nhân viên.

4. **Hỗ trợ tạo & Tra cứu Báo giá (Quotation)**:
   - Giúp người dùng tính toán và lên bảng báo giá chi tiết gồm: Tên món, Đơn vị tính, Số lượng, Đơn giá niêm yết, % Chiết khấu, Thành tiền, Thuế VAT và Tổng thanh toán.
   - Soạn thảo thư ngỏ chào giá / email báo giá chuyên nghiệp, lịch thiệp gửi đối tác hoặc khách hàng B2B.

5. **Tra cứu & Chăm sóc Khách hàng, Công nợ & Điểm thưởng**:
   - Tìm nhanh thông tin khách hàng qua Tên hoặc Số điện thoại.
   - Báo cáo số dư công nợ, hạng thành viên (Đồng, Bạc, Vàng, Kim Cương), điểm tích lũy.
   - Soạn tin nhắn Zalo/SMS nhắc nhở công nợ khéo léo, hoặc tin nhắn chúc mừng/ưu đãi tri ân khách hàng VIP.

6. **Báo cáo & Phân tích Doanh thu, Tồn kho & Tài chính**:
   - Tóm tắt tình hình kinh doanh, doanh thu, lợi nhuận, đơn hàng bán chạy nhất, sản phẩm tồn kho quá lâu hoặc sắp hết hàng cần nhập bù.
   - Đưa ra lời khuyên thiết thực giúp tối ưu biên lợi nhuận.

7. **Giải đáp thắc mắc khách hàng & Tư vấn kỹ thuật / Chính sách**:
   - Đóng vai chuyên viên tư vấn bán hàng giải đáp mọi thắc mắc của khách: tính năng sản phẩm, quy cách đóng gói, chính sách đổi trả hàng, quy trình bảo hành 1 đổi 1, tra cứu Serial/IMEI, thời hạn bảo hành.
   - Cung cấp kịch bản xử lý từ chối mua hàng (khách chê giá đắt, khách phân vân thương hiệu khác).

YÊU CẦU ĐỊNH DẠNG PHẢN HỒI:
- Trình bày mạch lạc bằng Tiếng Việt, sử dụng Markdown với các bảng biểu (Markdown tables), danh sách bullet points, in đậm số tiền (VD: **1.250.000 đ**), huy hiệu đơn vị tính rõ ràng.
- Giọng điệu chuyên nghiệp, thông thái, tận tâm, tốc độ và hữu ích cao.`;

      // Build contents from conversation history or prompt
      const conversationContents = messages.map((m: any) => ({
        role: m.sender === "user" || m.role === "user" ? "user" : "model",
        parts: [{ text: m.text || m.content || "" }],
      }));

      // Add current query if not already in messages
      if (
        !messages.length ||
        (messages[messages.length - 1]?.text !== query &&
          messages[messages.length - 1]?.content !== query)
      ) {
        conversationContents.push({
          role: "user",
          parts: [{ text: query }],
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: conversationContents as any,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || "Trợ lý AI GP-Copilot đã tiếp nhận thông tin.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error in /api/gemini/assistant:", error);
      res.status(500).json({
        error: error?.message || "Lỗi xử lý yêu cầu Trợ lý AI.",
      });
    }
  });

  // AI Product Description & SEO Generator
  app.post("/api/gemini/generate-product-desc", async (req, res) => {
    try {
      const { productName, category, price, attributes, targetAudience } = req.body;
      const ai = getGeminiClient();

      const prompt = `Viết mô tả sản phẩm bán hàng hấp dẫn, chuẩn SEO và thuyết phục khách hàng mua hàng ngay cho sản phẩm sau:
- Tên sản phẩm: ${productName}
- Danh mục: ${category || "Chung"}
- Giá bán: ${price ? Number(price).toLocaleString("vi-VN") + " đ" : "Chưa cập nhật"}
- Đặc điểm nổi bật / Thuộc tính: ${attributes || "Chất lượng cao, chính hãng"}
- Đối tượng khách hàng mục tiêu: ${targetAudience || "Mọi đối tượng"}

Yêu cầu trả về:
- Tiêu đề giật tít thu hút
- Đoạn mở đầu đánh trúng tâm lý người mua (Hook)
- Danh sách 4-5 lợi ích vượt trội (Bullet points)
- Thông số / Hướng dẫn sử dụng vắn tắt
- Lời kêu gọi hành động (Call To Action) và cam kết bảo hành/đổi trả uy tín.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.75,
        },
      });

      res.json({ description: response.text || "" });
    } catch (error: any) {
      console.error("Error in /api/gemini/generate-product-desc:", error);
      res.status(500).json({ error: error?.message || "Lỗi khi tạo mô tả sản phẩm." });
    }
  });

  // AI Interactive Sales Advisor Chat
  app.post("/api/gemini/chat-advisor", async (req, res) => {
    try {
      const { messages, storeContext } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `Bạn là "SalesMax AI Copilot" - Trợ lý cố vấn bán hàng và tối ưu hóa vận hành hệ thống thông minh, tận tâm và thực chiến tại Việt Nam.
Thông tin tóm tắt về cửa hàng hiện tại:
- Tên cửa hàng: ${storeContext?.storeName || "Cửa Hàng Bán Lẻ"}
- Số lượng sản phẩm: ${storeContext?.productCount || 0}
- Tổng số đơn: ${storeContext?.orderCount || 0}
- Doanh thu tích lũy: ${storeContext?.revenue?.toLocaleString("vi-VN") || 0} đ

Nhiệm vụ của bạn là:
- Trả lời các câu hỏi về bán hàng, kỹ năng chốt sale, xử lý từ chối giá đắt, quản lý dòng tiền, khuyến mãi, quản lý nhân viên ca kíp, và giữ chân khách hàng trung thành.
- Đưa ra lời khuyên ngắn gọn, thiết thực, có tính ứng dụng ngay lập tức, dùng văn phong chuyên nghiệp và thân thiện bằng tiếng Việt.`;

      const chat = ai.chats.create({
        model: "gemini-3.7-flash",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      // Send history + last user message
      let replyText = "";
      for (const msg of messages) {
        if (msg.role === "user") {
          const resp = await chat.sendMessage({ message: msg.content });
          replyText = resp.text || "";
        }
      }

      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Error in /api/gemini/chat-advisor:", error);
      res.status(500).json({ error: error?.message || "Lỗi khi kết nối với trợ lý AI." });
    }
  });

  // AI Marketing Campaign & Promo Generator
  app.post("/api/gemini/suggest-marketing", async (req, res) => {
    try {
      const { occasion, targetGoal, budget, products } = req.body;
      const ai = getGeminiClient();

      const prompt = `Lập kế hoạch chiến dịch khuyến mãi và thông điệp truyền thông bán hàng cho cửa hàng:
- Dịp / Sự kiện: ${occasion || "Khuyến mãi cuối tuần / Tháng mới"}
- Mục tiêu: ${targetGoal || "Tăng trưởng doanh thu 30% và xả kho hàng chậm bán"}
- Ngân sách / Mức giảm: ${budget || "Tối ưu, linh hoạt giảm từ 10% - 30%"}
- Danh sách nhóm sản phẩm áp dụng: ${products || "Tất cả sản phẩm hoặc sản phẩm chủ lực"}

Hãy đưa ra:
1. 🎁 Ý tưởng chương trình khuyến mãi độc đáo (tên chương trình, cơ chế tặng quà/voucher/combo)
2. 📱 2 mẫu bài viết Facebook / Zalo / TikTok Shop chuẩn chuyển đổi (kèm hashtag & icon bắt mắt)
3. 💬 2 kịch bản tin nhắn Zalo ZNS / SMS chăm sóc khách hàng cũ mời quay lại
4. ⏰ Lịch trình triển khai khuyến mãi từng giai đoạn`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.8,
        },
      });

      res.json({ campaign: response.text || "" });
    } catch (error: any) {
      console.error("Error in /api/gemini/suggest-marketing:", error);
      res.status(500).json({ error: error?.message || "Lỗi khi tạo chiến dịch marketing." });
    }
  });

  // Global Error Handler for API routes
  app.use(errorHandler);

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hệ thống bán hàng Server running at http://localhost:${PORT}`);
  });
}

startServer();
