import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-082-employee';

test.describe('UG-082 - Nhân viên', () => {
  test(
    'Hướng dẫn tạo nhân viên và phân loại vai trò',
    { tag: ['@user-guide', '@catalogs', '@employee'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/employee-list', /\/catalogs\/employee-details/);
      const suffix = String(Date.now()).slice(-6);
      // Nhân viên hiện ở các ô Nhân viên BG/KD/Thiết kế của báo giá — tắt Hoạt động ở cuối.
      const email = `huongdan${suffix}@test.com`;
      const firstName = `Hướng Dẫn ${suffix}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Nhân viên', async () => {
        await capture('Chọn module Danh mục, chức năng Nhân viên', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách nhân viên: Họ, Tên, Email, Loại (vai trò), Số ĐT', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập thông tin nhân viên', async () => {
        await guideFill(page, catalog.input(/^\s*email\s*\*?\s*$/i), email);
        await guideFill(page, catalog.input(/^\s*họ\s*\*?\s*$/i), 'Nguyễn');
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), firstName);
        await guideFill(page, catalog.input(/số đt/i), '0912345678');
        await capture('Nhập Email, Họ, Tên, Số ĐT', catalog.input(/^\s*email\s*\*?\s*$/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Chọn vai trò (Loại)', async () => {
        await catalog.selectMany(/^\s*loại\s*\*?\s*$/i, ['Báo giá', 'Kinh doanh']);
        await capture('Chọn Loại: nhân viên hiện ở các ô tương ứng trên chứng từ', catalog.dropdown(/^\s*loại\s*\*?\s*$/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Nghỉ việc: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động khi nhân viên nghỉ việc, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        // Ô tìm kiếm tìm theo tên, không tìm theo email.
        const row = await catalog.searchList(firstName);

        await capture('Tìm theo tên: nhân viên mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
