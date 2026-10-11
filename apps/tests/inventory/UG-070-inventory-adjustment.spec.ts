import { expect, Locator, test } from '@playwright/test';
import { InventoryDocumentPage } from '../../pages/inventory/InventoryDocumentPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideInventoryAdjustment } from '../../test-data/inventoryDocument.data';

const GUIDE_ID = 'UG-070-inventory-adjustment';

test.describe('UG-070 - Phiếu kho: tạo phiếu điều chỉnh tồn kho', () => {
  test(
    'Hướng dẫn xem danh sách phiếu kho và tạo, ghi sổ phiếu điều chỉnh',
    { tag: ['@user-guide', '@inventory', '@inventory-document'] },
    async ({ page }, testInfo) => {
      const documentPage = new InventoryDocumentPage(page);
      const data = createGuideInventoryAdjustment();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý kho > Phiếu kho', async () => {
        await expect(documentPage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Phiếu kho', documentPage.inventoryMenu);
        await documentPage.openDocumentList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Xem danh sách phiếu kho', async () => {
        await capture('Danh sách phiếu kho và các bộ lọc', documentPage.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', documentPage.createButton);
        await documentPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Chọn loại phiếu, kho, điểm đối ứng', async () => {
        await documentPage.selectType(data.type);
        await documentPage.selectWarehouse(data.warehouse);
        await documentPage.selectCounterpart(data.counterpart);
        await guideFill(page, documentPage.noteInput, data.note);
        await capture('Chọn loại phiếu Điều chỉnh, kho, điểm đối ứng và nhập ghi chú', documentPage.typeDropdown);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Thêm dòng điều chỉnh', async () => {
        await capture('Bấm Thêm để thêm dòng hàng', documentPage.addLineButton);
        await documentPage.addLine(data.line);
        await capture('Chọn chiều Nhập, mặt hàng, số lượng, đơn giá và lý do', documentPage.lineRows.last());
        await guidePause(page, 1_000);
      });

      let documentCode = '';

      await test.step('Bước 7 - Lưu phiếu', async () => {
        await capture('Bấm Lưu', documentPage.saveButton);
        documentCode = await documentPage.saveDocument();
        console.log(`Phiếu điều chỉnh: ${documentCode}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Ghi sổ phiếu', async () => {
        await capture('Bấm Ghi sổ để cập nhật tồn kho', documentPage.postButton);
        await documentPage.post();
        await capture('Phiếu đã ghi sổ, chỉ còn nút Xuất phiếu đảo', documentPage.reverseButton);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 9 - Trở lại danh sách và kiểm tra', async () => {
        await documentPage.backToList();
        await page.waitForURL(/inventory-document-list/i, { timeout: 30_000 });
        await expect(documentPage.documentLink(documentCode)).toBeVisible({ timeout: 20_000 });
        await capture(`Phiếu ${documentCode} hiển thị Đã ghi sổ trong danh sách`, documentPage.documentLink(documentCode));
        await guidePause(page, 2_000);
      });
    },
  );
});
