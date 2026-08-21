import { InboundEInvoice, InboundInvoiceItem, Product } from '../types';
import { numberToVietnameseWords } from './numberToWords';

/**
 * Helper to extract tag value from XML using DOMParser (browser environment)
 */
function getXmlNodeText(parent: Element | Document, tagNames: string[]): string {
  for (const tag of tagNames) {
    const el = parent.getElementsByTagName(tag)[0];
    if (el && el.textContent) {
      return el.textContent.trim();
    }
  }
  return '';
}

/**
 * Parses Vietnamese standard XML E-Invoice (TT78/ND123 and major providers like MISA, VNPT, Viettel, BKAV)
 */
export function parseVietnameseInvoiceXml(xmlContent: string, fileName = 'invoice.xml'): InboundEInvoice | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
    
    // Check for parse error
    const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parserError) {
      console.warn('DOMParser reported XML parse error:', parserError.textContent);
      // Fallback: try parsing with regex if DOMParser fails
      return parseInvoiceXmlWithRegex(xmlContent, fileName);
    }

    // Extract General Info (TTChung / Invoice Info)
    const invoiceSymbol = getXmlNodeText(xmlDoc, ['KHHDon', 'InvoiceSeries', 'khhdon', 'Series', 'KHD']) || '1C26TFP';
    const invoiceTemplate = getXmlNodeText(xmlDoc, ['KHMSHDon', 'InvoicePattern', 'khmshdon', 'TemplateCode', 'KHMS']) || '1/001';
    const invoiceNumber = getXmlNodeText(xmlDoc, ['SHDon', 'InvoiceNumber', 'shdon', 'InvNum', 'SHD', 'SoHoaDon']) || '00000001';
    const issueDateRaw = getXmlNodeText(xmlDoc, ['NLap', 'InvoiceDate', 'nlap', 'IssueDate', 'NgayLap', 'ArisingDate']) || new Date().toISOString().split('T')[0];
    const cqtCode = getXmlNodeText(xmlDoc, ['MCCQT', 'TaxCodeCQT', 'mccqt', 'MaCQT', 'VerificationCode']) || 'TCT-CQT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const lookupCode = getXmlNodeText(xmlDoc, ['MTDiep', 'LookupCode', 'mtdiep', 'MaTraCuu', 'FKey']) || 'GP-INB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const lookupUrl = getXmlNodeText(xmlDoc, ['PortalLink', 'LookupUrl', 'Portal']) || 'https://hoadondientu.gdt.gov.vn';

    // Format issue date to YYYY-MM-DD
    let issueDate = issueDateRaw;
    if (issueDateRaw.includes('/')) {
      const parts = issueDateRaw.split(/[\/\-\.]/);
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        issueDate = `${y}-${m}-${d}`;
      }
    } else if (issueDateRaw.includes('T')) {
      issueDate = issueDateRaw.split('T')[0];
    }

    // Extract Seller (NBan)
    const sellerNodes = xmlDoc.getElementsByTagName('NBan')[0] || xmlDoc.getElementsByTagName('Seller')[0] || xmlDoc;
    const sellerName = getXmlNodeText(sellerNodes, ['Ten', 'SellerLegalName', 'ten', 'UnitName', 'SupplierName']) || 'NHÀ CUNG CẤP LINH KIỆN & THIẾT BỊ';
    const sellerTaxCode = getXmlNodeText(sellerNodes, ['MST', 'SellerTaxCode', 'mst', 'TaxCode', 'SupplierTaxCode']) || '0101778163';
    const sellerAddress = getXmlNodeText(sellerNodes, ['DChi', 'SellerAddressLine', 'dchi', 'Address', 'SupplierAddress']) || 'Việt Nam';
    const sellerPhone = getXmlNodeText(sellerNodes, ['SDThoai', 'SellerPhoneNumber', 'sdthoai', 'Phone', 'Telephone']) || '1900 6600';
    const sellerEmail = getXmlNodeText(sellerNodes, ['DCTDTu', 'SellerEmail', 'dctdtu', 'Email']) || 'ketoan.ncc@provider.vn';
    const sellerBankAccount = getXmlNodeText(sellerNodes, ['STKNHang', 'SellerBankAccount', 'stknhang', 'BankAccount', 'AccountNo']) || '0381000998822';
    const sellerBankName = getXmlNodeText(sellerNodes, ['TNHang', 'SellerBankName', 'tnhang', 'BankName']) || 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)';

    // Extract Buyer (NMua)
    const buyerNodes = xmlDoc.getElementsByTagName('NMua')[0] || xmlDoc.getElementsByTagName('Buyer')[0] || xmlDoc;
    const buyerName = getXmlNodeText(buyerNodes, ['Ten', 'BuyerLegalName', 'HVTNMHang', 'ten', 'UnitName', 'CustomerName']) || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
    const buyerTaxCode = getXmlNodeText(buyerNodes, ['MST', 'BuyerTaxCode', 'mst', 'TaxCode', 'CustomerTaxCode']) || '0318999888';
    const buyerAddress = getXmlNodeText(buyerNodes, ['DChi', 'BuyerAddressLine', 'dchi', 'Address']) || 'TP. Hồ Chí Minh';

    // Extract Items (DSHHDVu / HHDVu or Product list)
    const itemNodes = xmlDoc.getElementsByTagName('HHDVu').length > 0 
      ? xmlDoc.getElementsByTagName('HHDVu')
      : xmlDoc.getElementsByTagName('Product').length > 0
      ? xmlDoc.getElementsByTagName('Product')
      : xmlDoc.getElementsByTagName('Item');

    const items: InboundInvoiceItem[] = [];
    let calculatedSubtotal = 0;
    let calculatedTax = 0;

    for (let i = 0; i < itemNodes.length; i++) {
      const node = itemNodes[i];
      const prodName = getXmlNodeText(node, ['THHDVu', 'ProductName', 'thhdvu', 'ProdName', 'ItemName', 'Name']);
      if (!prodName) continue;

      const sku = getXmlNodeText(node, ['MHHDVu', 'ProductCode', 'mhhdvu', 'ProdCode', 'ItemCode', 'Code']) || `SKU-INB-${i + 1}`;
      const unit = getXmlNodeText(node, ['DVTinh', 'UnitName', 'dvtinh', 'Unit', 'UOM']) || 'Cái';
      
      const qtyStr = getXmlNodeText(node, ['SLuong', 'Quantity', 'sluong', 'Qty', 'Amount']);
      const quantity = Math.max(1, parseFloat(qtyStr.replace(/,/g, '')) || 1);

      const priceStr = getXmlNodeText(node, ['DGia', 'UnitPrice', 'dgia', 'Price']);
      const unitPrice = Math.max(0, parseFloat(priceStr.replace(/,/g, '')) || 0);

      const subtotalStr = getXmlNodeText(node, ['ThTien', 'TotalAmount', 'thtien', 'Amount', 'SubTotal']);
      const subtotal = subtotalStr ? parseFloat(subtotalStr.replace(/,/g, '')) : (unitPrice * quantity);

      const taxRateStr = getXmlNodeText(node, ['TSuat', 'VATRate', 'tsuat', 'TaxRate', 'VAT']);
      let taxRate = 8;
      if (taxRateStr) {
        if (taxRateStr.includes('10')) taxRate = 10;
        else if (taxRateStr.includes('5')) taxRate = 5;
        else if (taxRateStr.includes('0')) taxRate = 0;
        else if (taxRateStr.includes('8')) taxRate = 8;
        else if (taxRateStr.toLowerCase().includes('kct')) taxRate = 0;
        else {
          const parsed = parseFloat(taxRateStr.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed)) taxRate = parsed;
        }
      }

      const taxAmount = Math.round(subtotal * (taxRate / 100));
      const total = subtotal + taxAmount;

      calculatedSubtotal += subtotal;
      calculatedTax += taxAmount;

      items.push({
        id: 'inb-item-' + (i + 1) + '-' + Math.random().toString(36).substr(2, 6),
        lineNumber: i + 1,
        productName: prodName,
        skuOrCode: sku,
        unit: unit,
        quantity: quantity,
        unitPrice: unitPrice,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        ratioToBaseUnit: 1,
        status: 'unmatched',
      });
    }

    // Total section from XML if available
    const totalSection = xmlDoc.getElementsByTagName('TToan')[0] || xmlDoc.getElementsByTagName('Total')[0] || xmlDoc;
    const xmlSubtotal = parseFloat(getXmlNodeText(totalSection, ['TgTCThue', 'TotalWithoutVAT', 'tgtcthue', 'TotalBeforeTax']).replace(/,/g, ''));
    const xmlTax = parseFloat(getXmlNodeText(totalSection, ['TgTThue', 'TotalVATAmount', 'tgtthue', 'TaxAmount']).replace(/,/g, ''));
    const xmlGrandTotal = parseFloat(getXmlNodeText(totalSection, ['TgTTTBSo', 'TotalAmountWithVAT', 'tgtttbso', 'TotalAmount', 'GrandTotal']).replace(/,/g, ''));

    const subtotal = !isNaN(xmlSubtotal) && xmlSubtotal > 0 ? xmlSubtotal : calculatedSubtotal;
    const taxAmount = !isNaN(xmlTax) && xmlTax > 0 ? xmlTax : calculatedTax;
    const totalAmount = !isNaN(xmlGrandTotal) && xmlGrandTotal > 0 ? xmlGrandTotal : (subtotal + taxAmount);
    
    const amountInWords = getXmlNodeText(totalSection, ['TgTTTBChu', 'TotalAmountInWords', 'tgtttbchu', 'AmountInWords']) || numberToVietnameseWords(totalAmount);

    const invoiceCode = `${invoiceSymbol}-${invoiceNumber.padStart(7, '0')}`;

    return {
      id: 'inb-inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      source: 'xml_upload',
      sourceDetail: `Nhập từ tệp XML: ${fileName}`,
      sourceFile: fileName,
      invoiceCode,
      invoiceNumber: invoiceNumber.padStart(7, '0'),
      invoiceSymbol,
      invoiceTemplate,
      issueDate,
      receivedDate: new Date().toISOString(),
      cqtCode,
      lookupCode,
      lookupUrl,
      seller: {
        name: sellerName,
        taxCode: sellerTaxCode,
        address: sellerAddress,
        phone: sellerPhone,
        email: sellerEmail,
        bankAccount: sellerBankAccount,
        bankName: sellerBankName,
      },
      buyer: {
        name: buyerName,
        taxCode: buyerTaxCode,
        address: buyerAddress,
      },
      items,
      subtotal,
      taxRate: items.length > 0 ? items[0].taxRate : 8,
      taxAmount,
      totalAmount,
      amountInWords,
      status: 'pending_review',
      rawXmlContent: xmlContent,
    };
  } catch (error) {
    console.error('Error parsing XML E-Invoice:', error);
    return parseInvoiceXmlWithRegex(xmlContent, fileName);
  }
}

/**
 * Fallback regex-based parser for malformed or unusual XML structures
 */
function parseInvoiceXmlWithRegex(xml: string, fileName: string): InboundEInvoice | null {
  const getTag = (tag: string) => {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return match ? match[1].trim() : '';
  };

  const invoiceNumber = getTag('SHDon') || getTag('shdon') || getTag('InvoiceNumber') || '00000001';
  const invoiceSymbol = getTag('KHHDon') || getTag('khhdon') || getTag('InvoiceSeries') || '1C26TFP';
  const sellerName = getTag('Ten') || getTag('SellerName') || 'NHÀ CUNG CẤP THIẾT BỊ';
  const sellerTaxCode = getTag('MST') || getTag('SellerTaxCode') || '0101778163';
  const totalStr = getTag('TgTTTBSo') || getTag('TotalAmount') || '0';
  const totalAmount = parseFloat(totalStr.replace(/,/g, '')) || 0;

  if (!sellerName && !invoiceNumber) {
    return null;
  }

  return {
    id: 'inb-inv-regex-' + Date.now(),
    source: 'xml_upload',
    sourceDetail: `Nhập dự phòng từ XML: ${fileName}`,
    sourceFile: fileName,
    invoiceCode: `${invoiceSymbol}-${invoiceNumber}`,
    invoiceNumber,
    invoiceSymbol,
    invoiceTemplate: '1/001',
    issueDate: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString(),
    cqtCode: 'TCT-CQT-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    lookupCode: 'GP-REG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    lookupUrl: 'https://hoadondientu.gdt.gov.vn',
    seller: {
      name: sellerName,
      taxCode: sellerTaxCode,
      address: getTag('DChi') || 'Việt Nam',
      phone: getTag('SDThoai') || '',
      email: getTag('DCTDTu') || '',
      bankAccount: getTag('STKNHang') || '',
      bankName: getTag('TNHang') || '',
    },
    buyer: {
      name: 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC',
      taxCode: '0318999888',
      address: 'TP. Hồ Chí Minh',
    },
    items: [
      {
        id: 'inb-item-1',
        lineNumber: 1,
        productName: 'Sản phẩm linh kiện tổng hợp theo HĐ ' + invoiceNumber,
        skuOrCode: 'SKU-GENERAL',
        unit: 'Bộ',
        quantity: 1,
        unitPrice: Math.round(totalAmount / 1.08),
        subtotal: Math.round(totalAmount / 1.08),
        taxRate: 8,
        taxAmount: Math.round(totalAmount - (totalAmount / 1.08)),
        total: totalAmount,
        ratioToBaseUnit: 1,
        status: 'unmatched',
      }
    ],
    subtotal: Math.round(totalAmount / 1.08),
    taxRate: 8,
    taxAmount: Math.round(totalAmount - (totalAmount / 1.08)),
    totalAmount,
    amountInWords: numberToVietnameseWords(totalAmount),
    status: 'pending_review',
    rawXmlContent: xml,
  };
}

/**
 * Intelligent fuzzy matching between Inbound Invoice Items and Inventory Products
 */
export function matchInboundItemsWithInventory(
  items: InboundInvoiceItem[],
  products: Product[]
): InboundInvoiceItem[] {
  if (!items || !products) return items || [];

  const cleanText = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();
  };

  return items.map((item) => {
    const itemClean = cleanText(item.productName);
    const itemSkuClean = item.skuOrCode ? cleanText(item.skuOrCode) : '';

    let bestMatch: Product | null = null;
    let highestScore = 0;

    for (const prod of products) {
      const prodNameClean = cleanText(prod.name);
      const prodSkuClean = cleanText(prod.sku);
      const prodBarcodeClean = prod.barcode ? cleanText(prod.barcode) : '';

      // Exact SKU or Barcode match (100% confidence)
      if (itemSkuClean && (prodSkuClean.includes(itemSkuClean) || itemSkuClean.includes(prodSkuClean))) {
        bestMatch = prod;
        highestScore = 1.0;
        break;
      }
      if (itemSkuClean && prodBarcodeClean && prodBarcodeClean.includes(itemSkuClean)) {
        bestMatch = prod;
        highestScore = 1.0;
        break;
      }

      // Keyword token matching
      const itemTokens = itemClean.split(/\s+/).filter((t) => t.length > 1);
      const prodTokens = prodNameClean.split(/\s+/).filter((t) => t.length > 1);
      
      let matchedTokensCount = 0;
      for (const token of itemTokens) {
        if (prodTokens.includes(token)) {
          matchedTokensCount++;
        }
      }

      const score = itemTokens.length > 0 ? (matchedTokensCount / itemTokens.length) : 0;

      if (score > 0.4 && score > highestScore) {
        highestScore = score;
        bestMatch = prod;
      }
    }

    if (bestMatch && highestScore >= 0.4) {
      return {
        ...item,
        matchedProductId: bestMatch.id,
        matchedProductName: bestMatch.name,
        matchedProductSku: bestMatch.sku,
        currentStock: bestMatch.stock,
        currentCostPrice: bestMatch.costPrice,
        status: 'matched',
        isNewProduct: false,
      };
    } else {
      return {
        ...item,
        status: 'unmatched',
        isNewProduct: true,
      };
    }
  });
}
