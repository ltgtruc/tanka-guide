import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-016-branch';

test.describe('UG-016 - Chi nhánh', () => {
  test(
    'Hướng dẫn tạo chi nhánh và ngừng sử dụng chi nhánh',
    { tag: ['@user-guide', '@catalogs', '@branch'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/site-list', /\/catalogs\/site-details/);
      // Chi nhánh xuất hiện ở mọi chứng từ — tắt Hoạt động ở cuối để không làm rác dropdown.
      const name = `Chi nhánh hướng dẫn ${Date.now()}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Chi nhánh', async () => {
        await capture('Chọn module Danh mục, chức năng Chi nhánh', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách chi nhánh', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên, địa chỉ, thành phố, số điện thoại', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await guideFill(page, catalog.input(/địa chỉ 1/i), '123 Nguyễn Văn Lượng');
        await guideFill(page, catalog.input(/địa chỉ 2/i), 'Phường An Hội Đông');
        await guideFill(page, catalog.input(/thành phố/i), 'Hồ Chí Minh');
        await guideFill(page, catalog.input(/số đt/i), '0987654321');
        await capture('Nhập Tên, Địa chỉ 1, Địa chỉ 2, Thành phố, Số ĐT', catalog.input(/địa chỉ 1/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động khi chi nhánh ngừng hoạt động, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: chi nhánh mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
