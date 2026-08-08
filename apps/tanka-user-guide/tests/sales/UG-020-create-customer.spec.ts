import { test, expect } from '@playwright/test';

import { NavigationPage } from '../../pages/NavigationPage';
import { CustomerPage } from '../../pages/sales/CustomerPage';

import { captureGuideStep } from '../../helpers/guide-step.helper';

import {
  guideFill,
  guidePause,
} from '../../helpers/video.helper';

import { createGuideCustomer } from '../../test-data/customer.data';

test.describe('UG-020 - Tạo khách hàng', () => {
  test(
    'Hướng dẫn tạo khách hàng mới',
    {
      tag: ['@user-guide', '@sales', '@customer'],
    },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const customerPage = new CustomerPage(page);

      const customer = createGuideCustomer();

      await test.step(
        'Bước 1 - Mở hệ thống',
        async () => {
          await page.goto('/');

          await expect(page).not.toHaveURL(/login/i);

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 1,
            title: 'Mở trang chính Tanka',
          });

          await guidePause(page, 1_000);
        },
      );

      await test.step(
        'Bước 2 - Mở module Bán hàng',
        async () => {
          const salesMenu = page
            .getByRole('link', {
              name: /bán hàng/i,
            })
            .first();

          await expect(salesMenu).toBeVisible({
            timeout: 10000,
          });

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 2,
            title: 'Chọn module Bán hàng',
            target: salesMenu,
          });

          await salesMenu.click();

          await guidePause(page, 1500);
        },
      );

      await test.step(
        'Bước 3 - Mở chức năng Khách hàng',
        async () => {
          const customerMenu = page
            .getByText(/khách hàng/i)
            .first();

          await expect(customerMenu).toBeVisible({
            timeout: 10000,
          });

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 3,
            title: 'Chọn chức năng Khách hàng',
            target: customerMenu,
          });

          await customerMenu.click();

          await guidePause(page, 2000);
        },
      );

      await test.step(
        'Bước 4 - Chọn Tạo mới',
        async () => {
          await expect(
            customerPage.createButton,
          ).toBeVisible({
            timeout: 10000,
          });

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 4,
            title: 'Chọn nút Tạo mới',
            target: customerPage.createButton,
          });

          await customerPage.openCreateForm();

          // DEBUG
          console.log(
            'Textbox count =',
            await page.getByRole('textbox').count(),
          );

          await expect(
            customerPage.nameInput,
          ).toBeVisible({
            timeout: 10000,
          });

          await guidePause(page, 1000);
        },
      );

      await test.step(
        'Bước 5 - Nhập tên khách hàng',
        async () => {
          await expect(
            customerPage.nameInput,
          ).toBeVisible({
            timeout: 10000,
          });

          console.log(
            'nameInput count =',
            await customerPage.nameInput.count(),
          );

          await guideFill(
            page,
            customerPage.nameInput,
            customer.name,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 5,
            title: 'Nhập tên khách hàng',
            target: customerPage.nameInput,
          });

          await guidePause(page, 500);
        },
      );

      await test.step(
        'Bước 6 - Nhập Email',
        async () => {
          await expect(
            customerPage.emailInput,
          ).toBeVisible({
            timeout: 10000,
          });

          console.log(
            'emailInput count =',
            await customerPage.emailInput.count(),
          );

          await guideFill(
            page,
            customerPage.emailInput,
            customer.email,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 6,
            title: 'Nhập Email khách hàng',
            target: customerPage.emailInput,
          });

          await guidePause(page, 500);
        },
      );

      await test.step(
        'Bước 7 - Nhập số điện thoại',
        async () => {
          await expect(
            customerPage.phoneInput,
          ).toBeVisible({
            timeout: 10_000,
          });

          await guideFill(
            page,
            customerPage.phoneInput,
            customer.phone,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 7,
            title: 'Nhập số điện thoại',
            target: customerPage.phoneInput,
          });
        },
      );

      await test.step(
        'Bước  8- Lưu khách hàng',
        async () => {

          const saveButton = page
            .getByRole('button', {
              name: /lưu|save/i,
            })
            .first();

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 8,
            title: 'Chọn nút Lưu',
            target: saveButton,
          });

          await saveButton.click();

          await guidePause(page, 3000);
        },
      );

      await test.step(
        'Bước 9 - Kiểm tra kết quả',
        async () => {

          const backButton = page
            .getByRole('button', {
              name: /trở lại|back/i,
            })
            .first();

          await expect(backButton).toBeVisible({
            timeout: 30000,
          });

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-020-create-customer',
            stepNumber: 9,
            title: 'Trở lại danh sách khách hàng để kiểm tra kết quả lưu thành công',
            target: backButton,
          });

          await backButton.click();


          

          await guidePause(page, 2000);
        },
      );
    },
  );
});