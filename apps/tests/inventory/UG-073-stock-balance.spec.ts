import { expect, Locator, test } from '@playwright/test';
import { StockBalancePage } from '../../pages/inventory/StockBalancePage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-073-stock-balance';

// Mặt hàng có đủ các cột Tồn / Đã giữ cho SX / Khả dụng để minh họa.
const ITEM_CODE = 'C3295-X-1.0';
const WAREHOUSE = '01-PR';

test.describe('UG-073 - Tồn kho', () => {
  test(
    'Hướng dẫn tra cứu tồn kho, đọc số tồn, đã giữ cho SX và khả dụng',
    { tag: ['@user-guide', '@inventory', '@stock-balance'] },
    async ({ page }, testInfo) => {
      const balancePage = new StockBalancePage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý kho > Tồn kho', async () => {
        await expect(balancePage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Tồn kho', balancePage.inventoryMenu);
        await balancePage.openBalanceList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Xem các cột của bảng tồn kho', async () => {
        await capture('Các cột: Tồn, Đã giữ cho SX, Khả dụng, Đang đặt mua, Đang chuyển đến', balancePage.tableHeader);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Lọc theo mặt hàng', async () => {
        await capture('Bấm ô Tên HTK, gõ mã mặt hàng cần tra', balancePage.itemFilter);
        await balancePage.filterByItem(ITEM_CODE);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Lọc thêm theo kho', async () => {
        await balancePage.filterByWarehouse(WAREHOUSE);
        await capture(`Tồn của ${ITEM_CODE} tại kho ${WAREHOUSE}`, balancePage.itemRow(ITEM_CODE));
        await guidePause(page, 1_200);
      });

      await test.step('Bước 6 - Mở xem tồn theo lô', async () => {
        const detail = await balancePage.expandRow(balancePage.itemRow(ITEM_CODE));

        await capture('Bấm mũi tên đầu dòng để xem tồn theo lô', detail);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 7 - Nút Tính lại tồn kho', async () => {
        await expect(balancePage.recalculateButton).toBeVisible({ timeout: 10_000 });
        await capture('Nút Tính lại tồn kho (dùng khi số tồn nghi bị lệch)', balancePage.recalculateButton);
        await guidePause(page, 2_000);
      });
    },
  );
});
