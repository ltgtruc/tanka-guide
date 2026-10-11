import { expect, Locator, test } from '@playwright/test';
import { GroupPermissionPage } from '../../pages/system/GroupPermissionPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-063-group-permissions';

test.describe('UG-063 - Phân quyền nhóm', () => {
  test(
    'Hướng dẫn tạo nhóm quyền, cho phép/từ chối quyền và xoá nhóm',
    { tag: ['@user-guide', '@system', '@group-permissions'] },
    async ({ page }, testInfo) => {
      // Chỉ thao tác trên nhóm minh hoạ (không có user nào) — không sửa Admin / Nhân viên / Quản lý.
      const groups = new GroupPermissionPage(page);
      const name = `Nhóm hướng dẫn ${Date.now()}`;
      const permission = 'Catalogs.Entity.Attribute:Read';

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Hệ thống > Phân quyền nhóm', async () => {
        await capture('Chọn module Hệ thống, chức năng Phân quyền nhóm', groups.systemMenu);
        await groups.open();
        await capture('Cây nhóm quyền bên trái: Admin, Nhân viên, Quản lý...', groups.tree);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Tạo nhóm mới', async () => {
        await capture('Chọn nút Tạo mới', groups.createButton);
        await groups.createButton.click();
        await expect(groups.dialog).toBeVisible({ timeout: 10_000 });
        await guideFill(page, groups.dialogInput(/^\s*tên/i), name);
        await guideFill(page, groups.dialogInput(/diễn giải/i), 'Nhóm minh hoạ cho hướng dẫn');
        await capture('Nhập Tên, Diễn giải; chọn Nhóm cha nếu muốn kế thừa quyền, rồi Lưu', groups.dialogInput(/^\s*tên/i));
        await groups.saveDialog();
        await expect(groups.group(name)).toBeVisible({ timeout: 20_000 });
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Chọn nhóm, mở tab Phân quyền', async () => {
        await groups.group(name).click();
        await groups.permissionTab.click();
        await expect(groups.permissionRows.first()).toBeVisible({ timeout: 20_000 });
        await capture('Chọn nhóm trên cây, mở tab Phân quyền: danh sách quyền theo Module / Loại', groups.permissionTab);
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Cho phép một quyền', async () => {
        const row = await groups.searchPermission(permission);
        const allow = row.getByRole('button', { name: /cho phép/i });

        await capture('Tìm quyền, bấm Cho phép', allow);
        await allow.click();
        await expect(row).toContainText(/cho phép|được phép|có/i, { timeout: 20_000 });
        await capture('Trạng thái quyền đã cập nhật', row);
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Xoá nhóm minh hoạ', async () => {
        await groups.infoTab.click();

        const deleteButton = page.locator('main [role="tabpanel"]').getByRole('button', { name: /xoá|xóa/i });

        await capture('Tab Thông tin: Sửa tên/nhóm cha, hoặc Xoá nhóm không dùng', deleteButton);
        await deleteButton.click();

        const confirm = page.getByRole('alertdialog').getByRole('button', { name: /đồng ý|xác nhận|có/i });

        await confirm.click({ timeout: 10_000 }).catch(() => undefined);
        await expect(groups.group(name)).toBeHidden({ timeout: 20_000 });
        await guidePause(page, 1_500);
      });
    },
  );
});
