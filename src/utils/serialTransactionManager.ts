import {
  Product,
  CartItem,
  Order,
  SerialDeviceRecord,
  StockOutboundNote,
  InventoryLog,
  AccountingRecord,
  Customer,
} from '../types';

export interface OutboundTransactionParams {
  order: Order;
  products: Product[];
  serialRecords: SerialDeviceRecord[];
  dispatchedBy: string;
  warehouseName?: string;
  notes?: string;
}

export interface OutboundTransactionResult {
  success: boolean;
  error?: string;
  updatedProducts?: Product[];
  updatedSerialRecords?: SerialDeviceRecord[];
  outboundNote?: StockOutboundNote;
  inventoryLogs?: InventoryLog[];
  updatedOrder?: Order;
}

/**
 * 1. Xử Lý Tranh Chấp Dữ Liệu (Concurrency Lock Check)
 * Kiểm tra xem Serial có sẵn sàng xuất bán hoặc bị tạm giữ bởi phiên khác không.
 */
export const checkSerialAvailability = (
  serial: string,
  serialRecords: SerialDeviceRecord[],
  currentOrderCode?: string
): { available: boolean; reason?: string; record?: SerialDeviceRecord } => {
  const cleanSerial = serial.trim().toUpperCase();
  const record = serialRecords.find(
    (s) => s.serialNumber.trim().toUpperCase() === cleanSerial
  );

  if (!record) {
    // Nếu chưa có trong hệ thống, cho phép xuất nhưng sẽ tự động sinh bản ghi mới
    return { available: true };
  }

  // Đã xuất bán
  if (record.status === 'sold') {
    return {
      available: false,
      reason: `Serial "${cleanSerial}" đã được xuất bán cho đơn hàng ${record.soldOrderCode || 'trước đó'} (Khách: ${record.customerName || 'N/A'}).`,
      record,
    };
  }

  // Đang bảo hành / Hỏng
  if (record.status === 'defective' || record.status === 'under_warranty' || record.status === 'returned_to_vendor') {
    return {
      available: false,
      reason: `Serial "${cleanSerial}" đang ở trạng thái lỗi/bảo hành (${record.status}), không thể xuất kho!`,
      record,
    };
  }

  // Kiểm tra khóa tạm giữ (Reservation Lock)
  if (record.status === 'reserved' && record.reservedByOrderCode && record.reservedByOrderCode !== currentOrderCode) {
    if (record.lockExpiry && new Date(record.lockExpiry).getTime() > Date.now()) {
      return {
        available: false,
        reason: `Serial "${cleanSerial}" đang bị tạm giữ bởi phiên/đơn ${record.reservedByOrderCode}. Vui lòng thử lại sau.`,
        record,
      };
    }
  }

  return { available: true, record };
};

/**
 * Tạm giữ Serial trong giỏ hàng (Optimistic Concurrency Lock - 15 Phút)
 */
export const reserveSerialsForOrder = (
  serials: string[],
  orderCode: string,
  serialRecords: SerialDeviceRecord[]
): SerialDeviceRecord[] => {
  const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const serialSet = new Set(serials.map((s) => s.trim().toUpperCase()));

  return serialRecords.map((record) => {
    if (serialSet.has(record.serialNumber.trim().toUpperCase())) {
      if (record.status === 'in_stock' || !record.status) {
        return {
          ...record,
          status: 'reserved',
          reservedByOrderCode: orderCode,
          lockExpiry: expiry,
        };
      }
    }
    return record;
  });
};

/**
 * 2. ACID Transaction Execution Manager
 * Thực thi chuỗi nghiệp vụ nguyên tử:
 * - Trừ kho Product
 * - Đổi trạng thái Serial sang 'sold'
 * - Tạo Phiếu Xuất Kho StockOutboundNote
 * - Tạo Nhật Ký Kho InventoryLog (loại export_sales)
 * - Cập nhật Order.outboundStatus = 'dispatched'
 */
export const executeSalesOutboundTransaction = (
  params: OutboundTransactionParams
): OutboundTransactionResult => {
  const {
    order,
    products,
    serialRecords,
    dispatchedBy,
    warehouseName = 'Kho Chính Gia Phúc Computer',
    notes,
  } = params;

  try {
    // 1. Validation & Lock Verification
    const allOutboundSerials: { serial: string; productId: string; productName: string; sku: string; warrantyMonths: number }[] = [];

    for (const item of order.items) {
      if (item.serials && item.serials.length > 0) {
        // Kiểm tra số lượng Serial khớp với số lượng mua
        if (item.serials.length !== item.quantity) {
          return {
            success: false,
            error: `Sản phẩm "${item.productName}" yêu cầu ${item.quantity} số Serial nhưng mới gán ${item.serials.length} Serial!`,
          };
        }

        // Kiểm tra tính hợp lệ và trùng lặp
        const seenInItem = new Set<string>();
        for (const sn of item.serials) {
          const upperSN = sn.trim().toUpperCase();
          if (seenInItem.has(upperSN)) {
            return {
              success: false,
              error: `Phát hiện Serial "${upperSN}" bị trùng lặp trong cùng một đơn hàng!`,
            };
          }
          seenInItem.add(upperSN);

          const check = checkSerialAvailability(upperSN, serialRecords, order.code);
          if (!check.available) {
            return {
              success: false,
              error: check.reason || `Serial "${upperSN}" không sẵn sàng để xuất kho.`,
            };
          }

          allOutboundSerials.push({
            serial: upperSN,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            warrantyMonths: item.warrantyPeriodMonths || 24, // Mặc định 24 tháng nếu không chỉ định
          });
        }
      }
    }

    // 2. Atomic Stock Deductions
    const updatedProducts = products.map((p) => {
      const matchedItem = order.items.find((it) => it.productId === p.id);
      if (matchedItem) {
        const deductedQty = (matchedItem.ratioToBase || 1) * matchedItem.quantity;
        return {
          ...p,
          stock: Math.max(0, p.stock - deductedQty),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    // 3. Atomic Serial Records Transition to 'sold' with Warranty Activation
    const soldDate = new Date().toISOString();
    const existingSerialMap = new Map(
      serialRecords.map((r) => [r.serialNumber.trim().toUpperCase(), r])
    );

    const now = new Date();

    allOutboundSerials.forEach((snItem) => {
      const expDate = new Date(now);
      expDate.setMonth(expDate.getMonth() + snItem.warrantyMonths);

      const existing = existingSerialMap.get(snItem.serial);
      if (existing) {
        existingSerialMap.set(snItem.serial, {
          ...existing,
          productId: snItem.productId,
          productName: snItem.productName,
          sku: snItem.sku,
          status: 'sold',
          soldOrderCode: order.code,
          soldDate,
          customerName: order.customer?.name || 'Khách Lẻ',
          customerPhone: order.customer?.phone || '',
          customerAddress: order.customer?.address || '',
          warrantyPeriodMonths: snItem.warrantyMonths,
          warrantyExpiryDate: expDate.toISOString().split('T')[0],
          warrantyStatus: 'valid',
          reservedByOrderCode: undefined,
          lockExpiry: undefined,
        });
      } else {
        // Tự động tạo bản ghi Serial mới nếu chưa có trong database
        const newRecord: SerialDeviceRecord = {
          id: `sn-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          serialNumber: snItem.serial,
          productId: snItem.productId,
          productName: snItem.productName,
          sku: snItem.sku,
          status: 'sold',
          soldOrderCode: order.code,
          soldDate,
          customerName: order.customer?.name || 'Khách Lẻ',
          customerPhone: order.customer?.phone || '',
          customerAddress: order.customer?.address || '',
          warrantyPeriodMonths: snItem.warrantyMonths,
          warrantyExpiryDate: expDate.toISOString().split('T')[0],
          warrantyStatus: 'valid',
          totalRepairsCount: 0,
          totalMaintenancesCount: 0,
        };
        existingSerialMap.set(snItem.serial, newRecord);
      }
    });

    const updatedSerialRecords = Array.from(existingSerialMap.values());

    // 4. Generate Stock Outbound Note (Phiếu Xuất Kho)
    const outboundNoteCode = `XK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const outboundNote: StockOutboundNote = {
      id: `outbound-${Date.now()}`,
      code: outboundNoteCode,
      orderCode: order.code,
      orderId: order.id,
      customerName: order.customer?.name || 'Khách Hàng',
      customerPhone: order.customer?.phone || '',
      customerAddress: order.customer?.address || '',
      warehouseName,
      dispatchedBy,
      dispatchedAt: soldDate,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unit: item.unit || 'Cái',
        quantity: item.quantity,
        serials: item.serials || [],
        warrantyPeriodMonths: item.warrantyPeriodMonths || 24,
      })),
      totalQuantity: order.items.reduce((sum, it) => sum + it.quantity, 0),
      notes: notes || `Xuất kho bán hàng theo đơn ${order.code}`,
      status: 'completed',
      createdAt: soldDate,
    };

    // 5. Generate Inventory Logs (Sổ Nhật Ký Kho)
    const inventoryLogs: InventoryLog[] = order.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const prevStock = prod?.stock || 0;
      const deductedQty = (item.ratioToBase || 1) * item.quantity;
      return {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        type: 'sale_deduct',
        oldStock: prevStock,
        quantityChange: -deductedQty,
        newStock: Math.max(0, prevStock - deductedQty),
        timestamp: soldDate,
        reason: `Xuất bán theo đơn ${order.code} (Phiếu ${outboundNoteCode})${item.serials && item.serials.length > 0 ? ` - S/N: ${item.serials.join(', ')}` : ''}`,
        performedBy: dispatchedBy,
        unitPrice: item.unitPrice,
      };
    });

    // 6. Update Order Outbound Status
    const updatedOrder: Order = {
      ...order,
      outboundStatus: 'dispatched',
      dispatchedAt: soldDate,
      dispatchedBy,
      outboundNoteCode,
      status: order.status === 'pending' || order.status === 'confirmed' ? 'completed' : order.status,
    };

    return {
      success: true,
      updatedProducts,
      updatedSerialRecords,
      outboundNote,
      inventoryLogs,
      updatedOrder,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Giao dịch xuất kho thất bại: ${err.message || 'Lỗi không xác định'}`,
    };
  }
};

/**
 * 3. Swap Serial Flow (Đổi Mới Thiết Bị 1-1 Khi Bảo Hành)
 * - Serial cũ: chuyển sang 'defective' hoặc 'returned_to_vendor', gán replacedBySerial = newSerial
 * - Serial mới: lấy từ kho (chuyển từ 'in_stock' sang 'sold'), gán previousSerial = oldSerial
 * - Kế thừa hạn bảo hành: Serial mới kế thừa thời hạn bảo hành còn lại từ Serial cũ (+ tháng bảo hành mở rộng nếu có)
 */
export interface SwapSerialParams {
  oldSerialNumber: string;
  newSerialNumber: string;
  technicianName: string;
  ticketCode: string;
  warrantyExtensionMonths?: number;
  serialRecords: SerialDeviceRecord[];
  products: Product[];
}

export interface SwapSerialResult {
  success: boolean;
  error?: string;
  updatedSerialRecords?: SerialDeviceRecord[];
  updatedProducts?: Product[];
  replacementLog?: InventoryLog;
}

export const executeSwapSerialTransaction = (
  params: SwapSerialParams
): SwapSerialResult => {
  const {
    oldSerialNumber,
    newSerialNumber,
    technicianName,
    ticketCode,
    warrantyExtensionMonths = 0,
    serialRecords,
    products,
  } = params;

  const cleanOld = oldSerialNumber.trim().toUpperCase();
  const cleanNew = newSerialNumber.trim().toUpperCase();

  const oldRecord = serialRecords.find(
    (s) => s.serialNumber.trim().toUpperCase() === cleanOld
  );
  if (!oldRecord) {
    return {
      success: false,
      error: `Không tìm thấy thông tin Serial cũ "${cleanOld}" trong hệ thống!`,
    };
  }

  const newRecord = serialRecords.find(
    (s) => s.serialNumber.trim().toUpperCase() === cleanNew
  );
  if (newRecord && newRecord.status !== 'in_stock') {
    return {
      success: false,
      error: `Serial thay thế "${cleanNew}" không ở trong kho (Trạng thái hiện tại: ${newRecord.status})!`,
    };
  }

  // Tính hạn bảo hành kế thừa
  let inheritedExpiryDate = oldRecord.warrantyExpiryDate;
  if (warrantyExtensionMonths > 0) {
    const currentExpiry = new Date(oldRecord.warrantyExpiryDate);
    currentExpiry.setMonth(currentExpiry.getMonth() + warrantyExtensionMonths);
    inheritedExpiryDate = currentExpiry.toISOString().split('T')[0];
  }

  const now = new Date().toISOString();

  // Cập nhật Serial cũ
  const updatedOldRecord: SerialDeviceRecord = {
    ...oldRecord,
    status: 'defective',
    replacedBySerial: cleanNew,
    notes: `${oldRecord.notes || ''} [Đổi mới sang ${cleanNew} theo phiếu ${ticketCode} ngày ${new Date().toLocaleDateString('vi-VN')}]`,
  };

  // Cập nhật Serial mới
  const updatedNewRecord: SerialDeviceRecord = {
    ...(newRecord || {
      id: `sn-${Date.now()}`,
      serialNumber: cleanNew,
      productName: oldRecord.productName,
      sku: oldRecord.sku,
      totalRepairsCount: 0,
      totalMaintenancesCount: 0,
    }),
    productId: oldRecord.productId || newRecord?.productId,
    productName: oldRecord.productName,
    sku: oldRecord.sku,
    status: 'sold',
    soldOrderCode: oldRecord.soldOrderCode,
    soldDate: oldRecord.soldDate,
    customerName: oldRecord.customerName,
    customerPhone: oldRecord.customerPhone,
    customerAddress: oldRecord.customerAddress,
    warrantyPeriodMonths: oldRecord.warrantyPeriodMonths + warrantyExtensionMonths,
    warrantyExpiryDate: inheritedExpiryDate,
    warrantyStatus: 'valid',
    previousSerial: cleanOld,
    notes: `[Thiết bị đổi mới 1-1 thay thế cho ${cleanOld} theo phiếu ${ticketCode}]`,
  };

  const updatedSerialRecords = serialRecords.map((s) => {
    const sn = s.serialNumber.trim().toUpperCase();
    if (sn === cleanOld) return updatedOldRecord;
    if (sn === cleanNew) return updatedNewRecord;
    return s;
  });

  // Nếu newRecord chưa tồn tại trong danh sách thì thêm mới
  if (!serialRecords.some((s) => s.serialNumber.trim().toUpperCase() === cleanNew)) {
    updatedSerialRecords.push(updatedNewRecord);
  }

  // Trừ tồn kho 1 chiếc từ sản phẩm
  const targetProduct = products.find(
    (p) => p.id === oldRecord.productId || p.sku === oldRecord.sku
  );
  let updatedProducts = products;
  let replacementLog: InventoryLog | undefined;

  if (targetProduct) {
    updatedProducts = products.map((p) =>
      p.id === targetProduct.id
        ? { ...p, stock: Math.max(0, p.stock - 1), updatedAt: now }
        : p
    );

    replacementLog = {
      id: `log-swap-${Date.now()}`,
      productId: targetProduct.id,
      productName: targetProduct.name,
      sku: targetProduct.sku,
      type: 'export',
      oldStock: targetProduct.stock,
      quantityChange: -1,
      newStock: Math.max(0, targetProduct.stock - 1),
      timestamp: now,
      reason: `Xuất đổi mới 1-1 (Thay S/N ${cleanOld} bằng S/N ${cleanNew} - Phiếu ${ticketCode})`,
      performedBy: technicianName,
      unitPrice: targetProduct.costPrice,
    };
  }

  return {
    success: true,
    updatedSerialRecords,
    updatedProducts,
    replacementLog,
  };
};

/**
 * 4. Bất Đồng Bộ Hóa Kích Hoạt Bảo Hành (Event-Driven Background Dispatcher)
 * Chạy ngầm không chặn luồng UI/Checkout.
 */
export const dispatchSalesOrderCompletedEvent = (
  order: Order,
  onLogMessage?: (msg: string) => void
) => {
  // Mô phỏng Micro-Queue Worker chạy ngầm sau 50ms
  setTimeout(() => {
    const countSerials = order.items.reduce(
      (acc, it) => acc + (it.serials ? it.serials.length : 0),
      0
    );

    const log = `[EVENT sales.order.dispatched] Đã kích hoạt bảo hành điện tử cho ${countSerials} số Serial của đơn ${order.code} (Khách hàng: ${order.customer?.name || 'Khách Lẻ'}).`;
    console.log(log);
    if (onLogMessage) onLogMessage(log);
  }, 50);
};
