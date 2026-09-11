export interface GuideProductProcess {
  scrapPrice: string;
  statusNote: string;

  approvedStatus: string;
  plannedStatus: string;
  purchasedStatus: string;
  inProductionStatus: string;
  producedStatus: string;
  installingStatus: string;
  installedStatus: string;
}

export function createGuideProductProcess(): GuideProductProcess {
  return {
    scrapPrice: '5000',
    statusNote: 'đã hoàn thành bước này',

    approvedStatus: 'Đã duyệt',
    plannedStatus: 'Đã kế hoạch',
    purchasedStatus: 'Đã mua hàng',
    inProductionStatus: 'Đang SX',
    producedStatus: 'Đã SX',
    installingStatus: 'Đang lắp đặt',
    installedStatus: 'Đã lắp đặt',
  };
}
