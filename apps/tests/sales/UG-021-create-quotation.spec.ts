import { expect, Locator, test } from '@playwright/test';
import { QuotationPage } from '../../pages/sales/QuotationPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideQuotation } from '../../test-data/quotation.data';

const GUIDE_ID = 'UG-021-create-quotation';

test.describe('UG-021 - Tạo báo giá', () => {
  test(
    'Hướng dẫn tạo báo giá mới',
    { tag: ['@user-guide', '@sales', '@quotation'] },
    async ({ page }, testInfo) => {
      const quotationPage = new QuotationPage(page);
      const quotation = createGuideQuotation();

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

      await test.step('Bước 3 - Mở chức năng Báo giá', async () => {
        const quotationMenu = page.getByText(/^báo giá$/i).first();

        await expect(quotationMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn chức năng Báo giá', quotationMenu);
        await quotationMenu.click();
        await quotationPage.verifyPageOpened();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await expect(quotationPage.createButton).toBeVisible({ timeout: 15_000 });
        await expect(quotationPage.createButton).toBeEnabled({ timeout: 15_000 });
        await capture('Chọn nút Tạo mới', quotationPage.createButton);
        await quotationPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Chọn thông tin bắt buộc', async () => {
        await capture('Chọn các thông tin bắt buộc', quotationPage.customerDropdown);

        const selectedCustomer = await quotationPage.selectDropdownOption(
          quotationPage.customerDropdown,
          quotation.customer,
        );

        console.log(`Khách hàng đã chọn: ${selectedCustomer}`);
        await guidePause(page, 700);

        const selectedWarehouse = await quotationPage.selectDropdownOption(
          quotationPage.warehouseDropdown,
          quotation.warehouse,
        );

        console.log(`Kho hàng đã chọn: ${selectedWarehouse}`);
        await guidePause(page, 700);

        const selectedQuotationEmployee = await quotationPage.selectDropdownOption(
          quotationPage.quotationEmployeeDropdown,
          quotation.quotationEmployee,
        );

        console.log(`Nhân viên BG đã chọn: ${selectedQuotationEmployee}`);
        await guidePause(page, 700);

        const selectedSalesEmployee = await quotationPage.selectDropdownOption(
          quotationPage.salesEmployeeDropdown,
          quotation.salesEmployee,
        );

        console.log(`Nhân viên kinh doanh đã chọn: ${selectedSalesEmployee}`);
        await guidePause(page, 700);

        const selectedDesignerEmployee = await quotationPage.selectDropdownOption(
          quotationPage.designerEmployeeDropdown,
          quotation.designerEmployee,
        );

        console.log(`Nhân viên thiết kế đã chọn: ${selectedDesignerEmployee}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Thêm và cấu hình dòng HTK', async () => {
        await expect(quotationPage.addButton).toBeVisible({ timeout: 20_000 });
        await expect(quotationPage.addButton).toBeEnabled({ timeout: 15_000 });
        await capture('Chọn nút Thêm', quotationPage.addButton);

        const newRow = await quotationPage.addNewLineItem();

        await guidePause(page, 1_000);
        await quotationPage.openInventoryDropdown(newRow);
        await guidePause(page, 500);

        const selectedInventory = await quotationPage.searchAndSelectInventory(quotation.lineItem.inventorySearch);

        console.log(`HTK đã chọn: ${selectedInventory}`);
        await guidePause(page, 1_000);
        await quotationPage.fillDrawingCode(quotation.lineItem.drawingCode);
        await guidePause(page, 700);
        await quotationPage.selectGlass(quotation.lineItem.glass);
        await guidePause(page, 1_000);
        await quotationPage.reviewAttributeOptions();
        await guidePause(page, 1_000);
        await quotationPage.updateItemDetails();
        await guidePause(page, 1_000);
        await quotationPage.closeItemDetails();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 7 - Lưu báo giá', async () => {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        await guidePause(page, 1_500);
        await expect(quotationPage.saveButton).toBeVisible({ timeout: 20_000 });
        await expect(quotationPage.saveButton).toBeEnabled({ timeout: 15_000 });
        await quotationPage.saveButton.scrollIntoViewIfNeeded();
        await capture('Chọn nút Lưu', quotationPage.saveButton);
        await quotationPage.saveButton.click();
        await guidePause(page, 3_000);
      });

      await test.step('Bước 8 - Trở lại danh sách', async () => {
        await expect(quotationPage.backButton).toBeVisible({ timeout: 15_000 });
        await capture('Trở lại danh sách báo giá', quotationPage.backButton);
        await quotationPage.backToQuotationList();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 9 - Kiểm tra báo giá vừa tạo', async () => {
        await expect(page).toHaveURL(/sales-quote-list|sales-order-list/i, { timeout: 30_000 });

        const listHeading = page.getByText(/báo giá|đơn bán hàng/i).first();

        await expect(listHeading).toBeVisible({ timeout: 15_000 });
        await capture('Kiểm tra báo giá vừa tạo');
        await guidePause(page, 2_000);
      });
    },
  );
});
