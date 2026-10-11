import { expect, Locator, test } from '@playwright/test';
import { StockLocationPage } from '../../pages/inventory/StockLocationPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-072-stock-location';

test.describe('UG-072 - Khu vực lưu trữ', () => {
  test(
    'Hướng dẫn tạo khu vực lưu trữ Kho vật lý cho kho hàng mới',
    { tag: ['@user-guide', '@inventory', '@stock-location'] },
    async ({ page }, testInfo) => {
      const locationPage = new StockLocationPage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      let warehousesWithLocation: string[] = [];

      await test.step('Bước 2 - Mở Quản lý kho > Khu vực lưu trữ', async () => {
        await expect(locationPage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Khu vực lưu trữ', locationPage.inventoryMenu);
        await locationPage.openLocationList();
        warehousesWithLocation = await locationPage.getWarehousesWithLocation();
        await capture('Danh sách khu vực lưu trữ theo loại', locationPage.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', locationPage.createButton);
        await locationPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      let warehouse = '';
      let locationName = '';

      await test.step('Bước 4 - Chọn loại Kho vật lý và kho hàng', async () => {
        await locationPage.selectType('Kho vật lý');
        warehouse = await locationPage.selectNewestWarehouseWithoutLocation(warehousesWithLocation);
        locationName = `Kho ${warehouse}`;
        console.log(`Tạo khu vực cho kho: ${warehouse}`);
        await capture('Chọn loại Kho vật lý và kho chưa có khu vực', locationPage.warehouseDropdown);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Nhập tên khu vực', async () => {
        await guideFill(page, locationPage.nameInput, locationName);
        await capture('Nhập tên khu vực', locationPage.nameInput);
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Lưu khu vực', async () => {
        await capture('Bấm Lưu', locationPage.saveButton);
        await locationPage.saveLocation();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và kiểm tra', async () => {
        await locationPage.backToList();
        await page.waitForURL(/stock-location-list/i, { timeout: 30_000 });
        await expect(locationPage.locationRow(locationName)).toBeVisible({ timeout: 20_000 });
        await capture(`Khu vực "${locationName}" xuất hiện trong danh sách`, locationPage.locationRow(locationName));
        await guidePause(page, 2_000);
      });
    },
  );
});
