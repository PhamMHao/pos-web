import React, { useState, useEffect } from 'react';
import { useStoreState } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/pos/PosView';
import { OrdersView } from './components/orders/OrdersView';
import { InventoryView } from './components/inventory/InventoryView';
import { CustomersView } from './components/customers/CustomersView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AiAdvisorView } from './components/ai/AiAdvisorView';
import { PromotionsView } from './components/promotions/PromotionsView';
import { SettingsView } from './components/settings/SettingsView';
import { AccountingView } from './components/accounting/AccountingView';
import { HrView } from './components/hr/HrView';
import { EInvoiceManagerView } from './components/invoices/EInvoiceManagerView';
import { LaborContractManagerView } from './components/contracts/LaborContractManagerView';
import { QuotesView } from './components/quotes/QuotesView';
import { CostingView } from './components/costing/CostingView';
import { AssetsView } from './components/assets/AssetsView';
import { WarrantyView } from './components/warranty/WarrantyView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { FraudModal } from './components/ai/FraudModal';
import { ShiftModal } from './components/pos/ShiftModal';
import { QuickStockModal } from './components/common/QuickStockModal';
import { DeviceManagerModal } from './components/common/DeviceManagerModal';
import { DatabaseConfigModal } from './components/settings/DatabaseConfigModal';
import { LoginModal } from './features/auth/components/LoginModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { ScannerPrinterHubModal } from './components/common/ScannerPrinterHubModal';
import { ProductBarcodeLabelModal } from './components/inventory/ProductBarcodeLabelModal';
import { productsApi } from './features/products/api/productsApi';
import { customersApi } from './features/customers/api/customersApi';
import { posApi } from './features/pos/api/posApi';
import { warehouseApi } from './features/warehouse/api/warehouseApi';
import { quotesApi } from './features/quotes/api/quotesApi';
import { costingApi } from './features/costing/api/costingApi';
import { warrantiesApi } from './features/warranties/api/warrantiesApi';
import { financeApi } from './features/finance/api/financeApi';
import { einvoicesApi } from './features/einvoices/api/einvoicesApi';
import { hrApi } from './features/hr/api/hrApi';
import { promotionsApi } from './features/promotions/api/promotionsApi';
import { assetsApi } from './features/assets/api/assetsApi';
import { inboundInvoicesApi } from './features/inbound-invoices/api/inboundInvoicesApi';
import { settingsApi } from './features/settings/api/settingsApi';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { sounds } from './utils/soundEffects';
import { Bot, Sparkles } from 'lucide-react';
import {
  Order,
  Product,
  Customer,
  Promotion,
  StoreSettings,
  InventoryLog,
  AccountingRecord,
  Employee,
  PriceQuote,
  ProductCosting,
  EnterpriseAsset,
  FraudAlert,
  WarrantyTicket,
  SerialDeviceRecord,
  CashShift,
  CartItem,
  PaymentMethod,
  Supplier,
  PurchaseOrder,
} from './types';

export function App() {
  const {
    products,
    setProducts,
    orders,
    setOrders,
    customers,
    setCustomers,
    promotions,
    setPromotions,
    shifts,
    setShifts,
    currentShift,
    setCurrentShift,
    inventoryLogs,
    setInventoryLogs,
    settings,
    setSettings,
    accountingRecords,
    setAccountingRecords,
    employees,
    setEmployees,
    quotes,
    setQuotes,
    costingList,
    setCostingList,
    assets,
    setAssets,
    warranties,
    setWarranties,
    serialRecords,
    setSerialRecords,
    fraudAlerts,
    setFraudAlerts,
    eInvoices,
    setEInvoices,
    laborContracts,
    setLaborContracts,
    inboundInvoices,
    setInboundInvoices,
    stockReceipts,
    setStockReceipts,
    resetToInitialData,
  } = useStoreState();

  const [activeTab, setActiveTab] = useState<
    | 'pos'
    | 'orders'
    | 'accounting'
    | 'hr'
    | 'quotes'
    | 'suppliers'
    | 'costing'
    | 'inventory'
    | 'assets'
    | 'warranties'
    | 'ai'
    | 'customers'
    | 'promotions'
    | 'analytics'
    | 'settings'
    | 'einvoices'
    | 'contracts'
  >('pos');

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const raw = localStorage.getItem('gp_erp_suppliers_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const raw = localStorage.getItem('gp_erp_purchase_orders_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      if (suppliers && suppliers.length > 0) {
        localStorage.setItem('gp_erp_suppliers_data', JSON.stringify(suppliers));
      }
    } catch {}
  }, [suppliers]);

  useEffect(() => {
    try {
      if (purchaseOrders && purchaseOrders.length > 0) {
        localStorage.setItem('gp_erp_purchase_orders_data', JSON.stringify(purchaseOrders));
      }
    } catch {}
  }, [purchaseOrders]);

  const handleSaveSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id);
      if (exists) return prev.map((s) => (s.id === supplier.id ? supplier : s));
      return [supplier, ...prev];
    });
  };

  const handleSavePurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders((prev) => [po, ...prev.filter((p) => p.id !== po.id)]);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [activeFraudAlert, setActiveFraudAlert] = useState<FraudAlert | null>(null);
  const [showQuickStockModal, setShowQuickStockModal] = useState(false);
  const [quickStockType, setQuickStockType] = useState<'import' | 'export' | 'audit_adjustment'>('import');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showScannerPrinterHubModal, setShowScannerPrinterHubModal] = useState(false);
  const [scannerHubInitialCode, setScannerHubInitialCode] = useState('');
  const [scannerHubInitialTab, setScannerHubInitialTab] = useState<'lookup' | 'register' | 'batch_serial' | 'printer_hub'>('lookup');
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [loadedQuoteData, setLoadedQuoteData] = useState<{ items: CartItem[]; customer?: Customer | null } | null>(null);

  const currentTheme = settings?.theme || 'light';
  const isLightTheme = currentTheme === 'light';

  // Global Hardware Barcode Scanner Listener
  useBarcodeScanner({
    enabled: true,
    enableSound: settings?.scannerBeepSound !== false,
  });

  // Global Keyboard shortcuts: F1 for AI Assistant, F2 for POS, F3 for Scanner & Printer Hub
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowAiDrawer((prev) => !prev);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setScannerHubInitialCode('');
        setScannerHubInitialTab('lookup');
        setShowScannerPrinterHubModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Global barcode listener across all tabs
  useEffect(() => {
    const handleGlobalBarcodeScanned = (e: any) => {
      const code = e.detail?.barcode;
      if (!code) return;
      // If outside POS view, automatically open Scanner & Printer Hub for rich lookup!
      if (activeTab !== 'pos') {
        setScannerHubInitialCode(code);
        setScannerHubInitialTab('lookup');
        setShowScannerPrinterHubModal(true);
      }
    };

    window.addEventListener('barcode-scanned', handleGlobalBarcodeScanned);
    return () => window.removeEventListener('barcode-scanned', handleGlobalBarcodeScanned);
  }, [activeTab]);

  useEffect(() => {
    if (isLightTheme) {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('theme-dark');
    }
  }, [isLightTheme]);

  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Hàm đồng bộ toàn diện dữ liệu trực tiếp từ SQL Server
  const fetchFreshDataFromDb = async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsSyncingDb(true);
    try {
      const [
        prodsRes,
        custsRes,
        ordersRes,
        shiftRes,
        logsRes,
        receiptsRes,
        quotesRes,
        costingRes,
        warrantiesRes,
        serialsRes,
        financeRes,
        eInvRes,
        empRes,
        contractsRes,
        promosRes,
        assetsRes,
        inboundRes,
        settingsRes,
      ] = await Promise.allSettled([
        productsApi.getProducts({ limit: 1000 }),
        customersApi.getCustomers({ limit: 1000 }),
        posApi.getOrders({ limit: 500 }),
        posApi.getCurrentShift(),
        warehouseApi.getInventoryLogs({ limit: 500 }),
        warehouseApi.getGoodsReceipts({ limit: 500 }),
        quotesApi.getQuotes({ limit: 500 }),
        costingApi.getCostings({ limit: 500 }),
        warrantiesApi.getWarrantyTickets({ limit: 500 }),
        warrantiesApi.getSerialDevices({ limit: 500 }),
        financeApi.getRecords({ limit: 500 }),
        einvoicesApi.getInvoices({ limit: 500 }),
        hrApi.getEmployees({ limit: 500 }),
        hrApi.getLaborContracts({ limit: 500 }),
        promotionsApi.getPromotions({ limit: 500 }),
        assetsApi.getAssets({ limit: 500 }),
        inboundInvoicesApi.getInboundInvoices({ limit: 500 }),
        settingsApi.getSettings(),
      ]);

      if (prodsRes.status === 'fulfilled' && prodsRes.value?.data && Array.isArray(prodsRes.value.data)) {
        setProducts(prodsRes.value.data);
      }
      if (custsRes.status === 'fulfilled' && custsRes.value?.data && Array.isArray(custsRes.value.data)) {
        setCustomers(custsRes.value.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data && Array.isArray(ordersRes.value.data)) {
        setOrders(ordersRes.value.data);
      }
      if (shiftRes.status === 'fulfilled' && shiftRes.value) {
        setCurrentShift(shiftRes.value);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.data && Array.isArray(logsRes.value.data)) {
        setInventoryLogs(logsRes.value.data);
      }
      if (receiptsRes.status === 'fulfilled' && receiptsRes.value?.data && Array.isArray(receiptsRes.value.data)) {
        setStockReceipts(receiptsRes.value.data as any);
      }
      if (quotesRes.status === 'fulfilled' && quotesRes.value?.data && Array.isArray(quotesRes.value.data)) {
        setQuotes(quotesRes.value.data);
      }
      if (costingRes.status === 'fulfilled' && costingRes.value?.data && Array.isArray(costingRes.value.data)) {
        setCostingList(costingRes.value.data);
      }
      if (warrantiesRes.status === 'fulfilled' && warrantiesRes.value?.data && Array.isArray(warrantiesRes.value.data)) {
        setWarranties(warrantiesRes.value.data);
      }
      if (serialsRes.status === 'fulfilled' && serialsRes.value?.data && Array.isArray(serialsRes.value.data)) {
        setSerialRecords(serialsRes.value.data);
      }
      if (financeRes.status === 'fulfilled' && financeRes.value?.data && Array.isArray(financeRes.value.data)) {
        setAccountingRecords(financeRes.value.data);
      }
      if (eInvRes.status === 'fulfilled' && eInvRes.value?.data && Array.isArray(eInvRes.value.data)) {
        setEInvoices(eInvRes.value.data);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data && Array.isArray(empRes.value.data)) {
        setEmployees(empRes.value.data);
      }
      if (contractsRes.status === 'fulfilled' && contractsRes.value?.data && Array.isArray(contractsRes.value.data)) {
        setLaborContracts(contractsRes.value.data);
      }
      if (promosRes.status === 'fulfilled' && promosRes.value?.data && Array.isArray(promosRes.value.data)) {
        setPromotions(promosRes.value.data);
      }
      if (assetsRes.status === 'fulfilled' && assetsRes.value?.data && Array.isArray(assetsRes.value.data)) {
        setAssets(assetsRes.value.data);
      }
      if (inboundRes.status === 'fulfilled' && inboundRes.value?.data && Array.isArray(inboundRes.value.data)) {
        setInboundInvoices(inboundRes.value.data);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setSettings((prev) => ({ ...prev, ...settingsRes.value }));
      }

      setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
    } catch (err: any) {
      console.warn('Lỗi khi đồng bộ dữ liệu từ SQL Server:', err.message);
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Sync live data on mount
  useEffect(() => {
    fetchFreshDataFromDb();
  }, []);

  // Sync live data when tab changes or window gains focus
  useEffect(() => {
    fetchFreshDataFromDb({ silent: true });
  }, [activeTab]);

  useEffect(() => {
    const handleFocus = () => {
      fetchFreshDataFromDb({ silent: true });
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = isLightTheme ? 'dark' : 'light';
    const updated: StoreSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    settingsApi.updateSettings(updated).catch(() => {});
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try {
      await settingsApi.updateSettings(newSettings);
    } catch (err: any) {
      console.warn('API updateSettings warning:', err.message);
    }
  };

  // Actions
  const handleSaveOrder = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update customer stats if customer attached
    if (newOrder.customer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newOrder.customer?.id) {
            const addedPoints = Math.floor(newOrder.total / 100000); // 1 point per 100k
            const newTotalSpent = c.totalSpent + newOrder.total;
            let newTier = c.tier;
            if (newTotalSpent >= 50000000) newTier = 'Kim Cương';
            else if (newTotalSpent >= 20000000) newTier = 'Vàng';
            else if (newTotalSpent >= 5000000) newTier = 'Bạc';

            return {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: newTotalSpent,
              points: c.points + addedPoints,
              tier: newTier,
            };
          }
          return c;
        })
      );
    }

    // Add inventory logs for sold products
    const newLogs: InventoryLog[] = (newOrder.items || []).map((item) => {
      const prod = (products || []).find((p) => p.id === item.productId);
      const oldStock = prod ? prod.stock : 0;
      return {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        type: 'sale_deduct',
        quantityChange: -item.quantity,
        oldStock,
        newStock: Math.max(0, oldStock - item.quantity),
        reason: `Bán lẻ qua đơn hàng ${newOrder.code}`,
        performedBy: currentShift?.staffName || 'Thu ngân',
        timestamp: new Date().toISOString(),
      };
    });

    setInventoryLogs((prev) => [...newLogs, ...prev]);

    // Persist to SQL Server backend
    try {
      await posApi.createOrder({
        ...newOrder,
        shiftId: currentShift?.id || null,
        customerId: newOrder.customer?.id || null,
        customerName: newOrder.customer?.name || null,
        customerPhone: newOrder.customer?.phone || null,
        customerAddress: newOrder.customer?.address || null,
      });
    } catch (err: any) {
      console.warn('API createOrder warning:', err.message);
    }
  };

  const handleUpdateProductStock = (productId: string, quantityDeducted: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, p.stock - quantityDeducted) }
          : p
      )
    );
  };

  const handleSaveProduct = async (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });

    try {
      let saved;
      try {
        saved = await productsApi.updateProduct(product.id, product);
      } catch {
        saved = await productsApi.createProduct(product);
      }
      if (saved) {
        const fresh = await productsApi.getProducts({ limit: 1000 });
        if (fresh?.data && Array.isArray(fresh.data)) {
          setProducts(fresh.data);
        }
      }
    } catch (err: any) {
      console.warn('API sync warning:', err.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await productsApi.deleteProduct(productId);
      const fresh = await productsApi.getProducts({ limit: 1000 });
      if (fresh?.data && Array.isArray(fresh.data)) {
        setProducts(fresh.data);
      }
    } catch (err: any) {
      console.warn('API delete warning:', err.message);
    }
  };

  const handleAdjustStock = async (logData: Omit<InventoryLog, 'id' | 'timestamp'>) => {
    const log: InventoryLog = {
      ...logData,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
    };

    setInventoryLogs((prev) => [log, ...prev]);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === logData.productId ? { ...p, stock: logData.newStock } : p
      )
    );

    try {
      await warehouseApi.adjustStock({
        productId: logData.productId,
        productName: logData.productName,
        sku: logData.sku,
        type: logData.type,
        quantityChange: logData.quantityChange,
        oldStock: logData.oldStock,
        newStock: logData.newStock,
        unitPrice: logData.unitPrice,
        reason: logData.reason,
        performedBy: logData.performedBy,
      });
      const fresh = await productsApi.getProducts({ limit: 1000 });
      if (fresh?.data && Array.isArray(fresh.data)) {
        setProducts(fresh.data);
      }
    } catch (err: any) {
      console.warn('API adjustStock warning:', err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await posApi.updateOrderStatus(orderId, { status: newStatus });
      const fresh = await posApi.getOrders({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) {
        setOrders(fresh.data);
      }
    } catch (err: any) {
      console.warn('API updateOrderStatus warning:', err.message);
    }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      if (exists) {
        return prev.map((c) => (c.id === customer.id ? customer : c));
      }
      return [customer, ...prev];
    });

    try {
      let saved;
      try {
        saved = await customersApi.updateCustomer(customer.id, customer);
      } catch {
        saved = await customersApi.createCustomer(customer);
      }
      if (saved) {
        const fresh = await customersApi.getCustomers({ limit: 1000 });
        if (fresh?.data && Array.isArray(fresh.data)) {
          setCustomers(fresh.data);
        }
      }
    } catch (err: any) {
      console.warn('API customer sync warning:', err.message);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    try {
      await customersApi.deleteCustomer(customerId);
      const fresh = await customersApi.getCustomers({ limit: 1000 });
      if (fresh?.data && Array.isArray(fresh.data)) {
        setCustomers(fresh.data);
      }
    } catch (err: any) {
      console.warn('API customer delete warning:', err.message);
    }
  };

  const handleSavePromotion = async (promotion: Promotion) => {
    setPromotions((prev) => {
      const exists = prev.some((p) => p.id === promotion.id);
      if (exists) {
        return prev.map((p) => (p.id === promotion.id ? promotion : p));
      }
      return [promotion, ...prev];
    });

    try {
      const exists = promotions.some((p) => p.id === promotion.id);
      if (exists) {
        await promotionsApi.updatePromotion(promotion.id, promotion);
      } else {
        await promotionsApi.createPromotion(promotion);
      }
    } catch (err: any) {
      console.warn('API promotion sync warning:', err.message);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== promotionId));
    try {
      await promotionsApi.deletePromotion(promotionId);
    } catch (err: any) {
      console.warn('API promotion delete warning:', err.message);
    }
  };

  const handleResolveFraudAlert = (alertId: string) => {
    setFraudAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  const handleSaveWarranty = async (newTicket: WarrantyTicket) => {
    setWarranties((prev) => [newTicket, ...prev]);

    // Automatically check or create a Serial Record if not existed
    setSerialRecords((prev) => {
      const exists = prev.some(
        (s) => s.serialNumber.toLowerCase() === newTicket.serialNumber.toLowerCase()
      );
      if (exists) {
        return prev.map((s) =>
          s.serialNumber.toLowerCase() === newTicket.serialNumber.toLowerCase()
            ? {
                ...s,
                totalRepairsCount:
                  newTicket.type === 'repair' ? s.totalRepairsCount + 1 : s.totalRepairsCount,
                totalMaintenancesCount:
                  newTicket.type === 'maintenance'
                    ? s.totalMaintenancesCount + 1
                    : s.totalMaintenancesCount,
              }
            : s
        );
      } else {
        const newRecord: SerialDeviceRecord = {
          id: 'sn-' + Date.now(),
          serialNumber: newTicket.serialNumber,
          productName: newTicket.productName,
          sku: newTicket.model || 'SKU-' + newTicket.serialNumber.slice(-4),
          soldOrderCode: newTicket.orderCode,
          soldDate: newTicket.receivedDate.slice(0, 10),
          customerName: newTicket.customerName,
          customerPhone: newTicket.customerPhone,
          warrantyPeriodMonths: 12,
          warrantyExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000)
            .toISOString()
            .slice(0, 10),
          warrantyStatus: 'valid',
          totalRepairsCount: newTicket.type === 'repair' ? 1 : 0,
          totalMaintenancesCount: newTicket.type === 'maintenance' ? 1 : 0,
        };
        return [newRecord, ...prev];
      }
    });

    try {
      await warrantiesApi.createWarrantyTicket(newTicket);
    } catch (err: any) {
      console.warn('API createWarrantyTicket warning:', err.message);
    }
  };

  const handleUpdateWarranty = async (updatedTicket: WarrantyTicket) => {
    setWarranties((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );

    try {
      await warrantiesApi.updateWarrantyTicket(updatedTicket.id, updatedTicket);
    } catch (err: any) {
      console.warn('API updateWarrantyTicket warning:', err.message);
    }
  };

  const handleSaveQuote = async (newQuote: PriceQuote) => {
    setQuotes((prev) => [newQuote, ...prev.filter((q) => q.id !== newQuote.id)]);
    try {
      await quotesApi.createQuote(newQuote);
      const fresh = await quotesApi.getQuotes({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setQuotes(fresh.data);
    } catch (err: any) {
      console.warn('API quote sync warning:', err.message);
    }
  };

  const handleConvertQuoteToOrder = async (quote: PriceQuote) => {
    const cartItems: CartItem[] = quote.items.map((item, idx) => {
      const matchedProd = products.find(
        (p) =>
          p.sku.toLowerCase() === item.sku.toLowerCase() ||
          p.name.toLowerCase() === item.productName.toLowerCase()
      );
      return {
        product: matchedProd || {
          id: 'prod-quote-' + idx,
          sku: item.sku,
          barcode: item.sku,
          name: item.productName,
          category: 'Điện tử & Cáp điện',
          unit: item.unit,
          costPrice: item.unitPrice * 0.7,
          sellingPrice: item.unitPrice,
          stock: 999,
          minStock: 5,
          image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        quantity: item.quantity,
        selectedUOM: item.unit,
        unitPrice: item.unitPrice,
        costPrice: item.unitPrice * 0.7,
        ratioToBase: 1,
        discountPercent: 0,
        customPrice: item.unitPrice,
      };
    });

    const matchingCustomer: Customer =
      customers.find(
        (c) =>
          c.name.toLowerCase() === quote.customerName.toLowerCase() ||
          (quote.customerPhone && c.phone === quote.customerPhone)
      ) || {
        id: 'cust-quote-' + Date.now(),
        name: quote.customerName,
        phone: quote.customerPhone,
        address: quote.customerCompany || '',
        totalSpent: 0,
        totalOrders: 0,
        tier: 'Đồng',
        points: 0,
        debt: 0,
        createdAt: new Date().toISOString(),
      };

    setLoadedQuoteData({
      items: cartItems,
      customer: matchingCustomer,
    });

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id ? { ...q, status: 'converted_to_order' } : q
      )
    );

    try {
      await quotesApi.updateQuote(quote.id, {
        status: 'converted_to_order',
      });
    } catch (e: any) {
      console.warn('API quote status update warning:', e.message);
    }

    setActiveTab('pos');
  };

  const handleSaveAccountingRecord = async (newRecord: AccountingRecord) => {
    setAccountingRecords((prev) => [newRecord, ...prev]);
    try {
      await financeApi.createRecord(newRecord);
      const fresh = await financeApi.getRecords({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setAccountingRecords(fresh.data);
    } catch (err: any) {
      console.warn('API finance sync warning:', err.message);
    }
  };

  const handleCollectDebt = async (
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note: string
  ) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const prefix = 'PT';
    const code = `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newRecord: AccountingRecord = {
      id: `acc-${Date.now()}`,
      code,
      type: 'income',
      category: 'Thu công nợ khách hàng',
      amount,
      date: new Date().toISOString(),
      party: cust.name,
      paymentMethod,
      status: 'completed',
      note: note || `Thu công nợ khách hàng ${cust.name}`,
      receiptNumber: code,
    };

    setAccountingRecords((prev) => [newRecord, ...prev]);

    const newDebt = Math.max(0, (cust.debt || 0) - amount);
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, debt: newDebt } : c))
    );

    try {
      await financeApi.createRecord(newRecord);
      await customersApi.updateCustomer(customerId, {
        ...cust,
        debt: newDebt,
      });
      const [freshFin, freshCust] = await Promise.all([
        financeApi.getRecords({ limit: 500 }),
        customersApi.getCustomers({ limit: 1000 }),
      ]);
      if (freshFin?.data && Array.isArray(freshFin.data)) setAccountingRecords(freshFin.data);
      if (freshCust?.data && Array.isArray(freshCust.data)) setCustomers(freshCust.data);
    } catch (err: any) {
      console.warn('API collect debt sync warning:', err.message);
    }
  };

  const handleSaveAsset = async (asset: EnterpriseAsset) => {
    setAssets((prev) => {
      const exists = prev.some((a) => a.id === asset.id);
      if (exists) return prev.map((a) => (a.id === asset.id ? asset : a));
      return [asset, ...prev];
    });

    try {
      let saved;
      try {
        saved = await assetsApi.updateAsset(asset.id, asset);
      } catch {
        saved = await assetsApi.createAsset(asset);
      }
      if (saved) {
        const fresh = await assetsApi.getAssets({ limit: 500 });
        if (fresh?.data && Array.isArray(fresh.data)) setAssets(fresh.data);
      }
    } catch (err: any) {
      console.warn('API asset sync warning:', err.message);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    try {
      await assetsApi.deleteAsset(assetId);
      const fresh = await assetsApi.getAssets({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setAssets(fresh.data);
    } catch (err: any) {
      console.warn('API asset delete warning:', err.message);
    }
  };

  const handleSaveCosting = async (costing: ProductCosting) => {
    setCostingList((prev) => [costing, ...prev.filter((c) => c.id !== costing.id)]);
    try {
      await costingApi.createCosting(costing);
      const fresh = await costingApi.getCostings({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setCostingList(fresh.data);
    } catch (err: any) {
      console.warn('API costing sync warning:', err.message);
    }
  };

  const handleAssembleProduct = async (payload: {
    costingId: string;
    quantity: number;
    technicianName: string;
    warehouse: string;
    note?: string;
  }) => {
    try {
      await costingApi.assembleProduct(payload);
      await fetchFreshDataFromDb();
    } catch (err: any) {
      console.warn('API assembleProduct warning:', err.message);
      throw err;
    }
  };

  const handleSaveEmployee = async (employee: Employee) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === employee.id);
      if (exists) return prev.map((e) => (e.id === employee.id ? employee : e));
      return [employee, ...prev];
    });

    try {
      let saved;
      try {
        saved = await hrApi.updateEmployee(employee.id, employee);
      } catch {
        saved = await hrApi.createEmployee(employee);
      }
      if (saved) {
        const fresh = await hrApi.getEmployees({ limit: 500 });
        if (fresh?.data && Array.isArray(fresh.data)) setEmployees(fresh.data);
      }
    } catch (err: any) {
      console.warn('API employee sync warning:', err.message);
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
    try {
      await hrApi.deleteEmployee(empId);
      const fresh = await hrApi.getEmployees({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setEmployees(fresh.data);
    } catch (err: any) {
      console.warn('API employee delete warning:', err.message);
    }
  };

  const handleExportAllData = () => {
    const backupData = {
      version: '2.0.0-enterprise',
      exportedAt: new Date().toISOString(),
      products,
      orders,
      customers,
      promotions,
      shifts,
      inventoryLogs,
      settings,
      accountingRecords,
      employees,
      quotes,
      costingList,
      assets,
      warranties,
      serialRecords,
      fraudAlerts,
      eInvoices,
      laborContracts,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gperp_enterprise_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pendingOrdersCount = (orders || []).filter((o) => o && o.status === 'pending').length;
  const lowStockCount = (products || []).filter((p) => p && p.stock <= p.minStock).length;

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isLightTheme
          ? 'theme-light bg-gradient-to-br from-[#f8fbff] via-[#f0f7ff] to-[#e8f3fc] text-slate-900'
          : 'bg-slate-950 text-slate-100'
      } font-sans antialiased transition-colors duration-150`}
    >
      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orders={orders}
        products={products}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        onOpenFraudAlert={() => setActiveFraudAlert(fraudAlerts[0] || null)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global Navbar */}
        <Navbar
          settings={settings}
          currentShift={currentShift}
          onOpenShiftModal={() => setShowShiftModal(true)}
          products={products}
          pendingOrdersCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNavigate={setActiveTab}
          onToggleTheme={handleToggleTheme}
          onRefreshDb={fetchFreshDataFromDb}
          isSyncingDb={isSyncingDb}
          lastSyncTime={lastSyncTime}
          onQuickStock={(type) => {
            setQuickStockType(type);
            setShowQuickStockModal(true);
          }}
          onOpenDevices={() => setShowDeviceModal(true)}
          onOpenAiAssistant={() => setShowAiDrawer(true)}
          onOpenDbConfig={() => setShowDbModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          onOpenScannerPrinterHub={() => {
            setScannerHubInitialCode('');
            setScannerHubInitialTab('lookup');
            setShowScannerPrinterHubModal(true);
          }}
        />

        {/* View Content */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'pos' && (
            <PosView
              products={products}
              customers={customers}
              promotions={promotions}
              settings={settings}
              currentShift={currentShift}
              onSaveOrder={handleSaveOrder}
              onUpdateProductStock={handleUpdateProductStock}
              onAddCustomer={handleSaveCustomer}
              onOpenDevices={() => setShowDeviceModal(true)}
              onOpenAiAssistant={() => setShowAiDrawer(true)}
              onIssueEInvoice={(newInv) => setEInvoices((prev) => [newInv, ...prev])}
              loadedQuoteData={loadedQuoteData}
              onClearLoadedQuoteData={() => setLoadedQuoteData(null)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              settings={settings}
            />
          )}

          {activeTab === 'einvoices' && (
            <EInvoiceManagerView
              eInvoices={eInvoices}
              setEInvoices={setEInvoices}
              orders={orders}
              customers={customers}
              settings={settings}
              inboundInvoices={inboundInvoices}
              setInboundInvoices={setInboundInvoices}
              products={products}
              onSaveProduct={handleSaveProduct}
              onAdjustStock={handleAdjustStock}
              setAccountingRecords={setAccountingRecords}
              stockReceipts={stockReceipts}
              setStockReceipts={setStockReceipts}
            />
          )}

          {activeTab === 'contracts' && (
            <LaborContractManagerView
              laborContracts={laborContracts}
              setLaborContracts={setLaborContracts}
              employees={employees}
              settings={settings}
            />
          )}

          {activeTab === 'accounting' && (
            <AccountingView
              records={accountingRecords}
              orders={orders}
              customers={customers}
              employees={employees}
              eInvoices={eInvoices}
              setEInvoices={setEInvoices}
              settings={settings}
              onSaveRecord={handleSaveAccountingRecord}
              onCollectDebt={handleCollectDebt}
            />
          )}

          {activeTab === 'hr' && (
            <HrView
              employees={employees}
              laborContracts={laborContracts}
              setLaborContracts={setLaborContracts}
              settings={settings}
              onSaveEmployee={handleSaveEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'quotes' && (
            <QuotesView
              quotes={quotes}
              products={products}
              customers={customers}
              settings={settings}
              onSaveQuote={handleSaveQuote}
              onConvertToOrder={handleConvertQuoteToOrder}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              products={products}
              settings={settings}
              onSaveSupplier={handleSaveSupplier}
              onSavePurchaseOrder={handleSavePurchaseOrder}
            />
          )}

          {activeTab === 'costing' && (
            <CostingView
              costingList={costingList}
              products={products}
              onSaveCosting={handleSaveCosting}
              onAssembleProduct={handleAssembleProduct}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              inventoryLogs={inventoryLogs}
              inboundInvoices={inboundInvoices}
              setInboundInvoices={setInboundInvoices}
              setAccountingRecords={setAccountingRecords}
              settings={settings}
              stockReceipts={stockReceipts}
              setStockReceipts={setStockReceipts}
              onRefreshDb={fetchFreshDataFromDb}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsView
              assets={assets}
              onSaveAsset={handleSaveAsset}
              onDeleteAsset={handleDeleteAsset}
              settings={settings}
            />
          )}

          {activeTab === 'warranties' && (
            <WarrantyView
              warranties={warranties}
              onSaveWarranty={handleSaveWarranty}
              onUpdateWarranty={handleUpdateWarranty}
              serialRecords={serialRecords}
              products={products}
              customers={customers}
              orders={orders}
              settings={settings}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onRefreshDb={fetchFreshDataFromDb}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView orders={orders} products={products} />
          )}

          {activeTab === 'ai' && (
            <AiAdvisorView
              products={products}
              orders={orders}
              customers={customers}
              quotes={quotes}
              warranties={warranties}
              eInvoices={eInvoices}
              laborContracts={laborContracts}
              employees={employees}
              accountingRecords={accountingRecords}
              settings={settings}
              onNavigate={(tab: any) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'promotions' && (
            <PromotionsView
              promotions={promotions}
              onSavePromotion={handleSavePromotion}
              onDeletePromotion={handleDeletePromotion}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={resetToInitialData}
              onExportAllData={handleExportAllData}
              onRefreshData={() => fetchFreshDataFromDb()}
            />
          )}
        </main>
      </div>

      {/* AI Assistant Omnipresent Drawer (Accessed via F1 or Navbar) */}
      <AiAssistantDrawer
        isOpen={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
        products={products}
        customers={customers}
        quotes={quotes}
        orders={orders}
        warranties={warranties}
        eInvoices={eInvoices}
        laborContracts={laborContracts}
        employees={employees}
        accountingRecords={accountingRecords}
        settings={settings}
        onNavigate={(tab) => {
          setActiveTab(tab as any);
        }}
      />

      {/* Cash Shift Modal */}
      {showShiftModal && (
        <ShiftModal
          currentShift={currentShift}
          onOpenShift={async (shiftData) => {
            const newShift: CashShift = {
              id: 'shift-' + Date.now(),
              shiftName: shiftData.shiftName,
              staffName: shiftData.staffName,
              startTime: new Date().toISOString(),
              initialCash: shiftData.initialCash,
              cashSales: 0,
              transferSales: 0,
              cardSales: 0,
              otherSales: 0,
              totalSales: 0,
              cashWithdrawals: 0,
              expectedEndingCash: shiftData.initialCash,
              status: 'open',
            };
            setCurrentShift(newShift);
            setShifts((prev) => [newShift, ...prev]);
            setShowShiftModal(false);

            try {
              const res = await posApi.openShift({
                shiftName: shiftData.shiftName,
                staffName: shiftData.staffName,
                initialCash: shiftData.initialCash,
              });
              if (res) {
                setCurrentShift(res as any);
              }
            } catch (err: any) {
              console.warn('API openShift warning:', err.message);
            }
          }}
          onCloseShift={async (actualCash, note) => {
            if (currentShift) {
              const closedShift: CashShift = {
                ...currentShift,
                actualEndingCash: actualCash,
                note,
                endTime: new Date().toISOString(),
                status: 'closed',
              };
              setCurrentShift(null);
              setShifts((prev) => [closedShift, ...prev.filter((s) => s.id !== currentShift.id)]);

              try {
                await posApi.closeShift(currentShift.id, {
                  actualEndingCash: actualCash,
                  note,
                });
              } catch (err: any) {
                console.warn('API closeShift warning:', err.message);
              }
            }
            setShowShiftModal(false);
          }}
          onCloseModal={() => setShowShiftModal(false)}
        />
      )}

      {/* Fraud Alert Modal */}
      {activeFraudAlert && (
        <FraudModal
          alert={activeFraudAlert}
          onClose={() => setActiveFraudAlert(null)}
          onResolve={handleResolveFraudAlert}
        />
      )}

      {/* Desktop Quick Stock Modal (Nhập kho, Xuất kho, Kiểm kho) */}
      <QuickStockModal
        isOpen={showQuickStockModal}
        onClose={() => setShowQuickStockModal(false)}
        products={products}
        onAdjustStock={handleAdjustStock}
        initialType={quickStockType}
      />

      {/* Desktop Hardware Device Manager Modal (Máy in bill K80, máy quét mã vạch 2D, POS quẹt thẻ, cân điện tử, két tiền) */}
      <DeviceManagerModal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />

      {/* SQL Server Connection & Setup Modal */}
      <DatabaseConfigModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />

      {/* User Login & Role Switch Modal */}
      <LoginModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* POS Keyboard Shortcuts Modal (Root Level) */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Unified Barcode Scanner & Physical/Virtual Printer Hub Modal (F3) */}
      {showScannerPrinterHubModal && (
        <ScannerPrinterHubModal
          isOpen={showScannerPrinterHubModal}
          onClose={() => {
            setShowScannerPrinterHubModal(false);
            setScannerHubInitialCode('');
          }}
          initialScanCode={scannerHubInitialCode}
          initialTab={scannerHubInitialTab}
          products={products}
          orders={orders}
          warranties={warranties}
          serialRecords={serialRecords}
          assets={assets}
          settings={settings}
          onAddToCart={(product) => {
            setActiveTab('pos');
          }}
          onAdjustStock={handleAdjustStock}
          onSaveProduct={handleSaveProduct}
          onSaveSerialRecord={(rec) => setSerialRecords((prev) => [rec, ...prev])}
          onNavigateToPos={() => setActiveTab('pos')}
          onOpenBarcodeLabelModal={(prod) => {
            setBarcodeModalProduct(prod);
            setShowBarcodeModal(true);
          }}
          onUpdateSettings={setSettings}
        />
      )}

      {/* Product Barcode & QR Code Label Modal */}
      {showBarcodeModal && (
        <ProductBarcodeLabelModal
          isOpen={showBarcodeModal}
          onClose={() => {
            setShowBarcodeModal(false);
            setBarcodeModalProduct(null);
          }}
          products={products}
          initialSelectedProduct={barcodeModalProduct}
          settings={settings}
        />
      )}
    </div>
  );
}

export default App;

