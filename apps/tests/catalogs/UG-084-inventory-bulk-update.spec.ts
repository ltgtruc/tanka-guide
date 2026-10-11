import { expect, Locator, test } from '@playwright/test';
import { InventoryBulkUpdatePage } from '../../pages/catalogs/InventoryBulkUpdatePage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-084-inventory-bulk-update';

/*
 * Chỉ cập nhật 1 mặt hàng test "ITEM-..." do UG-010 tạo (tìm theo từ khóa rồi
 * tích đúng 1 dòng) — không đụng tới vật tư thật. Cần chạy UG-010 ít nhất 1 lần.
 * "Cập nhật thuế suất" áp cho mọi mặt hàng khớp điều kiện nên chỉ giới thiệu.
 */
const KEYWORD = 'ITEM-';

test.describe('UG-084 - Hàng tồn kho: cập nhật hàng loạt', () => {
  test(
    'Hướng dẫn cập nhật hao hụt, quy cách hàng loạt và các công cụ thuế suất, import',
    { tag: ['@user-guide', '@catalogs', '@inventory-bulk'] },
    async ({ page }, testInfo) => {
      const bulk = new InventoryBulkUpdatePage(page);

      let stepNumber = 0;
      let itemCode = '';

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Hàng tồn kho', async () => {
        await bulk.openInventoryList();
        await capture('Thanh công cụ: Xem báo cáo, Cập nhật thuế suất / hao hụt / quy cách, Import', bulk.toolbar);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Mở Cập nhật các loại hao hụt', async () => {
        await capture('Bấm Cập nhật các loại hao hụt', bulk.toolbarButton(/cập nhật các loại hao hụt/i));
        await bulk.openDialog(/cập nhật các loại hao hụt/i);
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Tìm và tích chọn mặt hàng cần cập nhật', async () => {
        itemCode = await bulk.searchAndSelectFirst(KEYWORD);
        console.log(`Mặt hàng cập nhật: ${itemCode}`);
        await capture('Nhập điều kiện, bấm Tìm kiếm, tích các mặt hàng cần cập nhật', bulk.dialog.locator('table'));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Nhập hao hụt và cập nhật', async () => {
        await bulk.fillValues(['5', '3', '2']);
        await capture('Nhập Hao hụt SL (%), Hao hụt giá vốn (%), % bảo hành rồi bấm Cập nhật', bulk.updateButton());
        await bulk.submit();
        await bulk.closeDialog();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Cập nhật quy cách', async () => {
        await bulk.openDialog(/cập nhật quy cách/i);
        await bulk.searchAndSelectFirst(itemCode);
        // Ô số dùng dấu phẩy thập phân (gõ "1.4" sẽ thành 14).
        await bulk.fillValues(['6000', '5800', '300', '1,4', '0', '0,9']);
        await capture('Cập nhật quy cách: chiều dài, chiều dài sử dụng / tận dụng, độ dày, khoảng hở, trọng lượng', bulk.dialog);
        await bulk.submit();
        await bulk.closeDialog();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Giới thiệu Cập nhật thuế suất (không bấm)', async () => {
        await bulk.openDialog(/cập nhật thuế suất/i);
        await capture('Cập nhật thuế suất: áp cho MỌI mặt hàng khớp điều kiện — kiểm tra kỹ trước khi bấm', bulk.dialog);
        await bulk.closeDialog();
        await guidePause(page, 800);
      });

      await test.step('Bước 8 - Giới thiệu Import', async () => {
        await bulk.openDialog(/^\W*import$/i);
        await capture('Import Excel: thả file theo mẫu các cột Mã, Tên, ĐVT, Nhóm, Màu, quy cách...', bulk.dialog);
        await bulk.closeDialog();
        await guidePause(page, 800);
      });

      await test.step('Bước 9 - Kiểm tra trên mặt hàng', async () => {
        const keyword = page
          .locator('.c-component')
          .filter({ has: page.locator('label', { hasText: /từ khóa tìm kiếm/i }) })
          .locator('input')
          .first();

        await keyword.fill(itemCode);
        await keyword.press('Enter');
        await page.locator('main table tbody tr a').filter({ hasText: itemCode }).first().click();
        await page.getByRole('tab', { name: /thông tin quy cách/i }).click();

        const shrinkage = page
          .locator('.c-component')
          .filter({ has: page.locator('label', { hasText: /hao hụt sl/i }) })
          .locator('input')
          .first();

        await expect(shrinkage).toHaveValue(/5/, { timeout: 15_000 });
        await capture(`Tab Thông tin quy cách của ${itemCode} đã có hao hụt mới`, shrinkage);
        await guidePause(page, 2_000);
      });
    },
  );
});
