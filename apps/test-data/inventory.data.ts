export function createGuideInventoryItem() {
  const timestamp = Date.now();

  return {
    code: `ITEM-${timestamp}`,
    name: `Vật liệu Demo ${timestamp}`,
    description: 'Mô tả vật liệu demo',
    // ĐVT lưu kho phải có quy đổi sang ĐVT bán hàng/mua hàng mặc định (mm),
    // nếu không app báo lỗi "chưa có quy đổi" khi lưu.
    storageUnit: 'mm',
  };
}
