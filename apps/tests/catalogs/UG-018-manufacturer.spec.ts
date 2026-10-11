import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-018-manufacturer';

test.describe('UG-018 - Nhà sản xuất', () => {
  test(
    'Hướng dẫn tạo nhà sản xuất với thời hạn bảo hành và loại NVL',
    { tag: ['@user-guide', '@catalogs', '@manufacturer'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/manufacturer-list', /\/catalogs\/manufacturer-details/);
      const suffix = String(Date.now()).slice(-6);
      const name = `NSX HƯỚNG DẪN ${suffix}`;
      const code = `HD${suffix}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Nhà sản xuất', async () => {
        await capture('Chọn module Danh mục, chức năng Nhà sản xuất', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách NSX: Mã, thời hạn bảo hành, loại NVL', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên, mã, bảo hành và loại NVL', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await guideFill(page, catalog.input(/^\s*mã\s*\*?\s*$/i), code);
        await catalog.fillNumber(/thời hạn bảo hành/i, '2');
        await catalog.selectOption(/đơn vị bảo hành/i, 'Năm');
        await catalog.selectMany(/loại nvl/i, ['Profile', 'Phụ kiện']);
        await capture('Nhập Tên, Mã, Thời hạn + Đơn vị bảo hành, chọn Loại NVL', catalog.dropdown(/loại nvl/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động khi ngừng làm việc với NSX, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: NSX mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
