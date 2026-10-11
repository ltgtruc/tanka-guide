import { expect, Locator, test } from '@playwright/test';
import { InventoryPeriodPage } from '../../pages/inventory/InventoryPeriodPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-076-inventory-period';

test.describe('UG-076 - Kỳ kho', () => {
  test(
    'Hướng dẫn xem kỳ kho và số liệu nhập - xuất - tồn trong kỳ',
    { tag: ['@user-guide', '@inventory', '@inventory-period'] },
    async ({ page }, testInfo) => {
      const periodPage = new InventoryPeriodPage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý kho > Kỳ kho', async () => {
        await expect(periodPage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Kỳ kho', periodPage.inventoryMenu);
        await periodPage.openPeriodList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Xem danh sách kỳ kho', async () => {
        const row = periodPage.openPeriodRow();

        await expect(row).toBeVisible({ timeout: 15_000 });
        await capture('Mỗi tháng một kỳ kho; kỳ hiện tại ở trạng thái Đang mở', row);
        await guidePause(page, 1_000);
      });

      let period = '';

      await test.step('Bước 4 - Mở chi tiết kỳ kho', async () => {
        period = await periodPage.openPeriod(periodPage.openPeriodRow());
        console.log(`Kỳ kho: ${period}`);
        await capture(`Chi tiết kỳ kho ${period}: trạng thái và số liệu kỳ`, periodPage.statusText);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Đọc bảng Số liệu kỳ', async () => {
        await capture('Số liệu kỳ: Đầu kỳ, Nhập, Xuất, Cuối kỳ (SL / GT), Giá BQ kỳ', periodPage.figuresTable.locator('thead'));
        await guidePause(page, 1_200);
      });

      await test.step('Bước 6 - Nút Khóa kỳ (không bấm khi kỳ còn đang dùng)', async () => {
        await expect(periodPage.lockButton).toBeVisible({ timeout: 10_000 });
        await capture('Khóa kỳ khi đã chốt sổ cuối tháng — sau khi khóa không ghi sổ được vào kỳ', periodPage.lockButton);
        await guidePause(page, 2_000);
      });
    },
  );
});
