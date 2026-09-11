export interface GuideInstallationSettlement {
  team: string;
  productionCode: string;

  statusNote: string;
  sentStatus: string;
  approvedStatus: string;
  completedStatus: string;
}

export function createGuideInstallationSettlement(): GuideInstallationSettlement {
  return {
    /*
     * Không chỉ định đội/mã sản xuất cụ thể — luôn lấy dòng đầu tiên trong
     * danh sách vì "Chọn mã sản xuất" chỉ hiển thị các đề nghị SX có dòng
     * đã lắp đặt 100%, có ngày HTLĐ và HTVS (theo đội đã chọn), dữ liệu này
     * thay đổi theo thực tế mỗi lần chạy.
     */
    team: 'Đạt LD',
    productionCode: '',

    statusNote: 'đã hoàn thành bước này',
    sentStatus: 'Đã gửi',
    approvedStatus: 'Đã duyệt',
    completedStatus: 'Hoàn thành',
  };
}
