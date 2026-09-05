import { Request, Response } from "express";
import { ContractsService } from "./contracts.service";
import { asyncHandler } from "../../core/middlewares/asyncHandler";

export class ContractsController {
  static getContracts = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContractsService.getContracts(req.query as any);
    res.json({
      success: true,
      message: "Lấy danh sách hợp đồng kinh tế thành công",
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  static getContractById = asyncHandler(async (req: Request, res: Response) => {
    const contract = await ContractsService.getContractById(req.params.id);
    res.json({
      success: true,
      data: contract,
    });
  });

  static createContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await ContractsService.createContract(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo hợp đồng kinh tế thành công",
      data: contract,
    });
  });

  static createFromQuote = asyncHandler(async (req: Request, res: Response) => {
    const contract = await ContractsService.createFromQuote(req.body);
    res.status(201).json({
      success: true,
      message: `Đã khởi tạo hợp đồng [${contract.contractNumber}] từ Báo giá thành công!`,
      data: contract,
    });
  });

  static signContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await ContractsService.signContract(req.params.id, req.body);
    res.json({
      success: true,
      message: `Đã ký số điện tử thành công vào hợp đồng [${contract.contractNumber}]!`,
      data: contract,
    });
  });

  static createHandover = asyncHandler(async (req: Request, res: Response) => {
    const contract = await ContractsService.createHandover(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: "Lập phiếu bàn giao hàng hóa/thiết bị thành công",
      data: contract,
    });
  });

  static createLiquidation = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContractsService.createLiquidation(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: `Đã nghiệm thu và thanh lý hợp đồng thành công! ${result.invoiceCode ? `(Đã xuất hóa đơn VAT: ${result.invoiceCode})` : ""}`,
      data: result.contract,
      invoiceCode: result.invoiceCode,
    });
  });

  static deleteContract = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContractsService.deleteContract(req.params.id);
    res.json(result);
  });
}
