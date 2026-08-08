
export interface ProductionListData {
  warehouse: string;
  description: string;
}

export function createGuideProductionList(): ProductionListData {
  const timestamp = Date.now();

  return {
    warehouse: 'Kho Thành Phẩm',
    description: `Đơn theo dõi sản xuất tự động ${timestamp}`,
  };
}