/**
 * GP-ERP Enterprise - Central Currency & Number Formatting Utility
 * Chuẩn hóa định dạng tiền tệ và số lượng trên toàn bộ hệ sinh thái GP-ERP
 */

export interface CurrencyFormatOptions {
  /** Ký hiệu tiền tệ (mặc định: 'VNĐ') */
  symbol?: string;
  /** Có hiển thị ký hiệu tiền tệ hay không (mặc định: true) */
  showSymbol?: boolean;
  /** Vị trí ký hiệu tiền tệ ('after' | 'before', mặc định: 'after') */
  symbolPosition?: 'after' | 'before';
  /** Hiển thị dấu '+' cho số dương (ví dụ: +150.000 VNĐ) */
  showSign?: boolean;
  /** Rút gọn số lớn cho KPI/Chart (ví dụ: 15.5 tr, 2 tỷ) */
  compact?: boolean;
  /** Giá trị hiển thị khi null / undefined / NaN (mặc định: '0 VNĐ') */
  fallback?: string;
  /** Có khoảng trắng giữa số và ký hiệu không (mặc định: true) */
  space?: boolean;
  /** Số chữ số thập phân (mặc định: 0 cho VNĐ) */
  decimals?: number;
}

/**
 * Định dạng số tiền chuẩn cho toàn bộ hệ thống GP-ERP Enterprise
 * @param amount Số tiền (number, string hoặc null/undefined)
 * @param options Tùy chọn định dạng
 * @returns Chuỗi tiền tệ đã định dạng (ví dụ: "150.000 VNĐ", "-50.000 VNĐ", "+200.000 VNĐ")
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options?: CurrencyFormatOptions
): string {
  const {
    symbol = 'VNĐ',
    showSymbol = true,
    symbolPosition = 'after',
    showSign = false,
    compact = false,
    fallback,
    space = true,
    decimals = 0,
  } = options || {};

  if (amount === null || amount === undefined || amount === '') {
    return fallback !== undefined ? fallback : showSymbol ? `0${space ? ' ' : ''}${symbol}` : '0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);

  if (isNaN(num)) {
    return fallback !== undefined ? fallback : showSymbol ? `0${space ? ' ' : ''}${symbol}` : '0';
  }

  // Chế độ rút gọn cho biểu đồ / thẻ KPI
  if (compact) {
    return formatCompactCurrency(num, symbol);
  }

  const isNegative = num < 0;
  const isPositive = num > 0;
  const absNum = Math.abs(num);

  let formattedNumber = absNum.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Xử lý dấu
  let signStr = '';
  if (isNegative) {
    signStr = '-';
  } else if (showSign && isPositive) {
    signStr = '+';
  }

  if (!showSymbol || !symbol) {
    return `${signStr}${formattedNumber}`;
  }

  const spacing = space ? ' ' : '';

  if (symbolPosition === 'before') {
    return `${signStr}${symbol}${spacing}${formattedNumber}`;
  }

  return `${signStr}${formattedNumber}${spacing}${symbol}`;
}

/**
 * Format tiền tệ VND mặc định (tương thích 100% với các import cũ)
 * @param amount Số tiền
 * @returns Chuỗi định dạng ví dụ "150.000 VNĐ"
 */
export function formatVND(amount: number | string | null | undefined): string {
  return formatCurrency(amount, { symbol: 'VNĐ' });
}

/**
 * Rút gọn số tiền lớn cho các thẻ KPI và Biểu đồ Dashboard (ví dụ: 15.5 tr VNĐ, 2.4 tỷ VNĐ, 500 k VNĐ)
 * @param amount Số tiền
 * @param symbol Ký hiệu tiền tệ kèm theo (mặc định: 'VNĐ')
 */
export function formatCompactCurrency(
  amount: number | string | null | undefined,
  symbol: string = 'VNĐ'
): string {
  if (amount === null || amount === undefined || amount === '') return `0 ${symbol}`;
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return `0 ${symbol}`;

  const isNegative = num < 0;
  const abs = Math.abs(num);
  const sign = isNegative ? '-' : '';

  let compactStr = '';
  if (abs >= 1_000_000_000_000) {
    compactStr = (abs / 1_000_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' nghìn tỷ';
  } else if (abs >= 1_000_000_000) {
    compactStr = (abs / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
  } else if (abs >= 1_000_000) {
    compactStr = (abs / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tr';
  } else if (abs >= 1_000) {
    compactStr = (abs / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' k';
  } else {
    compactStr = abs.toLocaleString('vi-VN');
  }

  return symbol ? `${sign}${compactStr} ${symbol}` : `${sign}${compactStr}`;
}

/**
 * Định dạng số thông thường có phân cách hàng nghìn (không kèm ký hiệu tiền tệ)
 * Ví dụ: 1500000 -> "1.500.000"
 */
export function formatNumber(
  amount: number | string | null | undefined,
  decimals: number = 0
): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '0';

  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse chuỗi người dùng nhập trong ô input thành số thực (number)
 * Ví dụ: "150.000 VNĐ" -> 150000; "1,500,000" -> 1500000; "25.5" -> 25.5
 */
export function parseCurrencyInput(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  // Xóa bỏ tất cả ký tự không phải số, dấu trừ hoặc dấu chấm/phẩy thập phân
  const cleaned = value.toString().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
