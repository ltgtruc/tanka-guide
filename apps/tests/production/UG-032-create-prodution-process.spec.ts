import { expect, Locator, test } from '@playwright/test';
import { ProductProcessPage } from '../../pages/production/ProductProcessPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideProductProcess } from '../../test-data/productProcess.data';

const GUIDE_ID = 'UG-032-create-prodution-process';

test.describe('UG-032 - Tối ưu, chuyển trạng thái và tạo đơn mua hàng cho lệnh SX', () => {
  test(
    'Hướng dẫn xử lý một lệnh sản xuất từ Nháp đến Đã mua hàng',
    { tag: ['@user-guide', '@production', '@product-process'] },
    async ({ page }, testInfo) => {
      const productProcessPage = new ProductProcessPage(page);
      const productProcess = createGuideProductProcess();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý sản xuất', async () => {
        await capture('Mở module Sản xuất, chọn Quản lý sản xuất');
        await productProcessPage.openProductionManagement();
        await capture('Màn hình Quản lý SX', productProcessPage.productionHeading);
        await guidePause(page, 1_500);
      });

      let productionCode = '';

      await test.step('Bước 3 - Chọn mã sản xuất có trạng thái Nháp', async () => {
        productionCode = await productProcessPage.openDraftProductionOrder();
        console.log(`Lệnh sản xuất được chọn: ${productionCode}`);
        await capture('Mở lệnh sản xuất đang ở trạng thái Nháp', productProcessPage.currentStatusValue);
        await productProcessPage.expectCurrentStatus('Nháp');
        await guidePause(page, 1_500);
      });

      await test.step('Bước 4 - Mở tab Tối ưu', async () => {
        await capture('Chọn tab Tối ưu', productProcessPage.optimizeTab);
        await productProcessPage.openOptimizeTab();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Nhập Giá bán phế liệu và tính tối ưu, sau đó Lưu', async () => {
        await capture('Nhập Giá bán phế liệu', productProcessPage.scrapPriceInput);
        await guideFill(page, productProcessPage.scrapPriceInput, productProcess.scrapPrice);
        await guidePause(page, 500);

        await capture('Bấm Tính tối ưu', productProcessPage.calculateOptimizeButton);
        await productProcessPage.calculateOptimize();
        await guidePause(page, 1_000);

        /*
         * Nếu muốn thay đổi dữ liệu đã tính, bấm "Làm lại dữ liệu" rồi nhập
         * lại Giá bán phế liệu và bấm "Tính tối ưu" lại — bước này không bắt
         * buộc nên hướng dẫn không thao tác lại ở đây.
         */

        await capture('Bấm Lưu để lưu dữ liệu tối ưu đã tính', productProcessPage.optimizeSaveButton);
        await productProcessPage.saveOptimizeResult();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 6 - Chuyển trạng thái sang Đã duyệt', async () => {
        await capture('Chuyển trạng thái sang Đã duyệt', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(productProcess.approvedStatus, productProcess.statusNote);
        await productProcessPage.expectCurrentStatus(productProcess.approvedStatus);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 7 - Xác nhận chuyển trạng thái Đã duyệt', async () => {
        await capture('Trạng thái đã chuyển sang Đã duyệt', productProcessPage.currentStatusValue);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Chuyển trạng thái sang Đã kế hoạch', async () => {
        await capture('Chuyển trạng thái sang Đã kế hoạch', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(productProcess.plannedStatus, productProcess.statusNote);
        await productProcessPage.expectCurrentStatus(productProcess.plannedStatus);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 9 - Xác nhận chuyển trạng thái Đã kế hoạch', async () => {
        await capture('Trạng thái đã chuyển sang Đã kế hoạch', productProcessPage.currentStatusValue);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 10 - Mở tab Đơn mua hàng và tạo yêu cầu mua hàng', async () => {
        await productProcessPage.openPurchaseOrderTab();
        await capture('Bấm Tạo yêu cầu mua hàng', productProcessPage.createPurchaseRequisitionButton);
        await productProcessPage.startCreatePurchaseRequisition();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 11 - Xác nhận tạo yêu cầu mua hàng', async () => {
        await capture('Bấm Đồng ý để tạo yêu cầu mua hàng', productProcessPage.purchaseRequisitionConfirmButton);
        await productProcessPage.confirmCreatePurchaseRequisition();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 12 - Duyệt yêu cầu mua hàng', async () => {
        await capture('Bấm Duyệt yêu cầu mua hàng', productProcessPage.approveRequisitionButton);
        await productProcessPage.approvePurchaseRequisition();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 13 - Mở màn hình lập đơn mua hàng', async () => {
        await capture('Bấm Lập đơn mua hàng', productProcessPage.convertRequisitionButton);
        await productProcessPage.openConvertRequisition();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 14 - Chọn nhà cung cấp cho từng nhóm vật tư', async () => {
        await capture('Tích chọn các dòng và chọn nhà cung cấp', productProcessPage.supplierBulkDropdown);
        await productProcessPage.applySupplierToAllTabs();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 15 - Lập đơn mua hàng', async () => {
        await capture('Bấm Lập đơn mua hàng để hoàn thành', productProcessPage.convertRequisitionButton);
        await productProcessPage.submitConvertRequisition();
        await guidePause(page, 1_500);
        await capture('Các đơn mua hàng đã được lập từ yêu cầu mua hàng');
      });

      await test.step('Bước 16 - Quay lại lệnh sản xuất', async () => {
        await productProcessPage.backToProductionFromRequisition();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 17 - Chuyển trạng thái sang Đã mua hàng', async () => {
        await capture('Chuyển trạng thái sang Đã mua hàng', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(productProcess.purchasedStatus, productProcess.statusNote);
        await productProcessPage.expectCurrentStatus(productProcess.purchasedStatus);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 18 - Xác nhận chuyển trạng thái Đã mua hàng', async () => {
        await capture('Trạng thái đã chuyển sang Đã mua hàng', productProcessPage.currentStatusValue);
        await guidePause(page, 1_000);
      });
    },
  );
});
