import { expect, Locator, test } from '@playwright/test';
import { SalesOrderPage } from '../../pages/sales/SalesOrderPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideSalesOrder } from '../../test-data/saleOrder.data';

const GUIDE_ID = 'UG-022-create-sales-order';

test.describe('UG-022 - Tạo đơn bán hàng', () => {
  test(
    'Hướng dẫn tạo đơn bán hàng mới',
    { tag: ['@user-guide', '@sales', '@sales-order'] },
    async ({ page }, testInfo) => {
      const salesOrderPage = new SalesOrderPage(page);
      const salesOrder = createGuideSalesOrder();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở module Bán hàng', async () => {
        const salesMenu = page.getByRole('link', { name: /bán hàng/i }).first();

        await expect(salesMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Bán hàng', salesMenu);
        await salesMenu.click();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 3 - Mở chức năng Đơn bán hàng', async () => {
        const salesOrderMenu = page.getByText(/^đơn bán hàng$/i).first();

        await expect(salesOrderMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn chức năng Đơn bán hàng', salesOrderMenu);
        await salesOrderMenu.click();
        await salesOrderPage.verifyPageOpened();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await expect(salesOrderPage.createButton).toBeVisible({ timeout: 15_000 });
        await expect(salesOrderPage.createButton).toBeEnabled({ timeout: 15_000 });
        await capture('Chọn nút Tạo mới', salesOrderPage.createButton);
        await salesOrderPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Chọn thông tin bắt buộc', async () => {
        await capture('Chọn các thông tin bắt buộc', salesOrderPage.customerDropdown);

        const selectedCustomer = await salesOrderPage.selectDropdownOption(
          salesOrderPage.customerDropdown,
          salesOrder.customer,
        );

        console.log(`Khách hàng đã chọn: ${selectedCustomer}`);
        await guidePause(page, 700);

        const selectedWarehouse = await salesOrderPage.selectDropdownOption(
          salesOrderPage.warehouseDropdown,
          salesOrder.warehouse,
        );

        console.log(`Kho hàng đã chọn: ${selectedWarehouse}`);
        await guidePause(page, 700);

        const selectedQuotationEmployee = await salesOrderPage.selectDropdownOption(
          salesOrderPage.quotationEmployeeDropdown,
          salesOrder.quotationEmployee,
        );

        console.log(`Nhân viên BG đã chọn: ${selectedQuotationEmployee}`);
        await guidePause(page, 700);

        const selectedSalesEmployee = await salesOrderPage.selectDropdownOption(
          salesOrderPage.salesEmployeeDropdown,
          salesOrder.salesEmployee,
        );

        console.log(`Nhân viên BH đã chọn: ${selectedSalesEmployee}`);
        await guidePause(page, 700);

        const selectedDesignerEmployee = await salesOrderPage.selectDropdownOption(
          salesOrderPage.designerEmployeeDropdown,
          salesOrder.designerEmployee,
        );

        console.log(`Nhân viên thiết kế đã chọn: ${selectedDesignerEmployee}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Thêm và cấu hình dòng HTK', async () => {
        await expect(salesOrderPage.addButton).toBeVisible({ timeout: 20_000 });
        await expect(salesOrderPage.addButton).toBeEnabled({ timeout: 15_000 });
        await capture('Chọn nút Thêm', salesOrderPage.addButton);

        const newRow = await salesOrderPage.addNewLineItem();

        await guidePause(page, 1_000);
        await salesOrderPage.openInventoryDropdown(newRow);
        await guidePause(page, 500);

        const selectedInventory = await salesOrderPage.searchAndSelectInventory(salesOrder.lineItem.inventorySearch);

        console.log(`HTK đã chọn: ${selectedInventory}`);
        await guidePause(page, 1_000);
        await salesOrderPage.fillDrawingCode(salesOrder.lineItem.drawingCode);
        await guidePause(page, 700);

        const selectedGlass = await salesOrderPage.selectGlass(salesOrder.lineItem.glass);

        console.log(`Kính đã chọn: ${selectedGlass}`);
        await guidePause(page, 1_000);
        await salesOrderPage.reviewAttributeOptions();
        await guidePause(page, 1_000);
        await salesOrderPage.updateItemDetails();
        await guidePause(page, 1_000);
        await salesOrderPage.closeItemDetails();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 7 - Lưu đơn bán hàng', async () => {
        await salesOrderPage.scrollToTop();
        await expect(salesOrderPage.saveButton).toBeVisible({ timeout: 20_000 });
        await expect(salesOrderPage.saveButton).toBeEnabled({ timeout: 15_000 });
        await salesOrderPage.saveButton.scrollIntoViewIfNeeded();
        await capture('Chọn nút Lưu', salesOrderPage.saveButton);
        await salesOrderPage.saveButton.click();
        await guidePause(page, 3_000);
      });

      await test.step('Bước 8 - Trở lại danh sách', async () => {
        await expect(salesOrderPage.backButton).toBeVisible({ timeout: 15_000 });
        await capture('Trở lại danh sách đơn bán hàng', salesOrderPage.backButton);
        await salesOrderPage.backToSalesOrderList();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 9 - Kiểm tra đơn bán hàng vừa tạo', async () => {
        await expect(page).toHaveURL(/sales-order-list|orders\/sales-order(?!-details)/i, { timeout: 30_000 });

        const listHeading = page.getByText(/đơn bán hàng/i).first();

        await expect(listHeading).toBeVisible({ timeout: 15_000 });
        await capture('Kiểm tra đơn bán hàng vừa tạo');
        await guidePause(page, 2_000);
      });
    },
  );
});
