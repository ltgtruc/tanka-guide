import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-038-outsource-team-expense';

test.describe('UG-038 - Chi phí cho đội thuê ngoài', () => {
  test(
    'Hướng dẫn khai báo đơn giá cho đội thuê ngoài',
    { tag: ['@user-guide', '@production', '@outsource-team-expense'] },
    async ({ page }, testInfo) => {
      const expense = new CatalogFormPage(
        page,
        '/work-orders/outsource-team-expense-list',
        /\/work-orders\/outsource-team-expense-details/,
        /^\W*sản xuất\W*$/i,
      );
      // Đơn giá minh hoạ được xoá ở bước cuối để không ảnh hưởng quyết toán thật.
      const teamName = 'Anh Danh - GC Sản xuất';
      const value = '25000';

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Sản xuất > CP cho đội thuê ngoài', async () => {
        await capture('Chọn module Sản xuất, chức năng CP cho đội thuê ngoài', expense.catalogsMenu);
        await expense.openList();
        await capture('Danh sách đơn giá: đội, loại công việc, đơn vị, danh mục, giá trị', expense.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', expense.createButton);
        await expense.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Chọn đội, loại công việc, đơn vị, danh mục', async () => {
        await expense.selectOption(/đội gia công/i, teamName);
        await expense.selectOption(/^\s*loại\s*\*?\s*$/i, 'Vệ sinh');
        await expense.selectOption(/đơn vị/i, 'Mét');
        await expense.selectOption(/danh mục/i, 'ALU');
        await capture('Chọn Đội gia công ngoài, Loại (Vệ sinh / Lắp đặt / Sản xuất), Đơn vị, Danh mục', expense.dropdown(/^\s*loại\s*\*?\s*$/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Nhập giá trị', async () => {
        await expense.fillNumber(/giá trị/i, value);
        await capture('Nhập Giá trị: đơn giá trả cho đội trên 1 đơn vị', expense.input(/giá trị/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Lưu', async () => {
        await capture('Bấm Lưu', expense.saveButton);
        await expense.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Trở lại danh sách, lọc theo đội', async () => {
        await expense.backToListPage();
        await expense.selectOption(/đội gia công/i, teamName);

        const row = expense.listRows.filter({ hasText: /vệ sinh/i }).filter({ hasText: /mét/i }).filter({ hasText: /25\.000/ }).first();

        await expect(row).toBeVisible({ timeout: 20_000 });
        await capture('Lọc theo Đội gia công ngoài: đơn giá vừa tạo', row);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Xoá đơn giá không dùng nữa', async () => {
        const row = expense.listRows.filter({ hasText: /vệ sinh/i }).filter({ hasText: /mét/i }).filter({ hasText: /25\.000/ }).first();

        await capture('Bấm biểu tượng thùng rác, chọn Đồng ý để xoá đơn giá', expense.deleteButton(row));
        await expense.deleteRow(row);
        await guidePause(page, 1_500);
      });
    },
  );
});
