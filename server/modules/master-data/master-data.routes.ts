import { Router } from "express";
import { MasterDataController } from "./master-data.controller";

const router = Router();

// 1. All Master Data
router.get("/all", MasterDataController.getAll);

// 2. Departments
router.get("/departments", MasterDataController.getDepartments);
router.post("/departments", MasterDataController.createDepartment);
router.put("/departments/:id", MasterDataController.updateDepartment);
router.delete("/departments/:id", MasterDataController.deleteDepartment);

// 3. Job Positions
router.get("/job-positions", MasterDataController.getJobPositions);
router.post("/job-positions", MasterDataController.createJobPosition);
router.put("/job-positions/:id", MasterDataController.updateJobPosition);
router.delete("/job-positions/:id", MasterDataController.deleteJobPosition);

// 4. Warehouse Locations
router.get("/warehouse-locations", MasterDataController.getWarehouseLocations);
router.post("/warehouse-locations", MasterDataController.createWarehouseLocation);
router.put("/warehouse-locations/:id", MasterDataController.updateWarehouseLocation);
router.delete("/warehouse-locations/:id", MasterDataController.deleteWarehouseLocation);

// 5. Units of Measure
router.get("/units-of-measure", MasterDataController.getUnitsOfMeasure);
router.post("/units-of-measure", MasterDataController.createUnitOfMeasure);
router.put("/units-of-measure/:id", MasterDataController.updateUnitOfMeasure);
router.delete("/units-of-measure/:id", MasterDataController.deleteUnitOfMeasure);

// 5.1 Multi-Tier UOM Groups
router.get("/uom-groups", MasterDataController.getUOMGroups);
router.post("/uom-groups", MasterDataController.createUOMGroup);
router.put("/uom-groups/:id", MasterDataController.updateUOMGroup);
router.delete("/uom-groups/:id", MasterDataController.deleteUOMGroup);

// 6. Product Categories
router.get("/product-categories", MasterDataController.getProductCategories);
router.post("/product-categories", MasterDataController.createProductCategory);
router.put("/product-categories/:id", MasterDataController.updateProductCategory);
router.delete("/product-categories/:id", MasterDataController.deleteProductCategory);

// 7. Customer Groups
router.get("/customer-groups", MasterDataController.getCustomerGroups);
router.post("/customer-groups", MasterDataController.createCustomerGroup);
router.put("/customer-groups/:id", MasterDataController.updateCustomerGroup);
router.delete("/customer-groups/:id", MasterDataController.deleteCustomerGroup);

// 8. Customer Tiers
router.get("/customer-tiers", MasterDataController.getCustomerTiers);
router.post("/customer-tiers", MasterDataController.createCustomerTier);
router.put("/customer-tiers/:id", MasterDataController.updateCustomerTier);
router.delete("/customer-tiers/:id", MasterDataController.deleteCustomerTier);

// 9. Supplier Categories
router.get("/supplier-categories", MasterDataController.getSupplierCategories);
router.post("/supplier-categories", MasterDataController.createSupplierCategory);
router.put("/supplier-categories/:id", MasterDataController.updateSupplierCategory);
router.delete("/supplier-categories/:id", MasterDataController.deleteSupplierCategory);

// 10. Projects
router.get("/projects", MasterDataController.getProjects);
router.post("/projects", MasterDataController.createProject);
router.put("/projects/:id", MasterDataController.updateProject);
router.delete("/projects/:id", MasterDataController.deleteProject);

export default router;
