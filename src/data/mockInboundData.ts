import { InboundEInvoice } from '../types';
import { numberToVietnameseWords } from '../utils/numberToWords';

export const SAMPLE_SUPPLIER_XML_FPT = `<?xml version="1.0" encoding="UTF-8"?>
<HDon xmlns="http://hoadondientu.gdt.gov.vn/2021/MLT">
  <DLHDon Id="HD_1C26TFP_0008492">
    <TTChung>
      <PBan>2.0.0</PBan>
      <THDon>Hóa đơn giá trị gia tăng</THDon>
      <KHMSHDon>1</KHMSHDon>
      <KHHDon>1C26TFP</KHHDon>
      <SHDon>0008492</SHDon>
      <NLap>2026-08-14</NLap>
      <DVTTe>VND</DVTTe>
      <TGia>1</TGia>
      <HTTToan>TM/CK</HTTToan>
      <MCCQT>0089A891B89FC72901928001</MCCQT>
      <MTDiep>GP-FPT-2026-8892</MTDiep>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>CÔNG TY TNHH PHÂN PHỐI SYNNEX FPT</Ten>
        <MST>0101778163</MST>
        <DChi>Tòa nhà FPT Cầu Giấy, Phố Duy Tân, Cầu Giấy, Hà Nội</DChi>
        <SDThoai>024 7300 6666</SDThoai>
        <DCTDTu>einvoice@synnexfpt.com.vn</DCTDTu>
        <STKNHang>19028991823901</STKNHang>
        <TNHang>Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)</TNHang>
      </NBan>
      <NMua>
        <Ten>CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC</Ten>
        <MST>0318999888</MST>
        <DChi>Bình Dương / TP. Hồ Chí Minh</DChi>
        <SDThoai>0985 862 609</SDThoai>
      </NMua>
      <DSHHDVu>
        <HHDVu>
          <STT>1</STT>
          <MHHDVu>RAM-DDR4-16G</MHHDVu>
          <THHDVu>RAM Kingston Fury Beast 16GB DDR4 3200MHz</THHDVu>
          <DVTinh>Cái</DVTinh>
          <SLuong>20</SLuong>
          <DGia>780000</DGia>
          <ThTien>15600000</ThTien>
          <TSuat>8%</TSuat>
        </HHDVu>
        <HHDVu>
          <STT>2</STT>
          <MHHDVu>SSD-NVME-500G</MHHDVu>
          <THHDVu>Ổ cứng SSD Kingston NV2 500GB M.2 PCIe Gen 4x4 NVMe</THHDVu>
          <DVTinh>Cái</DVTinh>
          <SLuong>15</SLuong>
          <DGia>890000</DGia>
          <ThTien>13350000</ThTien>
          <TSuat>8%</TSuat>
        </HHDVu>
        <HHDVu>
          <STT>3</STT>
          <MHHDVu>MOUSE-LOGI-G102</MHHDVu>
          <THHDVu>Chuột Gaming Logitech G102 Lightsync RGB Gen 2</THHDVu>
          <DVTinh>Cái</DVTinh>
          <SLuong>30</SLuong>
          <DGia>310000</DGia>
          <ThTien>9300000</ThTien>
          <TSuat>8%</TSuat>
        </HHDVu>
      </DSHHDVu>
      <TToan>
        <TgTCThue>38250000</TgTCThue>
        <TgTThue>3060000</TgTThue>
        <TgTTTBSo>41310000</TgTTTBSo>
        <TgTTTBChu>Bốn mươi mốt triệu ba trăm mười nghìn đồng chẵn</TgTTTBChu>
      </TToan>
    </NDHDon>
    <DSCKS>
      <NBan>
        <SignatureValue>MIIE4wYJKoZIhvcNAQcCoIIE1DCCBNACAQEx...</SignatureValue>
      </NBan>
    </DSCKS>
  </DLHDon>
</HDon>`;

export const SAMPLE_SUPPLIER_XML_DGW = `<?xml version="1.0" encoding="UTF-8"?>
<HDon xmlns="http://hoadondientu.gdt.gov.vn/2021/MLT">
  <DLHDon Id="HD_1C26TDG_0019482">
    <TTChung>
      <PBan>2.0.0</PBan>
      <THDon>Hóa đơn giá trị gia tăng</THDon>
      <KHMSHDon>1</KHMSHDon>
      <KHHDon>1C26TDG</KHHDon>
      <SHDon>0019482</SHDon>
      <NLap>2026-08-15</NLap>
      <DVTTe>VND</DVTTe>
      <TGia>1</TGia>
      <HTTToan>CK</HTTToan>
      <MCCQT>0091B849C901049281729381</MCCQT>
      <MTDiep>DGW-INV-2026-9912</MTDiep>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>CÔNG TY CỔ PHẦN THẾ GIỚI SỐ (DIGIWORLD CORP)</Ten>
        <MST>0302861742</MST>
        <DChi>195 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh</DChi>
        <SDThoai>028 3929 0059</SDThoai>
        <DCTDTu>einvoice@dgw.com.vn</DCTDTu>
        <STKNHang>0071000849201</STKNHang>
        <TNHang>Ngân hàng TMCP Ngoại Thương Việt Nam (VCB) - CN TP.HCM</TNHang>
      </NBan>
      <NMua>
        <Ten>CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC</Ten>
        <MST>0318999888</MST>
        <DChi>Bình Dương / TP. Hồ Chí Minh</DChi>
      </NMua>
      <DSHHDVu>
        <HHDVu>
          <STT>1</STT>
          <MHHDVu>KB-MECH-DAREU</MHHDVu>
          <THHDVu>Bàn phím cơ DareU EK87 Tenkeyless (Brown Switch)</THHDVu>
          <DVTinh>Cái</DVTinh>
          <SLuong>10</SLuong>
          <DGia>420000</DGia>
          <ThTien>4200000</ThTien>
          <TSuat>8%</TSuat>
        </HHDVu>
        <HHDVu>
          <STT>2</STT>
          <MHHDVu>HEADSET-HYPERX</MHHDVu>
          <THHDVu>Tai nghe Gaming HyperX Cloud Stinger Core 7.1</THHDVu>
          <DVTinh>Cái</DVTinh>
          <SLuong>8</SLuong>
          <DGia>650000</DGia>
          <ThTien>5200000</ThTien>
          <TSuat>8%</TSuat>
        </HHDVu>
      </DSHHDVu>
      <TToan>
        <TgTCThue>9400000</TgTCThue>
        <TgTThue>752000</TgTThue>
        <TgTTTBSo>10152000</TgTTTBSo>
        <TgTTTBChu>Mười triệu một trăm năm mươi hai nghìn đồng chẵn</TgTTTBChu>
      </TToan>
    </NDHDon>
  </DLHDon>
</HDon>`;

export const INITIAL_INBOUND_INVOICES: InboundEInvoice[] = [
  {
    id: 'inb-inv-001',
    source: 'cqt_portal',
    sourceDetail: 'Đồng bộ tự động từ Cổng Tổng Cục Thuế (hoadondientu.gdt.gov.vn)',
    invoiceCode: '1C26TFP-0008492',
    invoiceNumber: '0008492',
    invoiceSymbol: '1C26TFP',
    invoiceTemplate: '1/001',
    issueDate: '2026-08-14',
    receivedDate: '2026-08-16T08:15:00Z',
    cqtCode: '0089A891B89FC72901928001',
    lookupCode: 'GP-FPT-2026-8892',
    lookupUrl: 'https://hoadondientu.gdt.gov.vn',
    seller: {
      name: 'CÔNG TY TNHH PHÂN PHỐI SYNNEX FPT',
      taxCode: '0101778163',
      address: 'Tòa nhà FPT Cầu Giấy, Phố Duy Tân, Cầu Giấy, Hà Nội',
      phone: '024 7300 6666',
      email: 'einvoice@synnexfpt.com.vn',
      bankAccount: '19028991823901',
      bankName: 'Techcombank',
    },
    buyer: {
      name: 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC',
      taxCode: '0318999888',
      address: 'Bình Dương / TP. Hồ Chí Minh',
    },
    items: [
      {
        id: 'inb-it-1',
        lineNumber: 1,
        productName: 'RAM Kingston Fury Beast 16GB DDR4 3200MHz',
        skuOrCode: 'RAM-DDR4-16G',
        unit: 'Cái',
        quantity: 20,
        unitPrice: 780000,
        subtotal: 15600000,
        taxRate: 8,
        taxAmount: 1248000,
        total: 16848000,
        status: 'unmatched',
      },
      {
        id: 'inb-it-2',
        lineNumber: 2,
        productName: 'Ổ cứng SSD Kingston NV2 500GB M.2 PCIe Gen 4x4 NVMe',
        skuOrCode: 'SSD-NVME-500G',
        unit: 'Cái',
        quantity: 15,
        unitPrice: 890000,
        subtotal: 13350000,
        taxRate: 8,
        taxAmount: 1068000,
        total: 14418000,
        status: 'unmatched',
      },
      {
        id: 'inb-it-3',
        lineNumber: 3,
        productName: 'Chuột Gaming Logitech G102 Lightsync RGB Gen 2',
        skuOrCode: 'MOUSE-LOGI-G102',
        unit: 'Cái',
        quantity: 30,
        unitPrice: 310000,
        subtotal: 9300000,
        taxRate: 8,
        taxAmount: 744000,
        total: 10044000,
        status: 'unmatched',
      }
    ],
    subtotal: 38250000,
    taxRate: 8,
    taxAmount: 3060000,
    totalAmount: 41310000,
    amountInWords: 'Bốn mươi mốt triệu ba trăm mười nghìn đồng chẵn',
    status: 'pending_review',
    rawXmlContent: SAMPLE_SUPPLIER_XML_FPT,
  },
  {
    id: 'inb-inv-002',
    source: 'gmail_sync',
    sourceDetail: 'Tự động bóc tách từ Email: einvoice@dgw.com.vn gửi đến hrmgpsoft@gmail.com',
    invoiceCode: '1C26TDG-0019482',
    invoiceNumber: '0019482',
    invoiceSymbol: '1C26TDG',
    invoiceTemplate: '1/001',
    issueDate: '2026-08-15',
    receivedDate: '2026-08-16T09:30:00Z',
    cqtCode: '0091B849C901049281729381',
    lookupCode: 'DGW-INV-2026-9912',
    lookupUrl: 'https://hoadondientu.gdt.gov.vn',
    seller: {
      name: 'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ (DIGIWORLD CORP)',
      taxCode: '0302861742',
      address: '195 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh',
      phone: '028 3929 0059',
      email: 'einvoice@dgw.com.vn',
      bankAccount: '0071000849201',
      bankName: 'Vietcombank TP.HCM',
    },
    buyer: {
      name: 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC',
      taxCode: '0318999888',
      address: 'Bình Dương / TP. Hồ Chí Minh',
    },
    items: [
      {
        id: 'inb-it-4',
        lineNumber: 1,
        productName: 'Bàn phím cơ DareU EK87 Tenkeyless (Brown Switch)',
        skuOrCode: 'KB-MECH-DAREU',
        unit: 'Cái',
        quantity: 10,
        unitPrice: 420000,
        subtotal: 4200000,
        taxRate: 8,
        taxAmount: 336000,
        total: 4536000,
        status: 'unmatched',
      },
      {
        id: 'inb-it-5',
        lineNumber: 2,
        productName: 'Tai nghe Gaming HyperX Cloud Stinger Core 7.1',
        skuOrCode: 'HEADSET-HYPERX',
        unit: 'Cái',
        quantity: 8,
        unitPrice: 650000,
        subtotal: 5200000,
        taxRate: 8,
        taxAmount: 416000,
        total: 5616000,
        status: 'unmatched',
      }
    ],
    subtotal: 9400000,
    taxRate: 8,
    taxAmount: 752000,
    totalAmount: 10152000,
    amountInWords: 'Mười triệu một trăm năm mươi hai nghìn đồng chẵn',
    status: 'pending_review',
    rawXmlContent: SAMPLE_SUPPLIER_XML_DGW,
  }
];

export const SIMULATED_CQT_NEW_INVOICES: InboundEInvoice[] = [
  {
    id: 'inb-inv-003',
    source: 'cqt_portal',
    sourceDetail: 'Đồng bộ từ CQT: Hóa đơn mới nhất của Công ty Viễn Sơn vừa cấp mã',
    invoiceCode: '1C26TVS-0004129',
    invoiceNumber: '0004129',
    invoiceSymbol: '1C26TVS',
    invoiceTemplate: '1/001',
    issueDate: '2026-08-16',
    receivedDate: '2026-08-16T11:00:00Z',
    cqtCode: '0092C781A901827461928301',
    lookupCode: 'VS-INV-2026-1029',
    lookupUrl: 'https://hoadondientu.gdt.gov.vn',
    seller: {
      name: 'CÔNG TY TNHH TIN HỌC VIỄN SƠN',
      taxCode: '0301389824',
      address: '150 Bùi Thị Xuân, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
      phone: '028 3832 6085',
      email: 'invoice@microstar.com.vn',
      bankAccount: '0071001928301',
      bankName: 'Vietcombank',
    },
    buyer: {
      name: 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC',
      taxCode: '0318999888',
      address: 'Bình Dương / TP. Hồ Chí Minh',
    },
    items: [
      {
        id: 'inb-it-6',
        lineNumber: 1,
        productName: 'Màn hình máy tính ASUS TUF Gaming VG249Q3A 24 inch 180Hz',
        skuOrCode: 'MON-ASUS-24',
        unit: 'Cái',
        quantity: 5,
        unitPrice: 2650000,
        subtotal: 13250000,
        taxRate: 8,
        taxAmount: 1060000,
        total: 14310000,
        status: 'unmatched',
      },
      {
        id: 'inb-it-7',
        lineNumber: 2,
        productName: 'Nguồn máy tính Antec Atom V550 550W',
        skuOrCode: 'PSU-ANTEC-550W',
        unit: 'Cái',
        quantity: 12,
        unitPrice: 580000,
        subtotal: 6960000,
        taxRate: 8,
        taxAmount: 556800,
        total: 7516800,
        status: 'unmatched',
      }
    ],
    subtotal: 20210000,
    taxRate: 8,
    taxAmount: 1616800,
    totalAmount: 21826800,
    amountInWords: 'Hai mươi mốt triệu tám trăm hai mươi sáu nghìn tám trăm đồng',
    status: 'pending_review',
  }
];
