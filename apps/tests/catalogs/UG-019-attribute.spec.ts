import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-019-attribute';

/*
 * Thuộc tính đang Hoạt động sẽ hiện ở tab "Các lựa chọn thuộc tính" khi cấu
 * hình cửa trên báo giá/đơn BH của loại cửa đã chọn — guide tắt Hoạt động ở
 * cuối để không ảnh hưởng UG-021/UG-022.
 */
const OPTIONS = [
  { name: 'Tay nắm tiêu chuẩn', value: '0' },
  { name: 'Tay nắm có khoá', value: '1' },
];

test.describe('UG-019 - Thuộc tính', () => {
  test(
    'Hướng dẫn tạo thuộc tính và các tuỳ chọn con có giá trị',
    { tag: ['@user-guide', '@catalogs', '@attribute'] },
    async ({ page }, testInfo) => {
      const catalog = new CatalogFormPage(page, '/catalogs/attribute-list', /\/catalogs\/attribute-details/);
      const suffix = String(Date.now()).slice(-6);
      const name = `Kiểu tay nắm HD${suffix}`;
      const code = `TAY_NAM_HD${suffix}`;

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Danh mục > Thuộc tính', async () => {
        await capture('Chọn module Danh mục, chức năng Thuộc tính', catalog.catalogsMenu);
        await catalog.openList();
        await capture('Danh sách thuộc tính: Mã, Loại, Loại báo cáo, Loại cửa, NSX, Thứ tự', catalog.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', catalog.createButton);
        await catalog.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập tên, mã, loại và loại cửa áp dụng', async () => {
        await guideFill(page, catalog.input(/^\s*tên\s*\*?\s*$/i), name);
        // Mã tự sinh từ Tên (dạng KIEU_TAY_NAM_...); xoá để nhập mã theo quy ước riêng.
        await catalog.input(/^\s*mã\s*\*?\s*$/i).fill('');
        await guideFill(page, catalog.input(/^\s*mã\s*\*?\s*$/i), code);
        await catalog.selectMany(/^\s*loại\s*\*?\s*$/i, ['Lựa chọn phụ kiện']);
        await catalog.selectMany(/^\s*loại cửa\s*\*?\s*$/i, ['Cửa mở quay']);
        await catalog.selectMany(/loại báo cáo/i, ['Hiển thị PK']);
        await catalog.fillNumber(/thứ tự/i, '99');
        await capture('Nhập Tên, Mã; chọn Loại, Loại cửa, Loại báo cáo, Thứ tự', catalog.dropdown(/^\s*loại\s*\*?\s*$/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Bật yêu cầu giá trị cho tuỳ chọn con', async () => {
        await catalog.setCheckbox(/yêu cầu giá trị cho tùy chọn con/i, true);
        await capture('Tích Yêu cầu giá trị khi thuộc tính dùng trong công thức BOM', catalog.checkbox(/yêu cầu giá trị/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Thêm các tuỳ chọn con', async () => {
        const addButton = page.locator('main').getByRole('button', { name: /^\W*thêm$/i });

        await capture('Bấm Thêm ở mục Các tuỳ chọn con', addButton);

        for (const option of OPTIONS) {
          await addButton.click();

          const row = page.locator('main table tbody tr').last();
          const value = row.getByRole('spinbutton');

          await row.getByRole('textbox').fill(option.name);
          await value.click();
          await value.press('Control+A');
          await value.pressSequentially(option.value, { delay: 30 });
          await value.press('Tab');

          // Bắt buộc chọn Loại cửa và NSX cho mỗi tuỳ chọn con: để trống thì app
          // lỗi JS khi Lưu (không gửi request, không báo lỗi).
          for (const [index, text] of [[0, 'Cửa mở quay'], [1, 'TIẾN ĐẠT']] as const) {
            await row.locator('.p-multiselect').nth(index).click();
            await page
              .locator('.p-multiselect-overlay:visible [role="option"]')
              .filter({ hasText: new RegExp(`^\\s*${text}\\s*$`) })
              .first()
              .click();
            await page.keyboard.press('Escape');
            await expect(page.locator('.p-multiselect-overlay')).toHaveCount(0, { timeout: 10_000 });
          }
        }

        await capture('Mỗi tuỳ chọn con: Tên, Giá trị (dùng trong công thức), Loại cửa, NSX', page.locator('main table').last());
        await guidePause(page, 800);
      });

      await test.step('Bước 7 - Lưu', async () => {
        await capture('Bấm Lưu', catalog.saveButton);
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await catalog.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động để thuộc tính không còn hiện khi báo giá, rồi Lưu', catalog.checkbox(/^\s*hoạt động\s*$/i));
        await catalog.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Trở lại danh sách và tìm kiếm', async () => {
        await catalog.backToListPage();

        const row = await catalog.searchList(code);

        await capture('Tìm theo mã: thuộc tính mới', row);
        await guidePause(page, 2_000);
      });
    },
  );
});
