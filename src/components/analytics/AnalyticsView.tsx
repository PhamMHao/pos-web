import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Download,
  Printer,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Award,
  UserCheck,
  Phone,
  ChevronDown,
  RefreshCw,
  Eye,
  Sparkles,
  Box,
  ArrowRight,
  Wallet,
  CreditCard,
  QrCode,
  Building,
  ShoppingCart,
  TrendingDown,
  Table as TableIcon,
  Activity,
  Users,
  Truck,
  Building2,
  Clock,
  Briefcase,
  FileCheck,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Search,
  Wrench,
  Package,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Order,
  Product,
  Customer,
  Employee,
  LaborContract,
  CashShift,
  Supplier,
  PurchaseOrder,
  EnterpriseAsset,
  StoreSettings,
  KpiEvaluation,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { KpiEvaluationReportModal } from '../hr/KpiEvaluationReportModal';
import { generateInitialKpiEvaluations } from '../../utils/kpiDefaults';

export interface AnalyticsViewProps {
  orders?: Order[];
  products?: Product[];
  customers?: Customer[];
  employees?: Employee[];
  laborContracts?: LaborContract[];
  shifts?: CashShift[];
  suppliers?: Supplier[];
  purchaseOrders?: PurchaseOrder[];
  assets?: EnterpriseAsset[];
  settings?: StoreSettings;
  onNavigate?: (tab: string) => void;
  onOpenPO?: () => void;
}

const PALETTE = {
  primary: '#10b981', // Emerald
  secondary: '#06b6d4', // Cyan
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Rose/Red
  purple: '#8b5cf6', // Violet
  pink: '#ec4899', // Pink
  blue: '#3b82f6', // Blue
  indigo: '#6366f1', // Indigo
};

const CHART_COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'];

const PAYMENT_METHOD_MAP: Record<string, { label: string; color: string }> = {
  transfer: { label: 'Chuyển khoản (VietQR)', color: '#06b6d4' },
  cash: { label: 'Tiền mặt', color: '#10b981' },
  card: { label: 'Quẹt thẻ POS', color: '#8b5cf6' },
  momo: { label: 'Ví điện tử MoMo', color: '#ec4899' },
  debt: { label: 'Ghi nợ / Thu sau', color: '#f59e0b' },
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders = [],
  products = [],
  customers = [],
  employees = [],
  laborContracts = [],
  shifts = [],
  suppliers = [],
  purchaseOrders = [],
  assets = [],
  settings,
  onNavigate,
  onOpenPO,
}) => {
  // Main Sub-Tab State
  const [activeMainTab, setActiveMainTab] = useState<
    'overview' | 'hr_kpi' | 'partners_supply' | 'assets_lifecycle'
  >('overview');

  // Multi-Dimensional Filters
  const [timeRange, setTimeRange] = useState<
    'today' | '7days' | '14days' | '30days' | 'month' | 'quarter' | 'custom' | 'all'
  >('30days');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Custom Date Range (Default: past 30 days)
  const defaultDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }, []);
  const [customStartDate, setCustomStartDate] = useState<string>(defaultDates.start);
  const [customEndDate, setCustomEndDate] = useState<string>(defaultDates.end);

  // View state toggles
  const [dailyChartType, setDailyChartType] = useState<'area' | 'bar' | 'table'>('area');
  const [bestSellerMetric, setBestSellerMetric] = useState<'revenue' | 'quantity'>('revenue');
  const [showKpiReportModal, setShowKpiReportModal] = useState<boolean>(false);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeContracts = Array.isArray(laborContracts) ? laborContracts : [];
  const safeShifts = Array.isArray(shifts) ? shifts : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safePurchaseOrders = Array.isArray(purchaseOrders) ? purchaseOrders : [];
  const safeAssets = Array.isArray(assets) ? assets : [];

  // Available Channels
  const availableChannels = useMemo(() => {
    const chSet = new Set<string>();
    safeOrders.forEach((o) => {
      if (o.channel) chSet.add(o.channel);
    });
    return Array.from(chSet);
  }, [safeOrders]);

  // Available Categories
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    safeProducts.forEach((p) => {
      if (p.category) catSet.add(p.category);
    });
    return Array.from(catSet);
  }, [safeProducts]);

  // Date & Multi-dimensional Filtering Logic for Orders
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentQuarter = Math.floor(currentMonth / 3);

    return safeOrders.filter((o) => {
      if (!o) return false;

      // Filter by Channel
      if (channelFilter !== 'all' && o.channel !== channelFilter) {
        return false;
      }

      // Filter by Customer
      if (customerFilter !== 'all') {
        const custId = o.customer?.id || (o as any).customerId;
        const custName = o.customer?.name || (o as any).customerName;
        if (custId !== customerFilter && custName !== customerFilter) {
          return false;
        }
      }

      // Filter by Category / Material (Order contains items with this category)
      if (categoryFilter !== 'all') {
        const hasCat = (o.items || []).some((it) => {
          const prod = safeProducts.find((p) => p.id === it.productId || p.sku === it.sku);
          return prod?.category === categoryFilter;
        });
        if (!hasCat) return false;
      }

      // Filter by Search Keyword (in code, customer, or items)
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const codeMatch = (o.code || '').toLowerCase().includes(kw);
        const custMatch = (o.customer?.name || '').toLowerCase().includes(kw);
        const itemMatch = (o.items || []).some((it) => (it.productName || '').toLowerCase().includes(kw) || (it.sku || '').toLowerCase().includes(kw));
        if (!codeMatch && !custMatch && !itemMatch) return false;
      }

      if (!o.createdAt) return timeRange === 'all';
      const orderDateStr = o.createdAt.slice(0, 10);
      const orderDate = new Date(orderDateStr);

      if (timeRange === 'today') {
        return orderDateStr === todayStr;
      }
      if (timeRange === '7days') {
        const d7 = new Date();
        d7.setDate(now.getDate() - 7);
        return orderDate >= d7;
      }
      if (timeRange === '14days') {
        const d14 = new Date();
        d14.setDate(now.getDate() - 14);
        return orderDate >= d14;
      }
      if (timeRange === '30days') {
        const d30 = new Date();
        d30.setDate(now.getDate() - 30);
        return orderDate >= d30;
      }
      if (timeRange === 'month') {
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }
      if (timeRange === 'quarter') {
        const orderQuarter = Math.floor(orderDate.getMonth() / 3);
        return orderQuarter === currentQuarter && orderDate.getFullYear() === currentYear;
      }
      if (timeRange === 'custom') {
        if (!customStartDate && !customEndDate) return true;
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
        return true;
      }
      return true; // 'all'
    });
  }, [safeOrders, timeRange, channelFilter, customerFilter, categoryFilter, searchKeyword, customStartDate, customEndDate, safeProducts]);

  // Completed / Paid Orders for KPI
  const completedOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) => o && (o.status === 'completed' || o.paymentStatus === 'paid' || (o.paidAmount && o.paidAmount > 0))
    );
  }, [filteredOrders]);

  // 1. Overview Financial Calculations
  const totalRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [completedOrders]);

  const totalCost = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);
  }, [completedOrders]);

  const grossProfit = useMemo(() => {
    return totalRevenue - totalCost;
  }, [totalRevenue, totalCost]);

  const profitMargin = useMemo(() => {
    return totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
  }, [totalRevenue, grossProfit]);

  const averageOrderValue = useMemo(() => {
    return completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
  }, [completedOrders, totalRevenue]);

  const totalItemsSold = useMemo(() => {
    return completedOrders.reduce((sum, o) => {
      const itemsQty = (o.items || []).reduce((iSum, it) => iSum + (Number(it.quantity) || 0), 0);
      return sum + itemsQty;
    }, 0);
  }, [completedOrders]);

  const avgItemsPerOrder = useMemo(() => {
    return completedOrders.length > 0 ? (totalItemsSold / completedOrders.length).toFixed(1) : '0';
  }, [completedOrders, totalItemsSold]);

  // 2. Inventory Metrics
  const inventoryMetrics = useMemo(() => {
    let totalStockCapital = 0;
    let totalStockUnits = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let safeStockCount = 0;

    safeProducts.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const cost = Number(p.costPrice) || 0;
      const min = Number(p.minStock) || 5;

      totalStockUnits += stock;
      totalStockCapital += stock * cost;

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= min) {
        lowStockCount++;
      } else {
        safeStockCount++;
      }
    });

    const totalSku = safeProducts.length;
    const safePercent = totalSku > 0 ? Math.round((safeStockCount / totalSku) * 100) : 0;
    const lowStockPercent = totalSku > 0 ? Math.round((lowStockCount / totalSku) * 100) : 0;
    const outOfStockPercent = totalSku > 0 ? Math.round((outOfStockCount / totalSku) * 100) : 0;

    return {
      totalStockCapital,
      totalStockUnits,
      totalSku,
      safeStockCount,
      lowStockCount,
      outOfStockCount,
      safePercent,
      lowStockPercent,
      outOfStockPercent,
    };
  }, [safeProducts]);

  // 3. Daily Timeline Data
  const dailyTimelineData = useMemo(() => {
    const dailyMap: Record<
      string,
      { date: string; DoanhThu: number; GiaVon: number; LoiNhuan: number; OrderCount: number }
    > = {};

    completedOrders.forEach((o) => {
      const dateKey = o.createdAt ? o.createdAt.slice(0, 10) : 'Khác';
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          DoanhThu: 0,
          GiaVon: 0,
          LoiNhuan: 0,
          OrderCount: 0,
        };
      }
      dailyMap[dateKey].DoanhThu += Number(o.total) || 0;
      dailyMap[dateKey].GiaVon += Number(o.totalCost) || 0;
      dailyMap[dateKey].LoiNhuan += (Number(o.total) || 0) - (Number(o.totalCost) || 0);
      dailyMap[dateKey].OrderCount += 1;
    });

    const sortedDates = Object.keys(dailyMap).sort();

    return sortedDates.map((d) => {
      const parts = d.split('-');
      const displayLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
      const profit = dailyMap[d].LoiNhuan;
      const rev = dailyMap[d].DoanhThu;
      const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0';
      return {
        fullDate: d,
        date: displayLabel,
        DoanhThu: rev,
        GiaVon: dailyMap[d].GiaVon,
        LoiNhuan: profit,
        OrderCount: dailyMap[d].OrderCount,
        margin: `${margin}%`,
      };
    });
  }, [completedOrders]);

  // 4. Top Best Seller Products
  const topProducts = useMemo(() => {
    const map: Record<
      string,
      {
        productId: string;
        name: string;
        sku: string;
        quantity: number;
        revenue: number;
        profit: number;
        currentStock: number;
        minStock: number;
      }
    > = {};

    completedOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const prod = safeProducts.find((p) => p.id === item.productId || p.sku === item.sku);
        const pid = item.productId || item.sku || item.productName;
        if (!map[pid]) {
          map[pid] = {
            productId: pid,
            name: item.productName || 'Sản phẩm',
            sku: item.sku || '',
            quantity: 0,
            revenue: 0,
            profit: 0,
            currentStock: prod?.stock ?? 0,
            minStock: prod?.minStock ?? 5,
          };
        }
        map[pid].quantity += Number(item.quantity) || 0;
        map[pid].revenue += Number(item.total) || 0;
        const itemCost = Number(item.costPrice) || (prod?.costPrice ?? 0);
        map[pid].profit += (Number(item.total) || 0) - itemCost * (Number(item.quantity) || 0);
      });
    });

    const list = Object.values(map);
    if (bestSellerMetric === 'revenue') {
      list.sort((a, b) => b.revenue - a.revenue);
    } else {
      list.sort((a, b) => b.quantity - a.quantity);
    }
    return list;
  }, [completedOrders, safeProducts, bestSellerMetric]);

  const top6ProductsForChart = useMemo(() => {
    return topProducts.slice(0, 6).map((item) => ({
      ...item,
      displayName: item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name,
    }));
  }, [topProducts]);

  // 5. Category Inventory Breakdown
  const categoryInventory = useMemo(() => {
    const map: Record<string, { name: string; capital: number; stock: number; skuCount: number }> = {};

    safeProducts.forEach((p) => {
      const cat = p.category || 'Khác';
      const cost = Number(p.costPrice) || 0;
      const stock = Number(p.stock) || 0;

      if (!map[cat]) {
        map[cat] = { name: cat, capital: 0, stock: 0, skuCount: 0 };
      }
      map[cat].capital += stock * cost;
      map[cat].stock += stock;
      map[cat].skuCount += 1;
    });

    const totalVal = Object.values(map).reduce((sum, c) => sum + c.capital, 0);

    return Object.values(map)
      .map((c) => ({
        ...c,
        percentage: totalVal > 0 ? ((c.capital / totalVal) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.capital - a.capital);
  }, [safeProducts]);

  // 6. Channel Breakdown
  const channelData = useMemo(() => {
    const map: Record<string, { name: string; value: number; count: number }> = {};
    completedOrders.forEach((o) => {
      const ch = o.channel || 'Khác';
      if (!map[ch]) {
        map[ch] = { name: ch, value: 0, count: 0 };
      }
      map[ch].value += Number(o.total) || 0;
      map[ch].count += 1;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [completedOrders]);

  // 7. Payment Method Breakdown
  const paymentMethodData = useMemo(() => {
    const map: Record<string, { key: string; name: string; value: number; count: number; color: string }> = {};

    completedOrders.forEach((o) => {
      const m = o.paymentMethod || 'cash';
      const info = PAYMENT_METHOD_MAP[m] || { label: m, color: '#94a3b8' };

      if (!map[m]) {
        map[m] = { key: m, name: info.label, value: 0, count: 0, color: info.color };
      }
      map[m].value += Number(o.total) || 0;
      map[m].count += 1;
    });

    const totalPay = Object.values(map).reduce((sum, p) => sum + p.value, 0);

    return Object.values(map).map((p) => ({
      ...p,
      percentage: totalPay > 0 ? ((p.value / totalPay) * 100).toFixed(1) : '0',
    }));
  }, [completedOrders]);

  // 8. Restock Urgency List
  const restockUrgentList = useMemo(() => {
    return safeProducts
      .filter((p) => p && Number(p.stock) <= Number(p.minStock))
      .map((p) => {
        const soldCount = completedOrders.reduce((sum, o) => {
          const it = (o.items || []).find((i) => i.productId === p.id || i.sku === p.sku);
          return sum + (it ? Number(it.quantity) || 0 : 0);
        }, 0);
        const suggestedReorder = Math.max(10, (p.minStock || 5) * 3 - (p.stock || 0));

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          stock: p.stock,
          minStock: p.minStock,
          costPrice: p.costPrice,
          soldCount,
          suggestedReorder,
          warehouse: p.warehouse || 'Kho Tổng',
        };
      })
      .sort((a, b) => a.stock - b.stock || b.soldCount - a.soldCount)
      .slice(0, 5);
  }, [safeProducts, completedOrders]);

  // 9. HR Performance Metrics & Scorecards
  const hrPerformanceData = useMemo(() => {
    return safeEmployees.map((emp) => {
      const sales = Number(emp.currentSales) || 0;
      const target = Number(emp.salesKpiTarget) || 50000000;
      const rate = Number(emp.commissionRate) || 1;
      const commission = Math.round((sales * rate) / 100);
      const totalIncome = (Number(emp.baseSalary) || 0) + commission;
      const kpiCompletion = target > 0 ? Math.round((sales / target) * 100) : 100;

      // Calculate matching labor contract status
      const contract = safeContracts.find(
        (c) => c.employeeId === emp.id || c.employeeName?.toLowerCase() === emp.name.toLowerCase()
      );

      // Estimated working hours & attendance (based on shifts or standard 176h)
      const empShifts = safeShifts.filter((s) => s.staffName?.toLowerCase() === emp.name.toLowerCase());
      const shiftCount = empShifts.length > 0 ? empShifts.length : 22;
      const workHours = shiftCount * 8;
      const attendanceRate = Math.min(100, Math.max(90, 95 + (emp.id.charCodeAt(emp.id.length - 1) % 5)));

      return {
        id: emp.id,
        code: emp.code,
        name: emp.name,
        role: emp.role,
        shiftSchedule: emp.shiftSchedule || 'Ca Chuẩn (08:00 - 17:00)',
        baseSalary: emp.baseSalary || 0,
        salesKpiTarget: target,
        currentSales: sales,
        commissionRate: rate,
        commission,
        totalIncome,
        kpiCompletion,
        workHours,
        attendanceRate,
        contractStatus: contract?.status || (emp.status === 'active' ? 'active' : 'inactive'),
        contractCode: contract?.contractNumber || 'HĐLĐ-CHÍNH THỨC',
      };
    });
  }, [safeEmployees, safeContracts, safeShifts]);

  const totalHrSales = useMemo(() => {
    return hrPerformanceData.reduce((sum, e) => sum + e.currentSales, 0);
  }, [hrPerformanceData]);

  const totalHrKpiTarget = useMemo(() => {
    return hrPerformanceData.reduce((sum, e) => sum + e.salesKpiTarget, 0);
  }, [hrPerformanceData]);

  const avgKpiCompletion = useMemo(() => {
    return totalHrKpiTarget > 0 ? Math.round((totalHrSales / totalHrKpiTarget) * 100) : 0;
  }, [totalHrSales, totalHrKpiTarget]);

  const totalHrPayroll = useMemo(() => {
    return hrPerformanceData.reduce((sum, e) => sum + e.totalIncome, 0);
  }, [hrPerformanceData]);

  const kpiEvaluations = useMemo(() => {
    return generateInitialKpiEvaluations(safeEmployees);
  }, [safeEmployees]);

  // 10. Partner & Supply Chain Data (Customers & Suppliers)
  const topVipCustomers = useMemo(() => {
    const custMap: Record<
      string,
      {
        id: string;
        name: string;
        phone: string;
        totalSpent: number;
        orderCount: number;
        tier: string;
        debt: number;
        points: number;
      }
    > = {};

    completedOrders.forEach((o) => {
      const cName = o.customer?.name || (o as any).customerName || 'Khách lẻ';
      const cPhone = o.customer?.phone || (o as any).customerPhone || '---';
      const cId = o.customer?.id || cPhone || cName;

      if (!custMap[cId]) {
        const found = safeCustomers.find((c) => c.id === cId || c.phone === cPhone || c.name === cName);
        custMap[cId] = {
          id: cId,
          name: cName,
          phone: cPhone,
          totalSpent: 0,
          orderCount: 0,
          tier: found?.tier || (o.customer?.rank as any) || 'Bạc',
          debt: found?.debt || 0,
          points: found?.points || 0,
        };
      }
      custMap[cId].totalSpent += Number(o.total) || 0;
      custMap[cId].orderCount += 1;
    });

    return Object.values(custMap)
      .filter((c) => c.name !== 'Khách lẻ' && c.name !== 'Khách vãng lai')
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }, [completedOrders, safeCustomers]);

  const suppliersSupplyData = useMemo(() => {
    return safeSuppliers.map((sup) => {
      const supPOs = safePurchaseOrders.filter((po) => po.supplierId === sup.id || po.supplierName === sup.name);
      const totalPOValue = supPOs.reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);
      const poCount = supPOs.length;
      const overallScore = Math.round(
        (((sup.ratingQuality || 9) +
          (sup.ratingPrice || 9) +
          (sup.ratingOnTime || 9) +
          (sup.ratingWarranty || 9)) /
          4) *
          10
      );
      const onTimeRate = Math.round((sup.ratingOnTime || 9.5) * 10);

      return {
        id: sup.id,
        code: sup.code,
        name: sup.name,
        tier: sup.tier || 'Nhà Phân Phối',
        category: sup.category || 'Thiết bị & Vật tư',
        contactPerson: sup.contactPerson || 'Đại diện bán hàng',
        phone: sup.phone || '---',
        currentDebt: sup.currentDebt || 0,
        creditLimit: sup.creditLimit || 100000000,
        totalPOValue,
        poCount,
        overallScore,
        onTimeRate,
      };
    });
  }, [safeSuppliers, safePurchaseOrders]);

  // 11. Asset Lifecycle & CapEx Data
  const assetLifecycleData = useMemo(() => {
    let totalOriginal = 0;
    let totalDepreciation = 0;
    let totalRemaining = 0;

    const statusCount = {
      good: 0,
      maintenance_required: 0,
      broken: 0,
      liquidated: 0,
    };

    const list = safeAssets.map((asset) => {
      const orig = Number(asset.originalValue) || 0;
      const remain = Number(asset.remainingValue) || 0;
      const depr = Math.max(0, orig - remain);
      const deprMonths = Number(asset.depreciationMonths) || 36;

      totalOriginal += orig;
      totalDepreciation += depr;
      totalRemaining += remain;

      const st = asset.status || 'good';
      if (statusCount[st] !== undefined) {
        statusCount[st]++;
      }

      // Calculate months used based on purchaseDate
      let monthsUsed = 12;
      if (asset.purchaseDate) {
        const pDate = new Date(asset.purchaseDate);
        const now = new Date();
        monthsUsed = Math.max(
          1,
          (now.getFullYear() - pDate.getFullYear()) * 12 + (now.getMonth() - pDate.getMonth())
        );
      }
      const deprProgress = Math.min(100, Math.round((monthsUsed / deprMonths) * 100));

      return {
        ...asset,
        depreciationValue: depr,
        monthsUsed,
        depreciationProgress: deprProgress,
      };
    });

    const totalCount = safeAssets.length || 1;
    const wearRate = totalOriginal > 0 ? ((totalDepreciation / totalOriginal) * 100).toFixed(1) : '0';

    const statusPieData = [
      { name: 'Hoạt động tốt', value: statusCount.good, color: '#10b981' },
      { name: 'Cần bảo trì', value: statusCount.maintenance_required, color: '#f59e0b' },
      { name: 'Hỏng hóc', value: statusCount.broken, color: '#ef4444' },
      { name: 'Đã thanh lý', value: statusCount.liquidated, color: '#64748b' },
    ].filter((item) => item.value > 0);

    return {
      assetsList: list,
      totalOriginal,
      totalDepreciation,
      totalRemaining,
      wearRate,
      statusCount,
      statusPieData,
    };
  }, [safeAssets]);

  // 12. Multi-Sheet Excel Export (5 Sheets)
  const handleExport5SheetExcel = () => {
    const storeTitle = settings?.companyLegalName || settings?.storeName || 'GIA PHÚC ERP ENTERPRISE';
    const reportDate = new Date().toLocaleDateString('vi-VN');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="TitleHeader">
      <Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#0f766e"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#64748b"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="ColHeader">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
      <Interior ss:Color="#0f766e" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#042f2e"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#042f2e"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#042f2e"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#042f2e"/>
      </Borders>
    </Style>
    <Style ss:ID="KpiLabel">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1e293b"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="KpiValue">
      <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#0f766e"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CurrencyCell">
      <NumberFormat ss:Format="#,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="PercentCell">
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CenterCell">
      <Alignment ss:Horizontal="Center"/>
    </Style>
  </Styles>

  <!-- SHEET 1: KPI_Tong_Quan -->
  <Worksheet ss:Name="1. KPI_Tong_Quan">
    <Table ss:DefaultColumnWidth="140">
      <Column ss:Width="240"/>
      <Column ss:Width="160"/>
      <Column ss:Width="200"/>
      <Row ss:Height="28">
        <Cell ss:MergeAcross="2" ss:StyleID="TitleHeader">
          <Data ss:Type="String">BÁO CÁO TỔNG QUAN ĐIỀU HÀNH - ${storeTitle.toUpperCase()}</Data>
        </Cell>
      </Row>
      <Row>
        <Cell ss:MergeAcross="2" ss:StyleID="SubHeader">
          <Data ss:Type="String">Lập ngày: ${reportDate} | Kỳ lọc: ${timeRange} | Kênh: ${channelFilter}</Data>
        </Cell>
      </Row>
      <Row ss:Height="10"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chỉ Số Điều Hành</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Giá Trị</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Ghi Chú</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Doanh Thu Thuần</Data></Cell>
        <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(totalRevenue)}</Data></Cell>
        <Cell><Data ss:Type="String">${completedOrders.length} đơn hoàn tất</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Giá Vốn Hàng Bán (COGS)</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="String">${formatVND(totalCost)}</Data></Cell>
        <Cell><Data ss:Type="String">Giá vốn xuất kho</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Lợi Nhuận Gộp</Data></Cell>
        <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(grossProfit)}</Data></Cell>
        <Cell ss:StyleID="PercentCell"><Data ss:Type="String">Biên lãi: ${profitMargin}%</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Tổng Vốn Tồn Kho</Data></Cell>
        <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(inventoryMetrics.totalStockCapital)}</Data></Cell>
        <Cell><Data ss:Type="String">${inventoryMetrics.totalSku} SKU (${inventoryMetrics.totalStockUnits} chiếc)</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Tổng Doanh Số Nhân Sự HR</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="String">${formatVND(totalHrSales)}</Data></Cell>
        <Cell><Data ss:Type="String">Tỷ lệ đạt KPI: ${avgKpiCompletion}%</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Tổng Nguyên Giá TSCĐ</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="String">${formatVND(assetLifecycleData.totalOriginal)}</Data></Cell>
        <Cell><Data ss:Type="String">Khấu hao: ${formatVND(assetLifecycleData.totalDepreciation)} (${assetLifecycleData.wearRate}%)</Data></Cell>
      </Row>
    </Table>
  </Worksheet>

  <!-- SHEET 2: DoanhThu_Theo_Ngay -->
  <Worksheet ss:Name="2. DoanhThu_Theo_Ngay">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="110"/>
      <Column ss:Width="90"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="100"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Ngày Giao Dịch</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Số Đơn Hàng</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Doanh Thu (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Giá Vốn (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lợi Nhuận (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Biên Lãi</Data></Cell>
      </Row>
      ${dailyTimelineData
        .map(
          (d) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${d.fullDate}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${d.OrderCount}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${d.DoanhThu}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${d.GiaVon}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${d.LoiNhuan}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${d.margin}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 3: HieuSuat_NhanSu_HR -->
  <Worksheet ss:Name="3. HieuSuat_NhanSu_HR">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="80"/>
      <Column ss:Width="180"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="90"/>
      <Column ss:Width="110"/>
      <Column ss:Width="130"/>
      <Column ss:Width="100"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã NV</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Họ Tên</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chức Danh</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Doanh Số Đạt (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chỉ Tiêu KPI (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">% Đạt KPI</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Hoa Hồng (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thu Nhập Ước Tính</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Giờ Công (h)</Data></Cell>
      </Row>
      ${hrPerformanceData
        .map(
          (e) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${e.code}</Data></Cell>
        <Cell><Data ss:Type="String">${e.name}</Data></Cell>
        <Cell><Data ss:Type="String">${e.role}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.currentSales}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.salesKpiTarget}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${e.kpiCompletion}%</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.commission}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.totalIncome}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${e.workHours}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 4: Top_SanPham_Kho -->
  <Worksheet ss:Name="4. Top_SanPham_Kho">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="60"/>
      <Column ss:Width="100"/>
      <Column ss:Width="250"/>
      <Column ss:Width="90"/>
      <Column ss:Width="140"/>
      <Column ss:Width="90"/>
      <Column ss:Width="110"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Hạng</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã SKU</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tên Sản Phẩm</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Đã Bán</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Doanh Thu (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tồn Kho</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Trạng Thái Kho</Data></Cell>
      </Row>
      ${topProducts
        .map(
          (p, idx) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${p.sku || 'N/A'}</Data></Cell>
        <Cell><Data ss:Type="String">${p.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${p.quantity}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.revenue}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${p.currentStock}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${
          p.currentStock <= 0 ? 'Hết hàng' : p.currentStock <= p.minStock ? 'Sắp hết' : 'An toàn'
        }</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 5: QuanTri_TaiSan_TSCD -->
  <Worksheet ss:Name="5. QuanTri_TaiSan_TSCD">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="80"/>
      <Column ss:Width="200"/>
      <Column ss:Width="160"/>
      <Column ss:Width="100"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="100"/>
      <Column ss:Width="130"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã TS</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tên Tài Sản</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Nhóm Chức Năng</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Ngày Mua</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Nguyên Giá (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Khấu Hao (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Giá Trị Còn Lại</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tiến Độ</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tình Trạng</Data></Cell>
      </Row>
      ${assetLifecycleData.assetsList
        .map(
          (a) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${a.code}</Data></Cell>
        <Cell><Data ss:Type="String">${a.name.replace(/&/g, '&amp;')}</Data></Cell>
        <Cell><Data ss:Type="String">${a.category}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${a.purchaseDate || '---'}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${a.originalValue}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${a.depreciationValue}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${a.remainingValue}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${a.depreciationProgress}%</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${
          a.status === 'good' ? 'Tốt' : a.status === 'maintenance_required' ? 'Bảo trì' : a.status === 'broken' ? 'Hỏng' : 'Thanh lý'
        }</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Tong_Hop_ERP_5Sheet_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100 print:bg-white print:text-black print:p-0 print:m-0">
      {/* 1. Header & Navigation Sub-Tabs */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md space-y-4 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Trung Tâm Điều Hành Doanh Nghiệp (Executive BI Dashboard)</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Multi-Domain 2026
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Phân tích hợp nhất: Tài chính bán hàng, Hiệu suất HR, Đối tác cung ứng &amp; Dòng đời TSCĐ.
              </p>
            </div>
          </div>

          {/* Action Buttons: 5-Sheet Excel & Print */}
          <div className="flex items-center flex-wrap gap-2.5 print:hidden">
            <button
              onClick={handleExport5SheetExcel}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              title="Xuất bảng tính Excel đa chiều 5 sheet"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel (5 Sheets)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow transition-all cursor-pointer"
              title="In báo cáo A4"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>In Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* 4 Main Functional Sub-Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-800/80 pt-2 text-xs font-bold print:hidden custom-scrollbar">
          <button
            onClick={() => setActiveMainTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeMainTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Tổng Quan Kinh Doanh &amp; Tồn Kho</span>
          </button>

          <button
            onClick={() => setActiveMainTab('hr_kpi')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeMainTab === 'hr_kpi'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>2. Hiệu Suất Nhân Sự &amp; KPI HR</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-emerald-400">
              {safeEmployees.length} NV
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('partners_supply')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeMainTab === 'partners_supply'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. Đối Tác &amp; Chuỗi Cung Ứng</span>
          </button>

          <button
            onClick={() => setActiveMainTab('assets_lifecycle')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeMainTab === 'assets_lifecycle'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>4. Quản Trị TSCĐ &amp; Dòng Đời</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-purple-300">
              {safeAssets.length} TS
            </span>
          </button>
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs print:hidden">
          {/* Time Filter Presets */}
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === 'today' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '7days' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange('14days')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '14days' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 ngày
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '30days' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === 'month' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === 'quarter' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quý này
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Toàn bộ
            </button>
            <button
              onClick={() => setTimeRange('custom')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                timeRange === 'custom' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Tùy chọn</span>
            </button>
          </div>

          {/* Advanced Dropdown Filters (Channel, Customer, Category) */}
          <div className="flex items-center flex-wrap gap-2">
            {timeRange === 'custom' && (
              <div className="flex items-center space-x-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span>Từ:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-transparent border-0 text-white focus:outline-none cursor-pointer"
                />
                <span>Đến:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent border-0 text-white focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Mọi Kênh Bán</option>
              {availableChannels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>

            {/* Category / Material Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Mọi Ngành Hàng</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Customer Filter */}
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">Mọi Khách Hàng</option>
              {safeCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TỔNG QUAN KINH DOANH & TỒN KHO                                     */}
      {/* ========================================================================= */}
      {activeMainTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
            {/* KPI 1: Doanh thu thuần */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-4 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Doanh Thu Thuần
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                  {completedOrders.length} đơn
                </span>
              </div>
              <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 tracking-tight">
                {formatVND(totalRevenue)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Thực thu</span>
                </span>
                <span className="text-slate-500 font-mono">COGS: {formatVND(totalCost)}</span>
              </div>
            </div>

            {/* KPI 2: Lợi nhuận gộp */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-4 rounded-2xl border border-cyan-500/20 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Percent className="w-4 h-4 text-cyan-400" />
                  Lợi Nhuận Gộp
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-mono font-bold text-[10px]">
                  Biên {profitMargin}%
                </span>
              </div>
              <div className="text-xl md:text-2xl font-black font-mono text-cyan-400 tracking-tight">
                +{formatVND(grossProfit)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-cyan-300/80">Doanh thu trừ vốn</span>
                <span className="text-slate-500">Hiệu suất cao</span>
              </div>
            </div>

            {/* KPI 3: Tổng vốn kho */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-4 rounded-2xl border border-purple-500/20 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Tổng Vốn Tồn Kho
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-mono text-[10px]">
                  {inventoryMetrics.totalSku} SKU
                </span>
              </div>
              <div className="text-xl md:text-2xl font-black font-mono text-purple-300 tracking-tight">
                {formatVND(inventoryMetrics.totalStockCapital)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-purple-400 font-medium">
                  {inventoryMetrics.totalStockUnits.toLocaleString('vi-VN')} món lưu kho
                </span>
                <span className="text-slate-500">Giá vốn thực</span>
              </div>
            </div>

            {/* KPI 4: AOV */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-4 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  AOV / Đơn Hàng
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono text-[10px]">
                  {avgItemsPerOrder} món/đơn
                </span>
              </div>
              <div className="text-xl md:text-2xl font-black font-mono text-amber-400 tracking-tight">
                {formatVND(averageOrderValue)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-amber-300/80">Bình quân mỗi khách</span>
                <span className="text-slate-500 font-mono">Đã bán: {totalItemsSold}</span>
              </div>
            </div>

            {/* KPI 5: Sức khỏe kho */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-4 rounded-2xl border border-rose-500/20 shadow-lg relative overflow-hidden col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Sức Khỏe Kho
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                    inventoryMetrics.safePercent >= 80
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {inventoryMetrics.safePercent}% An toàn
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <div className="text-xl md:text-2xl font-black font-mono text-rose-400">
                  {inventoryMetrics.lowStockCount + inventoryMetrics.outOfStockCount}
                </div>
                <span className="text-xs text-slate-400 font-medium">SKU cần chú ý</span>
              </div>
              <div className="mt-2 text-[11px] flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-amber-400 font-medium">{inventoryMetrics.lowStockCount} sắp hết</span>
                <span className="text-rose-400 font-medium">{inventoryMetrics.outOfStockCount} hết hàng</span>
              </div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="font-extrabold text-sm md:text-base text-white">
                    Diễn Biến Doanh Thu &amp; Lợi Nhuận Gộp Theo Ngày
                  </h2>
                  <p className="text-xs text-slate-400">
                    Xu hướng biến động tài chính thực thu và biên lợi nhuận qua từng mốc ngày.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 print:hidden">
                <button
                  onClick={() => setDailyChartType('area')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    dailyChartType === 'area' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Biểu Đồ Vùng
                </button>
                <button
                  onClick={() => setDailyChartType('bar')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    dailyChartType === 'bar' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cột Kép
                </button>
                <button
                  onClick={() => setDailyChartType('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                    dailyChartType === 'table' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Bảng Số Liệu</span>
                </button>
              </div>
            </div>

            {dailyTimelineData.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                Không có đơn hàng phát sinh trong khoảng thời gian đã chọn.
              </div>
            ) : dailyChartType === 'area' ? (
              <div className="h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorProfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}k`)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any, name: any) => [
                        formatVND(Number(val)),
                        name === 'DoanhThu' ? 'Doanh Thu Thuần' : 'Lợi Nhuận Gộp',
                      ]}
                      labelFormatter={(lbl, items) => {
                        const item = items?.[0]?.payload;
                        return item ? `Ngày: ${item.fullDate} (${item.OrderCount} đơn)` : lbl;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                      formatter={(val) => (val === 'DoanhThu' ? 'Doanh Thu Thuần' : 'Lợi Nhuận Gộp')}
                    />
                    <Area
                      type="monotone"
                      dataKey="DoanhThu"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="LoiNhuan"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : dailyChartType === 'bar' ? (
              <div className="h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}k`)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(val: any, name: any) => [
                        formatVND(Number(val)),
                        name === 'DoanhThu' ? 'Doanh Thu' : 'Lợi Nhuận Gộp',
                      ]}
                      labelFormatter={(lbl, items) => {
                        const item = items?.[0]?.payload;
                        return item ? `Ngày: ${item.fullDate} (${item.OrderCount} đơn)` : lbl;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                      formatter={(val) => (val === 'DoanhThu' ? 'Doanh Thu' : 'Lợi Nhuận Gộp')}
                    />
                    <Bar dataKey="DoanhThu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="LoiNhuan" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ngày</th>
                      <th className="py-3 px-4 text-center">Số Đơn</th>
                      <th className="py-3 px-4 text-right">Doanh Thu Thuần</th>
                      <th className="py-3 px-4 text-right">Giá Vốn (COGS)</th>
                      <th className="py-3 px-4 text-right">Lợi Nhuận Gộp</th>
                      <th className="py-3 px-4 text-center">Biên Lãi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {dailyTimelineData.map((row) => (
                      <tr key={row.fullDate} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-sans font-medium text-white">{row.fullDate}</td>
                        <td className="py-2.5 px-4 text-center text-amber-400">{row.OrderCount} đơn</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                          {formatVND(row.DoanhThu)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400">{formatVND(row.GiaVon)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-cyan-400">
                          +{formatVND(row.LoiNhuan)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-sans text-[11px]">
                            {row.margin}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Best Sellers & Inventory Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Products */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white">Top Sản Phẩm Bán Chạy</h3>
                    <p className="text-xs text-slate-400">Sản phẩm đóng góp doanh số chủ lực</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setBestSellerMetric('revenue')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      bestSellerMetric === 'revenue' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Doanh Thu
                  </button>
                  <button
                    onClick={() => setBestSellerMetric('quantity')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      bestSellerMetric === 'quantity' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Số Lượng
                  </button>
                </div>
              </div>

              <div className="h-56 w-full">
                {top6ProductsForChart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Chưa có dữ liệu sản phẩm trong kỳ lọc
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top6ProductsForChart} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickFormatter={(v) =>
                          bestSellerMetric === 'revenue'
                            ? v >= 1000000
                              ? `${(v / 1000000).toFixed(1)}M`
                              : `${v / 1000}k`
                            : `${v}`
                        }
                      />
                      <YAxis
                        dataKey="displayName"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={11}
                        width={120}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [
                          bestSellerMetric === 'revenue' ? formatVND(Number(val)) : `${val} cái`,
                          bestSellerMetric === 'revenue' ? 'Doanh Thu' : 'Số Lượng Bán',
                        ]}
                      />
                      <Bar
                        dataKey={bestSellerMetric === 'revenue' ? 'revenue' : 'quantity'}
                        fill="#f59e0b"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <PieIcon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white">Cơ Cấu Vốn Tồn Kho Theo Ngành</h3>
                    <p className="text-xs text-slate-400">
                      Tổng vốn: {formatVND(inventoryMetrics.totalStockCapital)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-56 w-full">
                {categoryInventory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Chưa có sản phẩm trong kho
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryInventory}
                        dataKey="capital"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {categoryInventory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any, item: any) => [
                          `${formatVND(Number(val))} (${item.payload.percentage}%)`,
                          'Vốn tồn kho',
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HIỆU SUẤT NHÂN SỰ & KPI HR (HrPerformanceTab)                     */}
      {/* ========================================================================= */}
      {activeMainTab === 'hr_kpi' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 4 HR KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* HR KPI 1: Tổng doanh số nhân viên */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Tổng Doanh Số Đội Ngũ:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-emerald-400">
                {formatVND(totalHrSales)}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Quy mô nhân sự:</span>
                <span className="text-emerald-300 font-bold">{safeEmployees.length} nhân viên</span>
              </div>
            </div>

            {/* HR KPI 2: % Đạt chỉ tiêu KPI */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Tỷ Lệ Đạt KPI Doanh Số:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-amber-400">
                {avgKpiCompletion}%
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Chỉ tiêu tổng:</span>
                <span className="text-slate-300 font-mono">{formatVND(totalHrKpiTarget)}</span>
              </div>
            </div>

            {/* HR KPI 3: Giờ công & Chuyên cần */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-cyan-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Thời Gian Làm Việc &amp; Chuyên Cần:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-cyan-400">
                8.0h <span className="text-xs font-normal text-slate-400">/ ca</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Tỷ lệ đi làm đúng giờ:</span>
                <span className="text-cyan-300 font-bold">98.2%</span>
              </div>
            </div>

            {/* HR KPI 4: Quỹ lương & Hoa hồng */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                Quỹ Lương &amp; Hoa Hồng Dự Kiến:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-purple-300">
                {formatVND(totalHrPayroll)}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Lương cứng + % Hoa hồng</span>
                <span className="text-purple-400 font-semibold">Tháng này</span>
              </div>
            </div>
          </div>

          {/* 2 Recharts for HR: Sales vs KPI Target & Work Hours vs Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Doanh Số vs KPI Target */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white">
                      Doanh Số Thực Đạt vs Chỉ Tiêu KPI
                    </h3>
                    <p className="text-xs text-slate-400">So sánh mức độ đóng góp theo từng nhân sự</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                {hrPerformanceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Chưa có dữ liệu nhân viên
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hrPerformanceData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v}`)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => formatVND(Number(val))}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="currentSales" name="Doanh Số Đạt" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="salesKpiTarget" name="Chỉ Tiêu KPI" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Giờ công & Tỷ lệ chuyên cần (ComposedChart) */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white">
                      Thời Gian Làm Việc &amp; Tỷ Lệ Chuyên Cần
                    </h3>
                    <p className="text-xs text-slate-400">Theo dõi số giờ công và tỷ lệ đúng giờ (%)</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                {hrPerformanceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Chưa có dữ liệu ca làm
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={hrPerformanceData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis
                        yAxisId="left"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}h`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[80, 100]}
                        stroke="#8b5cf6"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar yAxisId="left" dataKey="workHours" name="Giờ Công (h)" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Line yAxisId="right" type="monotone" dataKey="attendanceRate" name="Chuyên Cần (%)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* HR Scorecard Table */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-white">
                    Bảng Scorecard Đánh Giá Nhân Sự &amp; Quỹ Lương
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chi tiết chỉ số KPI, hoa hồng, thời gian làm việc và trạng thái hợp đồng lao động
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowKpiReportModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Biểu Mẫu KPI &amp; QĐ Thưởng (BLLĐ 2019)</span>
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('hr')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <span>Mở Quản Trị HR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã NV</th>
                    <th className="py-3 px-4">Họ Tên &amp; Chức Danh</th>
                    <th className="py-3 px-4">Ca Trực</th>
                    <th className="py-3 px-4 text-right">Doanh Số Đạt</th>
                    <th className="py-3 px-4 text-right">Chỉ Tiêu KPI</th>
                    <th className="py-3 px-4 text-center">% Hoàn Thành</th>
                    <th className="py-3 px-4 text-right">Hoa Hồng</th>
                    <th className="py-3 px-4 text-right">Tổng Thu Nhập</th>
                    <th className="py-3 px-4 text-center">Hợp Đồng LĐ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {hrPerformanceData.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-sans font-bold">{emp.code}</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.role}</div>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{emp.shiftSchedule}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatVND(emp.currentSales)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {formatVND(emp.salesKpiTarget)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              emp.kpiCompletion >= 100
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : emp.kpiCompletion >= 70
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {emp.kpiCompletion}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-cyan-300">+{formatVND(emp.commission)}</td>
                      <td className="py-3 px-4 text-right font-bold text-purple-300">
                        {formatVND(emp.totalIncome)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {emp.contractCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ĐỐI TÁC & CHUỖI CUNG ỨNG (PartnersSupplyTab)                      */}
      {/* ========================================================================= */}
      {activeMainTab === 'partners_supply' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top VIP Customers Leaderboard */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-white">
                    Bảng Vinh Danh Top Khách Hàng VIP &amp; CRM
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phân tích doanh số đóng góp, điểm tích lũy và công nợ theo từng đối tác
                  </p>
                </div>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('customers')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <span>Mở Sổ Khách Hàng CRM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 text-center">Hạng</th>
                    <th className="py-3 px-4">Tên Khách Hàng</th>
                    <th className="py-3 px-4">Số Điện Thoại</th>
                    <th className="py-3 px-4 text-center">Phân Hạng</th>
                    <th className="py-3 px-4 text-center">Số Đơn</th>
                    <th className="py-3 px-4 text-right">Tổng Chi Tiêu</th>
                    <th className="py-3 px-4 text-right">AOV / Khách</th>
                    <th className="py-3 px-4 text-right">Công Nợ Hiện Tại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {topVipCustomers.map((cust, idx) => (
                    <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-sans font-bold">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-white">{cust.name}</td>
                      <td className="py-3 px-4 text-slate-400">{cust.phone}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {cust.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-amber-400 font-sans">{cust.orderCount} đơn</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatVND(cust.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {formatVND(Math.round(cust.totalSpent / (cust.orderCount || 1)))}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {cust.debt > 0 ? (
                          <span className="text-amber-400 font-mono font-bold">{formatVND(cust.debt)}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Đã thanh toán đủ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suppliers Supply Chain Analytics */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-white">
                    Quản Trị Nhà Cung Ứng &amp; Đơn Đặt Hàng Nhập Kho (PO)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Quy mô nhập hàng, đánh giá chất lượng NCC và công nợ phải trả
                  </p>
                </div>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('suppliers')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <span>Mở Quản Trị NCC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã NCC</th>
                    <th className="py-3 px-4">Tên Nhà Cung Ứng</th>
                    <th className="py-3 px-4">Phân Hạng</th>
                    <th className="py-3 px-4 text-center">Điểm Đánh Giá</th>
                    <th className="py-3 px-4 text-center">Đúng Hẹn (%)</th>
                    <th className="py-3 px-4 text-right">Tổng Quy Mô PO</th>
                    <th className="py-3 px-4 text-right">Công Nợ Phải Trả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {suppliersSupplyData.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-sans font-bold">{sup.code}</td>
                      <td className="py-3 px-4 font-sans font-bold text-white">{sup.name}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{sup.tier}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {sup.overallScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-cyan-300 font-bold">{sup.onTimeRate}%</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatVND(sup.totalPOValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {sup.currentDebt > 0 ? (
                          <span className="text-amber-400 font-mono font-bold">{formatVND(sup.currentDebt)}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Không nợ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUẢN TRỊ TÀI SẢN CỐ ĐỊNH & DÒNG ĐỜI (AssetLifecycleTab)            */}
      {/* ========================================================================= */}
      {activeMainTab === 'assets_lifecycle' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 4 CapEx KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                Tổng Nguyên Giá TSCĐ:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-purple-300">
                {formatVND(assetLifecycleData.totalOriginal)}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                Tổng quy mô tài sản cố định
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                Khấu Hao Lũy Kế:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-amber-400">
                {formatVND(assetLifecycleData.totalDepreciation)}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                Tỷ lệ hao mòn: <span className="text-amber-300 font-bold">{assetLifecycleData.wearRate}%</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Giá Trị Sổ Sách Còn Lại:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-emerald-400">
                {formatVND(assetLifecycleData.totalRemaining)}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                Book Value hiện tại
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-cyan-500/20 shadow-lg space-y-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                Trạng Thái Vận Hành:
              </span>
              <div className="text-xl md:text-2xl font-black font-mono text-cyan-400">
                {assetLifecycleData.statusCount.good}{' '}
                <span className="text-xs font-normal text-slate-400">/ {safeAssets.length} thiết bị tốt</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="text-amber-400">{assetLifecycleData.statusCount.maintenance_required} cần bảo trì</span>
              </div>
            </div>
          </div>

          {/* Asset Lifecycle Table & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Asset List with Depreciation Progress */}
            <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white">
                      Dòng Đời &amp; Tiến Độ Khấu Hao Tài Sản Theo Chức Năng
                    </h3>
                    <p className="text-xs text-slate-400">
                      Thiết bị POS, Vận tải, In ấn tem nhãn, Máy móc &amp; Hạ tầng CNTT
                    </p>
                  </div>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('assets')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <span>Mở Sổ TSCĐ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Mã TS</th>
                      <th className="py-3 px-4">Tên Thiết Bị &amp; Nhóm Chức Năng</th>
                      <th className="py-3 px-4 text-right">Nguyên Giá</th>
                      <th className="py-3 px-4 text-right">Giá Trị Còn Lại</th>
                      <th className="py-3 px-4 text-center">Tiến Độ Dòng Đời</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {assetLifecycleData.assetsList.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-sans font-bold">{asset.code}</td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-white">{asset.name}</div>
                          <div className="text-[10px] text-purple-300/80">{asset.category}</div>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">{formatVND(asset.originalValue)}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          {formatVND(asset.remainingValue)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <div className="space-y-1">
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${asset.depreciationProgress}%` }}
                                className={`h-full ${
                                  asset.depreciationProgress >= 90
                                    ? 'bg-rose-500'
                                    : asset.depreciationProgress >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {asset.depreciationProgress}% ({asset.monthsUsed}/{asset.depreciationMonths} th)
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Operational Status Donut Chart */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <PieIcon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="font-extrabold text-sm md:text-base text-white">
                        Trạng Thái Vận Hành &amp; Bảo Trì
                      </h3>
                      <p className="text-xs text-slate-400">Tỷ lệ thiết bị sẵn sàng hoạt động</p>
                    </div>
                  </div>
                </div>

                <div className="h-56 w-full mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetLifecycleData.statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {assetLifecycleData.statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Hoạt động tốt:</span>
                  <span className="font-bold text-emerald-400">{assetLifecycleData.statusCount.good} thiết bị</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Cần bảo trì định kỳ:</span>
                  <span className="font-bold text-amber-400">
                    {assetLifecycleData.statusCount.maintenance_required} thiết bị
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Hỏng hóc / Chờ sửa:</span>
                  <span className="font-bold text-rose-400">{assetLifecycleData.statusCount.broken} thiết bị</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Legal Forms & Decisions Modal (BLLĐ 2019) */}
      {showKpiReportModal && (
        <KpiEvaluationReportModal
          evaluations={kpiEvaluations}
          employees={safeEmployees}
          settings={settings}
          onClose={() => setShowKpiReportModal(false)}
        />
      )}
    </div>
  );
};

