export interface GuideCustomerSettlement {
  customer: string;
  productionCode: string;

  statusNote: string;
  sentStatus: string;
  approvedStatus: string;
  completedStatus: string;
}

export function createGuideCustomerSettlement(): GuideCustomerSettlement {
  return {
    /*
     * Theo video: Khách hàng "Anh Kỳ" đã có sẵn các đề nghị SX ở trạng thái
     * Đã lắp đặt (điều kiện bắt buộc để hiện trong "Chọn sản xuất để quyết
     * toán"). Không chỉ định mã sản xuất cụ thể — luôn lấy mã đầu tiên
     * trong danh sách vì mã SX thay đổi theo dữ liệu thực tế mỗi lần chạy.
     */
    customer: 'Anh Kỳ',
    productionCode: '',

    statusNote: 'đã hoàn thành bước này',
    sentStatus: 'Đã gửi',
    approvedStatus: 'Đã duyệt',
    completedStatus: 'Hoàn thành',
  };
}
