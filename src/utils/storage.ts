import { useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Order,
  Promotion,
  CashShift,
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
  LaborContract,
  InboundEInvoice,
  StockGoodsReceipt,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PROMOTIONS,
  INITIAL_CASH_SHIFT,
  INITIAL_STORE_SETTINGS,
  INITIAL_ACCOUNTING_RECORDS,
  INITIAL_EMPLOYEES,
  INITIAL_QUOTES,
  INITIAL_COSTING,
  INITIAL_ASSETS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_WARRANTY_TICKETS,
  INITIAL_SERIAL_RECORDS,
  INITIAL_EINVOICES,
  INITIAL_LABOR_CONTRACTS,
} from '../data/initialData';
import { INITIAL_INBOUND_INVOICES } from '../data/mockInboundData';

const KEYS = {
  PRODUCTS: 'gperp_products_v2',
  CUSTOMERS: 'gperp_customers_v2',
  ORDERS: 'gperp_orders_v2',
  PROMOTIONS: 'gperp_promotions_v2',
  SHIFT: 'gperp_current_shift_v2',
  SHIFTS_HISTORY: 'gperp_shifts_history_v2',
  SETTINGS: 'gperp_settings_v2',
  INVENTORY_LOGS: 'gperp_inv_logs_v2',
  ACCOUNTING: 'gperp_accounting_v2',
  EMPLOYEES: 'gperp_employees_v2',
  QUOTES: 'gperp_quotes_v2',
  COSTING: 'gperp_costing_v2',
  ASSETS: 'gperp_assets_v2',
  FRAUD_ALERTS: 'gperp_fraud_alerts_v2',
  WARRANTIES: 'gperp_warranties_v2',
  SERIAL_RECORDS: 'gperp_serial_records_v2',
  EINVOICES: 'gperp_einvoices_v2',
  LABOR_CONTRACTS: 'gperp_labor_contracts_v2',
  INBOUND_INVOICES: 'gperp_inbound_invoices_v2',
  STOCK_RECEIPTS: 'gperp_stock_receipts_v2',
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export function useStoreState() {
  const [products, setProductsState] = useState<Product[]>(() =>
    getStoredItem(KEYS.PRODUCTS, [])
  );
  const [customers, setCustomersState] = useState<Customer[]>(() =>
    getStoredItem(KEYS.CUSTOMERS, [])
  );
  const [orders, setOrdersState] = useState<Order[]>(() =>
    getStoredItem(KEYS.ORDERS, [])
  );
  const [promotions, setPromotionsState] = useState<Promotion[]>(() =>
    getStoredItem(KEYS.PROMOTIONS, [])
  );
  const [currentShift, setCurrentShiftState] = useState<CashShift | null>(() =>
    getStoredItem(KEYS.SHIFT, null)
  );
  const [shifts, setShiftsState] = useState<CashShift[]>(() =>
    getStoredItem(KEYS.SHIFTS_HISTORY, [])
  );
  const [settings, setSettingsState] = useState<StoreSettings>(() =>
    getStoredItem(KEYS.SETTINGS, INITIAL_STORE_SETTINGS)
  );
  const [accountingRecords, setAccountingRecordsState] = useState<AccountingRecord[]>(() =>
    getStoredItem(KEYS.ACCOUNTING, [])
  );
  const [employees, setEmployeesState] = useState<Employee[]>(() =>
    getStoredItem(KEYS.EMPLOYEES, [])
  );
  const [quotes, setQuotesState] = useState<PriceQuote[]>(() =>
    getStoredItem(KEYS.QUOTES, [])
  );
  const [costingList, setCostingListState] = useState<ProductCosting[]>(() =>
    getStoredItem(KEYS.COSTING, [])
  );
  const [assets, setAssetsState] = useState<EnterpriseAsset[]>(() =>
    getStoredItem(KEYS.ASSETS, [])
  );
  const [fraudAlerts, setFraudAlertsState] = useState<FraudAlert[]>(() =>
    getStoredItem(KEYS.FRAUD_ALERTS, [])
  );
  const [warranties, setWarrantiesState] = useState<WarrantyTicket[]>(() =>
    getStoredItem(KEYS.WARRANTIES, [])
  );
  const [serialRecords, setSerialRecordsState] = useState<SerialDeviceRecord[]>(() =>
    getStoredItem(KEYS.SERIAL_RECORDS, [])
  );
  const [eInvoices, setEInvoicesState] = useState<EInvoice[]>(() =>
    getStoredItem(KEYS.EINVOICES, [])
  );
  const [laborContracts, setLaborContractsState] = useState<LaborContract[]>(() =>
    getStoredItem(KEYS.LABOR_CONTRACTS, [])
  );
  const [inboundInvoices, setInboundInvoicesState] = useState<InboundEInvoice[]>(() =>
    getStoredItem(KEYS.INBOUND_INVOICES, [])
  );
  const [stockReceipts, setStockReceiptsState] = useState<StockGoodsReceipt[]>(() =>
    getStoredItem(KEYS.STOCK_RECEIPTS, [])
  );
  const [inventoryLogs, setInventoryLogsState] = useState<InventoryLog[]>(() =>
    getStoredItem(KEYS.INVENTORY_LOGS, [])
  );

  // Sync helpers
  const setProducts = (newProducts: Product[] | ((prev: Product[]) => Product[])) => {
    setProductsState((prev) => {
      const val = typeof newProducts === 'function' ? newProducts(prev) : newProducts;
      setStoredItem(KEYS.PRODUCTS, val);
      return val;
    });
  };

  const setCustomers = (newCusts: Customer[] | ((prev: Customer[]) => Customer[])) => {
    setCustomersState((prev) => {
      const val = typeof newCusts === 'function' ? newCusts(prev) : newCusts;
      setStoredItem(KEYS.CUSTOMERS, val);
      return val;
    });
  };

  const setOrders = (newOrders: Order[] | ((prev: Order[]) => Order[])) => {
    setOrdersState((prev) => {
      const val = typeof newOrders === 'function' ? newOrders(prev) : newOrders;
      setStoredItem(KEYS.ORDERS, val);
      return val;
    });
  };

  const setPromotions = (newPromos: Promotion[] | ((prev: Promotion[]) => Promotion[])) => {
    setPromotionsState((prev) => {
      const val = typeof newPromos === 'function' ? newPromos(prev) : newPromos;
      setStoredItem(KEYS.PROMOTIONS, val);
      return val;
    });
  };

  const setCurrentShift = (newShift: CashShift | null | ((prev: CashShift | null) => CashShift | null)) => {
    setCurrentShiftState((prev) => {
      const val = typeof newShift === 'function' ? newShift(prev) : newShift;
      setStoredItem(KEYS.SHIFT, val);
      return val;
    });
  };

  const setShifts = (newShifts: CashShift[] | ((prev: CashShift[]) => CashShift[])) => {
    setShiftsState((prev) => {
      const val = typeof newShifts === 'function' ? newShifts(prev) : newShifts;
      setStoredItem(KEYS.SHIFTS_HISTORY, val);
      return val;
    });
  };

  const setSettings = (newSettings: StoreSettings | ((prev: StoreSettings) => StoreSettings)) => {
    setSettingsState((prev) => {
      const val = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      setStoredItem(KEYS.SETTINGS, val);
      return val;
    });
  };

  const setInventoryLogs = (newLogs: InventoryLog[] | ((prev: InventoryLog[]) => InventoryLog[])) => {
    setInventoryLogsState((prev) => {
      const val = typeof newLogs === 'function' ? newLogs(prev) : newLogs;
      setStoredItem(KEYS.INVENTORY_LOGS, val);
      return val;
    });
  };

  const setAccountingRecords = (newRecords: AccountingRecord[] | ((prev: AccountingRecord[]) => AccountingRecord[])) => {
    setAccountingRecordsState((prev) => {
      const val = typeof newRecords === 'function' ? newRecords(prev) : newRecords;
      setStoredItem(KEYS.ACCOUNTING, val);
      return val;
    });
  };

  const setEmployees = (newEmployees: Employee[] | ((prev: Employee[]) => Employee[])) => {
    setEmployeesState((prev) => {
      const val = typeof newEmployees === 'function' ? newEmployees(prev) : newEmployees;
      setStoredItem(KEYS.EMPLOYEES, val);
      return val;
    });
  };

  const setQuotes = (newQuotes: PriceQuote[] | ((prev: PriceQuote[]) => PriceQuote[])) => {
    setQuotesState((prev) => {
      const val = typeof newQuotes === 'function' ? newQuotes(prev) : newQuotes;
      setStoredItem(KEYS.QUOTES, val);
      return val;
    });
  };

  const setCostingList = (newList: ProductCosting[] | ((prev: ProductCosting[]) => ProductCosting[])) => {
    setCostingListState((prev) => {
      const val = typeof newList === 'function' ? newList(prev) : newList;
      setStoredItem(KEYS.COSTING, val);
      return val;
    });
  };

  const setAssets = (newAssets: EnterpriseAsset[] | ((prev: EnterpriseAsset[]) => EnterpriseAsset[])) => {
    setAssetsState((prev) => {
      const val = typeof newAssets === 'function' ? newAssets(prev) : newAssets;
      setStoredItem(KEYS.ASSETS, val);
      return val;
    });
  };

  const setFraudAlerts = (newAlerts: FraudAlert[] | ((prev: FraudAlert[]) => FraudAlert[])) => {
    setFraudAlertsState((prev) => {
      const val = typeof newAlerts === 'function' ? newAlerts(prev) : newAlerts;
      setStoredItem(KEYS.FRAUD_ALERTS, val);
      return val;
    });
  };

  const setWarranties = (newTickets: WarrantyTicket[] | ((prev: WarrantyTicket[]) => WarrantyTicket[])) => {
    setWarrantiesState((prev) => {
      const val = typeof newTickets === 'function' ? newTickets(prev) : newTickets;
      setStoredItem(KEYS.WARRANTIES, val);
      return val;
    });
  };

  const setSerialRecords = (newRecords: SerialDeviceRecord[] | ((prev: SerialDeviceRecord[]) => SerialDeviceRecord[])) => {
    setSerialRecordsState((prev) => {
      const val = typeof newRecords === 'function' ? newRecords(prev) : newRecords;
      setStoredItem(KEYS.SERIAL_RECORDS, val);
      return val;
    });
  };

  const setEInvoices = (newInvoices: EInvoice[] | ((prev: EInvoice[]) => EInvoice[])) => {
    setEInvoicesState((prev) => {
      const val = typeof newInvoices === 'function' ? newInvoices(prev) : newInvoices;
      setStoredItem(KEYS.EINVOICES, val);
      return val;
    });
  };

  const setLaborContracts = (newContracts: LaborContract[] | ((prev: LaborContract[]) => LaborContract[])) => {
    setLaborContractsState((prev) => {
      const val = typeof newContracts === 'function' ? newContracts(prev) : newContracts;
      setStoredItem(KEYS.LABOR_CONTRACTS, val);
      return val;
    });
  };

  const setInboundInvoices = (newInvoices: InboundEInvoice[] | ((prev: InboundEInvoice[]) => InboundEInvoice[])) => {
    setInboundInvoicesState((prev) => {
      const val = typeof newInvoices === 'function' ? newInvoices(prev) : newInvoices;
      setStoredItem(KEYS.INBOUND_INVOICES, val);
      return val;
    });
  };

  const setStockReceipts = (newReceipts: StockGoodsReceipt[] | ((prev: StockGoodsReceipt[]) => StockGoodsReceipt[])) => {
    setStockReceiptsState((prev) => {
      const val = typeof newReceipts === 'function' ? newReceipts(prev) : newReceipts;
      setStoredItem(KEYS.STOCK_RECEIPTS, val);
      return val;
    });
  };

  const addInventoryLog = (log: Omit<InventoryLog, 'id' | 'timestamp'>) => {
    const fullLog: InventoryLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    setInventoryLogsState((prev) => {
      const updated = [fullLog, ...prev];
      setStoredItem(KEYS.INVENTORY_LOGS, updated);
      return updated;
    });
  };

  // Reset data to Clean Empty Database State
  const resetToInitialData = () => {
    setProductsState([]);
    setCustomersState([]);
    setOrdersState([]);
    setPromotionsState([]);
    setCurrentShiftState(null);
    setShiftsState([]);
    setSettingsState(INITIAL_STORE_SETTINGS);
    setAccountingRecordsState([]);
    setEmployeesState([]);
    setQuotesState([]);
    setCostingListState([]);
    setAssetsState([]);
    setFraudAlertsState([]);
    setWarrantiesState([]);
    setSerialRecordsState([]);
    setEInvoicesState([]);
    setLaborContractsState([]);
    setInboundInvoicesState([]);
    setStockReceiptsState([]);
    setInventoryLogsState([]);

    setStoredItem(KEYS.PRODUCTS, []);
    setStoredItem(KEYS.CUSTOMERS, []);
    setStoredItem(KEYS.ORDERS, []);
    setStoredItem(KEYS.PROMOTIONS, []);
    setStoredItem(KEYS.SHIFT, null);
    setStoredItem(KEYS.SHIFTS_HISTORY, []);
    setStoredItem(KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
    setStoredItem(KEYS.ACCOUNTING, []);
    setStoredItem(KEYS.EMPLOYEES, []);
    setStoredItem(KEYS.QUOTES, []);
    setStoredItem(KEYS.COSTING, []);
    setStoredItem(KEYS.ASSETS, []);
    setStoredItem(KEYS.FRAUD_ALERTS, []);
    setStoredItem(KEYS.WARRANTIES, []);
    setStoredItem(KEYS.SERIAL_RECORDS, []);
    setStoredItem(KEYS.EINVOICES, []);
    setStoredItem(KEYS.LABOR_CONTRACTS, []);
    setStoredItem(KEYS.INBOUND_INVOICES, []);
    setStoredItem(KEYS.STOCK_RECEIPTS, []);
    setStoredItem(KEYS.INVENTORY_LOGS, []);
  };

  return {
    products,
    setProducts,
    customers,
    setCustomers,
    orders,
    setOrders,
    promotions,
    setPromotions,
    currentShift,
    setCurrentShift,
    shifts,
    setShifts,
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
    eInvoices,
    setEInvoices,
    laborContracts,
    setLaborContracts,
    inboundInvoices,
    setInboundInvoices,
    stockReceipts,
    setStockReceipts,
    fraudAlerts,
    setFraudAlerts,
    inventoryLogs,
    setInventoryLogs,
    addInventoryLog,
    resetToInitialData,
    resetAllData: resetToInitialData,
  };
}

