import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Lightbulb,
  Send,
  RefreshCw,
  TrendingUp,
  Target,
  Megaphone,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Bot,
  User,
  Search,
  Users,
  Wrench,
  DollarSign,
  Copy,
  Check,
  Building2,
  Package,
  Layers,
  Phone,
  FileText,
  ShieldCheck,
  Tag,
  ArrowRight,
  Calculator,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import {
  Product,
  Order,
  Customer,
  PriceQuote,
  WarrantyTicket,
  StoreSettings,
  EInvoice,
  LaborContract,
  Employee,
  AccountingRecord,
} from '../../types';
import { formatVND } from '../../utils/currency';

interface AiAdvisorViewProps {
  products?: Product[];
  orders?: Order[];
  customers?: Customer[];
  quotes?: PriceQuote[];
  warranties?: WarrantyTicket[];
  eInvoices?: EInvoice[];
  laborContracts?: LaborContract[];
  employees?: Employee[];
  accountingRecords?: AccountingRecord[];
  settings?: StoreSettings;
  onNavigate?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  products = [],
  orders = [],
  customers = [],
  quotes = [],
  warranties = [],
  eInvoices = [],
  laborContracts = [],
  employees = [],
  accountingRecords = [],
  settings,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'hub' | 'products' | 'quotes' | 'customers' | 'reports' | 'faq'
  >('hub');

  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const safeWarranties = Array.isArray(warranties) ? warranties : [];
  const safeEInvoices = Array.isArray(eInvoices) ? eInvoices : [];
  const safeContracts = Array.isArray(laborContracts) ? laborContracts : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeRecords = Array.isArray(accountingRecords) ? accountingRecords : [];

  // Metrics
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalDebt = safeCustomers.reduce((sum, c) => sum + (c.debt || 0), 0);
  const lowStockCount = safeProducts.filter((p) => p && p.stock <= p.minStock).length;

  // Tab 1: Hub Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là **GP-Copilot AI** - Cố vấn Doanh nghiệp & Trợ lý Toàn Năng GP-ERP Enterprise.

Tôi có thể hỗ trợ bạn mọi tác vụ:
1. 🔍 **Tìm kiếm sản phẩm, tra cứu đơn vị tính (UOM) & giá bán lẻ/sỉ tương ứng**
2. 📋 **Hỗ trợ tạo & tính toán Báo Giá (Quotes) chiết khấu theo dự án**
3. 👥 **Tra cứu hồ sơ khách hàng, phân loại VIP & kiểm soát công nợ**
4. 📊 **Tổng hợp báo cáo kinh doanh, doanh thu, lợi nhuận & cảnh báo tồn kho**
5. 🛡️ **Giải đáp thắc mắc khách hàng, xử lý khiếu nại & chính sách bảo hành**

Hãy nhập yêu cầu hoặc chọn tính năng bên trên để bắt đầu!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Tab 2: Product Search & Pricing UOM Tool
  const [productSearchKeyword, setProductSearchKeyword] = useState('dây');
  const [productSearchResult, setProductSearchResult] = useState('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);

  // Tab 3: Quote Generation Tool
  const [quoteCustomerName, setQuoteCustomerName] = useState('Công Ty Xây Dựng & Cơ Điện Nam Hải');
  const [quoteProjectName, setQuoteProjectName] = useState('Dự án Hệ Thống Điện Nhà Xưởng 500m2');
  const [quoteItemsDesc, setQuoteItemsDesc] = useState('50 cuộn Dây điện Cadivi 2.5mm, 30 hộp ổ cắm Panasonic, 10 bộ aptomat Schneider');
  const [quoteDiscount, setQuoteDiscount] = useState('8%');
  const [quoteResult, setQuoteResult] = useState('');
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  // Tab 4: Customer Debt & Care Tool
  const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState<string>(safeCustomers[0]?.name || 'Công Ty TNHH XD An Phát');
  const [debtMessageType, setDebtMessageType] = useState<'gentle' | 'formal' | 'vip_care'>('gentle');
  const [debtResult, setDebtResult] = useState('');
  const [isGeneratingDebt, setIsGeneratingDebt] = useState(false);

  // Tab 5: Business Intelligence Report
  const [analysisReport, setAnalysisReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tab 6: Customer FAQ & Support
  const [faqTopic, setFaqTopic] = useState('Khách phàn nàn giá theo Mét đắt hơn mua cả Cuộn và đòi giảm giá sâu');
  const [faqResult, setFaqResult] = useState('');
  const [isGeneratingFaq, setIsGeneratingFaq] = useState(false);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Generic AI Call Helper
  const callAiAssistant = async (prompt: string, category: string) => {
    const systemContext = {
      products: safeProducts,
      customers: safeCustomers,
      quotes: safeQuotes,
      orders: safeOrders.slice(0, 30),
      warranties: safeWarranties.slice(0, 20),
      eInvoices: safeEInvoices.slice(0, 20),
      laborContracts: safeContracts.slice(0, 20),
      employees: safeEmployees.slice(0, 20),
      accountingRecords: safeRecords.slice(0, 30),
      metrics: {
        totalRevenue,
        totalOrders: safeOrders.length,
        totalCustomers: safeCustomers.length,
        lowStockCount,
        totalDebt,
        totalInvoices: safeEInvoices.length,
        totalContracts: safeContracts.length,
      },
      storeSettings: settings || { storeName: 'GP-ERP Enterprise' },
    };

    const response = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: prompt,
        category,
        systemContext,
      }),
    });

    const data = await response.json();
    return data.reply || '';
  };

  // Handle Hub Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputQuery.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsChatLoading(true);

    try {
      const reply = await callAiAssistant(userMsg.text, 'all');
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply || 'Đã xử lý thông tin thành công.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Lỗi kết nối tới mô hình AI Gemini. Vui lòng kiểm tra lại đường truyền.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Product Search Tool
  const handleRunProductSearch = async () => {
    if (!productSearchKeyword.trim()) return;
    setIsSearchingProduct(true);
    try {
      const prompt = `Tra cứu thông tin sản phẩm có từ khóa "${productSearchKeyword}". Liệt kê danh sách sản phẩm khớp với từ khóa, bao gồm mã SKU, nhóm ngành, số lượng tồn kho (báo động nếu tồn <= mức tối thiểu), và ĐẶC BIỆT là chi tiết TẤT CẢ CÁC ĐƠN VỊ TÍNH (UOM) hiện có của sản phẩm (Thùng, Cuộn, Mét, Kg, Gam, Hộp, v.v.) kèm GIÁ BÁN LẺ VÀ GIÁ VỐN tương ứng cho từng đơn vị tính. Hướng dẫn cách nhân viên thu ngân chọn đơn vị tính khi bán hàng tại quầy POS.`;
      const reply = await callAiAssistant(prompt, 'products');
      setProductSearchResult(reply);
    } catch (err) {
      console.error(err);
      setProductSearchResult('Không thể tra cứu sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSearchingProduct(false);
    }
  };

  // Handle Quote Tool
  const handleRunQuoteGenerator = async () => {
    setIsGeneratingQuote(true);
    try {
      const prompt = `Lập bảng BÁO GIÁ DỰ ÁN B2B chuyên nghiệp:
- Khách hàng / Doanh nghiệp: ${quoteCustomerName}
- Tên dự án / Hạng mục: ${quoteProjectName}
- Danh sách hàng hóa & số lượng yêu cầu: ${quoteItemsDesc}
- Chiết khấu thương mại: ${quoteDiscount}

Yêu cầu xuất ra:
1. Bảng báo giá chi tiết (Markdown table: STT, Tên hàng, Đơn vị tính, Số lượng, Đơn giá niêm yết, % Chiết khấu, Đơn giá sau giảm, Thành tiền)
2. Tổng tiền hàng chưa VAT, Tiền VAT 8-10%, Tổng thanh toán sau thuế
3. Các điều khoản thương mại chuẩn mực (Thời hạn báo giá 15 ngày, phương thức thanh toán, tiến độ giao hàng, chính sách bảo hành chính hãng)
4. Mẫu thư ngỏ chào hàng lịch sự, chuyên nghiệp để gửi đính kèm email/Zalo.`;

      const reply = await callAiAssistant(prompt, 'quotes');
      setQuoteResult(reply);
    } catch (err) {
      console.error(err);
      setQuoteResult('Không thể tạo báo giá. Vui lòng thử lại.');
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  // Handle Customer Debt Care Tool
  const handleRunCustomerDebt = async () => {
    setIsGeneratingDebt(true);
    try {
      const prompt = `Tra cứu thông tin khách hàng "${selectedCustomerForDebt}", phân tích tình hình mua sắm, điểm tích lũy và số dư công nợ. 
Sau đó, soạn thảo thông điệp liên hệ theo phong cách "${debtMessageType === 'gentle' ? 'Nhắc nợ khéo léo, lịch sự, thân thiện' : debtMessageType === 'formal' ? 'Thông báo đối chiếu công nợ chính thức của phòng kế toán' : 'Chăm sóc tri ân khách hàng VIP kèm ưu đãi thanh toán sớm'}".
Thông điệp cần có số tiền nợ chính xác, số tài khoản nhận thanh toán QR và lời cảm ơn chân thành.`;

      const reply = await callAiAssistant(prompt, 'customers');
      setDebtResult(reply);
    } catch (err) {
      console.error(err);
      setDebtResult('Không thể xử lý dữ liệu khách hàng.');
    } finally {
      setIsGeneratingDebt(false);
    }
  };

  // Handle Business Intelligence Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Phân tích toàn diện hiệu suất kinh doanh của doanh nghiệp:
- Doanh thu: ${formatVND(totalRevenue)}
- Đơn hàng: ${safeOrders.length}
- Khách hàng: ${safeCustomers.length}
- Tồn kho cảnh báo thấp: ${lowStockCount} sản phẩm
- Công nợ chưa thu hồi: ${formatVND(totalDebt)}

Đưa ra báo cáo chi tiết gồm:
1. 📊 Đánh giá sức khỏe tài chính & dòng tiền
2. 🚀 4 Chiến lược tăng trưởng doanh thu trong 30 ngày tới
3. 📦 Đề xuất quản trị tồn kho thông minh (xử lý hàng tồn thấp & hàng bán chậm)
4. 💡 Ý tưởng khuyến mãi và Combo tăng giá trị trung bình đơn (AOV)
5. ⚡ Mẹo tối ưu hóa quy trình vận hành thu ngân & kỹ thuật bảo hành.`;

      const reply = await callAiAssistant(prompt, 'reports');
      setAnalysisReport(reply);
    } catch (err) {
      console.error(err);
      setAnalysisReport('Có lỗi xảy ra khi phân tích dữ liệu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle FAQ Generator
  const handleRunFaq = async () => {
    setIsGeneratingFaq(true);
    try {
      const prompt = `Đóng vai là chuyên viên tư vấn bán hàng & dịch vụ khách hàng xuất sắc của GP-ERP Enterprise.
Hãy giải đáp và cung cấp kịch bản xử lý tối ưu cho tình huống sau:
"${faqTopic}"

Yêu cầu cung cấp:
1. 🎯 Phân tích tâm lý và nguyên nhân khách hàng thắc mắc
2. 💬 Kịch bản câu trả lời trực tiếp tại quầy / qua điện thoại (ngắn gọn, thuyết phục, lịch thiệp)
3. 🛡️ Chính sách hỗ trợ / Giá trị gia tăng để chốt sale thành công (Bảo hành, ĐVT linh hoạt, Hỗ trợ kỹ thuật)
4. ❌ Những điều TUYỆT ĐỐI KHÔNG nên nói để tránh làm phật lòng khách hàng.`;

      const reply = await callAiAssistant(prompt, 'faq');
      setFaqResult(reply);
    } catch (err) {
      console.error(err);
      setFaqResult('Không thể tạo câu trả lời.');
    } finally {
      setIsGeneratingFaq(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100 bg-slate-950" id="ai-advisor-view">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-indigo-500/30 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/40 shrink-0">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg md:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Trợ Lý & Cố Vấn Doanh Nghiệp GP-Copilot AI</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm">
                GEMINI 3.7
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Hỗ trợ toàn diện: Tra cứu sản phẩm & ĐVT, lập báo giá B2B, quản lý khách hàng & công nợ, báo cáo KPIs & giải đáp thắc mắc khách hàng.
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <span>Sản phẩm: </span>
            <strong className="text-cyan-400 font-bold">{safeProducts.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <span>Khách hàng: </span>
            <strong className="text-purple-400 font-bold">{safeCustomers.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <span>Tồn thấp: </span>
            <strong className="text-rose-400 font-bold">{lowStockCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <span>Công nợ: </span>
            <strong className="text-amber-400 font-bold">{formatVND(totalDebt)}</strong>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
        <button
          onClick={() => setActiveTab('hub')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'hub'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Trợ Lý Toàn Năng (Chat Hub)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Tra Cứu Sản Phẩm & ĐVT</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'quotes'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          <span>Soạn Thảo Báo Giá AI</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span>Khách Hàng & Thu Hồi Nợ</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Báo Cáo & Dự Báo Kinh Doanh</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'faq'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-pink-400" />
          <span>Giải Đáp Thắc Mắc & CSKH</span>
        </button>
      </div>

      {/* TAB 1: ALL-IN-ONE CHAT HUB */}
      {activeTab === 'hub' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col h-[600px] overflow-hidden">
          {/* Quick suggestions header */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold whitespace-nowrap">Câu hỏi mẫu:</span>
              <button
                onClick={() => setInputQuery('Tìm sản phẩm dây điện Cadivi và cho biết giá từng đơn vị tính (Cuộn, Mét, Thùng)?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 whitespace-nowrap text-[11px] font-medium"
              >
                🔍 Tra cứu ĐVT & Giá
              </button>
              <button
                onClick={() => setInputQuery('Lập báo giá 20 bộ thiết bị điện và 50m cáp cho khách hàng thân thiết?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 whitespace-nowrap text-[11px] font-medium"
              >
                📋 Lập Báo Giá
              </button>
              <button
                onClick={() => setInputQuery('Khách hàng nào đang có dư nợ cao nhất và cần gửi mẫu tin nhắn nhắc nợ?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 whitespace-nowrap text-[11px] font-medium"
              >
                👥 Kiểm tra công nợ
              </button>
              <button
                onClick={() => setInputQuery('Tóm tắt báo cáo doanh thu và sản phẩm bán chạy nhất hôm nay?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 whitespace-nowrap text-[11px] font-medium"
              >
                📊 Tóm tắt KPIs
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none">
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10px] mt-2 ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/90 p-3 rounded-2xl border border-slate-700 w-fit shadow-md">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>GP-Copilot đang truy xuất cơ sở dữ liệu và soạn phản hồi...</span>
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendChat}
            className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Nhập câu hỏi tìm kiếm sản phẩm, đơn vị tính, báo giá, khách hàng, báo cáo..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !inputQuery.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PRODUCT SEARCH & PRICING UOM TOOL */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <span>Tra Cứu Thông Minh Sản Phẩm, Tồn Kho & Bảng Giá Theo Đơn Vị Tính</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  AI sẽ quét toàn bộ danh mục sản phẩm, tìm kiếm theo quy cách đóng gói và xuất ra bảng giá tương ứng cho từng đơn vị tính (Thùng, Cuộn, Mét, Kg, Gam, Hộp...).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={productSearchKeyword}
                onChange={(e) => setProductSearchKeyword(e.target.value)}
                placeholder="Nhập tên sản phẩm, mã SKU hoặc từ khóa (VD: Dây điện, Gạo, Sữa, Bia...)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleRunProductSearch}
                disabled={isSearchingProduct || !productSearchKeyword.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isSearchingProduct ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Tra Cứu...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Tra Cứu & Báo Giá ĐVT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {productSearchResult ? (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 relative group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Kết Quả Tra Cứu Sản Phẩm & Quy Cách Đơn Vị Tính</span>
                </h4>
                <button
                  onClick={() => handleCopyText('product', productSearchResult)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedSection === 'product' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'product' ? 'Đã sao chép' : 'Sao chép kết quả'}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 prose prose-invert max-w-none">
                {productSearchResult}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Nhập từ khóa và bấm "Tra Cứu & Báo Giá ĐVT"</p>
              <p className="text-xs text-slate-500">
                Hệ thống sẽ tổng hợp giá bán lẻ, giá sỉ và quy đổi tồn kho theo từng đơn vị tính để phục vụ bán lẻ và làm báo giá.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INSTANT QUOTATION ASSISTANT */}
      {activeTab === 'quotes' && (
        <div className="space-y-5">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Soạn Thảo Báo Giá Dự Án & B2B Tự Động Bằng AI</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tự động tính toán thành tiền, chiết khấu thương mại, thuế VAT và soạn thư chào giá gửi đối tác.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên khách hàng / Công ty:</label>
                <input
                  type="text"
                  value={quoteCustomerName}
                  onChange={(e) => setQuoteCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên công trình / Hạng mục:</label>
                <input
                  type="text"
                  value={quoteProjectName}
                  onChange={(e) => setQuoteProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Danh sách sản phẩm & số lượng yêu cầu:</label>
                <textarea
                  rows={2}
                  value={quoteItemsDesc}
                  onChange={(e) => setQuoteItemsDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="VD: 50 cuộn Dây Cadivi, 30 hộp Ổ cắm, 10 bộ Cầu dao..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chiết khấu đề xuất:</label>
                <input
                  type="text"
                  value={quoteDiscount}
                  onChange={(e) => setQuoteDiscount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end justify-end">
                <button
                  onClick={handleRunQuoteGenerator}
                  disabled={isGeneratingQuote}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingQuote ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Soạn Thảo Báo Giá...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo Bảng Báo Giá Chi Tiết</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {quoteResult && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-blue-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Bảng Báo Giá & Thư Ngỏ Chào Hàng Từ AI</span>
                </h4>
                <button
                  onClick={() => handleCopyText('quote', quoteResult)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedSection === 'quote' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'quote' ? 'Đã sao chép' : 'Sao chép toàn bộ'}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 prose prose-invert max-w-none">
                {quoteResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMER LOOKUP & DEBT RECOVERY */}
      {activeTab === 'customers' && (
        <div className="space-y-5">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Tra Cứu Khách Hàng, Quản Lý Công Nợ & Soạn Tin Nhắn Chăm Sóc</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kiểm tra nhanh số nợ còn lại, điểm tích lũy thành viên và tạo tin nhắn Zalo/SMS nhắc nợ khéo léo hoặc tri ân VIP.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chọn hoặc nhập tên khách hàng:</label>
                <select
                  value={selectedCustomerForDebt}
                  onChange={(e) => setSelectedCustomerForDebt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {safeCustomers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.phone}) - Nợ: {formatVND(c.debt)} [{c.tier}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mục đích thông điệp:</label>
                <select
                  value={debtMessageType}
                  onChange={(e) => setDebtMessageType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="gentle">💬 Nhắc nợ khéo léo, thân thiện kèm mã QR</option>
                  <option value="formal">📑 Thông báo đối chiếu công nợ kế toán chính thức</option>
                  <option value="vip_care">🎁 Tri ân khách hàng VIP & Tặng voucher mua tiếp</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={handleRunCustomerDebt}
                  disabled={isGeneratingDebt}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingDebt ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Phân Tích & Soạn Tin...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo Mẫu Tin Nhắn Chăm Sóc Khách Hàng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {debtResult && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-purple-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Nội Dung Đề Xuất Từ Trợ Lý AI</span>
                </h4>
                <button
                  onClick={() => handleCopyText('debt', debtResult)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedSection === 'debt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'debt' ? 'Đã sao chép' : 'Sao chép tin nhắn'}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 prose prose-invert max-w-none">
                {debtResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BUSINESS INTELLIGENCE & REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Báo Cáo Đánh Giá Hiệu Suất & Dự Báo Kinh Doanh AI</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mô hình Gemini sẽ tổng hợp dữ liệu {safeOrders.length} đơn hàng, {safeProducts.length} sản phẩm, {safeCustomers.length} khách hàng và công nợ để đề xuất chiến lược.
                </p>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all shrink-0 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Phân Tích Toàn Diện...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Chạy Báo Cáo Phân Tích Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {analysisReport && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Báo Cáo Phân Tích & Chiến Lược Đột Phá Doanh Số</span>
                </h4>
                <button
                  onClick={() => handleCopyText('analysis', analysisReport)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedSection === 'analysis' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'analysis' ? 'Đã sao chép' : 'Sao chép báo cáo'}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 prose prose-invert max-w-none">
                {analysisReport}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CUSTOMER FAQ & OBJECTION HANDLING */}
      {activeTab === 'faq' && (
        <div className="space-y-5">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-pink-400" />
                <span>Giải Đáp Thắc Mắc, Xử Lý Khiếu Nại & Tư Vấn Bán Hàng</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Huấn luyện nhân viên cách giải đáp tình huống khó, phản hồi thắc mắc về giá theo đơn vị tính, bảo hành 1 đổi 1 và kỹ thuật.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-300 font-semibold">Tình huống / Thắc mắc của khách hàng:</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setFaqTopic('Khách phàn nàn giá theo Mét đắt hơn mua cả Cuộn và đòi giảm giá sâu')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 text-[11px]"
                >
                  💡 So sánh giá Mét vs Cuộn
                </button>
                <button
                  type="button"
                  onClick={() => setFaqTopic('Khách hỏi điều kiện bảo hành 1 đổi 1 trong 30 ngày và thủ tục tiếp nhận serial/QR')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px]"
                >
                  🛡️ Chính sách bảo hành 1 đổi 1
                </button>
                <button
                  type="button"
                  onClick={() => setFaqTopic('Khách chê giá đắt hơn cửa hàng đối thủ và muốn hủy đơn')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px]"
                >
                  ⚡ Xử lý từ chối giá đắt
                </button>
              </div>

              <textarea
                rows={2}
                value={faqTopic}
                onChange={(e) => setFaqTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleRunFaq}
                  disabled={isGeneratingFaq}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingFaq ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Soạn Kịch Bản Tư Vấn...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo Kịch Bản Giải Đáp Thuyết Phục</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {faqResult && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-pink-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Kịch Bản Giải Đáp & Hướng Dẫn Tư Vấn Khách Hàng</span>
                </h4>
                <button
                  onClick={() => handleCopyText('faq', faqResult)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedSection === 'faq' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'faq' ? 'Đã sao chép' : 'Sao chép kịch bản'}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800 prose prose-invert max-w-none">
                {faqResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
