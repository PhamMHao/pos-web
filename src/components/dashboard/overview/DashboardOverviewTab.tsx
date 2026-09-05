import React from 'react';
import { Product } from '../../../types';
import {
  InventoryMetrics,
  DailyTimelineItem,
  DailyChartType,
  TopProductItem,
  BestSellerMetric,
  CategoryInventoryItem,
  ChannelDataItem,
  PaymentMethodDataItem,
  RestockUrgentItem,
  TopVipCustomerItem,
} from '../dashboard.types';
import { DashboardKpiCards } from '../DashboardKpiCards';
import { DashboardDailyChart } from '../DashboardDailyChart';
import { DashboardBestSellers } from '../DashboardBestSellers';
import { DashboardInventoryStructure } from '../DashboardInventoryStructure';
import { DashboardChannelAndPayment } from '../DashboardChannelAndPayment';
import { DashboardActionableIntelligence } from '../DashboardActionableIntelligence';

export interface DashboardOverviewTabProps {
  totalRevenue: number;
  completedOrdersCount: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: string;
  inventoryMetrics: InventoryMetrics;
  averageOrderValue: number;
  avgItemsPerOrder: string;
  totalItemsSold: number;
  dailyTimelineData: DailyTimelineItem[];
  dailyChartType: DailyChartType;
  setDailyChartType: (t: DailyChartType) => void;
  topProducts: TopProductItem[];
  top6ProductsForChart: TopProductItem[];
  bestSellerMetric: BestSellerMetric;
  setBestSellerMetric: (m: BestSellerMetric) => void;
  categoryInventory: CategoryInventoryItem[];
  channelData: ChannelDataItem[];
  paymentMethodData: PaymentMethodDataItem[];
  restockUrgentList: RestockUrgentItem[];
  topVipCustomers: TopVipCustomerItem[];
  onNavigate?: (tab: string) => void;
  onOpenPO?: (product?: Product) => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  totalRevenue,
  completedOrdersCount,
  totalCost,
  grossProfit,
  profitMargin,
  inventoryMetrics,
  averageOrderValue,
  avgItemsPerOrder,
  totalItemsSold,
  dailyTimelineData,
  dailyChartType,
  setDailyChartType,
  topProducts,
  top6ProductsForChart,
  bestSellerMetric,
  setBestSellerMetric,
  categoryInventory,
  channelData,
  paymentMethodData,
  restockUrgentList,
  topVipCustomers,
  onNavigate,
  onOpenPO,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. 5 Thẻ chỉ số KPI quản trị */}
      <DashboardKpiCards
        totalRevenue={totalRevenue}
        completedOrdersCount={completedOrdersCount}
        totalCost={totalCost}
        grossProfit={grossProfit}
        profitMargin={profitMargin}
        inventoryMetrics={inventoryMetrics}
        averageOrderValue={averageOrderValue}
        avgItemsPerOrder={avgItemsPerOrder}
        totalItemsSold={totalItemsSold}
      />

      {/* 2. Diễn biến doanh thu & lợi nhuận theo ngày */}
      <DashboardDailyChart
        dailyTimelineData={dailyTimelineData}
        dailyChartType={dailyChartType}
        setDailyChartType={setDailyChartType}
      />

      {/* 3. Top sản phẩm bán chạy & Cơ cấu tồn kho Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <DashboardBestSellers
            topProducts={topProducts}
            top6ProductsForChart={top6ProductsForChart}
            bestSellerMetric={bestSellerMetric}
            setBestSellerMetric={setBestSellerMetric}
          />
        </div>
        <div className="lg:col-span-5">
          <DashboardInventoryStructure
            categoryInventory={categoryInventory}
            inventoryMetrics={inventoryMetrics}
          />
        </div>
      </div>

      {/* 4. Phân bổ doanh số theo kênh & phương thức thanh toán */}
      <DashboardChannelAndPayment
        channelData={channelData}
        paymentMethodData={paymentMethodData}
      />

      {/* 5. Cảnh báo điều hành: Nhập hàng cấp bách & Khách hàng VIP */}
      <DashboardActionableIntelligence
        restockUrgentList={restockUrgentList}
        topVipCustomers={topVipCustomers}
        onNavigate={onNavigate}
        onOpenPO={onOpenPO}
      />
    </div>
  );
};
