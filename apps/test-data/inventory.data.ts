export function createGuideInventoryItem() {
  const timestamp = Date.now();

  return {
    code: `ITEM-${timestamp}`,
    name: `Vật liệu Demo ${timestamp}`,
    description: 'Mô tả vật liệu demo',
  };
}
