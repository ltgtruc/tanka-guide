import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-081-tax-rate';

test.describe('UG-081 - Thuế suất', () => {
  test(
    'Hướng dẫn tạo thuế suất và ngừng sử dụng thuế suất',
    { tag: ['@user-guide', '@catalogs', '@tax'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/tax-list', /\/catalogs\/tax-details/);
      // Tạo bản ghi minh họa rồi tắt Hoạt động ở cuối để không làm rác dropdown Thuế suất.
      const name = `VAT hướng dẫn ${Date.now()}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Thuế suất', async () => {
        await capture('Chọn module Danh mục, chức năng Thuế suất', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách thuế suất: Tên, Tỷ lệ (%)', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên và tỷ lệ thuế', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await catalog.fillNumber(/tỷ lệ/i, '7');
        await capture('Nhập Tên và Tỷ lệ (%)', catalog.input(/tỷ lệ/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để ngừng dùng thuế suất, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: thuế suất mới, cột Hoạt động không tích', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
