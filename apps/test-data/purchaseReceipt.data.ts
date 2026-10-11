export interface GuidePurchaseReceipt {
  supplier: string;
  warehouse: string;
  note: string;

  /** Dòng "Ngoài đơn" của phiếu nhận hàng tạo tay. */
  otherItem: {
    item: string;
    unit: string;
    quantity: string;
    amount: string;
  };

  /** Dòng trả lại NCC (lấy từ đơn mua hàng đã nhận của cùng NCC). */
  returnLine: {
    item: string;
    quantity: number;
    reason: string;
    needsReplacement: boolean;
  };
  returnNote: string;
}

export function createGuidePurchaseReceipt(): GuidePurchaseReceipt {
  const timestamp = Date.now();

  return {
    /*
     * Theo khảo sát thực tế: các đơn MH Green Future do UG-032 lập (tab
     * Profile) có dòng C3295-X-1.0 nhận vào kho 01-PR. Guide nhận thêm 1
     * thanh ngoài đơn (+1), trả lại 1 thanh (-1) rồi đảo phiếu trả (+1) nên
     * tồn kho không bị hụt khi chạy lặp lại.
     */
    supplier: 'Green Future',
    warehouse: '01-PR',
    note: `Nhận hàng ngoài đơn - hướng dẫn ${timestamp}`,

    otherItem: {
      item: 'C3295-X-1.0',
      unit: 'Thanh 5.8',
      quantity: '1',
      amount: '250000',
    },

    returnLine: {
      item: 'C3295-X-1.0',
      quantity: 1,
      reason: 'Hư hỏng',
      needsReplacement: true,
    },
    returnNote: `Trả 1 thanh nẹp kính bị móp - hướng dẫn ${timestamp}`,
  };
}
