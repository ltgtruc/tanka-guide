import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-034-outsource-team';

test.describe('UG-034 - Đội thuê ngoài', () => {
  test(
    'Hướng dẫn tạo đội thuê ngoài và ngừng sử dụng đội',
    { tag: ['@user-guide', '@production', '@outsource-team'] },
    async ({ page }, testInfo) => {
      const team = new CatalogFormPage(
        page,
        '/work-orders/outsource-team-list',
        /\/work-orders\/outsource-team-details/,
        /^\W*sản xuất\W*$/i,
      );
      // Đội xuất hiện ở Giám sát tiến độ SX — tắt Hoạt động ở cuối để không làm rác dropdown.
      const name = `Đội hướng dẫn ${Date.now()}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Sản xuất > Đội thuê ngoài', async () => {
        await capture('Chọn module Sản xuất, chức năng Đội thuê ngoài', team.catalogsMenu);
        await team.openList();
        await capture('Danh sách đội thuê ngoài (gia công, lắp đặt, vệ sinh)', team.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', team.createButton);
        await team.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên, số điện thoại, mã định danh', async () => {
        await guideFill(page, team.input(/^\s*tên\s*\*?\s*$/i), name);
        await guideFill(page, team.input(/số đt/i), '0909123456');
        await guideFill(page, team.input(/mã định danh/i), '079099000123');
        await capture('Nhập Tên, Số ĐT, Mã định danh (CCCD/MST của đội)', team.input(/số đt/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Lưu', async () => {
        await capture('Bấm Lưu', team.saveButton);
        await team.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await team.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động khi không còn thuê đội này, rồi Lưu', team.checkbox(/^\s*hoạt động\s*$/i));
        await team.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách và tìm kiếm', async () => {
        await team.backToListPage();

        const row = await team.searchList(name);

        await capture('Tìm theo tên: đội mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
