export interface GuideStockLot {
  item: {
    code: string;
    name: string;
    storageUnit: string;
    lotTracking: string;
    lotPicking: string;
    shelfLifeDays: string;
  };
  receipt: {
    supplier: string;
    warehouse: string;
    note: string;
    unit: string;
    quantity: string;
    amount: string;
    lotNumber: string;
    manufacturerLot: string;
    expiryDayNextMonth: number;
  };
}

export function createGuideStockLot(): GuideStockLot {
  const timestamp = Date.now();
  const shortId = String(timestamp).slice(-6);

  return {
    /*
     * Tạo vật liệu MỚI có theo dõi lô cho mỗi lần chạy: không bật lô trên
     * mặt hàng đang dùng trong chuỗi sản xuất (sẽ đổi cách xuất vật tư).
     * ĐVT lưu kho = mm vì ĐVT bán/mua mặc định là mm (tránh lỗi quy đổi).
     */
    item: {
      code: `LOT-${timestamp}`,
      name: `Keo dán theo lô ${timestamp}`,
      storageUnit: 'mm',
      lotTracking: 'Theo lô',
      lotPicking: 'FEFO (hết hạn trước xuất trước)',
      shelfLifeDays: '180',
    },
    receipt: {
      supplier: 'Soudal VN',
      warehouse: '03-VTP',
      note: `Nhận keo theo lô - hướng dẫn ${timestamp}`,
      unit: 'mm',
      quantity: '5000',
      amount: '250000',
      lotNumber: `LO-${shortId}`,
      manufacturerLot: 'NSX-2026-10',
      expiryDayNextMonth: 15,
    },
  };
}
