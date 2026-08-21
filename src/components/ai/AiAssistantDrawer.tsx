import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RefreshCw,
  Search,
  FileSpreadsheet,
  Users,
  BarChart3,
  HelpCircle,
  Wrench,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Trash2,
  ArrowRight,
  ExternalLink,
  Tag,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Boxes,
  Zap,
} from 'lucide-react';
import {
  Product,
  Customer,
  PriceQuote,
  Order,
  WarrantyTicket,
  StoreSettings,
  EInvoice,
  LaborContract,
  Employee,
  AccountingRecord,
} from '../../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  customers?: Customer[];
  quotes?: PriceQuote[];
  orders?: Order[];
  warranties?: WarrantyTicket[];
  eInvoices?: EInvoice[];
  laborContracts?: LaborContract[];
  employees?: Employee[];
  accountingRecords?: AccountingRecord[];
  settings?: StoreSettings;
  onNavigate?: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: string;
  actionLinks?: {
    label: string;
    tab: string;
    icon?: string;
  }[];
}

type AssistantCategory =
  | 'all'
  | 'products'
  | 'quotes'
  | 'einvoice'
  | 'contract'
  | 'customers'
  | 'reports'
  | 'faq'
  | 'warranty';

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  products = [],
  customers = [],
  quotes = [],
  orders = [],
  warranties = [],
  eInvoices = [],
  laborContracts = [],
  employees = [],
  accountingRecords = [],
  settings,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssistantCategory>('all');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeWarranties = Array.isArray(warranties) ? warranties : [];
  const safeEInvoices = Array.isArray(eInvoices) ? eInvoices : [];
  const safeContracts = Array.isArray(laborContracts) ? laborContracts : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeRecords = Array.isArray(accountingRecords) ? accountingRecords : [];

  // Metrics summary
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalDebt = safeCustomers.reduce((sum, c) => sum + (c.debt || 0), 0);
  const lowStockCount = safeProducts.filter((p) => p && p.stock <= p.minStock).length;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Xin chào! Tôi là **GP-Copilot AI** - Trợ lý Doanh nghiệp & Kế toán Toàn diện 2026. 

Tôi sẵn sàng hỗ trợ bạn tức thì:
- 🔍 **Tìm kiếm sản phẩm & tra cứu đơn vị tính (UOM) & giá bán lẻ/buôn** (Thùng, Cuộn, Mét, Kg, Hộp...).
- 🧾 **Hóa Đơn Điện Tử TT78/NĐ123**: Tra cứu số hóa đơn, kiểm tra mã xác thực CQT, xuất VAT & ký số điện tử.
- 📜 **Hợp Đồng Lao Động Điện Tử & HR**: Kiểm tra hợp đồng, chức danh, mức lương cơ bản, phụ cấp & ký số điện tử.
- 📋 **Hỗ trợ tạo & tính toán Báo Giá (Quotes)** chiết khấu chuyên nghiệp.
- 👥 **Tra cứu Khách hàng, điểm thưởng & kiểm tra công nợ** cần thu hồi.
- 📊 **Báo cáo nhanh doanh số, lợi nhuận & cảnh báo tồn kho**.
- 🛡️ **Giải đáp chính sách bảo hành, bảo trì serial & thắc mắc khách hàng/nhân viên**.

Hãy chọn gợi ý bên dưới hoặc nhập câu hỏi trực tiếp!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      category: 'all',
      actionLinks: [
        { label: 'Bán Hàng POS (F2)', tab: 'pos' },
        { label: 'Hóa Đơn Điện Tử', tab: 'accounting' },
        { label: 'Hợp Đồng Lao Động', tab: 'hr' },
        { label: 'Kho Hàng & ĐVT', tab: 'inventory' },
      ],
    },
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Keyboard shortcut listener (ESC to close, F1 to trigger handled in parent)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categories = [
    { id: 'all', label: 'Tất Cả', icon: Sparkles, color: 'text-amber-400' },
    { id: 'products', label: 'Sản Phẩm & ĐVT', icon: Search, color: 'text-cyan-400' },
    { id: 'einvoice', label: 'Hóa Đơn Điện Tử', icon: Tag, color: 'text-emerald-400' },
    { id: 'contract', label: 'HĐ Lao Động & HR', icon: Users, color: 'text-indigo-400' },
    { id: 'quotes', label: 'Báo Giá Dự Án', icon: FileSpreadsheet, color: 'text-blue-400' },
    { id: 'customers', label: 'Khách Hàng & Nợ', icon: Users, color: 'text-purple-400' },
    { id: 'reports', label: 'Báo Cáo & KPIs', icon: BarChart3, color: 'text-emerald-400' },
    { id: 'warranty', label: 'Bảo Hành & Serial', icon: Wrench, color: 'text-orange-400' },
    { id: 'faq', label: 'Giải Đáp Thắc Mắc', icon: HelpCircle, color: 'text-pink-400' },
  ];

  const quickPrompts: Record<AssistantCategory, string[]> = {
    all: [
      '🔍 Tìm sản phẩm dây điện & cáp Cadivi kèm các đơn vị tính và giá',
      '🧾 Tra cứu danh sách Hóa đơn điện tử gần nhất và trạng thái cấp mã CQT',
      '📜 Hợp đồng lao động của nhân viên nào sắp đến hạn tái ký?',
      '📋 Lập báo giá 50 cuộn cáp và 20 ổ cắm cho khách VIP chiết khấu 10%',
      '👥 Danh sách khách hàng có công nợ cần gửi tin nhắn nhắc nợ',
      '📊 Tóm tắt tình hình doanh thu và các sản phẩm bán chạy nhất',
      '🛡️ Tra cứu chính sách bảo hành 1 đổi 1 và quy trình tiếp nhận',
    ],
    products: [
      'Tìm tất cả sản phẩm thuộc nhóm Điện tử & Cáp điện và xem bảng giá theo ĐVT',
      'Sản phẩm nào đang bị tồn kho dưới mức an toàn cần nhập gấp?',
      'Quy cách 1 Thùng cáp điện gồm bao nhiêu Cuộn, Mét, Kg và giá bán lẻ từng mức?',
      'Tìm kiếm sản phẩm giá dưới 50.000đ để tư vấn kèm khi bán lẻ',
    ],
    einvoice: [
      'Tra cứu các hóa đơn GTGT đã được Cơ quan thuế (CQT) cấp mã thành công',
      'Quy trình xuất hóa đơn điện tử theo Nghị định 123/2020/NĐ-CP và Thông tư 78?',
      'Hướng dẫn ký số điện tử bằng USB Token / Chữ ký số HSM khi phát hành hóa đơn',
      'Kiểm tra hóa đơn bán cho Công ty Xây Dựng An Phát mã tra cứu là gì?',
    ],
    contract: [
      'Kiểm tra danh sách hợp đồng lao động đang hiệu lực và mức lương cơ bản từng nhân sự',
      'Quy định thời gian thử việc tối đa và mức lương thử việc theo Bộ luật Lao động 2019?',
      'Hướng dẫn ký điện tử hợp đồng lao động và bàn giao bản sao cho người lao động',
      'Bảng tính hoa hồng bán hàng và tổng thu nhập nhân viên tháng này',
    ],
    quotes: [
      'Lập bảng báo giá chi tiết cho Dự án Tòa nhà Công ty An Phát với 100m cáp và 20 bộ thiết bị',
      'Soạn thư ngỏ gửi email báo giá chuyên nghiệp và cam kết giao hàng tận nơi',
      'Kiểm tra danh sách báo giá đang chờ khách hàng duyệt',
      'Đề xuất mức chiết khấu tối ưu theo số lượng mua để tối đa hóa lợi nhuận',
    ],
    customers: [
      'Tra cứu khách hàng VIP và kiểm tra lịch sử mua sắm gần đây',
      'Tổng số tiền công nợ khách hàng hiện tại và khách hàng có dư nợ cao nhất?',
      'Soạn mẫu tin nhắn Zalo chăm sóc khách hàng thân thiết nhân dịp cuối tuần',
      'Soạn mẫu tin nhắn nhắc công nợ khéo léo, lịch sự và hỗ trợ chuyển khoản QR',
    ],
    reports: [
      'Báo cáo tổng quan hiệu suất bán hàng: Doanh thu, số đơn, lợi nhuận gộp',
      'Những mặt hàng nào đem lại tỷ suất lợi nhuận cao nhất trong hệ thống?',
      'Đánh giá dòng tiền và tồn kho hiện tại để lên kế hoạch nhập hàng tháng tới',
    ],
    warranty: [
      'Có bao nhiêu phiếu bảo hành / sửa chữa đang tiếp nhận chờ linh kiện?',
      'Quy trình tiếp nhận thiết bị có số Serial / mã QR và in phiếu hẹn trả khách',
      'Quy định bảo hành 1 đổi 1 trong 30 ngày đầu tiên áp dụng như thế nào?',
    ],
    faq: [
      'Khách hàng thắc mắc tại sao mua theo Mét lại đắt hơn mua nguyên Cuộn?',
      'Kịch bản xử lý khi khách hàng phàn nàn giá đắt hơn cửa hàng khác',
      'Cách hướng dẫn khách quét mã QR VietQR để thanh toán không tiền mặt',
    ],
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Package full enterprise context
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
          query: textToSend,
          category: selectedCategory,
          messages: messages.slice(-8).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          systemContext,
        }),
      });

      const data = await response.json();

      // Determine smart action links based on context
      const lowerQuery = textToSend.toLowerCase();
      const actionLinks: Message['actionLinks'] = [];

      if (lowerQuery.includes('hóa đơn') || lowerQuery.includes('invoice') || lowerQuery.includes('cqt') || lowerQuery.includes('thuế') || lowerQuery.includes('vat')) {
        actionLinks.push({ label: 'Quản Lý Hóa Đơn Điện Tử', tab: 'accounting' });
      }
      if (lowerQuery.includes('hợp đồng') || lowerQuery.includes('lao động') || lowerQuery.includes('nhân sự') || lowerQuery.includes('lương') || lowerQuery.includes('thử việc') || lowerQuery.includes('hr')) {
        actionLinks.push({ label: 'Quản Trị HR & Hợp Đồng', tab: 'hr' });
      }
      if (lowerQuery.includes('sản phẩm') || lowerQuery.includes('kho') || lowerQuery.includes('đơn vị tính') || lowerQuery.includes('uom') || lowerQuery.includes('tồn')) {
        actionLinks.push({ label: 'Mở Kho Hàng & ĐVT', tab: 'inventory' });
        actionLinks.push({ label: 'Bán Hàng (POS)', tab: 'pos' });
      }
      if (lowerQuery.includes('báo giá') || lowerQuery.includes('quote') || lowerQuery.includes('dự án') || lowerQuery.includes('chiết khấu')) {
        actionLinks.push({ label: 'Quản Lý Báo Giá', tab: 'quotes' });
      }
      if (lowerQuery.includes('khách hàng') || lowerQuery.includes('nợ') || lowerQuery.includes('công nợ') || lowerQuery.includes('crm')) {
        actionLinks.push({ label: 'Khách Hàng & CRM', tab: 'customers' });
        actionLinks.push({ label: 'Kế Toán & Thu Chi', tab: 'accounting' });
      }
      if (lowerQuery.includes('báo cáo') || lowerQuery.includes('doanh thu') || lowerQuery.includes('lợi nhuận') || lowerQuery.includes('kpi')) {
        actionLinks.push({ label: 'Báo Cáo & Phân Tích', tab: 'analytics' });
      }
      if (lowerQuery.includes('bảo hành') || lowerQuery.includes('bảo trì') || lowerQuery.includes('serial') || lowerQuery.includes('sửa chữa')) {
        actionLinks.push({ label: 'Bảo Hành & Bảo Trì', tab: 'warranties' });
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Đã xử lý thông tin thành công.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        category: selectedCategory,
        actionLinks: actionLinks.length > 0 ? actionLinks : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Error connecting to AI Assistant:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Không thể kết nối đến Trợ Lý AI Gemini.**\n\nVui lòng kiểm tra lại mạng máy chủ hoặc thử lại câu hỏi ngắn hơn.`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Đã làm mới cuộc hội thoại! Bạn cần trợ giúp tra cứu sản phẩm, lập báo giá, quản lý khách hàng hay phân tích báo cáo gì ngay lúc này?`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 flex flex-col bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 transition-all duration-300 ${
        isExpanded ? 'w-full md:w-[750px] lg:w-[880px]' : 'w-full sm:w-[480px] md:w-[540px]'
      }`}
      id="ai-assistant-drawer"
    >
      {/* Drawer Header */}
      <div className="p-3.5 md:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-indigo-400/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm md:text-base text-white truncate flex items-center space-x-1.5">
                <span>GP-Copilot AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30">
                  Gemini 3.7
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Trợ lý Doanh nghiệp: Tra cứu SP, Báo giá, CRM, Báo cáo & FAQ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Làm mới đoạn hội thoại"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
            title={isExpanded ? 'Thu nhỏ' : 'Mở rộng cửa sổ'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng trợ lý (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Pills Nav */}
      <div className="p-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto flex space-x-1.5 shrink-0 custom-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as AssistantCategory)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3.5 bg-slate-950/70 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-bold text-xs'
                  : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white'
              }`}
            >
              {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] md:max-w-[88%] rounded-2xl p-3 md:p-3.5 text-xs leading-relaxed shadow-md relative group ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {/* Copy button */}
              {msg.sender === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="absolute top-2 right-2 p-1 rounded-md bg-slate-800/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Sao chép câu trả lời"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Message Content formatted */}
              <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none break-words">
                {msg.text}
              </div>

              {/* Action links if available */}
              {msg.actionLinks && msg.actionLinks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block w-full mb-0.5">
                    Hành Động Đề Xuất:
                  </span>
                  {msg.actionLinks.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(action.tab);
                          onClose();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-[9px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2.5 animate-in fade-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-300 flex items-center space-x-2 shadow-md">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>GP-Copilot đang tra cứu dữ liệu và soạn thảo câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions Carousel */}
      <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 shrink-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Gợi Ý Thao Tác Nhanh ({categories.find((c) => c.id === selectedCategory)?.label}):</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {quickPrompts[selectedCategory]?.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] whitespace-nowrap transition-colors flex items-center space-x-1 shrink-0 disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="line-clamp-1">{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Hỏi AI về tìm sản phẩm, lập báo giá, nợ khách hàng, doanh thu..."
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={() => setInputQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 disabled:shadow-none shrink-0"
          title="Gửi câu hỏi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
