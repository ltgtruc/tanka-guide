export interface GuideProductionSettlement {
  team: string;
  productionCode: string;

  statusNote: string;
  sentStatus: string;
  approvedStatus: string;
  completedStatus: string;
}

export function createGuideProductionSettlement(): GuideProductionSettlement {
  return {
    /*
     * Không chỉ định đội/mã sản xuất cụ thể — luôn lấy dòng đầu tiên trong
     * danh sách vì "Chọn lệnh sản xuất" chỉ hiển thị các đề nghị SX có dòng
     * đã có ngày HTSX và hoàn thành (theo đội đã chọn), dữ liệu này thay
     * đổi theo thực tế mỗi lần chạy.
     */
    team: '',
    productionCode: '',

    statusNote: 'đã hoàn thành bước này',
    sentStatus: 'Đã gửi',
    approvedStatus: 'Đã duyệt',
    completedStatus: 'Hoàn thành',
  };
}
