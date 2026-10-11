export interface GuideInventoryAdjustment {
  type: string;
  warehouse: string;
  counterpart: string;
  note: string;
  line: {
    direction: string;
    itemCode: string;
    quantity: string;
    unitPrice: string;
    reason: string;
  };
}

export interface GuideStockTransfer {
  type: string;
  fromWarehouse: string;
  toWarehouse: string;
  counterpart: string;
  note: string;
  receiveNote: string;
  line: {
    itemCode: string;
    quantity: string;
  };
}

/*
 * Mặt hàng C3300-XW-X-1.8 (Nối khung vách kính hệ 55 - Xám) đang tồn
 * ~120.000 mm ở kho 01-PR và không bị lệnh SX nào giữ, giá bình quân ~75 đ/mm.
 * UG-070 nhập điều chỉnh +1.000 mm, UG-071 chuyển 1.000 mm sang 07-GC nên chạy
 * lặp lại không làm hụt tồn kho 01-PR.
 */
const ITEM_CODE = 'C3300-XW-X-1.8';

export function createGuideInventoryAdjustment(): GuideInventoryAdjustment {
  return {
    type: 'Điều chỉnh',
    warehouse: '01-PR',
    counterpart: 'Điều chỉnh',
    note: `Điều chỉnh tăng do đếm thực tế thừa - hướng dẫn ${Date.now()}`,
    line: {
      direction: 'Nhập',
      itemCode: ITEM_CODE,
      quantity: '1000',
      unitPrice: '75',
      reason: 'Khác',
    },
  };
}

export function createGuideStockTransfer(): GuideStockTransfer {
  return {
    type: 'Chuyển kho',
    fromWarehouse: '01-PR',
    toWarehouse: '07-GC',
    counterpart: 'Đang chuyển kho',
    note: `Chuyển nối khung sang kho gia công - hướng dẫn ${Date.now()}`,
    receiveNote: 'Đã nhận đủ tại kho gia công',
    line: {
      itemCode: ITEM_CODE,
      quantity: '1000',
    },
  };
}
