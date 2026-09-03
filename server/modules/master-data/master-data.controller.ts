import { Request, Response, NextFunction } from "express";
import { MasterDataService } from "./master-data.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class MasterDataController {
  // 1. All Master Data
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getAllMasterData();
      return sendSuccess(res, data, "Lấy toàn bộ dữ liệu cơ bản thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 2. Departments
  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getDepartments();
      return sendSuccess(res, data, "Lấy danh sách phòng ban thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createDepartment(req.body);
      return sendCreated(res, data, "Thêm mới phòng ban thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateDepartment(id, req.body);
      return sendSuccess(res, data, "Cập nhật phòng ban thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteDepartment(id);
      return sendSuccess(res, data, "Xóa phòng ban thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 3. Job Positions
  static async getJobPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getJobPositions();
      return sendSuccess(res, data, "Lấy danh sách chức vụ thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createJobPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createJobPosition(req.body);
      return sendCreated(res, data, "Thêm mới chức vụ thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateJobPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateJobPosition(id, req.body);
      return sendSuccess(res, data, "Cập nhật chức vụ thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteJobPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteJobPosition(id);
      return sendSuccess(res, data, "Xóa chức vụ thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 4. Master Warehouses
  static async getWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getWarehouses();
      return sendSuccess(res, data, "Lấy danh sách kho hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createWarehouse(req.body);
      return sendCreated(res, data, "Thêm mới kho hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateWarehouse(id, req.body);
      return sendSuccess(res, data, "Cập nhật kho hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteWarehouse(id);
      return sendSuccess(res, data, "Xóa kho hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 4.1 Warehouse Locations
  static async getWarehouseLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getWarehouseLocations();
      return sendSuccess(res, data, "Lấy danh sách vị trí kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createWarehouseLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createWarehouseLocation(req.body);
      return sendCreated(res, data, "Thêm mới vị trí kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateWarehouseLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateWarehouseLocation(id, req.body);
      return sendSuccess(res, data, "Cập nhật vị trí kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteWarehouseLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteWarehouseLocation(id);
      return sendSuccess(res, data, "Xóa vị trí kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 5. Units of Measure
  static async getUnitsOfMeasure(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getUnitsOfMeasure();
      return sendSuccess(res, data, "Lấy danh sách đơn vị tính thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createUnitOfMeasure(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createUnitOfMeasure(req.body);
      return sendCreated(res, data, "Thêm mới đơn vị tính thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateUnitOfMeasure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateUnitOfMeasure(id, req.body);
      return sendSuccess(res, data, "Cập nhật đơn vị tính thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUnitOfMeasure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteUnitOfMeasure(id);
      return sendSuccess(res, data, "Xóa đơn vị tính thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 6. Product Categories
  static async getProductCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getProductCategories();
      return sendSuccess(res, data, "Lấy danh sách danh mục ngành hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createProductCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createProductCategory(req.body);
      return sendCreated(res, data, "Thêm mới danh mục ngành hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateProductCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateProductCategory(id, req.body);
      return sendSuccess(res, data, "Cập nhật danh mục ngành hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProductCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteProductCategory(id);
      return sendSuccess(res, data, "Xóa danh mục ngành hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 7. Customer Groups
  static async getCustomerGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getCustomerGroups();
      return sendSuccess(res, data, "Lấy danh sách nhóm khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createCustomerGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createCustomerGroup(req.body);
      return sendCreated(res, data, "Thêm mới nhóm khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateCustomerGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateCustomerGroup(id, req.body);
      return sendSuccess(res, data, "Cập nhật nhóm khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCustomerGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteCustomerGroup(id);
      return sendSuccess(res, data, "Xóa nhóm khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 8. Customer Tiers
  static async getCustomerTiers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getCustomerTiers();
      return sendSuccess(res, data, "Lấy danh sách hạng thành viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createCustomerTier(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createCustomerTier(req.body);
      return sendCreated(res, data, "Thêm mới hạng thành viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateCustomerTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateCustomerTier(id, req.body);
      return sendSuccess(res, data, "Cập nhật hạng thành viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCustomerTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteCustomerTier(id);
      return sendSuccess(res, data, "Xóa hạng thành viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 9. Supplier Categories
  static async getSupplierCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getSupplierCategories();
      return sendSuccess(res, data, "Lấy danh sách phân loại NCC thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createSupplierCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createSupplierCategory(req.body);
      return sendCreated(res, data, "Thêm mới phân loại NCC thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateSupplierCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateSupplierCategory(id, req.body);
      return sendSuccess(res, data, "Cập nhật phân loại NCC thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteSupplierCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteSupplierCategory(id);
      return sendSuccess(res, data, "Xóa phân loại NCC thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 10. Projects
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getProjects();
      return sendSuccess(res, data, "Lấy danh sách dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createProject(req.body);
      return sendCreated(res, data, "Thêm mới dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateProject(id, req.body);
      return sendSuccess(res, data, "Cập nhật dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteProject(id);
      return sendSuccess(res, data, "Xóa dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 11. UOM Conversion Groups
  static async getUomGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getUomGroups();
      return sendSuccess(res, data, "Lấy danh sách bộ nhóm quy đổi ĐVT thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createUomGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createUomGroup(req.body);
      return sendCreated(res, data, "Thêm mới bộ nhóm quy đổi ĐVT thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateUomGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateUomGroup(id, req.body);
      return sendSuccess(res, data, "Cập nhật bộ nhóm quy đổi ĐVT thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUomGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteUomGroup(id);
      return sendSuccess(res, data, "Xóa bộ nhóm quy đổi ĐVT thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 12. Master Colors
  static async getColors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getColors();
      return sendSuccess(res, data, "Lấy danh sách màu sắc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createColor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createColor(req.body);
      return sendCreated(res, data, "Thêm mới màu sắc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateColor(id, req.body);
      return sendSuccess(res, data, "Cập nhật màu sắc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteColor(id);
      return sendSuccess(res, data, "Xóa màu sắc thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 13. Master Specifications
  static async getSpecifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.getSpecifications();
      return sendSuccess(res, data, "Lấy danh sách quy cách thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createSpecification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MasterDataService.createSpecification(req.body);
      return sendCreated(res, data, "Thêm mới quy cách thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateSpecification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.updateSpecification(id, req.body);
      return sendSuccess(res, data, "Cập nhật quy cách thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteSpecification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MasterDataService.deleteSpecification(id);
      return sendSuccess(res, data, "Xóa quy cách thành công");
    } catch (error) {
      return next(error);
    }
  }
}
