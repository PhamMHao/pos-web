import { Router } from 'express';
import { ApprovalsController } from './approvals.controller';

const router = Router();

// Lấy danh sách mẫu quy trình chuẩn
router.get('/templates', ApprovalsController.getTemplates);

// Phân tích KPI và điểm nghẽn
router.get('/analytics', ApprovalsController.getAnalytics);

// Danh sách phiếu trình ký
router.get('/processes', ApprovalsController.getProcesses);

// Chi tiết 1 phiếu trình ký
router.get('/processes/:id', ApprovalsController.getProcessById);

// Tạo mới phiếu trình ký
router.post('/processes', ApprovalsController.createProcess);

// Ký duyệt / Từ chối / Yêu cầu làm lại theo tuần tự
router.post('/processes/:id/action', ApprovalsController.executeAction);

// Gửi nhắc duyệt cho bước đang waiting
router.post('/processes/:id/remind', ApprovalsController.sendReminder);

export default router;
