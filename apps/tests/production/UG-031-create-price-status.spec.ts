import { expect, Locator, test } from '@playwright/test';
import { PriceStatusPage } from '../../pages/production/PriceStatusPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuidePriceStatus } from '../../test-data/priceStatus.data';

const GUIDE_ID = 'UG-031-create-price-status';

test.describe('UG-031 - Chuyển trạng thái đơn bán hàng đến Đã yêu cầu SX', () => {
  test(
    'Hướng dẫn yêu cầu sản xuất từ đơn bán hàng',
    { tag: ['@user-guide', '@sales', '@production', '@price-status'] },
    async ({ page }, testInfo) => {
      const priceStatusPage = new PriceStatusPage(page);
      const priceStatus = createGuidePriceStatus();

      let salesOrderCode = priceStatus.salesOrderCode;
      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở danh sách Đơn bán hàng', async () => {
        await priceStatusPage.openSalesOrderList();
        await capture('Mở danh sách Đơn bán hàng', priceStatusPage.salesOrderListHeading);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 3 - Mở đơn bán hàng mới tạo', async () => {
        salesOrderCode = await priceStatusPage.openNewestDraftSalesOrder(salesOrderCode);
        console.log(`Đơn bán hàng được chọn: ${salesOrderCode}`);
        await capture('Mở đơn bán hàng mới tạo', priceStatusPage.currentStatus);
        await priceStatusPage.expectCurrentStatus('Nháp');
        await guidePause(page, 1_500);
      });

      await test.step('Bước 4 - Chuyển trạng thái sang Đã gửi', async () => {
        await capture('Chuyển trạng thái sang Đã gửi', priceStatusPage.statusActionButton);
        await priceStatusPage.changeStatus(priceStatus.sentStatus, priceStatus.statusNote);
        await priceStatusPage.expectCurrentStatus(priceStatus.sentStatus);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 5 - Chuyển trạng thái sang Đã duyệt', async () => {
        await capture('Chuyển trạng thái sang Đã duyệt', priceStatusPage.statusActionButton);
        await priceStatusPage.changeStatus(priceStatus.approvedStatus, priceStatus.statusNote);
        await priceStatusPage.expectCurrentStatus(priceStatus.approvedStatus);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 6 - Chuyển trạng thái sang Đã yêu cầu SX', async () => {
        await capture('Chuyển trạng thái sang Đã yêu cầu SX', priceStatusPage.statusActionButton);
        await priceStatusPage.changeStatus(priceStatus.productionRequestedStatus, priceStatus.statusNote);
        await priceStatusPage.expectCurrentStatus(priceStatus.productionRequestedStatus);
        await guidePause(page, 1_500);
      });
    },
  );
});
