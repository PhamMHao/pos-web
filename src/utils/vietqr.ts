export interface VietQRParams {
  bankCode: string; // e.g. 'MB', 'VCB', 'TCB', 'ACB', 'VPB'
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
}

export const POPULAR_VIETNAMESE_BANKS = [
  { code: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)', bin: '970422' },
  { code: 'VCB', name: 'Vietcombank (Ngoại thương VN)', bin: '970436' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương)', bin: '970407' },
  { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', bin: '970432' },
  { code: 'BIDV', name: 'BIDV (Đầu tư & Phát triển VN)', bin: '970418' },
  { code: 'CTG', name: 'VietinBank (Công Thương VN)', bin: '970415' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)', bin: '970423' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)', bin: '970403' },
  { code: 'HDB', name: 'HDBank (Phát triển TP.HCM)', bin: '970437' },
];

export function generateVietQRUrl(params: VietQRParams): string {
  const { bankCode, accountNo, accountName, amount, description } = params;
  const safeBank = bankCode || 'MB';
  const safeAccount = accountNo || '0988888888';
  const encodedAccountName = encodeURIComponent(accountName || 'STORE OWNER');
  const encodedDesc = encodeURIComponent(description || 'Thanh toan don hang');
  const safeAmount = Math.max(0, Math.round(amount || 0));

  return `https://img.vietqr.io/image/${safeBank}-${safeAccount}-compact2.png?amount=${safeAmount}&addInfo=${encodedDesc}&accountName=${encodedAccountName}`;
}

export function formatVND(amount: number): string {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
}
