import { expect, Locator, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-001-login';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UG-001 - Đăng nhập hệ thống Tanka', () => {
  test(
    'Hướng dẫn đăng nhập bằng tài khoản hợp lệ',
    { tag: ['@user-guide', '@authentication'] },
    async ({ page }, testInfo) => {
      const email = process.env.TANKA_ADMIN_EMAIL;
      const password = process.env.TANKA_ADMIN_PASSWORD;

      if (!email || !password) {
        throw new Error('Thiếu tài khoản trong .env');
      }

      const loginPage = new LoginPage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator, mask?: Locator[]) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target, mask });

      await test.step('Bước 1 - Mở trang đăng nhập', async () => {
        await loginPage.open();
        await capture('Mở trang đăng nhập Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Nhập địa chỉ email', async () => {
        await guideFill(page, loginPage.emailInput, email);
        await capture('Nhập địa chỉ email', loginPage.emailInput);
        await guidePause(page, 900);
      });

      await test.step('Bước 3 - Nhập mật khẩu', async () => {
        await guideFill(page, loginPage.passwordInput, password);
        await capture('Nhập mật khẩu', loginPage.passwordInput, [loginPage.passwordInput]);
        await guidePause(page, 900);
      });

      await test.step('Bước 4 - Chọn nút Đăng nhập', async () => {
        await capture('Chọn nút Đăng nhập', loginPage.loginButton, [loginPage.passwordInput]);
        await loginPage.loginButton.click();
        await loginPage.verifyLoginSuccess();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 5 - Kiểm tra màn hình sau đăng nhập', async () => {
        await expect(page).not.toHaveURL(/login/i);
        await capture('Đăng nhập thành công');
        await guidePause(page, 2_000);
      });
    },
  );
});
