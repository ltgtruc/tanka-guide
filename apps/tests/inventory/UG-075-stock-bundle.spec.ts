import { expect, Locator, test } from '@playwright/test';
import { StockBundlePage } from '../../pages/inventory/StockBundlePage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-075-stock-bundle';

/*
 * Đăng ký 1 đoạn 1.200 mm của C3300-XW-X-1.8 ở kho 01-PR (tồn ~120.000 mm),
 * rồi huỷ chính đoạn đó ở cuối guide để chạy lặp lại không dồn đầu thừa giả.
 * Đăng ký đầu thừa không làm thay đổi số tồn kho.
 */
const WAREHOUSE = '01-PR';
const ITEM_CODE = 'C3300-XW-X-1.8';
const LENGTH_MM = '1200';
const LENGTH_TEXT = '1.200';

test.describe('UG-075 - Đầu thừa', () => {
  test(
    'Hướng dẫn đăng ký, tra cứu và huỷ đầu thừa profile',
    { tag: ['@user-guide', '@inventory', '@stock-bundle'] },
    async ({ page }, testInfo) => {
      const bundlePage = new StockBundlePage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý kho > Đầu thừa', async () => {
        await expect(bundlePage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Đầu thừa', bundlePage.inventoryMenu);
        await bundlePage.openBundleList();
        await capture('Danh sách đầu thừa: chiều dài, thanh gốc, nguồn, trạng thái', bundlePage.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Mở hộp thoại Đăng ký đầu thừa', async () => {
        await capture('Bấm Đăng ký đầu thừa', bundlePage.registerButton);
        await bundlePage.openRegisterDialog();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Chọn kho, mặt hàng, chiều dài và số đoạn', async () => {
        await bundlePage.fillRegistration(WAREHOUSE, ITEM_CODE, LENGTH_MM, '1');
        await capture('Chọn kho, mặt hàng, nhập chiều dài (mm) và số đoạn', bundlePage.registerDialog);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Đăng ký', async () => {
        await bundlePage.submitRegistration();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Lọc theo mặt hàng để kiểm tra', async () => {
        await bundlePage.filterByItem(ITEM_CODE);

        const row = bundlePage.manualBundleRow(LENGTH_TEXT);

        await expect(row).toBeVisible({ timeout: 15_000 });
        await capture('Đầu thừa mới: nguồn Đăng ký tay, trạng thái Sẵn dùng', row);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 7 - Huỷ đầu thừa đăng ký nhầm', async () => {
        const row = bundlePage.manualBundleRow(LENGTH_TEXT);

        await capture('Bấm biểu tượng thùng rác để huỷ đầu thừa', bundlePage.cancelIcon(row));
        await bundlePage.cancelBundle(row, 'Đăng ký nhầm chiều dài - hướng dẫn');
        await capture('Đầu thừa chuyển sang Đã huỷ', bundlePage.listRows.filter({ hasText: /đã huỷ/i }).first());
        await guidePause(page, 2_000);
      });
    },
  );
});
