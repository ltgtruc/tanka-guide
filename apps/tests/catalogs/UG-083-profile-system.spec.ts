import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-083-profile-system';

test.describe('UG-083 - Hệ profile', () => {
  test(
    'Hướng dẫn tạo hệ profile theo nhà sản xuất',
    { tag: ['@user-guide', '@catalogs', '@profile-system'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/profile-system-list', /\/catalogs\/profile-system-details/);
      const name = `Hệ 55 Tiến Đạt HD${String(Date.now()).slice(-6)}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Hệ profile', async () => {
        await capture('Chọn module Danh mục, chức năng Hệ profile', catalog.catalogsMenu);
        await catalog.openList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên, chọn NSX và tuỳ chọn nẹp kính', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await catalog.selectMany(/^\s*nsx\s*$/i, ['TIẾN ĐẠT']);
        await catalog.setCheckbox(/^\s*có nẹp kính\s*$/i, true);
        await capture('Nhập Tên hệ, chọn NSX, tích Có nẹp kính nếu hệ dùng nẹp', catalog.checkbox(/^\s*có nẹp kính\s*$/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để ngừng dùng hệ, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: hệ profile mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
