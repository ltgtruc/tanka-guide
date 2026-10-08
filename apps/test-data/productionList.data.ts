export interface ProductionListData {
  site: string;
  description: string;
}

export function createGuideProductionList(): ProductionListData {
  const timestamp = Date.now();

  return {
    // Form "Chi tiết SX" đổi field "Kho hàng" thành "Chi nhánh" (bắt buộc).
    site: 'Hóc Môn',
    description: `Đơn theo dõi sản xuất tự động ${timestamp}`,
  };
}
