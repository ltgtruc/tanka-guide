import { expect, Locator, test } from '@playwright/test';
import { NavigationPage } from '../../pages/NavigationPage';
import { ProductionListPage } from '../../pages/production/ProductionListPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideProductionList } from '../../test-data/productionList.data';

const GUIDE_ID = 'UG-030-create-production-list';

test.describe('UG-030 - Tạo đơn theo dõi sản xuất', () => {
  test(
    'Hướng dẫn tạo đơn theo dõi sản xuất',
    { tag: ['@user-guide', '@production'] },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const productionPage = new ProductionListPage(page);

      const production = createGuideProductionList();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i);
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở module Sản xuất', async () => {
        const productionMenu = page.getByRole('link', { name: /sản xuất/i }).first();

        await capture('Chọn module Sản xuất', productionMenu);
        await productionMenu.click();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 3 - Mở Quản lý SX', async () => {
        const productionListMenu = page.getByText(/quản lý sx/i).first();

        await capture('Chọn chức năng Quản lý SX', productionListMenu);
        await productionListMenu.click();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', productionPage.createButton);
        await productionPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Nhập thông tin bắt buộc', async () => {
        await expect(productionPage.siteDropdown).toBeVisible({ timeout: 10_000 });
        await productionPage.siteDropdown.click();
        await page.getByRole('option', { name: production.site, exact: true }).click();
        await guideFill(page, productionPage.descriptionInput, production.description);
        await capture('Chọn chi nhánh và nhập diễn giải', productionPage.descriptionInput);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Chọn các đơn BH', async () => {
        await capture('Chọn các đơn BH để sản xuất', productionPage.chooseSalesOrderButton);
        await productionPage.chooseSalesOrderButton.click();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 7 - Chọn đơn hàng', async () => {
        const { salesOrderCode, checkbox } = await productionPage.newestSalesOrderGroupCheckbox();

        console.log(`Đơn bán hàng được chọn để sản xuất: ${salesOrderCode}`);
        await capture('Tích chọn đơn hàng cần sản xuất', checkbox);
        await checkbox.check();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Xác nhận chọn', async () => {
        await capture('Chọn đơn hàng', productionPage.popupSelectButton);
        await productionPage.popupSelectButton.click();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 9 - Lưu dữ liệu', async () => {
        await capture('Lưu đơn theo dõi sản xuất', productionPage.saveButton);
        await productionPage.save();
        await guidePause(page, 3_000);
      });

      await test.step('Bước 10 - Kiểm tra kết quả', async () => {
        await capture('Trở lại danh sách Quản lý SX', productionPage.backButton);
        await productionPage.backToList();
        await guidePause(page, 2_000);
      });
    },
  );
});
