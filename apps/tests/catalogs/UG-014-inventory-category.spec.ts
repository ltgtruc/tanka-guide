import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-014-inventory-category';

test.describe('UG-014 - Nhóm hàng tồn kho', () => {
  test(
    'Hướng dẫn tạo nhóm hàng tồn kho với các giá trị mặc định',
    { tag: ['@user-guide', '@catalogs', '@inventory-category'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/category-list', /\/catalogs\/category-details/);
      const name = `NHÓM HƯỚNG DẪN ${Date.now()}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Nhóm hàng tồn kho', async () => {
        await capture('Chọn module Danh mục, chức năng Nhóm hàng tồn kho', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách nhóm: loại hàng và các ĐVT mặc định', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên và các giá trị mặc định', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await catalog.selectOption(/loại hàng mặc định/i, 'Nguyên liệu thô');
        await catalog.selectOption(/đvt lưu kho mặc định/i, 'mm');
        await catalog.selectOption(/đvt mua hàng mặc định/i, 'mm');
        await catalog.selectOption(/đvt bán hàng mặc định/i, 'mm');
        await catalog.selectOption(/chi nhánh mặc định/i, 'Hóc Môn');
        await capture('Chọn Loại hàng, ĐVT lưu kho / mua / bán và Chi nhánh mặc định', catalog.dropdown(/loại hàng mặc định/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để ngừng dùng nhóm, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: nhóm mới với các giá trị mặc định', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
