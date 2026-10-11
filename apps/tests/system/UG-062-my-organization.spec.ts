import { expect, Locator, test } from '@playwright/test';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-062-my-organization';

test.describe('UG-062 - Tổ chức của tôi', () => {
  test(
    'Hướng dẫn xem và cập nhật thông tin tổ chức',
    { tag: ['@user-guide', '@system', '@my-organization'] },
    async ({ page }, testInfo) => {
      // Chỉ mở hộp thoại Cập nhật để giới thiệu các ô rồi Đóng — không lưu thông tin công ty.
      const systemMenu = page.getByRole('link', { name: /^\W*hệ thống\W*$/i }).first();
      const organizationMenu = page.locator('a[href="/systems/my-organization"]');
      const updateButton = page.locator('main').getByRole('button', { name: /cập nhật/i });
      const dialog = page.locator('.p-dialog:visible');

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Hệ thống > Tổ chức của tôi', async () => {
        await expect(systemMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Hệ thống, chức năng Tổ chức của tôi', systemMenu);

        if (!(await organizationMenu.isVisible().catch(() => false))) {
          await systemMenu.click();
        }

        await organizationMenu.click();
        await page.waitForURL(/\/systems\/my-organization/, { timeout: 30_000 });
        await expect(updateButton).toBeVisible({ timeout: 20_000 });
        await capture('Thông tin công ty: tên, diễn giải, email, số ĐT, mã số thuế', page.locator('main h5').first());
        await guidePause(page, 800);
      });

      await test.step('Bước 3 - Mở Cập nhật', async () => {
        await capture('Bấm Cập nhật để sửa thông tin', updateButton);
        await updateButton.click();
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        await capture('Tab Thông tin chung: Tên, Số ĐT, Email, Mã số thuế, Diễn giải, Tên viết tắt, Hình ảnh (logo)', dialog);
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Tab Địa chỉ', async () => {
        const addressTab = dialog.getByRole('tab', { name: /địa chỉ/i });

        await addressTab.click();
        await capture('Tab Địa chỉ: địa chỉ công ty in trên chứng từ. Sửa xong bấm Lưu', addressTab);
        await dialog.getByRole('button', { name: /đóng/i }).click();
        await expect(dialog).toBeHidden({ timeout: 10_000 });
        await guidePause(page, 1_500);
      });
    },
  );
});
