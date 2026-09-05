import React from 'react';
import {
  Order,
  Product,
  Customer,
  Supplier,
  StoreSettings,
  Employee,
  LaborContract,
  CashShift,
  PurchaseOrder,
  EnterpriseAsset,
} from '../../types';
import { DashboardView } from '../dashboard/DashboardView';

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
  onOpenPO?: (product?: Product) => void;
}

export { DashboardView };

export const AnalyticsView: React.FC<AnalyticsViewProps> = (props) => {
  return <DashboardView {...props} />;
};

export default AnalyticsView;
