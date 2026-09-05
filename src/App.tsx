import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStoreState } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ViewLoadingSkeleton } from './components/common/ViewLoadingSkeleton';

// Lazy-loaded Views (On-Demand Code Splitting)
const PosView = lazy(() => import('./components/pos/PosView').then((m) => ({ default: m.PosView })));
const OrdersView = lazy(() => import('./components/orders/OrdersView').then((m) => ({ default: m.OrdersView })));
const InventoryView = lazy(() => import('./components/inventory/InventoryView').then((m) => ({ default: m.InventoryView })));
const CustomersView = lazy(() => import('./components/customers/CustomersView').then((m) => ({ default: m.CustomersView })));
const AnalyticsView = lazy(() => import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const AiAdvisorView = lazy(() => import('./components/ai/AiAdvisorView').then((m) => ({ default: m.AiAdvisorView })));
const PromotionsView = lazy(() => import('./components/promotions/PromotionsView').then((m) => ({ default: m.PromotionsView })));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView })));
const AccountingView = lazy(() => import('./components/accounting/AccountingView').then((m) => ({ default: m.AccountingView })));
const HrView = lazy(() => import('./components/hr/HrView').then((m) => ({ default: m.HrView })));
const EInvoiceManagerView = lazy(() => import('./components/invoices/EInvoiceManagerView').then((m) => ({ default: m.EInvoiceManagerView })));
const LaborContractManagerView = lazy(() => import('./components/contracts/LaborContractManagerView').then((m) => ({ default: m.LaborContractManagerView })));
const ContractsManagementHubView = lazy(() => import('./components/contracts/ContractsManagementHubView').then((m) => ({ default: m.ContractsManagementHubView })));
const QuotesView = lazy(() => import('./components/quotes/QuotesView').then((m) => ({ default: m.QuotesView })));
const CostingView = lazy(() => import('./components/costing/CostingView').then((m) => ({ default: m.CostingView })));
const AssetsView = lazy(() => import('./components/assets/AssetsView').then((m) => ({ default: m.AssetsView })));
const WarrantyView = lazy(() => import('./components/warranty/WarrantyView').then((m) => ({ default: m.WarrantyView })));
const SuppliersView = lazy(() => import('./components/suppliers/SuppliersView').then((m) => ({ default: m.SuppliersView })));
const AccountsManagerView = lazy(() => import('./components/accounts/AccountsManagerView').then((m) => ({ default: m.AccountsManagerView })));
const MasterDataManagerView = lazy(() => import('./components/masterdata/MasterDataManagerView').then((m) => ({ default: m.MasterDataManagerView })));
const ProjectsManagerView = lazy(() => import('./components/projects/ProjectsManagerView').then((m) => ({ default: m.ProjectsManagerView })));
const ApprovalsView = lazy(() => import('./components/approvals/ApprovalsView').then((m) => ({ default: m.ApprovalsView })));

// Lazy-loaded Modals & Drawers (Chỉ tải khi mở)
const FraudModal = lazy(() => import('./components/ai/FraudModal').then((m) => ({ default: m.FraudModal })));
const ShiftModal = lazy(() => import('./components/pos/ShiftModal').then((m) => ({ default: m.ShiftModal })));
const QuickStockModal = lazy(() => import('./components/common/QuickStockModal').then((m) => ({ default: m.QuickStockModal })));
const DeviceManagerModal = lazy(() => import('./components/common/DeviceManagerModal').then((m) => ({ default: m.DeviceManagerModal })));
const DatabaseConfigModal = lazy(() => import('./components/settings/DatabaseConfigModal').then((m) => ({ default: m.DatabaseConfigModal })));
const LoginModal = lazy(() => import('./features/auth/components/LoginModal').then((m) => ({ default: m.LoginModal })));
const ShortcutsModal = lazy(() => import('./components/common/ShortcutsModal').then((m) => ({ default: m.ShortcutsModal })));
const ScannerPrinterHubModal = lazy(() => import('./components/common/ScannerPrinterHubModal').then((m) => ({ default: m.ScannerPrinterHubModal })));
const DocumentOcrScannerModal = lazy(() => import('./components/common/DocumentOcrScannerModal').then((m) => ({ default: m.DocumentOcrScannerModal })));
const UniversalDocSearchModal = lazy(() => import('./components/common/UniversalDocSearchModal').then((m) => ({ default: m.UniversalDocSearchModal })));
const ProductBarcodeLabelModal = lazy(() => import('./components/inventory/ProductBarcodeLabelModal').then((m) => ({ default: m.ProductBarcodeLabelModal })));
const AiAssistantDrawer = lazy(() => import('./components/ai/AiAssistantDrawer').then((m) => ({ default: m.AiAssistantDrawer })));
const DigitalSignatureHubModal = lazy(() => import('./components/signatures/DigitalSignatureHubModal').then((m) => ({ default: m.DigitalSignatureHubModal })));

import { useAuth } from './core/contexts/AuthContext';
import { getDefaultModuleForRole } from './config/rbac.config';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { LoginView } from './features/auth/components/LoginView';

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
import { formatVND } from './utils/currency';
import { settingsApi } from './features/settings/api/settingsApi';
import { fraudAlertsApi } from './features/fraud-alerts/api/fraudAlertsApi';
import { suppliersApi } from './features/suppliers/api/suppliersApi';
import { returnsApi } from './features/returns/api/returnsApi';
import { transfersApi } from './features/transfers/api/transfersApi';
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
  EInvoice,
  CashShift,
  CartItem,
  PaymentMethod,
  Supplier,
  PurchaseOrder,
  ReturnOrder,
  StockTransfer,
  LoadedQuoteData,
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

  const { user, isAuthenticated, hasModuleAccess } = useAuth();

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
    | 'accounts'
    | 'masterdata'
    | 'settings'
    | 'einvoices'
    | 'contracts'
    | 'projects'
    | 'approvals'
  >('pos');

  // Redirection when user switches to a role without permission to current tab
  useEffect(() => {
    if (user && !hasModuleAccess(activeTab)) {
      const fallbackTab = getDefaultModuleForRole(user.role);
      setActiveTab(fallbackTab as any);
    }
  }, [user?.role, user?.username, hasModuleAccess, activeTab]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const handleSaveSupplier = async (supplier: Supplier) => {
    setSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id || s.code === supplier.code);
      if (exists) {
        return prev.map((s) => (s.id === supplier.id || s.code === supplier.code ? supplier : s));
      }
      return [supplier, ...prev];
    });

    try {
      const exists = suppliers.some((s) => s.id === supplier.id || s.code === supplier.code);
      if (exists) {
        await suppliersApi.updateSupplier(supplier.id, supplier);
      } else {
        await suppliersApi.createSupplier(supplier);
      }
      const fresh = await suppliersApi.getSuppliers({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setSuppliers(fresh.data);
    } catch (err: any) {
      console.warn('API supplier sync warning:', err.message);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    try {
      await suppliersApi.deleteSupplier(supplierId);
      const fresh = await suppliersApi.getSuppliers({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setSuppliers(fresh.data);
    } catch (err: any) {
      console.warn('API supplier delete warning:', err.message);
    }
  };

  const handleSavePurchaseOrder = async (po: PurchaseOrder) => {
    setPurchaseOrders((prev) => [po, ...prev.filter((p) => p.id !== po.id)]);
    try {
      const exists = purchaseOrders.some((p) => p.id === po.id || p.code === po.code);
      if (exists) {
        await suppliersApi.updatePurchaseOrderStatus(po.id, {
          status: po.status,
          paidAmount: po.paidAmount,
          paymentStatus: po.paymentStatus,
          notes: po.notes,
        });
      } else {
        await suppliersApi.createPurchaseOrder(po);
      }
      const fresh = await suppliersApi.getPurchaseOrders({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setPurchaseOrders(fresh.data);
    } catch (err: any) {
      console.warn('API purchase order sync warning:', err.message);
    }
  };

  const handleDeletePurchaseOrder = async (poId: string) => {
    setPurchaseOrders((prev) => prev.filter((p) => p.id !== poId));
    try {
      await suppliersApi.deletePurchaseOrder(poId);
      const fresh = await suppliersApi.getPurchaseOrders({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setPurchaseOrders(fresh.data);
    } catch (err: any) {
      console.warn('API purchase order delete warning:', err.message);
    }
  };

  // 16. Return Orders (Phiếu Trả Hàng & Hoàn Tiền)
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>(() => {
    const saved = localStorage.getItem('gp_erp_return_orders_data');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveReturnOrder = async (newReturn: ReturnOrder) => {
    setReturnOrders((prev) => {
      const next = [newReturn, ...prev.filter((r) => r.id !== newReturn.id)];
      localStorage.setItem('gp_erp_return_orders_data', JSON.stringify(next));
      return next;
    });

    try {
      await returnsApi.createReturnOrder(newReturn);
      fetchFreshDataFromDb();
    } catch (err: any) {
      console.warn('API return order sync warning:', err.message);
    }
  };

  const handleDeleteReturnOrder = async (id: string) => {
    setReturnOrders((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem('gp_erp_return_orders_data', JSON.stringify(next));
      return next;
    });

    try {
      await returnsApi.deleteReturnOrder(id);
      fetchFreshDataFromDb();
    } catch (err: any) {
      console.warn('API return order delete warning:', err.message);
    }
  };

  // 17. Inter-Branch Stock Transfers (Chuyển Kho Nội Bộ)
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem('gp_erp_stock_transfers_data');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveStockTransfer = async (newTransfer: StockTransfer) => {
    setStockTransfers((prev) => {
      const next = [newTransfer, ...prev.filter((t) => t.id !== newTransfer.id)];
      localStorage.setItem('gp_erp_stock_transfers_data', JSON.stringify(next));
      return next;
    });

    try {
      await transfersApi.createTransfer(newTransfer);
      fetchFreshDataFromDb();
    } catch (err: any) {
      console.warn('API stock transfer sync warning:', err.message);
    }
  };

  const handleUpdateStockTransferStatus = async (
    id: string,
    payload: { status: string; receiverName?: string; notes?: string }
  ) => {
    setStockTransfers((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: payload.status as any,
              receiverName: payload.receiverName || t.receiverName,
              receivedDate: new Date().toISOString(),
            }
          : t
      );
      localStorage.setItem('gp_erp_stock_transfers_data', JSON.stringify(next));
      return next;
    });

    try {
      await transfersApi.updateTransferStatus(id, payload);
      fetchFreshDataFromDb();
    } catch (err: any) {
      console.warn('API stock transfer update warning:', err.message);
    }
  };

  const handleDeleteStockTransfer = async (id: string) => {
    setStockTransfers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem('gp_erp_stock_transfers_data', JSON.stringify(next));
      return next;
    });

    try {
      await transfersApi.deleteTransfer(id);
      fetchFreshDataFromDb();
    } catch (err: any) {
      console.warn('API stock transfer delete warning:', err.message);
    }
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
  const [loadedQuoteData, setLoadedQuoteData] = useState<LoadedQuoteData | null>(null);
  const [showDocOcrModal, setShowDocOcrModal] = useState(false);
  const [showUniversalDocSearch, setShowUniversalDocSearch] = useState(false);
  const [showDigitalSignatureHubModal, setShowDigitalSignatureHubModal] = useState(false);
  const [docOcrInitialMode, setDocOcrInitialMode] = useState<'stock_in' | 'supplier_quote' | 'purchase_order' | 'customer_quote'>('stock_in');

  const handleOpenDocOcrScanner = (mode: 'stock_in' | 'supplier_quote' | 'purchase_order' | 'customer_quote' = 'stock_in') => {
    setDocOcrInitialMode(mode);
    setShowDocOcrModal(true);
  };

  const handleApplyOcrStockIn = async (data: { supplierName: string; documentCode: string; items: any[] }) => {
    const docCode = data.documentCode || `PNK-OCR-${Date.now().toString().slice(-4)}`;
    const receiptItems: any[] = [];
    let totalCostAmount = 0;
    let totalQty = 0;

    for (const it of data.items) {
      const qty = Number(it.quantity) || 1;
      const unitCost = Number(it.unitPrice) || 0;
      totalQty += qty;
      totalCostAmount += qty * unitCost;

      const existing = products.find(
        (p) =>
          (it.sku && p.sku.toLowerCase() === it.sku.toLowerCase()) ||
          p.name.toLowerCase() === it.productName.toLowerCase()
      );

      if (existing) {
        const oldStock = Number(existing.stock) || 0;
        const newStock = oldStock + qty;
        await handleAdjustStock({
          productId: existing.id,
          productName: existing.name,
          sku: existing.sku,
          type: 'import',
          quantityChange: qty,
          oldStock,
          newStock,
          unitPrice: unitCost,
          reason: `Nhập kho tự động từ quét AI Vision OCR phiếu ${docCode}`,
          performedBy: 'Thủ kho AI OCR',
        });
        receiptItems.push({
          productId: existing.id,
          productName: existing.name,
          sku: existing.sku,
          unit: existing.unit || it.unit || 'Cái',
          quantity: qty,
          oldStock,
          newStock,
          oldCostPrice: existing.costPrice,
          newCostPrice: unitCost,
          unitCost,
          taxRate: 10,
          totalAmount: qty * unitCost,
          storageLocation: existing.storageLocation || 'Kệ A-01',
          warehouse: existing.warehouse || 'Kho Tổng Gia Phúc TP.HCM',
        });
      } else {
        const newProdId = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        const newSku = it.sku || ('SP-' + Date.now().toString().slice(-4));
        const newProd: Product = {
          id: newProdId,
          sku: newSku,
          barcode: it.sku || ('893' + Date.now().toString().slice(-9)),
          name: it.productName,
          category: 'Camera & An Ninh',
          unit: it.unit || 'Cái',
          costPrice: unitCost,
          sellingPrice: Math.round(unitCost * 1.25),
          stock: qty,
          minStock: 5,
          image: '',
          storageLocation: 'Kệ A-01',
          warehouse: 'Kho Tổng Gia Phúc TP.HCM',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await handleSaveProduct(newProd);
        receiptItems.push({
          productId: newProdId,
          productName: newProd.name,
          sku: newProd.sku,
          unit: newProd.unit,
          quantity: qty,
          oldStock: 0,
          newStock: qty,
          oldCostPrice: unitCost,
          newCostPrice: unitCost,
          unitCost,
          taxRate: 10,
          totalAmount: qty * unitCost,
          storageLocation: 'Kệ A-01',
          warehouse: 'Kho Tổng Gia Phúc TP.HCM',
        });
      }
    }

    try {
      await warehouseApi.createGoodsReceipt({
        code: docCode,
        supplierName: data.supplierName || 'Nhà Cung Cấp',
        warehouseName: 'Kho Tổng Gia Phúc TP.HCM',
        creatorName: 'AI OCR Scanner',
        receivedBy: 'Thủ kho AI',
        totalItemsCount: data.items.length,
        totalQuantity: totalQty,
        totalCostAmount,
        totalTaxAmount: Math.round(totalCostAmount * 0.1),
        grandTotal: Math.round(totalCostAmount * 1.1),
        paymentStatus: 'paid',
        notes: `Phiếu nhập tự động từ quét AI OCR: ${docCode}`,
        items: receiptItems,
      });
      await fetchFreshDataFromDb({ silent: true });
    } catch (err: any) {
      console.warn('API createGoodsReceipt OCR warning:', err.message);
    }

    alert(`🎉 Đã nhập kho thành công ${data.items.length} mặt hàng từ chứng từ ${docCode} vào CSDL SQL Server!`);
  };

  const handleApplyOcrSupplierQuote = (data: { supplierName: string; items: any[] }) => {
    const existingSup = suppliers.find((s) => s.name.toLowerCase().includes(data.supplierName.toLowerCase()) || data.supplierName.toLowerCase().includes(s.name.toLowerCase()));
    if (existingSup) {
      const updatedPriceList = [...(existingSup.priceList || [])];
      data.items.forEach((it) => {
        const idx = updatedPriceList.findIndex((p) => p.sku.toLowerCase() === it.sku.toLowerCase());
        if (idx >= 0) {
          updatedPriceList[idx] = {
            sku: it.sku,
            productName: it.productName,
            costPrice: Number(it.unitPrice) || updatedPriceList[idx].costPrice,
            warrantyMonths: it.warrantyMonths || 24,
            moq: 1,
          };
        } else {
          updatedPriceList.push({
            sku: it.sku,
            productName: it.productName,
            costPrice: Number(it.unitPrice) || 0,
            warrantyMonths: it.warrantyMonths || 24,
            moq: 1,
          });
        }
      });
      handleSaveSupplier({ ...existingSup, priceList: updatedPriceList });
      alert(`🎉 Đã cập nhật bảng giá ${data.items.length} SKU cho Nhà cung ứng: ${existingSup.name}`);
    } else {
      const newSup: Supplier = {
        id: 'sup-' + Date.now(),
        code: 'NCC-' + Date.now().toString().slice(-4),
        name: data.supplierName || 'Nhà Cung Ứng Mới',
        taxCode: '0101234567',
        tier: 'Tổng Đại Lý',
        category: 'Camera & An Ninh',
        contactPerson: 'Đại diện bán hàng',
        phone: '0901234567',
        email: 'sales@supplier.com',
        address: 'Hà Nội / TP.HCM',
        creditLimit: 100000000,
        creditDays: 30,
        currentDebt: 0,
        ratingQuality: 9.5,
        ratingPrice: 9.0,
        ratingOnTime: 9.5,
        ratingWarranty: 9.2,
        priceList: data.items.map((it) => ({
          sku: it.sku,
          productName: it.productName,
          costPrice: Number(it.unitPrice) || 0,
          warrantyMonths: it.warrantyMonths || 24,
          moq: 1,
        })),
        createdAt: new Date().toISOString(),
      };
      handleSaveSupplier(newSup);
      alert(`🎉 Đã tạo mới hồ sơ NCC "${newSup.name}" với ${data.items.length} SKU bảng giá!`);
    }
    setActiveTab('suppliers');
  };

  const handleApplyOcrPurchaseOrder = (data: { supplierName: string; documentCode: string; items: any[] }) => {
    const subtotal = data.items.reduce((acc, it) => acc + (Number(it.total) || (Number(it.quantity) * Number(it.unitPrice))), 0);
    const vatAmount = Math.round(subtotal * 0.1);
    const newPO: PurchaseOrder = {
      id: 'po-' + Date.now(),
      code: data.documentCode || ('PO-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4)),
      supplierId: suppliers[0]?.id || 'sup-main',
      supplierName: data.supplierName || 'Nhà Cung Ứng',
      supplierPhone: '0901234567',
      supplierAddress: 'Kho Nhà Cung Cấp',
      warehouseId: 'wh-main',
      warehouseName: 'Kho Tổng Gia Phúc TP.HCM',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      status: 'confirmed',
      items: data.items.map((it) => ({
        sku: it.sku,
        productName: it.productName,
        unit: it.unit || 'Cái',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || (Number(it.quantity) * Number(it.unitPrice)),
      })),
      subtotal,
      vatRate: 10,
      vatAmount,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: subtotal + vatAmount,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      paymentMethod: 'debt_30d',
      notes: 'Lập tự động từ chức năng Quét Phiếu AI Vision.',
      createdAt: new Date().toISOString(),
    };
    handleSavePurchaseOrder(newPO);
    setActiveTab('suppliers');
    alert(`🎉 Đã tạo thành công Đơn Đặt Hàng Mua ${newPO.code}!`);
  };

  const handleApplyOcrCustomerQuote = (data: { items: any[]; markupPercent: number }) => {
    const quoteItems: CartItem[] = data.items.map((it) => {
      const cost = Number(it.unitPrice) || 0;
      const sell = Math.round(cost * (1 + (data.markupPercent || 25) / 100));
      return {
        product: {
          id: 'ocr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          sku: it.sku,
          barcode: it.sku,
          name: it.productName,
          category: 'Camera & An Ninh',
          unit: it.unit || 'Bộ',
          costPrice: cost,
          sellingPrice: sell,
          stock: 100,
          minStock: 5,
          image: '',
          storageLocation: 'Kho Tổng',
          warehouse: 'Kho Tổng Gia Phúc TP.HCM',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        quantity: Number(it.quantity) || 1,
        unitPrice: sell,
        discountPercent: 0,
        customPrice: sell,
      };
    });

    setLoadedQuoteData({
      quoteId: 'ocr-' + Date.now(),
      quoteCode: 'BG-OCR-' + Date.now().toString().slice(-4),
      items: quoteItems,
      customer: customers[0] || null,
    });
    setActiveTab('pos');
    alert(`🎉 Đã chuyển đổi ${data.items.length} mặt hàng (+${data.markupPercent}% lãi gộp) sang giỏ hàng POS / Báo giá!`);
  };

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
      } else if (e.key === 'F7') {
        e.preventDefault();
        setShowUniversalDocSearch((prev) => !prev);
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
        fraudRes,
        suppliersRes,
        poRes,
        returnsRes,
        transfersRes,
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
        fraudAlertsApi.getAlerts({ limit: 500 }),
        suppliersApi.getSuppliers({ limit: 500 }),
        suppliersApi.getPurchaseOrders({ limit: 500 }),
        returnsApi.getReturnOrders({ limit: 500 }),
        transfersApi.getTransfers({ limit: 500 }),
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
      if (fraudRes.status === 'fulfilled' && fraudRes.value?.data && Array.isArray(fraudRes.value.data)) {
        setFraudAlerts(fraudRes.value.data);
      }
      if (suppliersRes.status === 'fulfilled' && suppliersRes.value?.data && Array.isArray(suppliersRes.value.data)) {
        setSuppliers(suppliersRes.value.data);
      }
      if (poRes.status === 'fulfilled' && poRes.value?.data && Array.isArray(poRes.value.data)) {
        setPurchaseOrders(poRes.value.data);
      }
      if (returnsRes.status === 'fulfilled' && returnsRes.value?.data && Array.isArray(returnsRes.value.data)) {
        setReturnOrders(returnsRes.value.data);
        localStorage.setItem('gp_erp_return_orders_data', JSON.stringify(returnsRes.value.data));
      }
      if (transfersRes.status === 'fulfilled' && transfersRes.value?.data && Array.isArray(transfersRes.value.data)) {
        setStockTransfers(transfersRes.value.data);
        localStorage.setItem('gp_erp_stock_transfers_data', JSON.stringify(transfersRes.value.data));
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

  const handleIssueEInvoice = async (newInv: EInvoice) => {
    setEInvoices((prev) => [newInv, ...prev]);
    try {
      await einvoicesApi.createInvoice(newInv);
      const fresh = await einvoicesApi.getInvoices({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setEInvoices(fresh.data);
    } catch (err: any) {
      console.warn('API issue e-invoice error:', err.message);
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

    // Auto-complete Source Price Quote if order was converted from Quote
    if (newOrder.sourceQuoteId) {
      const quoteId = newOrder.sourceQuoteId;
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) => {
          if (q.id === quoteId || q.code === newOrder.sourceQuoteCode) {
            const completedQuote: PriceQuote = {
              ...q,
              status: 'completed',
              orderCode: newOrder.code,
              convertedOrderCode: newOrder.code,
              convertedOrderId: newOrder.id,
              completedAt: new Date().toISOString(),
              lockedByPosSession: null,
              lockExpiry: undefined,
              lifecycleHistory: [
                {
                  id: `tl-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  author: newOrder.dispatchedBy || currentShift?.staffName || 'Thu Ngân POS',
                  fromStatus: q.status,
                  toStatus: 'completed',
                  note: `Đã hoàn tất thanh toán hóa đơn ${newOrder.code} tại quầy POS (Tổng thanh toán: ${formatVND(newOrder.total)})`,
                },
                ...(q.lifecycleHistory || []),
              ],
            };

            // Call backend API async
            quotesApi.updateQuote(q.id, completedQuote).catch((err: any) => {
              console.warn('API updateQuote on complete warning:', err.message);
            });

            return completedQuote;
          }
          return q;
        })
      );

      setLoadedQuoteData(null);
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

  const handleResolveFraudAlert = async (alertId: string) => {
    setFraudAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
    try {
      await fraudAlertsApi.resolveAlert(alertId);
      const fresh = await fraudAlertsApi.getAlerts({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setFraudAlerts(fresh.data);
    } catch (err: any) {
      console.warn('API resolve fraud alert warning:', err.message);
    }
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
    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === newQuote.id || q.code === newQuote.code);
      if (exists) {
        return prev.map((q) => (q.id === newQuote.id || q.code === newQuote.code ? newQuote : q));
      }
      return [newQuote, ...prev];
    });

    try {
      const exists = quotes.some((q) => q.id === newQuote.id || q.code === newQuote.code);
      if (exists) {
        await quotesApi.updateQuote(newQuote.id, newQuote);
      } else {
        await quotesApi.createQuote(newQuote);
      }
      const fresh = await quotesApi.getQuotes({ limit: 500 });
      if (fresh?.data && Array.isArray(fresh.data)) setQuotes(fresh.data);
    } catch (err: any) {
      console.warn('API quote sync warning:', err.message);
    }
  };

  const handleConvertQuoteToOrder = async (quote: PriceQuote) => {
    // 1. Double conversion prevention
    if (quote.status === 'completed' || quote.convertedOrderCode) {
      alert(`Báo giá "${quote.code}" đã được thanh toán và hoàn tất trong hóa đơn ${quote.convertedOrderCode || quote.orderCode}!`);
      return;
    }

    // 2. Concurrency lock check (15 minutes)
    if (
      quote.lockedByPosSession &&
      quote.lockExpiry &&
      new Date(quote.lockExpiry).getTime() > Date.now()
    ) {
      if (
        !window.confirm(
          `Báo giá "${quote.code}" đang được nạp tại một phiên POS khác. Bạn có chắc muốn ghi đè phiên và tiếp tục không?`
        )
      ) {
        return;
      }
    }

    // 3. Price preservation: preserve quote unitPrice, customPrice, discountPercent
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
        discountPercent: quote.discountPercent || 0,
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

    const quoteSnapshot = {
      quoteId: quote.id,
      quoteCode: quote.code,
      totalAmount: quote.totalAmount,
      discountPercent: quote.discountPercent,
      finalTotal: quote.finalTotal,
      validUntil: quote.validUntil,
      items: quote.items,
    };

    setLoadedQuoteData({
      quoteId: quote.id,
      quoteCode: quote.code,
      items: cartItems,
      customer: matchingCustomer,
      validUntil: quote.validUntil,
      originalNotes: quote.notes,
      quoteSnapshot,
    });

    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const updatedQuote: PriceQuote = {
      ...quote,
      status: 'converted_to_order',
      lockedByPosSession: 'pos_session_' + Date.now(),
      lockExpiry,
      quoteSnapshot,
      lifecycleHistory: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: settings.defaultCreatorName || 'Nhân Viên Bán Hàng',
          fromStatus: quote.status,
          toStatus: 'converted_to_order',
          note: `Đã nạp báo giá vào giỏ hàng POS để tiến hành quét Serial và thanh toán`,
        },
        ...(quote.lifecycleHistory || []),
      ],
    };

    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? updatedQuote : q)));

    try {
      await quotesApi.updateQuote(quote.id, updatedQuote);
    } catch (e: any) {
      console.warn('API quote status update warning:', e.message);
    }
  };

  const handleCancelLoadedQuote = async () => {
    if (loadedQuoteData?.quoteId) {
      const quoteId = loadedQuoteData.quoteId;
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) => {
          if (q.id === quoteId && q.status !== 'completed') {
            const revertedQuote: PriceQuote = {
              ...q,
              status: 'approved',
              lockedByPosSession: null,
              lockExpiry: undefined,
              lifecycleHistory: [
                {
                  id: `tl-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  author: 'Thu Ngân POS',
                  fromStatus: q.status,
                  toStatus: 'approved',
                  note: 'Đã hủy nạp báo giá tại quầy POS, giải phóng khóa và trả về trạng thái Đã Duyệt',
                },
                ...(q.lifecycleHistory || []),
              ],
            };

            quotesApi.updateQuote(q.id, revertedQuote).catch((err: any) => {
              console.warn('API updateQuote on cancel warning:', err.message);
            });

            return revertedQuote;
          }
          return q;
        })
      );
    }
    setLoadedQuoteData(null);
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
    setCostingList((prev) => {
      const exists = prev.some((c) => c.id === costing.id || c.sku === costing.sku);
      if (exists) {
        return prev.map((c) => (c.id === costing.id || c.sku === costing.sku ? costing : c));
      }
      return [costing, ...prev];
    });

    try {
      const exists = costingList.some((c) => c.id === costing.id || c.sku === costing.sku);
      if (exists) {
        await costingApi.updateCosting(costing.id, costing);
      } else {
        await costingApi.createCosting(costing);
      }
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

  const handleResetAllData = () => {
    resetToInitialData();
    setSuppliers([]);
    setPurchaseOrders([]);
    localStorage.removeItem('gp_erp_suppliers_data');
    localStorage.removeItem('gp_erp_purchase_orders_data');
  };

  const pendingOrdersCount = (orders || []).filter((o) => o && o.status === 'pending').length;
  const lowStockCount = (products || []).filter((p) => p && p.stock <= p.minStock).length;

  if (!isAuthenticated) {
    return <LoginView settings={settings} onLoginSuccess={() => {}} />;
  }

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
        onOpenAuthModal={() => setShowAuthModal(true)}
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
          onOpenDocOcrScanner={() => handleOpenDocOcrScanner('stock_in')}
          onOpenUniversalSearch={() => setShowUniversalDocSearch(true)}
          onOpenDigitalSignatureHub={() => setShowDigitalSignatureHubModal(true)}
        />

        {/* View Content */}
        <main className="flex-1 overflow-hidden relative">
          <Suspense fallback={<ViewLoadingSkeleton />}>
            {!hasModuleAccess(activeTab) ? (
              <AccessDeniedView
                moduleId={activeTab}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenAuthModal={() => setShowAuthModal(true)}
              />
            ) : (
              <>
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
                    onIssueEInvoice={handleIssueEInvoice}
                    loadedQuoteData={loadedQuoteData}
                    onClearLoadedQuoteData={() => setLoadedQuoteData(null)}
                    onCancelLoadedQuote={handleCancelLoadedQuote}
                    serialRecords={serialRecords}
                    onSaveSerialRecords={setSerialRecords}
                  />
                )}

                {activeTab === 'orders' && (
                  <OrdersView
                    orders={orders}
                    products={products}
                    customers={customers}
                    returns={returnOrders}
                    serialRecords={serialRecords}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onSaveOrder={handleSaveOrder}
                    onAdjustStock={handleAdjustStock}
                    onSaveReturn={handleSaveReturnOrder}
                    onDeleteReturn={handleDeleteReturnOrder}
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
                    onSaveSettings={handleSaveSettings}
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
                  <ContractsManagementHubView
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
                    onSaveSettings={handleSaveSettings}
                    onSaveQuote={handleSaveQuote}
                    onConvertToOrder={handleConvertQuoteToOrder}
                    onOpenDocOcrScanner={(mode) => handleOpenDocOcrScanner(mode || 'customer_quote')}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'projects' && (
                  <ProjectsManagerView
                    products={products}
                    customers={customers}
                    employees={employees}
                    onNavigateTab={setActiveTab}
                    onRefreshGlobalData={fetchFreshDataFromDb}
                  />
                )}

                {activeTab === 'approvals' && (
                  <ApprovalsView />
                )}

                {activeTab === 'suppliers' && (
                  <SuppliersView
                    suppliers={suppliers}
                    purchaseOrders={purchaseOrders}
                    products={products}
                    settings={settings}
                    onSaveSupplier={handleSaveSupplier}
                    onDeleteSupplier={handleDeleteSupplier}
                    onSavePurchaseOrder={handleSavePurchaseOrder}
                    onDeletePurchaseOrder={handleDeletePurchaseOrder}
                    onAdjustStock={handleAdjustStock}
                    onOpenDocOcrScanner={(mode) => handleOpenDocOcrScanner(mode || 'supplier_quote')}
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
                    transfers={stockTransfers}
                    onSaveTransfer={handleSaveStockTransfer}
                    onUpdateTransferStatus={handleUpdateStockTransferStatus}
                    onDeleteTransfer={handleDeleteStockTransfer}
                    onRefreshDb={fetchFreshDataFromDb}
                    onOpenDocOcrScanner={(mode) => handleOpenDocOcrScanner(mode || 'stock_in')}
                    onSavePartner={handleSaveSupplier}
                    onSaveEmployee={handleSaveEmployee}
                    orders={orders}
                    onSaveOrder={handleSaveOrder}
                    serialRecords={serialRecords}
                    setSerialRecords={setSerialRecords}
                    purchaseOrders={purchaseOrders}
                    quotes={quotes}
                    suppliers={suppliers}
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
                    onSaveSerialRecords={setSerialRecords}
                    products={products}
                    onSaveProduct={handleSaveProduct}
                    onAdjustStock={handleAdjustStock}
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
                  <AnalyticsView
                    orders={orders}
                    products={products}
                    customers={customers}
                    employees={employees}
                    laborContracts={laborContracts}
                    shifts={shifts}
                    suppliers={suppliers}
                    purchaseOrders={purchaseOrders}
                    assets={assets}
                    settings={settings}
                    onNavigate={(tab: any) => setActiveTab(tab)}
                    onOpenPO={() => setActiveTab('suppliers')}
                  />
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

                {activeTab === 'accounts' && (
                  <AccountsManagerView />
                )}

                {activeTab === 'masterdata' && (
                  <MasterDataManagerView />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    onResetData={handleResetAllData}
                    onExportAllData={handleExportAllData}
                    onRefreshData={() => fetchFreshDataFromDb()}
                  />
                )}
              </>
            )}
          </Suspense>
        </main>
      </div>

      {/* Lazy Modals & Drawers */}
      <Suspense fallback={null}>
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
          settings={settings}
          onSaveProduct={handleSaveProduct}
          onSavePartner={handleSaveSupplier}
          onSaveEmployee={handleSaveEmployee}
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
          onSuccess={() => {
            setShowDbModal(false);
            window.location.reload();
          }}
        />

        {/* User Login & Role Switch Modal */}
        <LoginModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onNavigateToAccounts={() => setActiveTab('accounts')}
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
            onSaveSerialRecord={async (rec) => {
              setSerialRecords((prev) => [rec, ...prev.filter((s) => s.serialNumber !== rec.serialNumber)]);
              try {
                await warrantiesApi.createOrUpdateSerialDevice(rec);
              } catch (err: any) {
                console.warn('API save serial record warning:', err.message);
              }
            }}
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

        {/* AI Vision Document OCR & Excel/PDF Import Modal */}
        {showDocOcrModal && (
          <DocumentOcrScannerModal
            isOpen={showDocOcrModal}
            onClose={() => setShowDocOcrModal(false)}
            products={products}
            suppliers={suppliers}
            settings={settings}
            initialMode={docOcrInitialMode}
            onApplyStockIn={handleApplyOcrStockIn}
            onApplySupplierQuote={handleApplyOcrSupplierQuote}
            onApplyPurchaseOrder={handleApplyOcrPurchaseOrder}
            onApplyCustomerQuote={handleApplyOcrCustomerQuote}
          />
        )}

        {/* Universal Document Search, Barcode/QR Scanner & Product Lifecycle Center (F7) */}
        {showUniversalDocSearch && (
          <UniversalDocSearchModal
            isOpen={showUniversalDocSearch}
            onClose={() => setShowUniversalDocSearch(false)}
            orders={orders}
            stockReceipts={stockReceipts}
            quotes={quotes}
            warranties={warranties}
            purchaseOrders={purchaseOrders}
            eInvoices={eInvoices}
            inboundInvoices={inboundInvoices}
            products={products}
            customers={customers}
            settings={settings}
          />
        )}

        {/* Digital Signature Hub Modal (Viettel, VNPT, FPT, MISA, BKAV, USB Token) */}
        {showDigitalSignatureHubModal && (
          <DigitalSignatureHubModal
            settings={settings}
            onClose={() => setShowDigitalSignatureHubModal(false)}
            onNavigate={(tab) => {
              setShowDigitalSignatureHubModal(false);
              setActiveTab(tab as any);
            }}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;

