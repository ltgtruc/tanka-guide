import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-024-sales-price-group';

test.describe('UG-024 - Nhóm giá bán', () => {
  test(
    'Hướng dẫn tạo nhóm giá bán theo % lợi nhuận',
    { tag: ['@user-guide', '@sales', '@sales-price-group'] },
    async ({ page }, testInfo) => {
      const group = new CatalogFormPage(
        page,
        '/orders/sales-price-group-list',
        /\/orders\/sales-price-group-details/,
        /^\W*bán hàng\W*$/i,
      );
      // Nhóm minh hoạ được xoá ở bước cuối — chưa gán cho mặt hàng nào nên không ảnh hưởng giá bán.
      const name = `Nhóm giá hướng dẫn ${Date.now()}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Bán hàng > Nhóm giá bán', async () => {
        await capture('Chọn module Bán hàng, chức năng Nhóm giá bán', group.catalogsMenu);
        await group.openList();
        await capture('Danh sách nhóm giá: phạm vi áp dụng và % lợi nhuận', group.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', group.createButton);
        await group.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên và phạm vi áp dụng', async () => {
        await guideFill(page, group.input(/^\s*tên\s*\*?\s*$/i), name);
        await group.selectMany(/loại nvl/i, ['Phụ kiện']);
        await group.selectMany(/loại htk/i, ['Bộ phận cấu thành']);
        await group.selectMany(/chi nhánh/i, ['Hóc Môn']);
        await capture('Nhập Tên; chọn Loại NVL, Loại HTK, NSX, Chi nhánh mà nhóm áp dụng', group.dropdown(/loại nvl/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Chọn loại và giá trị %', async () => {
        await group.selectOption(/^\s*loại\s*\*?\s*$/i, '% lợi nhuận dựa vào chi phí');
        await group.fillNumber(/giá trị/i, '35');
        await capture('Loại: % lợi nhuận dựa vào chi phí; Giá trị (%): giá bán = giá vốn × (1 + %)', group.input(/giá trị/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Lưu', async () => {
        await capture('Bấm Lưu', group.saveButton);
        await group.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await group.backToListPage();

        const row = await group.searchList(name);

        await capture('Tìm theo tên: nhóm giá mới', row);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Xoá nhóm giá không dùng', async () => {
        const row = group.listRows.filter({ hasText: name }).first();

        await capture('Bấm biểu tượng thùng rác, chọn Đồng ý để xoá nhóm chưa dùng', group.deleteButton(row));
        await group.deleteRow(row);
        await guidePause(page, 1_500);
      });
    },
  );
});
