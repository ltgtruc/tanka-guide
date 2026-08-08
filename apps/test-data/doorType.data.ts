export interface DoorTypeData {
  name: string;
  reportType: string;
}

export function createGuideDoorType(): DoorTypeData {
  const timestamp = Date.now();

  return {
    name: `Loại cửa tự động ${timestamp}`,
    reportType: 'Báo cáo tiêu chuẩn',
  };
}