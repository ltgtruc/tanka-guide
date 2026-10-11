import { expect, Locator, test } from '@playwright/test';
import { UserPage } from '../../pages/system/UserPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-060-create-user';

test.describe('UG-060 - Người dùng (Users)', () => {
  test(
    'Hướng dẫn tạo tài khoản người dùng, đặt lại mật khẩu, khoá và xoá tài khoản',
    { tag: ['@user-guide', '@system', '@user'] },
    async ({ page }, testInfo) => {
      const users = new UserPage(page);
      // Tài khoản minh hoạ (nhóm Nhân viên) được khoá rồi xoá ở cuối hướng dẫn.
      const stamp = Date.now();
      const name = `User hướng dẫn ${stamp}`;
      const email = `huongdan.${stamp}@example.com`;
      const password = 'Tanka@12345';
      const newPassword = 'Tanka@67890';
      const row = users.listRows.filter({ hasText: email }).first();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target, mask: [] });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Hệ thống > Users', async () => {
        await capture('Chọn module Hệ thống, chức năng Users', users.catalogsMenu);
        await users.openList();
        await capture('Danh sách người dùng: tên, email, nhóm quyền, trạng thái khoá', users.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Tạo mới tài khoản', async () => {
        await capture('Chọn nút Tạo mới', users.createButton);
        await users.openCreateDialog();
        await guideFill(page, users.dialogInput(/^\s*email/i), email);
        await guideFill(page, users.dialogInput(/^\s*tên/i), name);
        await guideFill(page, users.dialogInput(/^\s*mật khẩu/i), password);
        await users.selectGroup('Nhân viên');
        await capture('Nhập Email (tên đăng nhập), Tên, Mật khẩu; chọn Nhóm quyền', users.dialogInput(/^\s*email/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Lưu', async () => {
        await capture('Bấm Lưu', users.dialogSaveButton);
        await users.saveDialog();
        await users.searchList(email).catch(async () => users.searchList(name));
        await expect(row).toBeVisible({ timeout: 20_000 });
        await capture('Tài khoản mới trong danh sách', row);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Đặt lại mật khẩu', async () => {
        await capture('Bấm biểu tượng chìa khoá để đặt lại mật khẩu khi người dùng quên', users.passwordButton(row));
        await users.passwordButton(row).click();
        await expect(users.dialog).toBeVisible({ timeout: 10_000 });
        await guideFill(page, users.dialogInput(/^\s*mật khẩu/i), newPassword);
        await guideFill(page, users.dialogInput(/xác nhận mật khẩu/i), newPassword);
        await capture('Nhập Mật khẩu mới và Xác nhận mật khẩu rồi Lưu', users.dialogSaveButton);
        await users.saveDialog();
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Khoá tài khoản', async () => {
        await users.editButton(row).click();
        await expect(users.dialog).toBeVisible({ timeout: 10_000 });

        const lockBox = users.dialogCheckbox(/khoá tài khoản|khóa tài khoản/i);

        await lockBox.click();
        await expect(lockBox).toHaveClass(/p-checkbox-checked/, { timeout: 5_000 });
        await capture('Người dùng nghỉ việc: bấm Sửa, tích Khoá tài khoản rồi Lưu — không đăng nhập được nữa', lockBox);
        await users.saveDialog();
        await expect(row.locator('.p-checkbox-checked')).toBeVisible({ timeout: 20_000 });
        await guidePause(page, 800);
      });

      await test.step('Bước 7 - Xoá tài khoản', async () => {
        await capture('Bấm thùng rác, chọn Đồng ý để xoá tài khoản tạo nhầm', users.deleteButton(row));
        await users.deleteRow(row);
        await guidePause(page, 1_500);
      });
    },
  );
});
