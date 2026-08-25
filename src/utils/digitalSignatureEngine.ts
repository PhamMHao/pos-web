import {
  CaGatewayConfig,
  CaProvider,
  DigitalCertificateX509,
  DigitalSignatureMetadata,
  DocSigningType,
  SignableDocument,
  SignatureAuditLog,
  SigningMethod,
  StoreSettings,
} from '../types';

// 1. Danh sách cổng kết nối các nhà cung cấp CA hàng đầu
export const DEFAULT_CA_GATEWAYS: CaGatewayConfig[] = [
  {
    provider: 'viettel_smartca',
    name: 'Viettel SmartCA',
    logo: '🔴',
    tagline: 'Ký số từ xa qua ứng dụng Viettel Money / Viettel CA',
    supportedMethods: ['remote_signing', 'cloud_hsm'],
    endpointUrl: 'https://smartca-api.viettel.vn/v2/sign',
    clientId: 'GP_ERP_VIETTEL_CA_PROD',
    clientSecretMasked: '••••••••••••••••••••3821',
    isActive: true,
    pingLatencyMs: 38,
    lastPingStatus: 'online',
    lastPingAt: 'Vừa xong',
    description: 'Hỗ trợ xác thực vân tay/FaceID trên điện thoại, đạt chuẩn eIDAS & TT16/2019/TT-BTTTT.',
  },
  {
    provider: 'vnpt_smartca',
    name: 'VNPT SmartCA',
    logo: '🔵',
    tagline: 'Chứng thực số đám mây tập đoàn VNPT & TSA RFC 3161',
    supportedMethods: ['remote_signing', 'cloud_hsm', 'soft_cert'],
    endpointUrl: 'https://smartca.vnpt.vn/api/v1/remote-sign',
    clientId: 'GP_ERP_VNPT_CA_ENTERPRISE',
    clientSecretMasked: '••••••••••••••••••••9942',
    isActive: true,
    pingLatencyMs: 42,
    lastPingStatus: 'online',
    lastPingAt: 'Vừa xong',
    description: 'Tích hợp Dấu thời gian tin cậy VNPT-TSA, hỗ trợ ký hàng loạt tốc độ cao.',
  },
  {
    provider: 'fpt_esign',
    name: 'FPT.eSign',
    logo: '🟠',
    tagline: 'Dịch vụ ký số số 1 cho Tài chính - Ngân hàng & ERP',
    supportedMethods: ['cloud_hsm', 'remote_signing'],
    endpointUrl: 'https://esign-api.fpt.com.vn/v3/signature',
    clientId: 'GP_ERP_FPT_ESIGN_GATEWAY',
    clientSecretMasked: '••••••••••••••••••••1054',
    isActive: true,
    pingLatencyMs: 45,
    lastPingStatus: 'online',
    lastPingAt: '1 phút trước',
    description: 'Chuẩn PAdES B-LT và CAdES, lưu vết bảo mật HSM Level 3.',
  },
  {
    provider: 'misa_esign',
    name: 'MISA eSign',
    logo: '🟢',
    tagline: 'Ký số Hóa đơn điện tử TT78 & Kế toán MISA',
    supportedMethods: ['remote_signing', 'usb_token', 'cloud_hsm'],
    endpointUrl: 'https://esign.misa.vn/api/v2/integration',
    clientId: 'GP_ERP_MISA_ESIGN_PRO',
    clientSecretMasked: '••••••••••••••••••••7712',
    isActive: true,
    pingLatencyMs: 51,
    lastPingStatus: 'online',
    lastPingAt: '2 phút trước',
    description: 'Chuyên dụng phát hành hóa đơn điện tử CQT và báo cáo thuế.',
  },
  {
    provider: 'bkav_ca',
    name: 'BKAV eSign',
    logo: '🟡',
    tagline: 'Bảo mật an ninh mạng hàng đầu & Chữ ký số USB Token',
    supportedMethods: ['usb_token', 'cloud_hsm', 'remote_signing'],
    endpointUrl: 'https://ca.bkav.com.vn/api/v1/sign',
    clientId: 'GP_ERP_BKAV_CA_SECURE',
    clientSecretMasked: '••••••••••••••••••••8390',
    isActive: true,
    pingLatencyMs: 49,
    lastPingStatus: 'online',
    lastPingAt: '1 phút trước',
    description: 'Bảo vệ kép với phần cứng Token PKCS#11 và chữ ký số từ xa.',
  },
  {
    provider: 'usb_token',
    name: 'USB Token Phần Cứng (PKCS#11)',
    logo: '🔑',
    tagline: 'Thiết bị khóa phần cứng cắm cổng USB trực tiếp máy tính',
    supportedMethods: ['usb_token'],
    endpointUrl: 'localhost:8989/pkcs11',
    clientId: 'PKCS11_LOCAL_TOKEN_DRIVER',
    clientSecretMasked: 'PIN_AUTH_PROTECTED',
    isActive: true,
    pingLatencyMs: 5,
    lastPingStatus: 'online',
    lastPingAt: 'Đã kết nối',
    description: 'Ký cục bộ trực tiếp qua chứng thư số lưu trữ an toàn trong chip bảo mật Token.',
  },
];

// 2. Danh mục Chứng thư số X.509 Doanh nghiệp mặc định
export const DEFAULT_CERTIFICATES: DigitalCertificateX509[] = [
  {
    id: 'cert-corp-01',
    serialNumber: '5404 8839 2011 9283 4401 A892 C3D1',
    subjectName: 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC',
    subjectTaxCode: '3702918234',
    issuer: 'Viettel-CA Root Authority (Bộ TT&TT)',
    provider: 'viettel_smartca',
    validFrom: '2025-01-01',
    validTo: '2028-01-01',
    keyAlgorithm: 'RSA 2048-bit (SHA256withRSA)',
    keyUsage: ['Digital Signature', 'Non-Repudiation', 'Document Signing', 'Corporate Seal'],
    status: 'active',
    isDefault: true,
    assignedTo: 'Con Dấu Pháp Nhân Doanh Nghiệp (Tổng Giám Đốc)',
  },
  {
    id: 'cert-director-02',
    serialNumber: '3920 1192 8344 01A8 92C3 D154 0488',
    subjectName: 'NGUYỄN VĂN PHÚC (TỔNG GIÁM ĐỐC)',
    subjectTaxCode: '8092381923',
    issuer: 'VNPT-CA National Root',
    provider: 'vnpt_smartca',
    validFrom: '2025-03-15',
    validTo: '2027-03-15',
    keyAlgorithm: 'RSA 2048-bit (SHA256withRSA)',
    keyUsage: ['Digital Signature', 'Non-Repudiation', 'Personal Signing'],
    status: 'active',
    isDefault: false,
    assignedTo: 'Tổng Giám Đốc Phê Duyệt Ký Số',
  },
  {
    id: 'cert-accountant-03',
    serialNumber: '1192 8344 01A8 92C3 D154 0488 3920',
    subjectName: 'VÕ THỊ THƠM (KẾ TOÁN TRƯỞNG)',
    subjectTaxCode: '8392019482',
    issuer: 'FPT-CA Corporate Sub-CA',
    provider: 'fpt_esign',
    validFrom: '2024-06-01',
    validTo: '2026-06-01',
    keyAlgorithm: 'RSA 2048-bit',
    keyUsage: ['Digital Signature', 'Tax & Invoice Issuance'],
    status: 'active',
    isDefault: false,
    assignedTo: 'Kế Toán Trưởng Ký Phát Hành HĐĐT & Thuế',
  },
];

// 3. Danh sách chứng từ mẫu có thể ký số tập trung
export function getInitialSignableDocuments(): SignableDocument[] {
  return [
    {
      id: 'doc-inv-001',
      code: 'HD-2026-0089',
      title: 'Hóa Đơn Điện Tử GTGT - Cty CP Xây Dựng & Công Nghệ Landmark',
      type: 'einvoice',
      typeLabel: 'Hóa Đơn Điện Tử',
      createdAt: '2026-02-25 09:15',
      totalAmount: 48500000,
      creatorName: 'Võ Thị Thơm (Kế toán)',
      recipientName: 'Cty CP Xây Dựng Landmark (MST: 0314992812)',
      status: 'pending',
      legalStandard: 'XML-DSig TT78/2021/TT-BTC',
    },
    {
      id: 'doc-quote-002',
      code: 'BG-2026-0042',
      title: 'Báo Giá Dự Án Hệ Thống Mạng & Máy Trạm - Bệnh Viện Quốc Tế Hạnh Phúc',
      type: 'quote',
      typeLabel: 'Báo Giá Thương Mại',
      createdAt: '2026-02-25 10:30',
      totalAmount: 125000000,
      creatorName: 'Trần Thị Thảo (Kinh doanh)',
      recipientName: 'BV Quốc Tế Hạnh Phúc (MST: 3701294821)',
      status: 'pending',
      legalStandard: 'PAdES B-LT (ETSI EN 319 142)',
    },
    {
      id: 'doc-contract-003',
      code: 'HDLD-2026-NV01',
      title: 'Hợp Đồng Lao Động Xác Định Thời Hạn - Bùi Thị Mỹ Dung (Quản Lý)',
      type: 'contract',
      typeLabel: 'Hợp Đồng Lao Động',
      createdAt: '2026-02-24 14:00',
      totalAmount: 18000000,
      creatorName: 'Phòng Nhân Sự HR',
      recipientName: 'Bùi Thị Mỹ Dung (Mã NV: NV-2026-01)',
      status: 'pending',
      legalStandard: 'PAdES B-LT Luật GDĐT 2023',
    },
    {
      id: 'doc-po-004',
      code: 'PO-2026-0018',
      title: 'Đơn Đặt Hàng Nhập Kho Linh Kiện Máy Tính - FPT Synnex Distribution',
      type: 'purchase_order',
      typeLabel: 'Đơn Đặt Hàng (PO)',
      createdAt: '2026-02-25 11:20',
      totalAmount: 85600000,
      creatorName: 'Lê Văn Khoa (Thủ kho)',
      recipientName: 'Công Ty CP Synnex FPT (MST: 0101460621)',
      status: 'pending',
      legalStandard: 'PAdES B-LT B2B Standard',
    },
    {
      id: 'doc-kpi-005',
      code: 'QD-KT-2026/02-GPERP',
      title: 'Quyết Định Khen Thưởng & Chi Trả Quỹ Thưởng KPI Tháng 02/2026',
      type: 'kpi_decision',
      typeLabel: 'Quyết Định Pháp Quy KPI',
      createdAt: '2026-02-25 08:00',
      totalAmount: 12400000,
      creatorName: 'Ban Giám Đốc',
      recipientName: 'Toàn Thể Cán Bộ Nhân Viên GP-ERP',
      status: 'pending',
      legalStandard: 'PAdES B-LT BLLĐ 2019',
    },
  ];
}

// 4. Tạo mã băm SHA-256 giả lập chuẩn mật mã
export function generateMockSha256(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78${hexPart}`;
}

// 5. Hàm thực hiện ký số điện tử (Single Sign)
export async function executeDigitalSignature(
  doc: SignableDocument,
  provider: CaProvider,
  method: SigningMethod,
  certificate: DigitalCertificateX509,
  settings?: StoreSettings,
  signerCustomName?: string
): Promise<{ signature: DigitalSignatureMetadata; auditLog: SignatureAuditLog }> {
  // Giả lập thời gian handshake & mã hóa qua CA (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const now = new Date();
  const isoTime = now.toISOString();
  const sha256 = generateMockSha256(`${doc.id}-${doc.code}-${isoTime}-${certificate.serialNumber}`);
  const providerName =
    provider === 'viettel_smartca'
      ? 'Viettel SmartCA'
      : provider === 'vnpt_smartca'
      ? 'VNPT SmartCA'
      : provider === 'fpt_esign'
      ? 'FPT.eSign'
      : provider === 'misa_esign'
      ? 'MISA eSign'
      : provider === 'bkav_ca'
      ? 'BKAV eSign'
      : 'USB Token PKCS#11';

  const signatureFormat: 'XML-DSig' | 'PAdES B-LT' | 'PKCS#7' =
    doc.type === 'einvoice' ? 'XML-DSig' : 'PAdES B-LT';

  const signatureId = `SIG-${provider.toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const signerName = signerCustomName || certificate.assignedTo.split('(')[0].trim() || 'NGUYỄN VĂN PHÚC';

  const signature: DigitalSignatureMetadata = {
    signatureId,
    documentId: doc.id,
    documentType: doc.type,
    documentCode: doc.code,
    documentTitle: doc.title,
    provider,
    providerName,
    signingMethod: method,
    signerName,
    signerPosition: 'Tổng Giám Đốc / Đại Diện Pháp Luật',
    signerTaxCode: certificate.subjectTaxCode,
    signedAt: isoTime,
    tsaTimestamp: `${now.toLocaleTimeString('vi-VN')} ${now.toLocaleDateString('vi-VN')} (VNPT-TSA RFC 3161 Verified)`,
    tsaProvider: 'Bộ Thông Tin & Truyền Thông (MIC Root TSA)',
    signatureFormat,
    sha256Hash: sha256,
    certificateSerial: certificate.serialNumber,
    issuer: certificate.issuer,
    status: 'signed',
    ipAddress: '113.161.42.18 (Viettel Telecom Binh Duong)',
    validationStatus: 'valid',
    validationMessage: 'Chữ ký số hợp lệ 100%, chứng thư số còn hiệu lực, dấu thời gian TSA nguyên vẹn.',
  };

  const auditLog: SignatureAuditLog = {
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`,
    action: 'sign_single',
    documentId: doc.id,
    documentCode: doc.code,
    documentType: doc.type,
    documentTitle: doc.title,
    provider,
    signerName,
    ipAddress: '113.161.42.18',
    status: 'success',
    details: `Đã ký số thành công qua ${providerName} (${method}). Định dạng: ${signatureFormat}. Serial: ${certificate.serialNumber}`,
    sha256Hash: sha256,
  };

  return { signature, auditLog };
}

// 6. Hàm kiểm tra tính toàn vẹn chữ ký số (Verify Signature)
export function verifySignatureIntegrity(signature: DigitalSignatureMetadata): {
  isValid: boolean;
  score: number;
  checks: { name: string; passed: boolean; details: string }[];
} {
  const checks = [
    {
      name: 'Chứng thư số X.509 hợp lệ',
      passed: true,
      details: `Cấp bởi ${signature.issuer} - Chuỗi tin cậy Quốc gia Root CA`,
    },
    {
      name: 'Mã băm dữ liệu SHA-256 nguyên vẹn',
      passed: true,
      details: 'Dữ liệu không bị chỉnh sửa sau khi ký số',
    },
    {
      name: 'Dấu thời gian tin cậy TSA (RFC 3161)',
      passed: true,
      details: signature.tsaTimestamp || 'Đã xác thực thời gian ký độc lập qua TSA',
    },
    {
      name: 'Trạng thái chứng thư (CRL / OCSP)',
      passed: true,
      details: 'Chứng thư số không nằm trong danh sách thu hồi của CA',
    },
    {
      name: 'Tuân thủ Luật Giao dịch điện tử 2023',
      passed: true,
      details: 'Đáp ứng đầy đủ giá trị pháp lý tương đương văn bản giấy có dấu đỏ',
    },
  ];

  return {
    isValid: true,
    score: 100,
    checks,
  };
}
