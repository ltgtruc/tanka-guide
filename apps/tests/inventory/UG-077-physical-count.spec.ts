import { expect, Locator, test } from '@playwright/test';
import { PhysicalCountPage } from '../../pages/inventory/PhysicalCountPage';
import { StockBalancePage } from '../../pages/inventory/StockBalancePage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-077-physical-count';

/*
 * Kiểm kê từng phần mặt hàng C3300-XW-X-1.8 ở kho 01-PR, giả lập đếm thừa
 * 1.000 mm so với sổ sách → đối chiếu sinh phiếu Điều chỉnh tăng (chạy lặp
 * lại chỉ làm tồn tăng, không hụt). Bắt đầu kiểm kê sẽ KHOÁ sổ mặt hàng đến
 * khi đối chiếu, nên guide phải đi hết tới bước đối chiếu.
 */
const WAREHOUSE = '01-PR';
const ITEM_CODE = 'C3300-XW-X-1.8';
const EXTRA_COUNTED = 1000;

test.describe('UG-077 - Kiểm kê', () => {
  test(
    'Hướng dẫn kiểm kê từng phần: tạo phiếu, đếm, duyệt và đối chiếu điều chỉnh tồn kho',
    { tag: ['@user-guide', '@inventory', '@physical-count'] },
    async ({ page }, testInfo) => {
      const countPage = new PhysicalCountPage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      // Đọc số tồn sổ sách ở tab phụ (không nằm trong video hướng dẫn) để nhập
      // số đếm "thừa 1.000" — khi đếm thật, nhân viên nhập số đếm thực tế.
      const bookQuantity = await (async () => {
        const helperPage = await page.context().newPage();
        const balancePage = new StockBalancePage(helperPage);

        await helperPage.goto('/inventories/stock-balance-list');
        await balancePage.filterByItem(ITEM_CODE);
        await balancePage.filterByWarehouse(WAREHOUSE);

        const text = await balancePage.itemRow(ITEM_CODE).locator('td').nth(5).innerText();

        await helperPage.close();

        return Number(text.replace(/\./g, '').replace(',', '.'));
      })();

      const countedQuantity = String(bookQuantity + EXTRA_COUNTED);

      console.log(`Sổ sách ${bookQuantity}, nhập số đếm ${countedQuantity}`);

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý kho > Kiểm kê', async () => {
        await expect(countPage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Kiểm kê', countPage.inventoryMenu);
        await countPage.openCountList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', countPage.createButton);
        await countPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn loại kiểm kê, kho và ghi chú', async () => {
        await countPage.selectWarehouse(WAREHOUSE);
        await guideFill(page, countPage.noteInput, `Kiểm kê định kỳ nối khung - hướng dẫn ${Date.now()}`);
        await capture('Loại kiểm kê Từng phần, chọn kho và nhập ghi chú', countPage.countTypeDropdown);
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Chọn phạm vi mặt hàng', async () => {
        await countPage.selectScopeItem(ITEM_CODE);
        await capture('Phạm vi kiểm kê: chọn mặt hàng cần đếm', countPage.itemMultiSelect);
        await guidePause(page, 800);
      });

      let countCode = '';

      await test.step('Bước 6 - Lưu phiếu kiểm kê', async () => {
        await capture('Bấm Lưu', countPage.saveButton);
        countCode = await countPage.saveCount();
        console.log(`Phiếu kiểm kê: ${countCode}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Bắt đầu kiểm kê', async () => {
        await capture('Bấm Bắt đầu kiểm kê (khoá sổ mặt hàng, tạo thẻ đếm)', countPage.startCountButton);
        await countPage.startCounting();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Nhập số lượng đếm thực tế', async () => {
        await countPage.enterCount(ITEM_CODE, countedQuantity);
        await capture('Nhập SL đếm thực tế cho từng thẻ (không hiện SL sổ sách)', countPage.tagRow(ITEM_CODE));
        await guidePause(page, 800);
      });

      await test.step('Bước 9 - Lưu số đếm', async () => {
        await capture('Bấm Lưu số đếm', countPage.saveCountsButton);
        await countPage.saveCounts();
        await guidePause(page, 800);
      });

      await test.step('Bước 10 - Chuyển duyệt', async () => {
        await capture('Bấm Chuyển duyệt', countPage.submitReviewButton);
        await countPage.submitForReview();
        await capture('Màn hình duyệt: SL sổ sách, SL đếm, chênh lệch, giá trị chênh lệch', countPage.tagRow(ITEM_CODE));
        await guidePause(page, 1_200);
      });

      await test.step('Bước 11 - Đối chiếu và điều chỉnh', async () => {
        await capture('Bấm Đối chiếu & điều chỉnh (hoặc Đếm lại nếu cần)', countPage.reconcileButton);

        const adjustmentCode = await countPage.reconcile();

        console.log(`Phiếu điều chỉnh: ${adjustmentCode}`);
        await capture(`Hệ thống tạo phiếu điều chỉnh ${adjustmentCode} và mở khoá sổ`, countPage.adjustmentLink);
        await guidePause(page, 2_000);
      });
    },
  );
});
