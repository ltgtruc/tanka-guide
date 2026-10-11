import { expect, Locator, test } from '@playwright/test';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-061-my-account';

test.describe('UG-061 - Tài khoản của tôi', () => {
  test(
    'Hướng dẫn xem thông tin cá nhân và đổi mật khẩu',
    { tag: ['@user-guide', '@system', '@my-account'] },
    async ({ page }, testInfo) => {
      // Chỉ chỉ ra các ô — KHÔNG bấm Lưu để không đổi tên/mật khẩu của tài khoản admin dùng quay guide.
      const systemMenu = page.getByRole('link', { name: /^\W*hệ thống\W*$/i }).first();
      const accountMenu = page.locator('a[href="/systems/my-account"]');
      const field = (label: RegExp) =>
        page
          .locator('main .c-component')
          .filter({ has: page.locator('label', { hasText: label }) })
          .locator('input')
          .first();
      const saveButtons = page.locator('main').getByRole('button', { name: /lưu/i });

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Hệ thống > Tài khoản của tôi', async () => {
        await expect(systemMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Hệ thống, chức năng Tài khoản của tôi', systemMenu);

        if (!(await accountMenu.isVisible().catch(() => false))) {
          await systemMenu.click();
        }

        await accountMenu.click();
        await page.waitForURL(/\/systems\/my-account/, { timeout: 30_000 });
        await expect(field(/^\s*email/i)).toBeVisible({ timeout: 20_000 });
        await guidePause(page, 800);
      });

      await test.step('Bước 3 - Thông tin cá nhân', async () => {
        await capture('Thông tin cá nhân: Email (không đổi được), sửa Tên rồi bấm Lưu của khung này', field(/^\s*tên/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Đổi mật khẩu', async () => {
        await capture(
          'Đổi mật khẩu: nhập Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới rồi bấm Lưu của khung này',
          field(/mật khẩu hiện tại/i),
        );
        await expect(saveButtons).toHaveCount(2);
        await guidePause(page, 2_000);
      });
    },
  );
});
