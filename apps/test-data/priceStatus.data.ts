export interface GuidePriceStatus {
  salesOrderCode: string;
  warehouse: string;

  sentStatus: string;
  approvedStatus: string;
  productionRequestedStatus: string;

  statusNote: string;
}

export function createGuidePriceStatus(): GuidePriceStatus {
  return {
    salesOrderCode: '',
    warehouse: 'Hóc Môn',

    /*
     * Nội dung button trong dropdown là "Đã gửi".
     * Sau khi cập nhật, timeline có thể hiển thị
     * "Đã gửi từ báo giá".
     */
    sentStatus: 'Đã gửi',
    approvedStatus: 'Đã duyệt',
    productionRequestedStatus:
      'Đã yêu cầu SX',

    statusNote: 'đã thực thiện bước này',
  };
}