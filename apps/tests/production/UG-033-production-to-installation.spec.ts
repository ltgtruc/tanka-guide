import { expect, Locator, test } from '@playwright/test';
import { DeliveryPage } from '../../pages/production/DeliveryPage';
import { ProductionSupervisionPage } from '../../pages/production/ProductionSupervisionPage';
import { ProductProcessPage } from '../../pages/production/ProductProcessPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideProductionToInstallation } from '../../test-data/productionToInstallation.data';

const GUIDE_ID = 'UG-033-production-to-installation';

test.describe('UG-033 - Sản xuất, giao hàng và lắp đặt lệnh SX', () => {
  test(
    'Hướng dẫn xử lý lệnh sản xuất từ Đã mua hàng đến Đã lắp đặt',
    { tag: ['@user-guide', '@production', '@delivery', '@installation'] },
    async ({ page }, testInfo) => {
      const productProcessPage = new ProductProcessPage(page);
      const deliveryPage = new DeliveryPage(page);
      const supervisionPage = new ProductionSupervisionPage(page);
      const data = createGuideProductionToInstallation();

      const today = new Date();
      const yesterday = new Date(today);

      yesterday.setDate(today.getDate() - 1);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      let productionCode = '';
      let salesOrderCode = '';
      let customer = '';

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quản lý sản xuất', async () => {
        await productProcessPage.openProductionManagement();
        await capture('Màn hình Quản lý SX', productProcessPage.productionHeading);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Mở lệnh sản xuất đã mua hàng', async () => {
        productionCode = await productProcessPage.openProductionOrderByStatus('Đã mua hàng');
        ({ salesOrderCode, customer } = await productProcessPage.getSalesOrderInfo());
        console.log(`Lệnh SX: ${productionCode} - Đơn BH: ${salesOrderCode} - Khách hàng: ${customer}`);
        await capture('Mở lệnh sản xuất đang ở trạng thái Đã mua hàng', productProcessPage.currentStatusValue);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chuyển trạng thái sang Đang SX (xuất kho vật tư)', async () => {
        await capture('Chuyển trạng thái sang Đang SX', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(data.inProductionStatus, data.statusNote);
        await productProcessPage.expectCurrentStatus(data.inProductionStatus);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 5 - Chuyển trạng thái sang Đã SX (nhập kho thành phẩm)', async () => {
        await capture('Chuyển trạng thái sang Đã SX', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(data.producedStatus, data.statusNote);
        await productProcessPage.expectCurrentStatus(data.producedStatus);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 6 - Mở Phiếu giao hàng và chọn Tạo mới', async () => {
        await deliveryPage.openDeliveryList();
        await capture('Chọn nút Tạo mới phiếu giao hàng', deliveryPage.createButton);
        await deliveryPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Chọn khách hàng, đơn bán hàng và ngày giao', async () => {
        await deliveryPage.selectCustomer(customer);
        await deliveryPage.selectSalesOrder(salesOrderCode);
        await deliveryPage.selectDeliveryDate(yesterday);
        await capture('Chọn khách hàng, đơn bán hàng và ngày giao hàng', deliveryPage.salesOrderDropdown);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Thêm dòng hàng cần giao', async () => {
        await capture('Bấm Thêm dòng hàng', deliveryPage.addLinesButton);
        await deliveryPage.addAllProductionLines();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Lưu phiếu giao hàng', async () => {
        await capture('Bấm Lưu phiếu giao hàng', deliveryPage.saveButton);
        await deliveryPage.saveDelivery();
        await guidePause(page, 1_200);
      });

      await test.step('Bước 10 - Chuyển phiếu giao hàng sang Đang giao', async () => {
        await capture('Chuyển phiếu sang Đang giao', deliveryPage.statusToggleButton);
        await deliveryPage.changeStatus(data.deliveringDeliveryStatus, data.statusNote);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 11 - Chuyển phiếu giao hàng sang Hoàn thành', async () => {
        await capture('Chuyển phiếu sang Hoàn thành', deliveryPage.statusToggleButton);
        await deliveryPage.changeStatus(data.completedDeliveryStatus, data.statusNote);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 12 - Quay lại lệnh SX, trạng thái đã tự chuyển sang Đã giao hàng', async () => {
        await productProcessPage.openProductionManagement();
        await productProcessPage.openProductionOrder(productionCode);
        await productProcessPage.expectCurrentStatus(data.deliveredStatus);
        await capture('Lệnh SX tự chuyển sang Đã giao hàng', productProcessPage.currentStatusValue);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 13 - Chuyển trạng thái sang Đang lắp đặt', async () => {
        await capture('Chuyển trạng thái sang Đang lắp đặt', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(data.installingStatus, data.statusNote);
        await productProcessPage.expectCurrentStatus(data.installingStatus);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 14 - Chuyển trạng thái sang Đã lắp đặt', async () => {
        await capture('Chuyển trạng thái sang Đã lắp đặt', productProcessPage.statusActionButton);
        await productProcessPage.changeStatus(data.installedStatus, data.statusNote);
        await productProcessPage.expectCurrentStatus(data.installedStatus);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 15 - Mở Giám sát tiến độ SX', async () => {
        await supervisionPage.open();
        await capture('Màn hình Giám sát tiến độ SX', supervisionPage.heading);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 16 - Cập nhật đội sản xuất, đội lắp đặt và đội vệ sinh', async () => {
        await supervisionPage.selectTeam(productionCode, 'Đội SX', data.productionTeam);
        await supervisionPage.selectTeam(productionCode, 'Đội LĐ', data.installationTeam);
        await supervisionPage.selectTeam(productionCode, 'Đội VS', data.cleaningTeam);
        await capture('Chọn Đội SX, Đội LĐ, Đội VS', await supervisionPage.cell(productionCode, 'Đội LĐ'));
        await guidePause(page, 1_000);
      });

      await test.step('Bước 17 - Nhập ngày bắt đầu và hoàn thành vệ sinh', async () => {
        await supervisionPage.selectDate(productionCode, 'Ngày BĐVS', today);
        await supervisionPage.selectDate(productionCode, 'Ngày HTVS', today);
        await capture('Nhập Ngày BĐVS và Ngày HTVS', await supervisionPage.cell(productionCode, 'Ngày HTVS'));
        await guidePause(page, 2_000);
      });
    },
  );
});
