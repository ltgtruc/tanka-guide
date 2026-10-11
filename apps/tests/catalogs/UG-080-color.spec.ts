import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-080-color';

test.describe('UG-080 - Màu sắc', () => {
  test(
    'Hướng dẫn tạo màu sắc theo loại NVL',
    { tag: ['@user-guide', '@catalogs', '@color'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/color-list', /\/catalogs\/color-details/);
      const name = `NÂU CAFE HD${String(Date.now()).slice(-6)}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Màu sắc', async () => {
        await capture('Chọn module Danh mục, chức năng Màu sắc', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách màu sắc theo loại NVL', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên và loại NVL dùng màu này', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await catalog.selectMany(/loại nvl/i, ['Profile', 'Phụ kiện']);
        await capture('Nhập Tên màu, chọn các Loại NVL có màu này', catalog.dropdown(/loại nvl/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để ngừng dùng màu, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: màu mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
