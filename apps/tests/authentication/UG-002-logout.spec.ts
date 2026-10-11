import { expect, Locator, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-002-logout';

// Đăng nhập phiên riêng để đăng xuất không ảnh hưởng storageState của các spec khác.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UG-002 - Đăng xuất khỏi hệ thống Tanka', () => {
  test(
    'Hướng dẫn đăng xuất',
    { tag: ['@user-guide', '@authentication'] },
    async ({ page }, testInfo) => {
      const email = process.env.TANKA_ADMIN_EMAIL;
      const password = process.env.TANKA_ADMIN_PASSWORD;

      if (!email || !password) {
        throw new Error('Thiếu tài khoản trong .env');
      }

      const loginPage = new LoginPage(page);
      // Menu người dùng ở góc phải: biểu tượng + tên người dùng (Bootstrap dropdown).
      const userMenu = page.locator('a.nav-profile');
      const logoutItem = page.locator('.dropdown-menu.show').getByText(/đăng xuất/i);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Đang làm việc trên hệ thống', async () => {
        await loginPage.open();
        await loginPage.login(email, password);
        await loginPage.verifyLoginSuccess();
        await expect(userMenu).toBeVisible({ timeout: 15_000 });
        await capture('Đang đăng nhập: tên người dùng hiện ở góc phải trên cùng', userMenu);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở menu người dùng', async () => {
        await userMenu.click();
        await expect(logoutItem).toBeVisible({ timeout: 10_000 });
        await capture('Bấm vào tên người dùng, chọn Đăng xuất', logoutItem);
        await guidePause(page, 800);
      });

      await test.step('Bước 3 - Đăng xuất', async () => {
        await logoutItem.click();
        await expect(loginPage.emailInput).toBeVisible({ timeout: 20_000 });
        await capture('Đã đăng xuất: hệ thống quay về trang đăng nhập', loginPage.loginButton);
        await guidePause(page, 2_000);
      });
    },
  );
});
