import { expect, Locator, test } from '@playwright/test';
import { ProductProcessPage } from '../../pages/production/ProductProcessPage';
import { PurchaseOrderPage } from '../../pages/purchasing/PurchaseOrderPage';
import { PurchaseReceiptPage } from '../../pages/purchasing/PurchaseReceiptPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuidePurchaseReceipt } from '../../test-data/purchaseReceipt.data';

const GUIDE_ID = 'UG-041-receipt-return-reverse';

test.describe('UG-041 - Phiếu nhận hàng: nhận ngoài đơn, trả hàng NCC và đảo phiếu', () => {
  test(
    'Hướng dẫn nhận hàng ngoài đơn, trả hàng cho nhà cung cấp và đảo phiếu đã ghi sổ',
    { tag: ['@user-guide', '@purchasing', '@purchase-receipt'] },
    async ({ page }, testInfo) => {
      const receiptPage = new PurchaseReceiptPage(page);
      const purchaseOrderPage = new PurchaseOrderPage(page);
      const productProcessPage = new ProductProcessPage(page);
      const data = createGuidePurchaseReceipt();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      // ===== Phần A: Nhận hàng ngoài đơn =====

      await test.step('Bước 2 - Mở danh sách Phiếu nhận hàng', async () => {
        await expect(receiptPage.purchasingMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Mua hàng, chức năng Phiếu nhận hàng', receiptPage.purchasingMenu);
        await receiptPage.openReceiptList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', receiptPage.createButton);
        await receiptPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn nhà cung cấp, kho nhận và nhập ghi chú', async () => {
        await receiptPage.selectSupplier(data.supplier);
        await receiptPage.selectWarehouse(data.warehouse);
        await guideFill(page, receiptPage.noteInput, data.note);
        await capture('Chọn nhà cung cấp, kho nhận và nhập ghi chú', receiptPage.warehouseDropdown);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Thêm mặt hàng ngoài đơn', async () => {
        await capture('Bấm Thêm mặt hàng khác', receiptPage.addOtherItemButton);
        await receiptPage.addOtherItem(data.otherItem);
        await guidePause(page, 1_000);
      });

      let receiptCode = '';

      await test.step('Bước 6 - Lưu phiếu nhận hàng', async () => {
        await capture('Chọn mặt hàng, ĐVT, số lượng, thành tiền rồi bấm Lưu', receiptPage.saveButton);
        receiptCode = await receiptPage.saveReceipt();
        console.log(`Phiếu nhận hàng ngoài đơn: ${receiptCode}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Ghi sổ phiếu nhận hàng', async () => {
        await capture('Bấm Ghi sổ để nhập kho', receiptPage.postButton);
        await receiptPage.post();
        await capture('Phiếu nhận hàng đã ghi sổ', receiptPage.statusField);
        await guidePause(page, 1_200);
      });

      // ===== Phần B: Trả hàng nhà cung cấp =====

      let orderCode = '';

      await test.step('Bước 8 - Mở lệnh sản xuất có đơn mua hàng đã nhận', async () => {
        await productProcessPage.openProductionManagement();

        const productionCode = await productProcessPage.openNewestProductionOrderAfterPurchase();

        console.log(`Lệnh SX: ${productionCode}`);
        await productProcessPage.openPurchaseOrdersTab();
        await capture('Mở lệnh SX, chọn tab Đơn mua hàng', productProcessPage.purchaseOrderTab);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Mở đơn mua hàng cần trả hàng', async () => {
        const orderLink = productProcessPage.purchaseOrderLinkBySupplier(data.supplier);

        await expect(orderLink, `Lệnh SX không có đơn mua hàng của ${data.supplier}`).toBeVisible({ timeout: 15_000 });
        orderCode = (await orderLink.innerText()).replace(/\s+/g, '');
        console.log(`Đơn mua hàng dùng để trả hàng: ${orderCode}`);
        await capture(`Bấm vào đơn mua hàng ${orderCode}`, orderLink);
        await orderLink.click();
        await purchaseOrderPage.waitForOrderOpened();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 10 - Bấm Trả hàng NCC', async () => {
        await purchaseOrderPage.returnToSupplierButton.scrollIntoViewIfNeeded();
        await capture('Bấm Trả hàng NCC', purchaseOrderPage.returnToSupplierButton);
        await purchaseOrderPage.openReturnForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 11 - Chọn dòng trả, số lượng, giá trị và lý do trả', async () => {
        await receiptPage.prepareReturnLine(data.returnLine);
        await guideFill(page, receiptPage.noteInput, data.returnNote);
        await capture('Giữ dòng cần trả, nhập số lượng, giá trị, lý do trả', receiptPage.lineRows.first());
        await guidePause(page, 1_000);
      });

      let returnCode = '';

      await test.step('Bước 12 - Lưu phiếu trả hàng', async () => {
        await capture('Bấm Lưu phiếu trả hàng', receiptPage.saveButton);
        returnCode = await receiptPage.saveReceipt();
        console.log(`Phiếu trả hàng NCC: ${returnCode}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 13 - Xuất trả hàng cho nhà cung cấp', async () => {
        await capture('Bấm Xuất trả', receiptPage.postButton);
        await receiptPage.post();
        await capture('Phiếu trả hàng đã ghi sổ, tồn kho giảm', receiptPage.statusField);
        await guidePause(page, 1_200);
      });

      // ===== Phần C: Đảo phiếu đã ghi sổ =====

      await test.step('Bước 14 - Đảo phiếu trả hàng', async () => {
        await capture('Bấm Đảo phiếu khi cần hủy phiếu đã ghi sổ', receiptPage.reverseButton);
        await receiptPage.reverse();
        await guidePause(page, 1_200);
      });

      await test.step('Bước 15 - Kiểm tra kết quả', async () => {
        await capture('Phiếu chuyển sang Đã đảo, có link phiếu kho đảo', receiptPage.statusField);
        await guidePause(page, 2_000);
      });
    },
  );
});
