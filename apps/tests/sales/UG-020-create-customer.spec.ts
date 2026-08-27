import { expect, Locator, test } from '@playwright/test';
import { CustomerPage } from '../../pages/sales/CustomerPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { waitVisible } from '../../helpers/action.helper';
import { createGuideCustomer } from '../../test-data/customer.data';

const GUIDE_ID = 'UG-020-create-customer';

test.describe('UG-020 - Tạo khách hàng', () => {
  test(
    'Hướng dẫn tạo khách hàng mới',
    { tag: ['@user-guide', '@sales', '@customer'] },
    async ({ page }, testInfo) => {
      const customerPage = new CustomerPage(page);

      const customer = createGuideCustomer();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i);
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở module Bán hàng', async () => {
        const salesMenu = page.getByRole('link', { name: /bán hàng/i }).first();

        await waitVisible(salesMenu);
        await capture('Chọn module Bán hàng', salesMenu);
        await salesMenu.click();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 3 - Mở chức năng Khách hàng', async () => {
        const customerMenu = page.getByText(/khách hàng/i).first();
        await waitVisible(customerMenu);
        await capture('Chọn chức năng Khách hàng', customerMenu);
        await customerMenu.click();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await waitVisible(customerPage.createButton);
        await capture('Chọn nút Tạo mới', customerPage.createButton);
        await customerPage.openCreateForm();
        await waitVisible(customerPage.nameInput);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Nhập tên khách hàng', async () => {
        await waitVisible(customerPage.nameInput);
        await guideFill(page, customerPage.nameInput, customer.name);
        await capture('Nhập tên khách hàng', customerPage.nameInput);
        await guidePause(page, 500);
      });

      await test.step('Bước 6 - Nhập Email', async () => {
        await waitVisible(customerPage.emailInput);
        await guideFill(page, customerPage.emailInput, customer.email);
        await capture('Nhập Email khách hàng', customerPage.emailInput);
        await guidePause(page, 500);
      });

      await test.step('Bước 7 - Nhập số điện thoại', async () => {
        await waitVisible(customerPage.phoneInput);
        await guideFill(page, customerPage.phoneInput, customer.phone);
        await capture('Nhập số điện thoại', customerPage.phoneInput);
      });

      await test.step('Bước 8 - Lưu khách hàng', async () => {
        await capture('Chọn nút Lưu', customerPage.saveButton);
        await customerPage.save();
        await guidePause(page, 3_000);
      });

      await test.step('Bước 9 - Kiểm tra kết quả', async () => {
        await waitVisible(customerPage.backButton, 30_000);
        await capture('Trở lại danh sách khách hàng để kiểm tra kết quả lưu thành công', customerPage.backButton);
        await customerPage.backToList();
        await guidePause(page, 2_000);
      });
    },
  );
});
