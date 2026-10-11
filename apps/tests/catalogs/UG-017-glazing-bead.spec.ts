import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-017-glazing-bead';

test.describe('UG-017 - Mã nẹp kính', () => {
  test(
    'Hướng dẫn tạo mã nẹp kính theo nhà sản xuất và loại cửa',
    { tag: ['@user-guide', '@catalogs', '@glazing-bead'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/glazing-bead-list', /\/catalogs\/glazing-bead-details/);
      const name = `TDA - Nẹp kính HD${String(Date.now()).slice(-6)}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Mã nẹp kính', async () => {
        await capture('Chọn module Danh mục, chức năng Mã nẹp kính', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách mã nẹp kính: Tên, NSX, Loại cửa', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên, chọn NSX và loại cửa', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await catalog.selectOption(/^\s*nsx\s*\*?\s*$/i, 'TIẾN ĐẠT');
        await catalog.selectMany(/loại cửa/i, ['Cửa mở quay', 'Cửa mở hất']);
        await capture('Nhập Tên, chọn NSX và các Loại cửa dùng nẹp này', catalog.dropdown(/loại cửa/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để ngừng dùng mã nẹp, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: mã nẹp kính mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
