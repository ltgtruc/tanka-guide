import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-042-vendor';

test.describe('UG-042 - Nhà cung cấp', () => {
  test(
    'Hướng dẫn tạo nhà cung cấp và thiết lập hàng tồn kho theo nhà cung cấp',
    { tag: ['@user-guide', '@purchasing', '@vendor'] },
    async ({ page }, testInfo) => {
      const vendor = new CatalogFormPage(page, '/purchases/vendor-list', /\/purchases\/vendor(?!-)/, /^\W*mua hàng\W*$/i);
      // NCC xuất hiện khi chuyển YCMH thành đơn mua — tắt Hoạt động ở cuối để không làm rác dropdown.
      const name = `NCC hướng dẫn ${Date.now()}`;
      const dialog = page.locator('.p-dialog:visible');

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Mua hàng > Nhà cung cấp', async () => {
        await capture('Chọn module Mua hàng, chức năng Nhà cung cấp', vendor.catalogsMenu);
        await vendor.openList();
        await capture('Danh sách nhà cung cấp', vendor.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', vendor.createButton);
        await vendor.openCreateForm();
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Nhập thông tin chung', async () => {
        await guideFill(page, vendor.input(/^\s*tên\s*\*?\s*$/i), name);
        await guideFill(page, vendor.input(/số đt/i), '0281234567');
        await guideFill(page, vendor.input(/^\s*email\s*$/i), 'ncc.huongdan@example.com');
        await guideFill(page, vendor.input(/mã số thuế/i), '0312345678');
        await capture('Nhập Tên, Số ĐT, Email, Mã số thuế', vendor.input(/^\s*tên\s*\*?\s*$/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Chọn loại NVL và dung sai nhận hàng', async () => {
        await vendor.selectMany(/loại nvl/i, ['Phụ kiện', 'Vật tư phụ']);
        await vendor.selectOption(/xử lý/i, 'Chấp nhận và cảnh báo');
        await vendor.fillNumber(/nhận tối thiểu/i, '95');
        await vendor.fillNumber(/nhận tối đa/i, '105');
        await capture(
          'Chọn Loại NVL cung cấp; Xử lý khi ngoài dung sai, Nhận tối thiểu / tối đa (%) dùng khi nhận hàng',
          vendor.dropdown(/xử lý/i),
        );
        await guidePause(page, 800);
      });

      await test.step('Bước 6 - Lưu', async () => {
        await capture('Bấm Lưu', vendor.saveButton);
        await vendor.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Thêm địa chỉ', async () => {
        await page.getByRole('tab', { name: /địa chỉ/i }).click();

        const addButton = page.locator('main [role="tabpanel"]').getByRole('button', { name: /thêm/i });

        await expect(addButton).toBeVisible({ timeout: 10_000 });
        await capture('Mở tab Địa chỉ, bấm Thêm', addButton);
        await addButton.click();
        await expect(dialog).toBeVisible({ timeout: 10_000 });

        const dialogInput = (label: RegExp) =>
          dialog.locator('.c-component').filter({ has: page.locator('label', { hasText: label }) }).locator('input').first();

        await guideFill(page, dialogInput(/^\s*tên\s*\*?\s*$/i), 'Kho NCC');
        await guideFill(page, dialogInput(/^\s*địa chỉ\s*\*?\s*$/i), '45 Quốc lộ 22, Hóc Môn');
        await guideFill(page, dialogInput(/thành phố/i), 'Hồ Chí Minh');

        const saveAddress = dialog.getByRole('button', { name: /lưu/i });

        await capture('Nhập Tên, Địa chỉ, Thành phố rồi bấm Lưu', saveAddress);
        await saveAddress.click();

        // Hộp thoại thường tự đóng sau khi lưu; còn mở thì bấm Đóng.
        await dialog
          .getByRole('button', { name: /đóng/i })
          .click({ timeout: 3_000 })
          .catch(() => undefined);

        await expect(page.locator('main [role="tabpanel"] table tbody tr').filter({ hasText: 'Kho NCC' })).toBeVisible({
          timeout: 20_000,
        });
        // Lưu trong hộp thoại chỉ thêm dòng vào bảng — phải Lưu NCC thì địa chỉ mới được ghi.
        await capture('Địa chỉ đã thêm vào bảng — bấm Lưu của nhà cung cấp để ghi lại', vendor.saveButton);
        await vendor.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Ngừng sử dụng: bỏ tích Hoạt động', async () => {
        await page.getByRole('tab', { name: /thông tin chung/i }).click();
        await vendor.setCheckbox(/^\s*hoạt động\s*$/i, false);
        await capture('Bỏ tích Hoạt động khi không còn mua của NCC này, rồi Lưu', vendor.checkbox(/^\s*hoạt động\s*$/i));
        await vendor.saveRecord();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Trở lại danh sách và tìm kiếm', async () => {
        await vendor.backToListPage();

        const row = await vendor.searchList(name);

        await capture('Tìm theo tên: nhà cung cấp mới', row);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 10 - Thiết lập hàng tồn kho và nhà cung cấp', async () => {
        await vendor.keywordInput.fill('');
        await vendor.keywordInput.press('Enter');

        const setupButton = page.locator('main').getByRole('button', { name: /thiết lập htk và ncc/i });

        await capture('Bấm Thiết lập HTK và NCC', setupButton);
        await setupButton.click();
        await page.waitForURL(/\/purchases\/vendor-inventory-items/, { timeout: 30_000 });

        const firstRow = page.locator('main table tbody tr').first();

        await expect(firstRow).toBeVisible({ timeout: 20_000 });
        await capture('Mỗi hàng tồn kho chọn nhà cung cấp thường mua ở cột Nhà cung cấp', firstRow.locator('td').nth(1));
        await guidePause(page, 2_000);
      });
    },
  );
});
