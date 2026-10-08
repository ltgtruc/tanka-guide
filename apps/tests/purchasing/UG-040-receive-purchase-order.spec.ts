import { expect, Locator, test } from '@playwright/test';
import { PurchaseOrderPage } from '../../pages/purchasing/PurchaseOrderPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-040-receive-purchase-order';

test.describe('UG-040 - Duyệt đơn mua hàng và nhận hàng nhập kho', () => {
  test(
    'Hướng dẫn duyệt các đơn mua hàng của lệnh SX và ghi sổ phiếu nhận hàng',
    { tag: ['@user-guide', '@purchasing', '@purchase-receipt'] },
    async ({ page }, testInfo) => {
      const purchaseOrderPage = new PurchaseOrderPage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở danh sách Đơn mua hàng', async () => {
        await expect(purchaseOrderPage.purchasingMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Mua hàng, chức năng Đơn mua hàng', purchaseOrderPage.purchasingMenu);
        await purchaseOrderPage.openPurchaseOrderList();
        await guidePause(page, 1_500);
      });

      let orderCodes: string[] = [];

      await test.step('Bước 3 - Xác định các đơn mua hàng nháp của lệnh SX', async () => {
        const productionCode = await purchaseOrderPage.getNewestDraftProductionCode();

        orderCodes = await purchaseOrderPage.getDraftOrderCodes(productionCode);
        console.log(`Lệnh SX ${productionCode} có các đơn mua hàng nháp: ${orderCodes.join(', ')}`);
        expect(orderCodes.length).toBeGreaterThan(0);
        await capture(`Các đơn mua hàng nháp của lệnh ${productionCode}`, purchaseOrderPage.orderLink(orderCodes[0]));
        await guidePause(page, 1_000);
      });

      for (const [index, orderCode] of orderCodes.entries()) {
        await test.step(`Bước 4.${index + 1} - Mở và duyệt đơn mua hàng ${orderCode}`, async () => {
          if (index > 0) {
            await purchaseOrderPage.openPurchaseOrderList();
          }

          await capture(`Mở đơn mua hàng ${orderCode}`, purchaseOrderPage.orderLink(orderCode));
          await purchaseOrderPage.openOrder(orderCode);
          await guidePause(page, 1_000);

          await capture(`Chuyển trạng thái đơn ${orderCode} sang Đã duyệt`, purchaseOrderPage.statusToggleButton);
          await purchaseOrderPage.approveOrder();
          await guidePause(page, 1_200);
        });

        const receiptCodes = await purchaseOrderPage.getReceiptCodes();

        for (const receiptCode of receiptCodes) {
          await test.step(`Bước 5.${index + 1} - Ghi sổ phiếu nhận hàng ${receiptCode}`, async () => {
            await capture(`Mở phiếu nhận hàng ${receiptCode}`, purchaseOrderPage.receiptLinkByCode(receiptCode));
            await purchaseOrderPage.openReceipt(receiptCode);
            await guidePause(page, 1_000);

            await capture(`Bấm Ghi sổ để nhập kho ${receiptCode}`, purchaseOrderPage.postReceiptButton);
            await purchaseOrderPage.postReceipt();
            await guidePause(page, 1_200);

            await purchaseOrderPage.backToOrderFromReceipt(orderCode);
          });
        }
      }

      await test.step('Bước 6 - Kiểm tra kết quả nhận hàng', async () => {
        await capture('Đơn mua hàng đã duyệt và nhận hàng vào kho', purchaseOrderPage.statusValue);
        await guidePause(page, 2_000);
      });
    },
  );
});
