import { UOMOption } from '../types';

/**
 * Standard unit suggestions for dropdowns
 */
export const COMMON_UNITS = [
  'Thùng',
  'Cuộn',
  'Mét',
  'Kg',
  'Gam',
  'Tấn',
  'Tạ',
  'Yến',
  'Bao',
  'Túi',
  'Lô',
  'Kiện',
  'Hộp',
  'Lốc',
  'Lon',
  'Chai',
  'Vỉ',
  'Viên',
  'Gói',
  'Cái',
  'Chiếc',
  'Bộ',
  'Cây',
  'Bó',
  'Mét vuông (m2)',
  'Mét khối (m3)',
  'Lít (L)',
  'Mililít (ml)',
  'PCS',
];

/**
 * Solve cascading multi-tier UOM conversions
 * e.g. 
 *  1 Thùng = 10 Cuộn
 *  1 Cuộn = 100 Mét (Base unit)
 *  1 Cuộn = 1.3 Kg
 *  1 Cuộn = 1300 Gam
 * 
 * Result:
 *  - Base unit (Mét): ratio = 1
 *  - Cuộn: ratio = 100
 *  - Thùng: ratio = 10 * 100 = 1000
 *  - Kg: 1 Cuộn = 1.3 Kg => 1.3 Kg = 100 Mét => 1 Kg = 100 / 1.3 = 76.923 Mét (ratio = 76.923)
 *  - Gam: 1 Cuộn = 1300 Gam => 1300 Gam = 100 Mét => 1 Gam = 100 / 1300 = 0.07692 Mét
 */
export function solveUomChain(
  uomList: UOMOption[],
  baseUnit: string,
  baseCostPrice: number = 0,
  baseSellingPrice: number = 0
): UOMOption[] {
  if (!uomList || uomList.length === 0) {
    return [
      {
        unit: baseUnit || 'Cái',
        ratioToBase: 1,
        costPrice: baseCostPrice,
        sellingPrice: baseSellingPrice,
        isBase: true,
        referenceUnit: baseUnit || 'Cái',
        conversionRate: 1,
        description: `1 ${baseUnit || 'Cái'} (ĐVT Cơ bản)`,
      },
    ];
  }

  // Graph adjacency map for ratio solving
  const normalizedBase = (baseUnit || 'Cái').trim();
  const ratios: Record<string, number> = {};
  ratios[normalizedBase] = 1;

  // Multi-pass iterative solver (up to 6 passes to resolve deeply nested dependencies)
  for (let pass = 0; pass < 6; pass++) {
    for (const item of uomList) {
      const uName = (item.unit || '').trim();
      const refName = (item.referenceUnit || normalizedBase).trim();
      const convRate = Number(item.conversionRate) || Number(item.ratioToBase) || 1;

      if (!uName) continue;

      // Case 1: ref is already solved, uName is 1 uName = convRate * refName
      if (ratios[refName] !== undefined && ratios[uName] === undefined) {
        ratios[uName] = convRate * ratios[refName];
      }
      // Case 2: uName is solved, solve refName: 1 refName = (1 / convRate) * uName
      else if (ratios[uName] !== undefined && ratios[refName] === undefined && convRate > 0) {
        ratios[refName] = ratios[uName] / convRate;
      }
      // Case 3: item has explicit ratioToBase
      else if (item.ratioToBase && ratios[uName] === undefined) {
        ratios[uName] = Number(item.ratioToBase);
      }
    }
  }

  // Ensure all units have a valid ratio (fallback to 1 if disconnected)
  return uomList.map((item) => {
    const uName = (item.unit || '').trim();
    const refName = (item.referenceUnit || normalizedBase).trim();
    const convRate = Number(item.conversionRate) || Number(item.ratioToBase) || 1;

    let finalRatio = ratios[uName] ?? item.ratioToBase ?? 1;
    if (finalRatio <= 0 || isNaN(finalRatio)) finalRatio = 1;

    const isBase = uName.toLowerCase() === normalizedBase.toLowerCase() || Math.abs(finalRatio - 1) < 0.00001;

    // Calculate proportional cost & selling prices
    const calcCost = Math.round(baseCostPrice * finalRatio);
    const calcSelling = Math.round(baseSellingPrice * finalRatio);

    // Auto generate descriptive string
    let autoDesc = item.description;
    if (!autoDesc || autoDesc.startsWith('1 ') || autoDesc.includes('ĐVT')) {
      if (refName && refName !== uName && convRate !== 1) {
        autoDesc = `1 ${uName} = ${convRate} ${refName}`;
        if (refName !== normalizedBase && !isBase) {
          autoDesc += ` (= ${Number(finalRatio.toFixed(3))} ${normalizedBase})`;
        }
      } else if (isBase) {
        autoDesc = `1 ${uName} (ĐVT Cơ bản chuẩn)`;
      } else {
        autoDesc = `1 ${uName} = ${Number(finalRatio.toFixed(3))} ${normalizedBase}`;
      }
    }

    return {
      ...item,
      unit: uName,
      referenceUnit: refName,
      conversionRate: convRate,
      ratioToBase: Number(finalRatio.toFixed(5)),
      costPrice: item.costPrice > 0 ? item.costPrice : calcCost,
      sellingPrice: item.sellingPrice > 0 ? item.sellingPrice : calcSelling,
      isBase,
      description: autoDesc,
    };
  });
}

/**
 * Convert quantity between two arbitrary units
 */
export function convertUomQuantity(
  qty: number,
  fromUnit: string,
  toUnit: string,
  uomList: UOMOption[],
  baseUnit: string
): number {
  if (fromUnit === toUnit) return qty;
  const fromOpt = uomList.find((u) => u.unit.toLowerCase() === fromUnit.toLowerCase());
  const toOpt = uomList.find((u) => u.unit.toLowerCase() === toUnit.toLowerCase());

  const fromRatio = fromOpt?.ratioToBase ?? 1;
  const toRatio = toOpt?.ratioToBase ?? 1;

  if (toRatio === 0) return qty;
  const baseQty = qty * fromRatio;
  return Number((baseQty / toRatio).toFixed(4));
}

/**
 * Get full equivalent breakdown string for a given quantity in a specific unit
 * e.g. "250 Mét = 2.5 Cuộn = 0.25 Thùng = 3.25 Kg = 3.250 Gam"
 */
export function getUomEquivalentsSummary(
  qty: number,
  currentUnit: string,
  uomList: UOMOption[],
  baseUnit: string
): string[] {
  if (!uomList || uomList.length <= 1) return [];

  const currentOpt = uomList.find((u) => u.unit.toLowerCase() === currentUnit.toLowerCase());
  const currentRatio = currentOpt?.ratioToBase ?? 1;
  const baseQty = qty * currentRatio;

  return uomList
    .filter((u) => u.unit.toLowerCase() !== currentUnit.toLowerCase())
    .map((u) => {
      const equivQty = u.ratioToBase > 0 ? baseQty / u.ratioToBase : 0;
      const formattedQty =
        equivQty % 1 === 0 ? equivQty.toLocaleString('vi-VN') : Number(equivQty.toFixed(3)).toLocaleString('vi-VN');
      return `${formattedQty} ${u.unit}`;
    });
}
