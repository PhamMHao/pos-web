/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn theo văn bản pháp lý / Hóa đơn điện tử
 */
export function numberToVietnameseWords(n: number): string {
  if (isNaN(n) || n === 0) return 'Không đồng';
  
  const abs = Math.floor(Math.abs(n));
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readGroup(group: number, showZeroHundred: boolean): string {
    const h = Math.floor(group / 100);
    const t = Math.floor((group % 100) / 10);
    const u = group % 10;
    let res = '';

    if (h > 0 || showZeroHundred) {
      res += digits[h] + ' trăm ';
    }

    if (t > 1) {
      res += digits[t] + ' mươi ';
      if (u === 1) res += 'mốt ';
      else if (u === 5) res += 'lăm ';
      else if (u > 0) res += digits[u] + ' ';
    } else if (t === 1) {
      res += 'mười ';
      if (u === 5) res += 'lăm ';
      else if (u > 0) res += digits[u] + ' ';
    } else {
      if ((h > 0 || showZeroHundred) && u > 0) {
        res += 'lẻ ' + digits[u] + ' ';
      } else if (u > 0) {
        res += digits[u] + ' ';
      }
    }

    return res.trim();
  }

  let str = abs.toString();
  const groups: number[] = [];
  while (str.length > 0) {
    const slice = str.slice(-3);
    groups.unshift(parseInt(slice, 10));
    str = str.slice(0, -3);
  }

  let result = '';
  const totalGroups = groups.length;

  for (let i = 0; i < totalGroups; i++) {
    const g = groups[i];
    const unitIndex = totalGroups - 1 - i;
    if (g > 0) {
      const showZero = i > 0 && g < 100;
      const groupText = readGroup(g, showZero);
      result += groupText + ' ' + (units[unitIndex] || '') + ' ';
    }
  }

  result = result.trim().replace(/\s+/g, ' ');
  if (!result) return 'Không đồng';

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn.';
  return result;
}
