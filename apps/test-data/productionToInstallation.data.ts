export interface GuideProductionToInstallation {
  statusNote: string;

  inProductionStatus: string;
  producedStatus: string;
  deliveredStatus: string;
  installingStatus: string;
  installedStatus: string;

  deliveringDeliveryStatus: string;
  completedDeliveryStatus: string;

  /*
   * Đội trên màn hình Giám sát tiến độ SX — phải khớp đội dùng ở các guide
   * quyết toán: UG-037 lọc theo Đội SX, UG-036 lọc theo Đội LĐ.
   */
  productionTeam: string;
  installationTeam: string;
  cleaningTeam: string;
}

export function createGuideProductionToInstallation(): GuideProductionToInstallation {
  return {
    statusNote: 'đã hoàn thành bước này',

    inProductionStatus: 'Đang SX',
    producedStatus: 'Đã SX',
    deliveredStatus: 'Đã giao hàng',
    installingStatus: 'Đang lắp đặt',
    installedStatus: 'Đã lắp đặt',

    deliveringDeliveryStatus: 'Đang giao',
    completedDeliveryStatus: 'Hoàn thành',

    productionTeam: 'Anh Danh - GC Sản xuất',
    installationTeam: 'Đạt LD',
    cleaningTeam: 'Đạt LD',
  };
}
