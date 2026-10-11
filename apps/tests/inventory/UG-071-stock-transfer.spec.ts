import { expect, Locator, test } from '@playwright/test';
import { InventoryDocumentPage } from '../../pages/inventory/InventoryDocumentPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideStockTransfer } from '../../test-data/inventoryDocument.data';

const GUIDE_ID = 'UG-071-stock-transfer';

test.describe('UG-071 - Chuyển kho', () => {
  test(
    'Hướng dẫn chuyển hàng giữa hai kho và nhận hàng tại kho nhận',
    { tag: ['@user-guide', '@inventory', '@stock-transfer'] },
    async ({ page }, testInfo) => {
      const documentPage = new InventoryDocumentPage(page);
      const data = createGuideStockTransfer();

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

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', documentPage.createButton);
        await documentPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn loại Chuyển kho, kho đi và kho nhận', async () => {
        await documentPage.selectType(data.type);
        await documentPage.selectWarehouse(data.fromWarehouse);
        await documentPage.selectCounterpart(data.counterpart);
        await documentPage.selectReceivingWarehouse(data.toWarehouse);
        await guideFill(page, documentPage.noteInput, data.note);
        await capture('Chọn loại Chuyển kho, kho đi, điểm đối ứng, kho nhận', documentPage.receivingWarehouseDropdown);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Thêm hàng cần chuyển', async () => {
        await capture('Bấm Thêm để thêm dòng hàng', documentPage.addLineButton);
        await documentPage.addLine(data.line);
        await capture('Chọn mặt hàng và số lượng chuyển', documentPage.lineRows.last());
        await guidePause(page, 1_000);
      });

      let transferCode = '';

      await test.step('Bước 6 - Lưu phiếu chuyển kho', async () => {
        await capture('Bấm Lưu', documentPage.saveButton);
        transferCode = await documentPage.saveDocument();
        console.log(`Phiếu chuyển kho: ${transferCode}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Ghi sổ phiếu chuyển kho (xuất khỏi kho đi)', async () => {
        await documentPage.postButton.click();
        await expect(documentPage.transferPostDialog).toBeVisible({ timeout: 15_000 });
        await capture('Hộp thoại Ghi sổ phiếu chuyển kho, tùy chọn Nhận ngay', documentPage.transferPostDialog);
        await documentPage.transferPostDialog.getByRole('button', { name: /đóng/i }).click();
        await documentPage.postTransfer(false);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 8 - Hàng đang chuyển, chưa nhận', async () => {
        await documentPage.receiptSection.scrollIntoViewIfNeeded();
        await capture('Hàng đang chuyển: SL đang chuyển, chưa có phiếu nhận', documentPage.receiveButton);
        await guidePause(page, 1_000);
      });

      let receiptCode = '';

      await test.step('Bước 9 - Nhận hàng tại kho nhận', async () => {
        await documentPage.receiveButton.click();
        await expect(documentPage.transferReceiveDialog).toBeVisible({ timeout: 15_000 });
        await capture('Hộp thoại Nhận hàng chuyển kho: kho nhận, ngày, SL nhận', documentPage.transferReceiveDialog);
        await documentPage.transferReceiveDialog.getByRole('button', { name: /đóng/i }).click();
        receiptCode = await documentPage.receiveTransfer(data.receiveNote);
        console.log(`Phiếu nhận chuyển kho: ${receiptCode}`);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 10 - Kiểm tra kết quả', async () => {
        const receiptLink = documentPage.documentLink(receiptCode);

        await expect(receiptLink).toBeVisible({ timeout: 20_000 });
        await receiptLink.scrollIntoViewIfNeeded();
        await capture(`Đã nhận đủ, phiếu nhận ${receiptCode} hiển thị ở mục Phiếu nhận`, receiptLink);
        await guidePause(page, 2_000);
      });
    },
  );
});
