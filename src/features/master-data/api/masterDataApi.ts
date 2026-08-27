import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import {
  Department,
  JobPosition,
  WarehouseLocation,
  UnitOfMeasure,
  MasterProductCategory,
  CustomerGroup,
  MasterCustomerTier,
  MasterSupplierCategory,
  EnterpriseProject,
  Customer,
  Supplier,
} from "../../../types";

export interface AllMasterDataResponse {
  departments: Department[];
  jobPositions: JobPosition[];
  warehouseLocations: WarehouseLocation[];
  unitsOfMeasure: UnitOfMeasure[];
  uomGroups: UOMGroup[];
  productCategories: MasterProductCategory[];
  customerGroups: CustomerGroup[];
  customerTiers: MasterCustomerTier[];
  supplierCategories: MasterSupplierCategory[];
  projects: EnterpriseProject[];
  customers: Customer[];
  suppliers: Supplier[];
}

export const masterDataApi = {
  // 1. Get All Master Data
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<AllMasterDataResponse>>("/master-data/all");
    return res.data.data;
  },

  // 2. Departments
  getDepartments: async () => {
    const res = await apiClient.get<ApiResponse<Department[]>>("/master-data/departments");
    return res.data.data;
  },
  createDepartment: async (data: Partial<Department>) => {
    const res = await apiClient.post<ApiResponse<Department>>("/master-data/departments", data);
    return res.data.data;
  },
  updateDepartment: async (id: string, data: Partial<Department>) => {
    const res = await apiClient.put<ApiResponse<Department>>(`/master-data/departments/${id}`, data);
    return res.data.data;
  },
  deleteDepartment: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/departments/${id}`);
    return res.data.data;
  },

  // 3. Job Positions
  getJobPositions: async () => {
    const res = await apiClient.get<ApiResponse<JobPosition[]>>("/master-data/job-positions");
    return res.data.data;
  },
  createJobPosition: async (data: Partial<JobPosition>) => {
    const res = await apiClient.post<ApiResponse<JobPosition>>("/master-data/job-positions", data);
    return res.data.data;
  },
  updateJobPosition: async (id: string, data: Partial<JobPosition>) => {
    const res = await apiClient.put<ApiResponse<JobPosition>>(`/master-data/job-positions/${id}`, data);
    return res.data.data;
  },
  deleteJobPosition: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/job-positions/${id}`);
    return res.data.data;
  },

  // 4. Warehouse Locations
  getWarehouseLocations: async () => {
    const res = await apiClient.get<ApiResponse<WarehouseLocation[]>>("/master-data/warehouse-locations");
    return res.data.data;
  },
  createWarehouseLocation: async (data: Partial<WarehouseLocation>) => {
    const res = await apiClient.post<ApiResponse<WarehouseLocation>>("/master-data/warehouse-locations", data);
    return res.data.data;
  },
  updateWarehouseLocation: async (id: string, data: Partial<WarehouseLocation>) => {
    const res = await apiClient.put<ApiResponse<WarehouseLocation>>(`/master-data/warehouse-locations/${id}`, data);
    return res.data.data;
  },
  deleteWarehouseLocation: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/warehouse-locations/${id}`);
    return res.data.data;
  },

  // 5. Units of Measure
  getUnitsOfMeasure: async () => {
    const res = await apiClient.get<ApiResponse<UnitOfMeasure[]>>("/master-data/units-of-measure");
    return res.data.data;
  },
  createUnitOfMeasure: async (data: Partial<UnitOfMeasure>) => {
    const res = await apiClient.post<ApiResponse<UnitOfMeasure>>("/master-data/units-of-measure", data);
    return res.data.data;
  },
  updateUnitOfMeasure: async (id: string, data: Partial<UnitOfMeasure>) => {
    const res = await apiClient.put<ApiResponse<UnitOfMeasure>>(`/master-data/units-of-measure/${id}`, data);
    return res.data.data;
  },
  deleteUnitOfMeasure: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/units-of-measure/${id}`);
    return res.data.data;
  },

  // 5.1 Multi-Tier UOM Groups
  getUOMGroups: async () => {
    const res = await apiClient.get<ApiResponse<UOMGroup[]>>("/master-data/uom-groups");
    return res.data.data;
  },
  createUOMGroup: async (data: Partial<UOMGroup>) => {
    const res = await apiClient.post<ApiResponse<UOMGroup>>("/master-data/uom-groups", data);
    return res.data.data;
  },
  updateUOMGroup: async (id: string, data: Partial<UOMGroup>) => {
    const res = await apiClient.put<ApiResponse<UOMGroup>>(`/master-data/uom-groups/${id}`, data);
    return res.data.data;
  },
  deleteUOMGroup: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/uom-groups/${id}`);
    return res.data.data;
  },

  // 6. Product Categories
  getProductCategories: async () => {
    const res = await apiClient.get<ApiResponse<MasterProductCategory[]>>("/master-data/product-categories");
    return res.data.data;
  },
  createProductCategory: async (data: Partial<MasterProductCategory>) => {
    const res = await apiClient.post<ApiResponse<MasterProductCategory>>("/master-data/product-categories", data);
    return res.data.data;
  },
  updateProductCategory: async (id: string, data: Partial<MasterProductCategory>) => {
    const res = await apiClient.put<ApiResponse<MasterProductCategory>>(`/master-data/product-categories/${id}`, data);
    return res.data.data;
  },
  deleteProductCategory: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/product-categories/${id}`);
    return res.data.data;
  },

  // 7. Customer Groups
  getCustomerGroups: async () => {
    const res = await apiClient.get<ApiResponse<CustomerGroup[]>>("/master-data/customer-groups");
    return res.data.data;
  },
  createCustomerGroup: async (data: Partial<CustomerGroup>) => {
    const res = await apiClient.post<ApiResponse<CustomerGroup>>("/master-data/customer-groups", data);
    return res.data.data;
  },
  updateCustomerGroup: async (id: string, data: Partial<CustomerGroup>) => {
    const res = await apiClient.put<ApiResponse<CustomerGroup>>(`/master-data/customer-groups/${id}`, data);
    return res.data.data;
  },
  deleteCustomerGroup: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/customer-groups/${id}`);
    return res.data.data;
  },

  // 8. Customer Tiers
  getCustomerTiers: async () => {
    const res = await apiClient.get<ApiResponse<MasterCustomerTier[]>>("/master-data/customer-tiers");
    return res.data.data;
  },
  createCustomerTier: async (data: Partial<MasterCustomerTier>) => {
    const res = await apiClient.post<ApiResponse<MasterCustomerTier>>("/master-data/customer-tiers", data);
    return res.data.data;
  },
  updateCustomerTier: async (id: string, data: Partial<MasterCustomerTier>) => {
    const res = await apiClient.put<ApiResponse<MasterCustomerTier>>(`/master-data/customer-tiers/${id}`, data);
    return res.data.data;
  },
  deleteCustomerTier: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/customer-tiers/${id}`);
    return res.data.data;
  },

  // 9. Supplier Categories
  getSupplierCategories: async () => {
    const res = await apiClient.get<ApiResponse<MasterSupplierCategory[]>>("/master-data/supplier-categories");
    return res.data.data;
  },
  createSupplierCategory: async (data: Partial<MasterSupplierCategory>) => {
    const res = await apiClient.post<ApiResponse<MasterSupplierCategory>>("/master-data/supplier-categories", data);
    return res.data.data;
  },
  updateSupplierCategory: async (id: string, data: Partial<MasterSupplierCategory>) => {
    const res = await apiClient.put<ApiResponse<MasterSupplierCategory>>(`/master-data/supplier-categories/${id}`, data);
    return res.data.data;
  },
  deleteSupplierCategory: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/supplier-categories/${id}`);
    return res.data.data;
  },

  // 10. Projects
  getProjects: async () => {
    const res = await apiClient.get<ApiResponse<EnterpriseProject[]>>("/master-data/projects");
    return res.data.data;
  },
  createProject: async (data: Partial<EnterpriseProject>) => {
    const res = await apiClient.post<ApiResponse<EnterpriseProject>>("/master-data/projects", data);
    return res.data.data;
  },
  updateProject: async (id: string, data: Partial<EnterpriseProject>) => {
    const res = await apiClient.put<ApiResponse<EnterpriseProject>>(`/master-data/projects/${id}`, data);
    return res.data.data;
  },
  deleteProject: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/master-data/projects/${id}`);
    return res.data.data;
  },
};
