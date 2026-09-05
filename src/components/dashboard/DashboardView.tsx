import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  Landmark,
} from 'lucide-react';
import {
  DashboardViewProps,
  DashboardTabType,
  TimeRangeType,
  DailyChartType,
  BestSellerMetric,
} from './dashboard.types';
import { exportDashboard5SheetExcel } from './exportDashboardExcel5Sheets';
import { DashboardExecutiveControls } from './DashboardExecutiveControls';
import { DashboardOverviewTab } from './overview/DashboardOverviewTab';
import { DashboardHrTab } from './hr/DashboardHrTab';
import { DashboardPartnersSupplyTab } from './partners/DashboardPartnersSupplyTab';
import { DashboardAssetLifecycleTab } from './assets/DashboardAssetLifecycleTab';
import { useDashboardCalculations } from './useDashboardCalculations';

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders = [],
  products = [],
  customers = [],
  suppliers = [],
  employees = [],
  laborContracts = [],
  shifts = [],
  purchaseOrders = [],
  assets = [],
  settings,
  onNavigate,
  onOpenPO,
}) => {
  // 1. Sub-Tab State
  const [activeTab, setActiveTab] = useState<DashboardTabType>('overview');

  // 2. Executive Filter States
  const [timeRange, setTimeRange] = useState<TimeRangeType>('30days');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Default custom dates
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

  // Chart settings
  const [dailyChartType, setDailyChartType] = useState<DailyChartType>('area');
  const [bestSellerMetric, setBestSellerMetric] = useState<BestSellerMetric>('revenue');

  // 3. Centralized Calculations
  const {
    safeProducts,
    safeCustomers,
    safeSuppliers,
    safeEmployees,
    availableChannels,
    availableCategories,
    completedOrders,
    totalRevenue,
    totalCost,
    grossProfit,
    profitMargin,
    averageOrderValue,
    totalItemsSold,
    avgItemsPerOrder,
    inventoryMetrics,
    dailyTimelineData,
    topProducts,
    top6ProductsForChart,
    categoryInventory,
    channelData,
    paymentMethodData,
    restockUrgentList,
    topVipCustomers,
    hrPerformanceData,
    hrKpiSummary,
    partnersKpiSummary,
    suppliersData,
    materialMargins,
    assetSummary,
  } = useDashboardCalculations({
    orders,
    products,
    customers,
    suppliers,
    employees,
    laborContracts,
    shifts,
    purchaseOrders,
    assets,
    timeRange,
    customStartDate,
    customEndDate,
    channelFilter,
    categoryFilter,
    customerFilter,
    supplierFilter,
    materialFilter,
    searchKeyword,
    bestSellerMetric,
  });

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (timeRange !== '30days') count++;
    if (channelFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (customerFilter !== 'all') count++;
    if (supplierFilter !== 'all') count++;
    if (materialFilter !== 'all') count++;
    if (searchKeyword.trim()) count++;
    return count;
  }, [timeRange, channelFilter, categoryFilter, customerFilter, supplierFilter, materialFilter, searchKeyword]);

  const handleResetFilters = () => {
    setTimeRange('30days');
    setChannelFilter('all');
    setCategoryFilter('all');
    setCustomerFilter('all');
    setSupplierFilter('all');
    setMaterialFilter('all');
    setSearchKeyword('');
    setCustomStartDate(defaultDates.start);
    setCustomEndDate(defaultDates.end);
  };

  const handleExportExcel = () => {
    const storeTitle =
      settings?.companyLegalName || settings?.storeName || 'GIA PHÚC ERP ENTERPRISE';
    const reportDate = new Date().toLocaleDateString('vi-VN');
    exportDashboard5SheetExcel({
      storeTitle,
      reportDate,
      totalRevenue,
      completedOrdersCount: completedOrders.length,
      totalCost,
      grossProfit,
      profitMargin,
      inventoryMetrics,
      averageOrderValue,
      avgItemsPerOrder,
      dailyTimelineData,
      topProducts,
      categoryInventory,
      hrPerformanceData,
      assetsList: assetSummary.assetsList,
    });
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-900 bg-slate-50 print:bg-white print:p-0 print:m-0">
      {/* 1. Bộ lọc điều hành đa chiều & Action buttons */}
      <DashboardExecutiveControls
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        materialFilter={materialFilter}
        setMaterialFilter={setMaterialFilter}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        availableChannels={availableChannels}
        availableCategories={availableCategories}
        safeCustomers={safeCustomers}
        availableSuppliers={safeSuppliers}
        availableProducts={safeProducts}
        completedOrdersCount={completedOrders.length}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        onExportExcel={handleExportExcel}
        onPrint={() => window.print()}
      />

      {/* 2. Thanh Điều Hướng 4 Sub-Tabs Chuyên Biệt */}
      <div className="flex items-center space-x-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>1. Tổng Quan &amp; Tồn Kho</span>
        </button>

        <button
          onClick={() => setActiveTab('hr_kpi')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'hr_kpi'
              ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Hiệu Suất Nhân Sự &amp; KPI HR</span>
        </button>

        <button
          onClick={() => setActiveTab('partners_supply')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'partners_supply'
              ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>3. Đối Tác &amp; Chuỗi Cung Ứng</span>
        </button>

        <button
          onClick={() => setActiveTab('assets_lifecycle')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'assets_lifecycle'
              ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>4. Quản Trị TSCĐ &amp; Dòng Đời</span>
        </button>
      </div>

      {/* 3. Nội Dung Từng Tab Tương Ứng */}
      {activeTab === 'overview' && (
        <DashboardOverviewTab
          totalRevenue={totalRevenue}
          completedOrdersCount={completedOrders.length}
          totalCost={totalCost}
          grossProfit={grossProfit}
          profitMargin={profitMargin}
          inventoryMetrics={inventoryMetrics}
          averageOrderValue={averageOrderValue}
          avgItemsPerOrder={avgItemsPerOrder}
          totalItemsSold={totalItemsSold}
          dailyTimelineData={dailyTimelineData}
          dailyChartType={dailyChartType}
          setDailyChartType={setDailyChartType}
          topProducts={topProducts}
          top6ProductsForChart={top6ProductsForChart}
          bestSellerMetric={bestSellerMetric}
          setBestSellerMetric={setBestSellerMetric}
          categoryInventory={categoryInventory}
          channelData={channelData}
          paymentMethodData={paymentMethodData}
          restockUrgentList={restockUrgentList}
          topVipCustomers={topVipCustomers}
          onNavigate={onNavigate}
          onOpenPO={onOpenPO}
        />
      )}

      {activeTab === 'hr_kpi' && (
        <DashboardHrTab
          hrPerformanceData={hrPerformanceData}
          summary={hrKpiSummary}
          employees={safeEmployees}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'partners_supply' && (
        <DashboardPartnersSupplyTab
          summary={partnersKpiSummary}
          vipCustomers={topVipCustomers}
          suppliersData={suppliersData}
          materialMargins={materialMargins}
          products={safeProducts}
          onNavigate={onNavigate}
          onOpenPO={onOpenPO}
        />
      )}

      {activeTab === 'assets_lifecycle' && (
        <DashboardAssetLifecycleTab
          summary={assetSummary}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

export default DashboardView;
