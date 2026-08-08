import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';

import { captureGuideStep } from '../../helpers/guide-step.helper';

import {
  guidePause,
  guideFill,
} from '../../helpers/video.helper';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

test.describe('UG-001 - Đăng nhập hệ thống Tanka', () => {
  test(
    'Hướng dẫn đăng nhập bằng tài khoản hợp lệ',
    {
      tag: ['@user-guide', '@authentication'],
    },
    async ({ page }, testInfo) => {
      const email = process.env.TANKA_ADMIN_EMAIL;
      const password = process.env.TANKA_ADMIN_PASSWORD;

      if (!email || !password) {
        throw new Error('Thiếu tài khoản trong .env');
      }

      const loginPage = new LoginPage(page);

      await test.step(
        'Bước 1 - Mở trang đăng nhập',
        async () => {
          await loginPage.open();

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-001-login',
            stepNumber: 1,
            title: 'Mở trang đăng nhập Tanka',
          });

          await guidePause(page, 1_000);
        },
      );

      await test.step(
        'Bước 2 - Nhập địa chỉ email',
        async () => {
          await guideFill(
            page,
            loginPage.emailInput,
            email,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-001-login',
            stepNumber: 2,
            title: 'Nhập địa chỉ email',
            target: loginPage.emailInput,
          });

          await guidePause(page, 900);
        },
      );

      await test.step(
        'Bước 3 - Nhập mật khẩu',
        async () => {
          await guideFill(
            page,
            loginPage.passwordInput,
            password,
          );

          /*
           * Không nên chụp lại giá trị mật khẩu.
           * Mask input mật khẩu khi chụp.
           */
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-001-login',
            stepNumber: 3,
            title: 'Nhập mật khẩu',
            target: loginPage.passwordInput,
            mask: [loginPage.passwordInput],
          });

          await guidePause(page, 900);
        },
      );

      await test.step(
        'Bước 4 - Chọn nút Đăng nhập',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-001-login',
            stepNumber: 4,
            title: 'Chọn nút Đăng nhập',
            target: loginPage.loginButton,
            mask: [loginPage.passwordInput],
          });

          await loginPage.loginButton.click();

          await loginPage.verifyLoginSuccess();

          await guidePause(page, 1_500);
        },
      );

      await test.step(
        'Bước 5 - Kiểm tra màn hình sau đăng nhập',
        async () => {
          await expect(page).not.toHaveURL(/login/i);

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-001-login',
            stepNumber: 5,
            title: 'Đăng nhập thành công',
          });

          await guidePause(page, 2_000);
        },
      );
    },
  );
});