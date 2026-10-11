import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-015-unit-of-measure';

test.describe('UG-015 - Đơn vị tính', () => {
  test(
    'Hướng dẫn tạo đơn vị tính và khai báo quy đổi',
    { tag: ['@user-guide', '@catalogs', '@unit'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/unit-list', /\/catalogs\/unit-details/);
      const name = `Thanh 6.0 HD${String(Date.now()).slice(-6)}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Đơn vị tính', async () => {
        await capture('Chọn module Danh mục, chức năng Đơn vị tính', catalog.catalogsMenu);
        await catalog.openList();
        await guidePause(page, 800);
      });

      await test.step('Bước 3 - Xem quy đổi của một ĐVT có sẵn', async () => {
        const row = await catalog.searchList('Thanh 5.8');

        await capture('Mỗi ĐVT hiển thị dòng Chuyển đổi, ví dụ Thanh 5.8 = mm x 5800', row);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Nhập tên, loại báo cáo và đơn vị đếm', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        await catalog.selectMany(/loại báo cáo/i, ['Hiển thị theo chiều dài']);
        await catalog.setCheckbox(/đơn vị đếm/i, true);
        await capture('Nhập Tên, chọn Loại báo cáo, tích Đơn vị đếm (mua theo số nguyên)', catalog.dropdown(/loại báo cáo/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Thêm dòng chuyển đổi', async () => {
        const addButton = page.locator('main').getByRole('button', { name: /^\W*thêm$/i });

        await capture('Bấm Thêm ở mục Chuyển đổi', addButton);
        await addButton.click();

        const row = page.locator('main table tbody tr').last();
        const comboboxes = row.locator('[role="combobox"]');

        // Danh sách ĐVT dài — gõ để lọc rồi chọn.
        await comboboxes.nth(0).click();
        await page.keyboard.type('mm', { delay: 50 });
        await page.getByRole('option', { name: 'mm', exact: true }).click();
        await comboboxes.nth(1).click();
        await page.getByRole('option', { name: 'Nhân (*)', exact: true }).click();

        const factor = row.getByRole('spinbutton');

        await factor.click();
        await factor.press('Control+A');
        await factor.pressSequentially('6000', { delay: 30 });
        await factor.press('Tab');
        await capture('Đổi ĐVT = mm, Loại tính = Nhân, Hệ số = 6000 (1 thanh = 6000 mm)', row);
        await guidePause(page, 800);
      });

      await test.step('Bước 7 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để ngừng dùng ĐVT, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(name);

        await capture('Tìm theo tên: ĐVT mới kèm dòng Chuyển đổi', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
