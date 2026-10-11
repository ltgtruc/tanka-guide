import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-023-sales-price';

test.describe('UG-023 - Giá bán', () => {
  test(
    'Hướng dẫn xem bảng giá bán và khai báo giá cho mặt hàng chưa có giá',
    { tag: ['@user-guide', '@sales', '@sales-price'] },
    async ({ page }, testInfo) => {
      const price = new CatalogFormPage(page, '/orders/sales-price-list', /\/orders\/sales-price-details/, /^\W*bán hàng\W*$/i);
      // Chỉ đặt giá cho mặt hàng thử nghiệm (Keo dán theo lô, tạo từ UG-074) — không sửa giá hàng thật.
      const itemKeyword = 'Keo dán theo lô';
      const site = 'Hóc Môn';
      const dialog = page.locator('.p-dialog:visible');
      const visibleRows = page.locator('main table:visible tbody tr');

      let stepNumber = 0;
      let itemName = '';

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Bán hàng > Giá bán', async () => {
        await capture('Chọn module Bán hàng, chức năng Giá bán', price.catalogsMenu);
        await price.openList();
        await capture('Tab Có giá: giá bán, giá vốn, % lợi nhuận, nhóm giá theo từng chi nhánh', price.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Cập nhật lợi nhuận hàng loạt (giới thiệu)', async () => {
        const updateProfit = page.locator('main').getByRole('button', { name: /cập nhật lợi nhuận/i });

        await capture('Các nút cập nhật hàng loạt: giá vốn cho profile, lợi nhuận, nhập Excel', updateProfit);
        await updateProfit.click();
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        await capture('Cập nhật lợi nhuận: chọn Nhóm, phạm vi và Giá trị % rồi Lưu (ở đây chỉ xem, bấm Đóng)', dialog);
        await dialog.getByRole('button', { name: /đóng/i }).click();
        await expect(dialog).toBeHidden({ timeout: 10_000 });
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Tab Không có giá, tìm mặt hàng', async () => {
        await page.getByRole('tab', { name: /không có giá/i }).click();
        await price.keywordInput.fill(itemKeyword);
        await price.keywordInput.press('Enter');

        const row = visibleRows.filter({ hasText: itemKeyword }).filter({ hasText: site }).first();

        await expect(row).toBeVisible({ timeout: 20_000 });
        itemName = (await row.locator('a[href*="sales-price-details"]').innerText()).trim();
        await capture('Tab Không có giá: mặt hàng chưa có giá ở chi nhánh — bấm vào tên để khai báo', row);
        await row.locator('a[href*="sales-price-details"]').click();
        await page.waitForURL(/\/orders\/sales-price-details\//, { timeout: 30_000 });
        await expect(price.saveButton).toBeVisible({ timeout: 20_000 });
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Chọn nhóm giá và nhập giá vốn', async () => {
        await price.selectOption(/^\s*nhóm\s*\*?\s*$/i, 'Nhóm giá VTP');
        await price.fillNumber(/giá vốn mặc định/i, '100000');
        await capture('Chọn Nhóm giá (quyết định % lợi nhuận) và nhập Giá vốn mặc định', price.input(/giá vốn mặc định/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Lưu và xem giá bán', async () => {
        await capture('Bấm Lưu', price.saveButton);
        await price.saveRecord();
        await expect(price.input(/giá bán mặc định/i)).not.toHaveValue(/^0(,00)?$/, { timeout: 20_000 });
        await capture('Giá bán mặc định được tính tự động = giá vốn × (1 + % lợi nhuận của nhóm)', price.input(/giá bán mặc định/i));
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Thiết lập kế hoạch giá (giới thiệu)', async () => {
        await page.getByRole('tab', { name: /thiết lập kế hoạch giá/i }).click();

        const addButton = page.locator('main [role="tabpanel"]').getByRole('button', { name: /thêm/i });

        await expect(addButton).toBeVisible({ timeout: 10_000 });
        await capture('Thiết lập kế hoạch giá: thêm giá/% theo số lượng tối thiểu và khoảng ngày áp dụng', addButton);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Kiểm tra trong tab Có giá', async () => {
        await page.locator('main').getByRole('button', { name: /đóng/i }).first().click();
        await page.waitForURL(/\/orders\/sales-price-list/, { timeout: 30_000 });
        // Danh sách nhớ tab đang chọn trước đó (Không có giá) — chuyển về Có giá.
        await page.getByRole('tab', { name: /^\s*có giá\s*$/i }).click();
        await price.keywordInput.fill(itemName.split(' - ')[0]);
        await price.keywordInput.press('Enter');

        const row = visibleRows.filter({ hasText: itemName.split(' - ')[0] }).filter({ hasText: site }).first();

        await expect(row).toBeVisible({ timeout: 20_000 });
        await capture('Mặt hàng đã chuyển sang tab Có giá với giá bán, giá vốn, % lợi nhuận', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
