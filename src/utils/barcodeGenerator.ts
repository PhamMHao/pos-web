/**
 * Pure TypeScript Code-128 & QR Code Vector SVG Generator
 * Thiết kế chuẩn cho máy in mã vạch / máy in tem nhiệt (Xprinter, Bixolon, Godex, Zebra, HPRT)
 */

// Code 128 Table B encoding patterns (widths of bars and spaces)
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (106 is STOP)
];

const START_B = 104;
const STOP = 106;

/**
 * Generate standard Code 128B bar sequence
 */
export function encodeCode128(text: string): string {
  if (!text) return '';
  const clean = text.replace(/[^\x20-\x7E]/g, '');
  if (!clean) return '';

  const values: number[] = [START_B];
  let checkSum = START_B;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) - 32;
    values.push(code);
    checkSum += code * (i + 1);
  }

  values.push(checkSum % 103);
  values.push(STOP);

  let patternStr = '';
  for (const v of values) {
    patternStr += CODE128_PATTERNS[v] || '';
  }

  return patternStr;
}

/**
 * Generates an SVG string for Code-128 barcode
 */
export function generateBarcodeSVG(
  text: string,
  options: {
    height?: number;
    showText?: boolean;
    barWidth?: number;
    fontSize?: number;
  } = {}
): string {
  const { height = 45, showText = true, barWidth = 2, fontSize = 11 } = options;
  const pattern = encodeCode128(text);
  if (!pattern) return '';

  let totalModules = 0;
  for (let i = 0; i < pattern.length; i++) {
    totalModules += parseInt(pattern[i], 10);
  }

  const quietZoneModules = 10;
  const fullModules = totalModules + quietZoneModules * 2;
  const svgWidth = fullModules * barWidth;
  const textHeight = showText ? fontSize + 4 : 0;
  const svgHeight = height + textHeight;

  let currentX = quietZoneModules * barWidth;
  const rects: string[] = [];

  let isBar = true;
  for (let i = 0; i < pattern.length; i++) {
    const width = parseInt(pattern[i], 10) * barWidth;
    if (isBar) {
      rects.push('<rect x="' + currentX + '" y="0" width="' + width + '" height="' + height + '" fill="#000000" />');
    }
    currentX += width;
    isBar = !isBar;
  }

  const textElement = showText
    ? '<text x="' + (svgWidth / 2) + '" y="' + (height + fontSize) + '" text-anchor="middle" font-family="monospace, monospace" font-size="' + fontSize + '" font-weight="bold" fill="#000000" letter-spacing="1.5">' + text + '</text>'
    : '';

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" width="100%" height="100%" style="display:block; max-height:100%;">' + rects.join('') + textElement + '</svg>';
}

/**
 * QR Code Generator (SVG Data URL)
 */
export function getQRCodeUrl(text: string, size = 150): string {
  const encodedText = encodeURIComponent(text);
  return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&format=svg&data=' + encodedText + '&margin=0';
}

export type LabelSizePreset = '30x20' | '35x22' | '40x30' | '50x30' | '60x40' | '75x50' | '100x70';

export interface LabelTemplateConfig {
  id: LabelSizePreset;
  name: string;
  widthMm: number;
  heightMm: number;
  columns: number; // 1, 2 or 3 labels per row
  gapMm: number;
  description: string;
  defaultBarHeight: number;
  fontSize: {
    brand: number;
    title: number;
    price: number;
    code: number;
  };
}

export const LABEL_SIZE_PRESETS: Record<LabelSizePreset, LabelTemplateConfig> = {
  '30x20': {
    id: '30x20',
    name: '30 x 20 mm (Mini / 3 tem 1 hàng)',
    widthMm: 30,
    heightMm: 20,
    columns: 3,
    gapMm: 2,
    description: 'Dành cho phụ kiện nhỏ, dây sạc, jack chuyển, chip, dán kệ siêu thị',
    defaultBarHeight: 22,
    fontSize: {
      brand: 6.5,
      title: 7,
      price: 8.5,
      code: 6.5,
    },
  },
  '35x22': {
    id: '35x22',
    name: '35 x 22 mm (Chuẩn Xprinter 3 tem / hàng)',
    widthMm: 35,
    heightMm: 22,
    columns: 3,
    gapMm: 2,
    description: 'Khổ phổ biến nhất trên thị trường máy in nhiệt (XP-350B, XP-420B, Gprinter)',
    defaultBarHeight: 26,
    fontSize: {
      brand: 7,
      title: 7.5,
      price: 9,
      code: 7,
    },
  },
  '40x30': {
    id: '40x30',
    name: '40 x 30 mm (Tem đơn 1 hoặc 2 tem / hàng)',
    widthMm: 40,
    heightMm: 30,
    columns: 2,
    gapMm: 2,
    description: 'Tem nhãn tiêu chuẩn cho thiết bị, chuột, bàn phím, tai nghe',
    defaultBarHeight: 34,
    fontSize: {
      brand: 7.5,
      title: 8.5,
      price: 10.5,
      code: 7.5,
    },
  },
  '50x30': {
    id: '50x30',
    name: '50 x 30 mm (Siêu Thị / Rõ chữ & Giá)',
    widthMm: 50,
    heightMm: 30,
    columns: 1,
    gapMm: 3,
    description: 'Tối ưu cho hiển thị tên dài, giá bán nổi bật và in song song cả Barcode 1D + QR Code 2D',
    defaultBarHeight: 38,
    fontSize: {
      brand: 8.5,
      title: 9.5,
      price: 12,
      code: 8.5,
    },
  },
  '60x40': {
    id: '60x40',
    name: '60 x 40 mm (Tem thùng / Kho vận)',
    widthMm: 60,
    heightMm: 40,
    columns: 1,
    gapMm: 3,
    description: 'Tem dán thùng carton nhỏ, linh kiện điện tử, quản lý kho vận',
    defaultBarHeight: 45,
    fontSize: {
      brand: 9,
      title: 11,
      price: 13.5,
      code: 9,
    },
  },
  '75x50': {
    id: '75x50',
    name: '75 x 50 mm (Tem giao nhận / Thùng carton)',
    widthMm: 75,
    heightMm: 50,
    columns: 1,
    gapMm: 3,
    description: 'Tem dán thùng carton, đóng gói pallet và kiện hàng xuất nhập kho',
    defaultBarHeight: 55,
    fontSize: {
      brand: 10,
      title: 12,
      price: 15,
      code: 10,
    },
  },
  '100x70': {
    id: '100x70',
    name: '100 x 70 mm (Tem thùng lớn / Pallet)',
    widthMm: 100,
    heightMm: 70,
    columns: 1,
    gapMm: 4,
    description: 'Dán thùng PC lớn, màn hình, pallet vận chuyển liên tỉnh',
    defaultBarHeight: 70,
    fontSize: {
      brand: 12,
      title: 14,
      price: 18,
      code: 12,
    },
  },
};
