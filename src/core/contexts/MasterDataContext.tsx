import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Department,
  JobPosition,
  MasterWarehouse,
  WarehouseLocation,
  UnitOfMeasure,
  MasterUomGroup,
  MasterProductCategory,
  CustomerGroup,
  MasterSupplierCategory,
  EmailGatewayConfig,
  EmailTemplate,
  EmailDispatchLog,
  PasswordResetRequest,
  EmailTemplateType,
  Customer,
  Supplier,
  MasterCustomerTier,
  EnterpriseProject,
  MasterColor,
  MasterSpecification,
} from '../../types';
import { masterDataApi } from '../../features/master-data/api/masterDataApi';
import { customersApi } from '../../features/customers/api/customersApi';
import { suppliersApi } from '../../features/suppliers/api/suppliersApi';

// Default Email Configuration
const DEFAULT_EMAIL_CONFIG: EmailGatewayConfig = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  secure: false,
  authUser: 'hrmgpsoft@gmail.com',
  authPasswordMasked: '••••••••••••••••',
  defaultSenderName: 'GIA PHÚC Computer - Hệ Thống GPSOFT',
  defaultSenderEmail: 'hrmgpsoft@gmail.com',
  adminNotificationEmail: 'hrmgpsoft@gmail.com',
  accountingEmail: 'ketoan@vitinhgiaphuc.com',
  salesEmail: 'sales@vitinhgiaphuc.com',
  signatureHtml: `
    <div style="font-family: Arial, sans-serif; color: #1e293b; border-top: 2px solid #0284c7; padding-top: 10px; margin-top: 20px;">
      <strong style="color: #0284c7; font-size: 14px;">CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC</strong><br/>
      <span style="font-size: 12px; color: #64748b;">Hệ Thống Quản Trị Doanh Nghiệp GPSOFT Enterprise</span><br/>
      <span style="font-size: 12px;">📞 Hotline: 0985 862 609 - 0914 665 994 | 🌐 Website: www.vitinhgiaphuc.com</span><br/>
      <span style="font-size: 11px; color: #94a3b8;">Địa chỉ: 182/3 Tỉnh Lộ 8, Khu Phố 2, Thị Trấn Củ Chi, TP. Hồ Chí Minh</span>
    </div>
  `,
  isGatewayActive: true,
  lastTestSuccessAt: '2026-08-25T14:00:00Z',
};

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-einvoice',
    type: 'einvoice_vat',
    name: 'Gửi Hóa Đơn Điện Tử VAT TT78 Cho Khách Hàng',
    subject: 'Hóa Đơn Điện Tử Số {{invoiceCode}} - GIA PHÚC Computer kính gửi Quý khách {{customerName}}',
    bodyHtml: `
      <p>Kính gửi Quý khách hàng <strong>{{customerName}}</strong>,</p>
      <p>GIA PHÚC Computer xin trân trọng cảm ơn Quý khách đã tin tưởng mua sắm và sử dụng dịch vụ tại công ty chúng tôi.</p>
      <p>Hệ thống đã phát hành thành công Hóa đơn điện tử theo thông tư 78/2021/TT-BTC với thông tin chi tiết như sau:</p>
      <ul>
        <li><strong>Số hóa đơn:</strong> {{invoiceCode}} (Ký hiệu: 1C26TGP)</li>
        <li><strong>Ngày lập:</strong> {{invoiceDate}}</li>
        <li><strong>Tổng tiền thanh toán:</strong> {{totalAmount}} VNĐ</li>
        <li><strong>Mã tra cứu CQT:</strong> {{lookupCode}}</li>
      </ul>
      <p>Quý khách vui lòng tải về file hóa đơn PDF có chữ ký số Viettel-CA và file dữ liệu gốc XML đính kèm theo thư này.</p>
      <p>Trân trọng cảm ơn Quý khách!</p>
    `,
    availableVariables: ['{{customerName}}', '{{invoiceCode}}', '{{invoiceDate}}', '{{totalAmount}}', '{{lookupCode}}', '{{pdfUrl}}', '{{xmlUrl}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'tmpl-quote',
    type: 'quote_proposal',
    name: 'Gửi Bảng Báo Giá Dự Án / Thiết Bị Máy Tính',
    subject: 'Bảng Báo Giá Thiết Bị Số {{quoteCode}} - GIA PHÚC Computer kính gửi Quý khách {{customerName}}',
    bodyHtml: `
      <p>Kính gửi Quý khách hàng <strong>{{customerName}}</strong>,</p>
      <p>Chúng tôi xin gửi đến Quý khách bảng báo giá chi tiết cho các hạng mục thiết bị máy tính / giải pháp CNTT theo yêu cầu.</p>
      <p><strong>Mã báo giá:</strong> {{quoteCode}} | <strong>Hiệu lực đến:</strong> {{validUntil}}</p>
      <p><strong>Tổng giá trị dự toán:</strong> {{finalTotal}} VNĐ</p>
      <p>Quý khách vui lòng xem chi tiết danh mục linh kiện, chính sách bảo hành và chiết khấu trong file đính kèm.</p>
      <p>Mọi thắc mắc xin liên hệ nhân viên phụ trách: <strong>{{staffName}} ({{staffPhone}})</strong>.</p>
    `,
    availableVariables: ['{{customerName}}', '{{quoteCode}}', '{{finalTotal}}', '{{validUntil}}', '{{staffName}}', '{{staffPhone}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'tmpl-po',
    type: 'purchase_order',
    name: 'Gửi Đơn Đặt Hàng Mua (PO) Cho Nhà Cung Ứng',
    subject: 'Đơn Đặt Hàng Mua Vật Tư PO-{{poCode}} - GIA PHÚC Computer gửi {{supplierName}}',
    bodyHtml: `
      <p>Kính gửi Ban Giám Đốc & Phòng Kinh Doanh <strong>{{supplierName}}</strong>,</p>
      <p>GIA PHÚC Computer xin gửi đơn đặt hàng mua linh kiện theo thỏa thuận báo giá với các chi tiết sau:</p>
      <ul>
        <li><strong>Mã đơn mua hàng:</strong> {{poCode}}</li>
        <li><strong>Số lượng mặt hàng:</strong> {{itemsCount}} loại</li>
        <li><strong>Tổng giá trị đơn hàng:</strong> {{totalPoAmount}} VNĐ</li>
        <li><strong>Địa điểm giao hàng:</strong> Kho Chính Gia Phúc - Củ Chi, TP.HCM</li>
      </ul>
      <p>Quý công ty vui lòng xác nhận đơn hàng và thời gian giao hàng sớm nhất.</p>
    `,
    availableVariables: ['{{supplierName}}', '{{poCode}}', '{{itemsCount}}', '{{totalPoAmount}}', '{{deliveryDate}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
];

// ==========================================
// Master Data Context Interface
// ==========================================

export type MasterDataType =
  | 'customers'
  | 'suppliers'
  | 'projects'
  | 'departments'
  | 'positions'
  | 'warehouses'
  | 'warehouse'
  | 'locations'
  | 'uoms'
  | 'categories'
  | 'colors'
  | 'specifications'
  | 'customerGroups'
  | 'customerTiers'
  | 'supplierCategories';

interface MasterDataContextType {
  // Customers
  customers: Customer[];
  addCustomer: (item: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, item: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Customer Tiers (Hạng Thành Viên)
  customerTiers: MasterCustomerTier[];
  addCustomerTier: (item: Omit<MasterCustomerTier, 'id' | 'createdAt'>) => MasterCustomerTier;
  updateCustomerTier: (id: string, item: Partial<MasterCustomerTier>) => void;
  deleteCustomerTier: (id: string) => void;

  // Projects (Dự Án Doanh Nghiệp)
  projects: EnterpriseProject[];
  addProject: (item: Omit<EnterpriseProject, 'id' | 'createdAt'>) => EnterpriseProject;
  updateProject: (id: string, item: Partial<EnterpriseProject>) => void;
  deleteProject: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (item: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, item: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Departments
  departments: Department[];
  addDepartment: (item: Omit<Department, 'id' | 'createdAt'>) => Department;
  updateDepartment: (id: string, item: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Job Positions
  jobPositions: JobPosition[];
  addJobPosition: (item: Omit<JobPosition, 'id' | 'createdAt'>) => JobPosition;
  updateJobPosition: (id: string, item: Partial<JobPosition>) => void;
  deleteJobPosition: (id: string) => void;

  // Master Warehouses (Danh Mục Kho Hàng)
  warehouses: MasterWarehouse[];
  addWarehouse: (item: Omit<MasterWarehouse, 'id' | 'createdAt'>) => MasterWarehouse;
  updateWarehouse: (id: string, item: Partial<MasterWarehouse>) => void;
  deleteWarehouse: (id: string) => void;

  // Warehouse Locations (Vị Trí Ô Kệ Theo Kho)
  warehouseLocations: WarehouseLocation[];
  addWarehouseLocation: (item: Omit<WarehouseLocation, 'id' | 'createdAt'>) => WarehouseLocation;
  updateWarehouseLocation: (id: string, item: Partial<WarehouseLocation>) => void;
  deleteWarehouseLocation: (id: string) => void;

  // Units Of Measure (UOM)
  unitsOfMeasure: UnitOfMeasure[];
  addUnitOfMeasure: (item: Omit<UnitOfMeasure, 'id' | 'createdAt'>) => UnitOfMeasure;
  updateUnitOfMeasure: (id: string, item: Partial<UnitOfMeasure>) => void;
  deleteUnitOfMeasure: (id: string) => void;

  // UOM Conversion Groups
  uomGroups: MasterUomGroup[];
  addUomGroup: (item: Omit<MasterUomGroup, 'id' | 'createdAt'>) => MasterUomGroup;
  updateUomGroup: (id: string, item: Partial<MasterUomGroup>) => void;
  deleteUomGroup: (id: string) => void;

  // Product Categories
  productCategories: MasterProductCategory[];
  addProductCategory: (item: Omit<MasterProductCategory, 'id' | 'createdAt'>) => MasterProductCategory;
  updateProductCategory: (id: string, item: Partial<MasterProductCategory>) => void;
  deleteProductCategory: (id: string) => void;

  // Colors
  colors: MasterColor[];
  addColor: (item: Omit<MasterColor, 'id' | 'createdAt'>) => MasterColor;
  updateColor: (id: string, item: Partial<MasterColor>) => void;
  deleteColor: (id: string) => void;

  // Specifications
  specifications: MasterSpecification[];
  addSpecification: (item: Omit<MasterSpecification, 'id' | 'createdAt'>) => MasterSpecification;
  updateSpecification: (id: string, item: Partial<MasterSpecification>) => void;
  deleteSpecification: (id: string) => void;

  // Customer Groups
  customerGroups: CustomerGroup[];
  addCustomerGroup: (item: Omit<CustomerGroup, 'id' | 'createdAt'>) => CustomerGroup;
  updateCustomerGroup: (id: string, item: Partial<CustomerGroup>) => void;
  deleteCustomerGroup: (id: string) => void;

  // Supplier Categories
  supplierCategories: MasterSupplierCategory[];
  addSupplierCategory: (item: Omit<MasterSupplierCategory, 'id' | 'createdAt'>) => MasterSupplierCategory;
  updateSupplierCategory: (id: string, item: Partial<MasterSupplierCategory>) => void;
  deleteSupplierCategory: (id: string) => void;

  // Email Gateway Config
  emailConfig: EmailGatewayConfig;
  updateEmailConfig: (config: Partial<EmailGatewayConfig>) => void;

  // Email Templates
  emailTemplates: EmailTemplate[];
  updateEmailTemplate: (id: string, template: Partial<EmailTemplate>) => void;

  // Email Dispatch Logs
  emailLogs: EmailDispatchLog[];
  sendEmailDispatch: (options: {
    recipientEmail: string;
    recipientName: string;
    type: EmailTemplateType;
    subject: string;
    bodyHtml?: string;
    referenceCode?: string;
  }) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  clearEmailLogs: () => void;

  // Password Reset Approval Flow
  passwordResetRequests: PasswordResetRequest[];
  requestPasswordReset: (username: string, email: string, reason?: string) => Promise<{ success: boolean; requestId: string; message: string }>;
  approvePasswordReset: (requestId: string, customTempPassword?: string) => Promise<{ success: boolean; tempPassword: string; message: string }>;
  rejectPasswordReset: (requestId: string, adminNote?: string) => void;

  // Universal Quick-Add Helper
  quickAddMasterItem: (type: MasterDataType, data: any) => any;
  resetMasterDataToDefaults: () => void;
  refreshMasterDataFromDb: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Live State from SQL Server DB (No Mock Constants)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<EnterpriseProject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [warehouses, setWarehouses] = useState<MasterWarehouse[]>([]);
  const [warehouseLocations, setWarehouseLocations] = useState<WarehouseLocation[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [uomGroups, setUomGroups] = useState<MasterUomGroup[]>([]);
  const [productCategories, setProductCategories] = useState<MasterProductCategory[]>([]);
  const [colors, setColors] = useState<MasterColor[]>([]);
  const [specifications, setSpecifications] = useState<MasterSpecification[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [customerTiers, setCustomerTiers] = useState<MasterCustomerTier[]>([]);
  const [supplierCategories, setSupplierCategories] = useState<MasterSupplierCategory[]>([]);

  // Email & Security
  const [emailConfig, setEmailConfig] = useState<EmailGatewayConfig>(DEFAULT_EMAIL_CONFIG);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);

  // Fetch and sync directly from SQL Server Database on mount & on demand
  const refreshMasterDataFromDb = async () => {
    try {
      const data = await masterDataApi.getAll();
      if (data) {
        if (Array.isArray(data.departments)) setDepartments(data.departments);
        if (Array.isArray(data.jobPositions)) setJobPositions(data.jobPositions);
        if (Array.isArray(data.warehouses)) setWarehouses(data.warehouses);
        if (Array.isArray(data.warehouseLocations)) setWarehouseLocations(data.warehouseLocations);
        if (Array.isArray(data.unitsOfMeasure)) setUnitsOfMeasure(data.unitsOfMeasure);
        if (Array.isArray(data.uomGroups)) setUomGroups(data.uomGroups);
        if (Array.isArray(data.productCategories)) setProductCategories(data.productCategories);
        if (Array.isArray(data.colors)) setColors(data.colors);
        if (Array.isArray(data.specifications)) setSpecifications(data.specifications);
        if (Array.isArray(data.customerGroups)) setCustomerGroups(data.customerGroups);
        if (Array.isArray(data.customerTiers)) setCustomerTiers(data.customerTiers);
        if (Array.isArray(data.supplierCategories)) setSupplierCategories(data.supplierCategories);
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.warn('Could not load master data from DB:', err);
    }
  };

  useEffect(() => {
    refreshMasterDataFromDb();
  }, []);

  // ==========================================
  // CRUD Actions: Customers (Synced to SQL Server [KhachHang])
  // ==========================================
  const addCustomer = (item: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...item,
      id: (item as any).id || `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => {
      const filtered = prev.filter((c) => c.phone !== newCust.phone && c.id !== newCust.id);
      return [newCust, ...filtered];
    });
    customersApi.createCustomer(newCust).then((saved) => {
      if (saved) {
        setCustomers((prev) => prev.map((c) => (c.phone === newCust.phone || c.id === newCust.id ? saved : c)));
      }
    }).catch((err) => console.warn('Customer DB sync error:', err));
    return newCust;
  };

  const updateCustomer = (id: string, item: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
    customersApi.updateCustomer(id, item).then((saved) => {
      if (saved) {
        setCustomers((prev) => prev.map((c) => (c.id === id ? saved : c)));
      }
    }).catch((err) => console.warn('Customer DB update error:', err));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    customersApi.deleteCustomer(id).catch((err) => console.warn('Customer DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Suppliers (Synced to SQL Server [NhaCungCap])
  // ==========================================
  const addSupplier = (item: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newSup: Supplier = {
      ...item,
      id: (item as any).id || `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => {
      const filtered = prev.filter((s) => s.id !== newSup.id && s.code !== newSup.code);
      return [newSup, ...filtered];
    });
    suppliersApi.createSupplier(newSup).then((saved) => {
      if (saved) {
        setSuppliers((prev) => prev.map((s) => (s.id === newSup.id || s.code === newSup.code ? saved : s)));
      }
    }).catch((err) => console.warn('Supplier DB sync error:', err));
    return newSup;
  };

  const updateSupplier = (id: string, item: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
    suppliersApi.updateSupplier(id, item).then((saved) => {
      if (saved) {
        setSuppliers((prev) => prev.map((s) => (s.id === id ? saved : s)));
      }
    }).catch((err) => console.warn('Supplier DB update error:', err));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    suppliersApi.deleteSupplier(id).catch((err) => console.warn('Supplier DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Departments (Synced to SQL Server [PhongBan])
  // ==========================================
  const addDepartment = (item: Omit<Department, 'id' | 'createdAt'>): Department => {
    const newDept: Department = {
      ...item,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartments((prev) => [newDept, ...prev]);
    masterDataApi.createDepartment(newDept).then((saved) => {
      if (saved) setDepartments((prev) => prev.map((d) => (d.id === newDept.id ? saved : d)));
    }).catch((err) => console.warn('Department DB sync error:', err));
    return newDept;
  };

  const updateDepartment = (id: string, item: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...item } : d)));
    masterDataApi.updateDepartment(id, item).then((saved) => {
      if (saved) setDepartments((prev) => prev.map((d) => (d.id === id ? saved : d)));
    }).catch((err) => console.warn('Department DB update error:', err));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    masterDataApi.deleteDepartment(id).catch((err) => console.warn('Department DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Job Positions (Synced to SQL Server [ChucVu])
  // ==========================================
  const addJobPosition = (item: Omit<JobPosition, 'id' | 'createdAt'>): JobPosition => {
    const newPos: JobPosition = {
      ...item,
      id: `pos-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setJobPositions((prev) => [newPos, ...prev]);
    masterDataApi.createJobPosition(newPos).then((saved) => {
      if (saved) setJobPositions((prev) => prev.map((p) => (p.id === newPos.id ? saved : p)));
    }).catch((err) => console.warn('JobPosition DB sync error:', err));
    return newPos;
  };

  const updateJobPosition = (id: string, item: Partial<JobPosition>) => {
    setJobPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...item } : p)));
    masterDataApi.updateJobPosition(id, item).then((saved) => {
      if (saved) setJobPositions((prev) => prev.map((p) => (p.id === id ? saved : p)));
    }).catch((err) => console.warn('JobPosition DB update error:', err));
  };

  const deleteJobPosition = (id: string) => {
    setJobPositions((prev) => prev.filter((p) => p.id !== id));
    masterDataApi.deleteJobPosition(id).catch((err) => console.warn('JobPosition DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Master Warehouses (Synced to SQL Server [DanhMucKhoHang])
  // ==========================================
  const addWarehouse = (item: Omit<MasterWarehouse, 'id' | 'createdAt'>): MasterWarehouse => {
    const newWh: MasterWarehouse = {
      ...item,
      id: `wh-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWarehouses((prev) => [newWh, ...prev]);
    masterDataApi.createWarehouse(newWh).then((saved) => {
      if (saved) setWarehouses((prev) => prev.map((w) => (w.id === newWh.id ? saved : w)));
    }).catch((err) => console.warn('Warehouse DB sync error:', err));
    return newWh;
  };

  const updateWarehouse = (id: string, item: Partial<MasterWarehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...item } : w)));
    masterDataApi.updateWarehouse(id, item).then((saved) => {
      if (saved) setWarehouses((prev) => prev.map((w) => (w.id === id ? saved : w)));
    }).catch((err) => console.warn('Warehouse DB update error:', err));
  };

  const deleteWarehouse = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
    masterDataApi.deleteWarehouse(id).catch((err) => console.warn('Warehouse DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Warehouse Locations (Synced to SQL Server [ViTriLuuKho])
  // ==========================================
  const addWarehouseLocation = (item: Omit<WarehouseLocation, 'id' | 'createdAt'>): WarehouseLocation => {
    const newLoc: WarehouseLocation = {
      ...item,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWarehouseLocations((prev) => [newLoc, ...prev]);
    masterDataApi.createWarehouseLocation(newLoc).then((saved) => {
      if (saved) setWarehouseLocations((prev) => prev.map((l) => (l.id === newLoc.id ? saved : l)));
    }).catch((err) => console.warn('WarehouseLocation DB sync error:', err));
    return newLoc;
  };

  const updateWarehouseLocation = (id: string, item: Partial<WarehouseLocation>) => {
    setWarehouseLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...item } : l)));
    masterDataApi.updateWarehouseLocation(id, item).then((saved) => {
      if (saved) setWarehouseLocations((prev) => prev.map((l) => (l.id === id ? saved : l)));
    }).catch((err) => console.warn('WarehouseLocation DB update error:', err));
  };

  const deleteWarehouseLocation = (id: string) => {
    setWarehouseLocations((prev) => prev.filter((l) => l.id !== id));
    masterDataApi.deleteWarehouseLocation(id).catch((err) => console.warn('WarehouseLocation DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Units Of Measure (Synced to SQL Server [DanhMucDonViTinh])
  // ==========================================
  const addUnitOfMeasure = (item: Omit<UnitOfMeasure, 'id' | 'createdAt'>): UnitOfMeasure => {
    const newUom: UnitOfMeasure = {
      ...item,
      id: `uom-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUnitsOfMeasure((prev) => [newUom, ...prev]);
    masterDataApi.createUnitOfMeasure(newUom).then((saved) => {
      if (saved) setUnitsOfMeasure((prev) => prev.map((u) => (u.id === newUom.id ? saved : u)));
    }).catch((err) => console.warn('UnitOfMeasure DB sync error:', err));
    return newUom;
  };

  const updateUnitOfMeasure = (id: string, item: Partial<UnitOfMeasure>) => {
    setUnitsOfMeasure((prev) => prev.map((u) => (u.id === id ? { ...u, ...item } : u)));
    masterDataApi.updateUnitOfMeasure(id, item).then((saved) => {
      if (saved) setUnitsOfMeasure((prev) => prev.map((u) => (u.id === id ? saved : u)));
    }).catch((err) => console.warn('UnitOfMeasure DB update error:', err));
  };

  const deleteUnitOfMeasure = (id: string) => {
    setUnitsOfMeasure((prev) => prev.filter((u) => u.id !== id));
    masterDataApi.deleteUnitOfMeasure(id).catch((err) => console.warn('UnitOfMeasure DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: UOM Conversion Groups (Synced to SQL Server [NhomDonViTinh] & [ChiTietNhomDonViTinh])
  // ==========================================
  const addUomGroup = (item: Omit<MasterUomGroup, 'id' | 'createdAt'>): MasterUomGroup => {
    const newGrp: MasterUomGroup = {
      ...item,
      id: `uom-grp-${Date.now()}`,
      lines: item.lines || [],
      createdAt: new Date().toISOString(),
    };
    setUomGroups((prev) => [newGrp, ...prev]);
    masterDataApi.createUomGroup(newGrp).then((saved) => {
      if (saved) setUomGroups((prev) => prev.map((g) => (g.id === newGrp.id ? saved : g)));
    }).catch((err) => console.warn('UomGroup DB sync error:', err));
    return newGrp;
  };

  const updateUomGroup = (id: string, item: Partial<MasterUomGroup>) => {
    setUomGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...item } : g)));
    masterDataApi.updateUomGroup(id, item).then((saved) => {
      if (saved) setUomGroups((prev) => prev.map((g) => (g.id === id ? saved : g)));
    }).catch((err) => console.warn('UomGroup DB update error:', err));
  };

  const deleteUomGroup = (id: string) => {
    setUomGroups((prev) => prev.filter((g) => g.id !== id));
    masterDataApi.deleteUomGroup(id).catch((err) => console.warn('UomGroup DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Product Categories (Synced to SQL Server [DanhMucNganhHang])
  // ==========================================
  const addProductCategory = (item: Omit<MasterProductCategory, 'id' | 'createdAt'>): MasterProductCategory => {
    const newCat: MasterProductCategory = {
      ...item,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProductCategories((prev) => [newCat, ...prev]);
    masterDataApi.createProductCategory(newCat).then((saved) => {
      if (saved) setProductCategories((prev) => prev.map((c) => (c.id === newCat.id ? saved : c)));
    }).catch((err) => console.warn('ProductCategory DB sync error:', err));
    return newCat;
  };

  const updateProductCategory = (id: string, item: Partial<MasterProductCategory>) => {
    setProductCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
    masterDataApi.updateProductCategory(id, item).then((saved) => {
      if (saved) setProductCategories((prev) => prev.map((c) => (c.id === id ? saved : c)));
    }).catch((err) => console.warn('ProductCategory DB update error:', err));
  };

  const deleteProductCategory = (id: string) => {
    setProductCategories((prev) => prev.filter((c) => c.id !== id));
    masterDataApi.deleteProductCategory(id).catch((err) => console.warn('ProductCategory DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Colors (Synced to SQL Server [DanhMucMauSac])
  // ==========================================
  const addColor = (item: Omit<MasterColor, 'id' | 'createdAt'>): MasterColor => {
    const newColor: MasterColor = {
      ...item,
      id: `clr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setColors((prev) => [newColor, ...prev]);
    masterDataApi.createColor(newColor).then((saved) => {
      if (saved) setColors((prev) => prev.map((c) => (c.id === newColor.id ? saved : c)));
    }).catch((err) => console.warn('Color DB sync error:', err));
    return newColor;
  };

  const updateColor = (id: string, item: Partial<MasterColor>) => {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
    masterDataApi.updateColor(id, item).then((saved) => {
      if (saved) setColors((prev) => prev.map((c) => (c.id === id ? saved : c)));
    }).catch((err) => console.warn('Color DB update error:', err));
  };

  const deleteColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
    masterDataApi.deleteColor(id).catch((err) => console.warn('Color DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Specifications (Synced to SQL Server [DanhMucQuyCach])
  // ==========================================
  const addSpecification = (item: Omit<MasterSpecification, 'id' | 'createdAt'>): MasterSpecification => {
    const newSpec: MasterSpecification = {
      ...item,
      id: `spec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSpecifications((prev) => [newSpec, ...prev]);
    masterDataApi.createSpecification(newSpec).then((saved) => {
      if (saved) setSpecifications((prev) => prev.map((s) => (s.id === newSpec.id ? saved : s)));
    }).catch((err) => console.warn('Specification DB sync error:', err));
    return newSpec;
  };

  const updateSpecification = (id: string, item: Partial<MasterSpecification>) => {
    setSpecifications((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
    masterDataApi.updateSpecification(id, item).then((saved) => {
      if (saved) setSpecifications((prev) => prev.map((s) => (s.id === id ? saved : s)));
    }).catch((err) => console.warn('Specification DB update error:', err));
  };

  const deleteSpecification = (id: string) => {
    setSpecifications((prev) => prev.filter((s) => s.id !== id));
    masterDataApi.deleteSpecification(id).catch((err) => console.warn('Specification DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Customer Groups (Synced to SQL Server [NhomKhachHang])
  // ==========================================
  const addCustomerGroup = (item: Omit<CustomerGroup, 'id' | 'createdAt'>): CustomerGroup => {
    const newGrp: CustomerGroup = {
      ...item,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomerGroups((prev) => [newGrp, ...prev]);
    masterDataApi.createCustomerGroup(newGrp).then((saved) => {
      if (saved) setCustomerGroups((prev) => prev.map((g) => (g.id === newGrp.id ? saved : g)));
    }).catch((err) => console.warn('CustomerGroup DB sync error:', err));
    return newGrp;
  };

  const updateCustomerGroup = (id: string, item: Partial<CustomerGroup>) => {
    setCustomerGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...item } : g)));
    masterDataApi.updateCustomerGroup(id, item).then((saved) => {
      if (saved) setCustomerGroups((prev) => prev.map((g) => (g.id === id ? saved : g)));
    }).catch((err) => console.warn('CustomerGroup DB update error:', err));
  };

  const deleteCustomerGroup = (id: string) => {
    setCustomerGroups((prev) => prev.filter((g) => g.id !== id));
    masterDataApi.deleteCustomerGroup(id).catch((err) => console.warn('CustomerGroup DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Customer Tiers (Synced to SQL Server [HangThanhVien])
  // ==========================================
  const addCustomerTier = (item: Omit<MasterCustomerTier, 'id' | 'createdAt'>): MasterCustomerTier => {
    const newTier: MasterCustomerTier = {
      ...item,
      id: `tier-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomerTiers((prev) => [newTier, ...prev]);
    masterDataApi.createCustomerTier(newTier).then((saved) => {
      if (saved) setCustomerTiers((prev) => prev.map((t) => (t.id === newTier.id ? saved : t)));
    }).catch((err) => console.warn('CustomerTier DB sync error:', err));
    return newTier;
  };

  const updateCustomerTier = (id: string, item: Partial<MasterCustomerTier>) => {
    setCustomerTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...item } : t)));
    masterDataApi.updateCustomerTier(id, item).then((saved) => {
      if (saved) setCustomerTiers((prev) => prev.map((t) => (t.id === id ? saved : t)));
    }).catch((err) => console.warn('CustomerTier DB update error:', err));
  };

  const deleteCustomerTier = (id: string) => {
    setCustomerTiers((prev) => prev.filter((t) => t.id !== id));
    masterDataApi.deleteCustomerTier(id).catch((err) => console.warn('CustomerTier DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Supplier Categories (Synced to SQL Server [PhanLoaiNhaCungCap])
  // ==========================================
  const addSupplierCategory = (item: Omit<MasterSupplierCategory, 'id' | 'createdAt'>): MasterSupplierCategory => {
    const newCat: MasterSupplierCategory = {
      ...item,
      id: `supcat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSupplierCategories((prev) => [newCat, ...prev]);
    masterDataApi.createSupplierCategory(newCat).then((saved) => {
      if (saved) setSupplierCategories((prev) => prev.map((c) => (c.id === newCat.id ? saved : c)));
    }).catch((err) => console.warn('SupplierCategory DB sync error:', err));
    return newCat;
  };

  const updateSupplierCategory = (id: string, item: Partial<MasterSupplierCategory>) => {
    setSupplierCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
    masterDataApi.updateSupplierCategory(id, item).then((saved) => {
      if (saved) setSupplierCategories((prev) => prev.map((c) => (c.id === id ? saved : c)));
    }).catch((err) => console.warn('SupplierCategory DB update error:', err));
  };

  const deleteSupplierCategory = (id: string) => {
    setSupplierCategories((prev) => prev.filter((c) => c.id !== id));
    masterDataApi.deleteSupplierCategory(id).catch((err) => console.warn('SupplierCategory DB delete error:', err));
  };

  // ==========================================
  // CRUD Actions: Projects (Synced to SQL Server [DuAnDoanhNghiep])
  // ==========================================
  const addProject = (item: Omit<EnterpriseProject, 'id' | 'createdAt'>): EnterpriseProject => {
    const newProj: EnterpriseProject = {
      ...item,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    masterDataApi.createProject(newProj).then((saved) => {
      if (saved) setProjects((prev) => prev.map((p) => (p.id === newProj.id ? saved : p)));
    }).catch((err) => console.warn('Project DB sync error:', err));
    return newProj;
  };

  const updateProject = (id: string, item: Partial<EnterpriseProject>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...item } : p)));
    masterDataApi.updateProject(id, item).then((saved) => {
      if (saved) setProjects((prev) => prev.map((p) => (p.id === id ? saved : p)));
    }).catch((err) => console.warn('Project DB update error:', err));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    masterDataApi.deleteProject(id).catch((err) => console.warn('Project DB delete error:', err));
  };

  // ==========================================
  // Email Gateway & Templates
  // ==========================================
  const updateEmailConfig = (config: Partial<EmailGatewayConfig>) => {
    setEmailConfig((prev) => ({ ...prev, ...config }));
  };

  const updateEmailTemplate = (id: string, template: Partial<EmailTemplate>) => {
    setEmailTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...template } : t)));
  };

  const sendEmailDispatch = async (options: {
    recipientEmail: string;
    recipientName: string;
    type: EmailTemplateType;
    subject: string;
    bodyHtml?: string;
    referenceCode?: string;
  }) => {
    const newLog: EmailDispatchLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientEmail: options.recipientEmail,
      recipientName: options.recipientName,
      subject: options.subject,
      type: options.type,
      typeLabel: options.type === 'einvoice_vat' ? 'Hóa Đơn GTGT TT78' : options.type === 'quote_proposal' ? 'Báo Giá Dự Án' : 'Đơn Mua Hàng PO',
      status: 'sent',
      responseTimeMs: Math.floor(Math.random() * 200) + 150,
      referenceCode: options.referenceCode,
    };
    setEmailLogs((prev) => [newLog, ...prev]);
    return { success: true, latencyMs: newLog.responseTimeMs, message: `Email đã gửi thành công tới ${options.recipientEmail}` };
  };

  const clearEmailLogs = () => {
    setEmailLogs([]);
  };

  // ==========================================
  // Password Reset Approval Flow
  // ==========================================
  const requestPasswordReset = async (username: string, email: string, reason?: string) => {
    const reqId = `req-pwd-${Date.now()}`;
    const newReq: PasswordResetRequest = {
      id: reqId,
      timestamp: new Date().toISOString(),
      userId: `usr-${username}`,
      username,
      fullName: username,
      userEmail: email,
      adminEmail: emailConfig.adminNotificationEmail,
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      reason: reason || 'Quên mật khẩu đăng nhập',
      status: 'pending_admin_approval',
      requestedAt: new Date().toISOString(),
    };
    setPasswordResetRequests((prev) => [newReq, ...prev]);
    return { success: true, requestId: reqId, message: 'Yêu cầu cấp lại mật khẩu đã được gửi tới Quản Trị Viên' };
  };

  const approvePasswordReset = async (requestId: string, customTempPassword?: string) => {
    const tempPassword = customTempPassword || `GP@${Math.floor(100000 + Math.random() * 900000)}`;
    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', approvedAt: new Date().toISOString() }
          : r
      )
    );
    return { success: true, tempPassword, message: 'Đã phê duyệt và cấp mật khẩu tạm thời thành công' };
  };

  const rejectPasswordReset = (requestId: string, adminNote?: string) => {
    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', rejectedAt: new Date().toISOString(), adminNote }
          : r
      )
    );
  };

  // Universal Quick-Add Helper
  const quickAddMasterItem = (type: MasterDataType, data: any) => {
    switch (type) {
      case 'customers':
        return addCustomer(data);
      case 'suppliers':
        return addSupplier(data);
      case 'projects':
        return addProject(data);
      case 'departments':
        return addDepartment(data);
      case 'positions':
        return addJobPosition(data);
      case 'warehouses':
      case 'warehouse':
        return addWarehouse(data);
      case 'locations':
        return addWarehouseLocation(data);
      case 'uoms':
        return addUnitOfMeasure(data);
      case 'categories':
        return addProductCategory(data);
      case 'colors':
        return addColor(data);
      case 'specifications':
        return addSpecification(data);
      case 'customerGroups':
        return addCustomerGroup(data);
      case 'customerTiers':
        return addCustomerTier(data);
      case 'supplierCategories':
        return addSupplierCategory(data);
      default:
        throw new Error(`Unsupported master data type: ${type}`);
    }
  };

  const resetMasterDataToDefaults = () => {
    refreshMasterDataFromDb();
  };

  return (
    <MasterDataContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        customerTiers,
        addCustomerTier,
        updateCustomerTier,
        deleteCustomerTier,

        projects,
        addProject,
        updateProject,
        deleteProject,

        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,

        departments,
        deleteDepartment,
        addDepartment,
        updateDepartment,

        jobPositions,
        deleteJobPosition,
        addJobPosition,
        updateJobPosition,

        warehouses,
        deleteWarehouse,
        addWarehouse,
        updateWarehouse,

        warehouseLocations,
        deleteWarehouseLocation,
        addWarehouseLocation,
        updateWarehouseLocation,

        unitsOfMeasure,
        deleteUnitOfMeasure,
        addUnitOfMeasure,
        updateUnitOfMeasure,

        uomGroups,
        deleteUomGroup,
        addUomGroup,
        updateUomGroup,

        productCategories,
        deleteProductCategory,
        addProductCategory,
        updateProductCategory,

        colors,
        deleteColor,
        addColor,
        updateColor,

        specifications,
        deleteSpecification,
        addSpecification,
        updateSpecification,

        customerGroups,
        deleteCustomerGroup,
        addCustomerGroup,
        updateCustomerGroup,

        supplierCategories,
        deleteSupplierCategory,
        addSupplierCategory,
        updateSupplierCategory,

        emailConfig,
        updateEmailConfig,

        emailTemplates,
        updateEmailTemplate,

        emailLogs,
        sendEmailDispatch,
        clearEmailLogs,

        passwordResetRequests,
        requestPasswordReset,
        approvePasswordReset,
        rejectPasswordReset,

        quickAddMasterItem,
        resetMasterDataToDefaults,
        refreshMasterDataFromDb,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = (): MasterDataContextType => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};
