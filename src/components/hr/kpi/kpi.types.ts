import { KpiCriterion, KpiEvaluation, KpiRank, StoreSettings, DigitalSignatureMetadata } from '../../../types';

export type KpiFormTabType = 'form01' | 'form02' | 'form03' | 'form04';

export interface KpiRankThreshold {
  rank: KpiRank;
  minScore: number;
  label: string;
  bonusRate: number; // % lương cơ bản
  initiativeBonus: number; // VNĐ
  attendanceBonus: number; // VNĐ
  colorBadge: string;
  description: string;
}

export const KPI_RANK_CONFIGS: Record<KpiRank, KpiRankThreshold> = {
  'A+': {
    rank: 'A+',
    minScore: 95.0,
    label: 'Xuất sắc',
    bonusRate: 25,
    initiativeBonus: 1000000,
    attendanceBonus: 500000,
    colorBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Vượt trội toàn diện các chỉ tiêu, có sáng kiến cải tiến quy trình nổi bật.',
  },
  'A': {
    rank: 'A',
    minScore: 85.0,
    label: 'Tốt',
    bonusRate: 15,
    initiativeBonus: 300000,
    attendanceBonus: 500000,
    colorBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Hoàn thành vượt mức các chỉ tiêu cốt lõi, kỷ luật và tác phong gương mẫu.',
  },
  'B': {
    rank: 'B',
    minScore: 70.0,
    label: 'Khá',
    bonusRate: 8,
    initiativeBonus: 0,
    attendanceBonus: 500000,
    colorBadge: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Đạt đúng yêu cầu công việc, hoàn thành chỉ tiêu doanh số và khối lượng giao.',
  },
  'C': {
    rank: 'C',
    minScore: 50.0,
    label: 'Trung bình / Cần cải thiện',
    bonusRate: 0,
    initiativeBonus: 0,
    attendanceBonus: 0,
    colorBadge: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Chưa đạt 30% chỉ tiêu được giao, cần lập Kế hoạch cải thiện hiệu suất (PIP).',
  },
  'D': {
    rank: 'D',
    minScore: 0,
    label: 'Yếu / Không hoàn thành',
    bonusRate: 0,
    initiativeBonus: 0,
    attendanceBonus: 0,
    colorBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Vi phạm quy chế hoặc không hoàn thành trên 50% chỉ tiêu được giao.',
  },
};

export const AVAILABLE_PERIODS = [
  'Tháng 03/2026',
  'Tháng 02/2026',
  'Tháng 01/2026',
  'Quý 1/2026',
  'Quý 4/2025',
];

export const DEPARTMENTS = [
  'Phòng Kinh Doanh & Bán Lẻ POS',
  'Bộ Phận Kho Vận & Hậu Cần',
  'Phòng Kế Toán - Tài Chính',
  'Ban Điều Hành & Quản Lý Chi Nhánh',
  'Tất cả phòng ban',
];

export { type KpiCriterion, type KpiEvaluation, type KpiRank };
