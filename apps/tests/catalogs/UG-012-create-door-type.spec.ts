import { expect, Locator, test } from '@playwright/test';
import { NavigationPage } from '../../pages/NavigationPage';
import { DoorTypePage } from '../../pages/catalogs/DoorTypePage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideDoorType } from '../../test-data/doorType.data';

const GUIDE_ID = 'UG-012-create-door-type';

test.describe('UG-012 - Tạo loại cửa', () => {
  test(
    'Hướng dẫn tạo loại cửa mới',
    { tag: ['@user-guide', '@catalog', '@door-type'] },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const doorTypePage = new DoorTypePage(page);

      const doorType = createGuideDoorType();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i);
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở module Danh mục', async () => {
        const catalogMenu = page.getByRole('link', { name: /danh mục/i }).first();

        await capture('Chọn module Danh mục', catalogMenu);
        await catalogMenu.click();
        await guidePause(page, 1_500);
      });

      await test.step('Bước 3 - Mở chức năng Loại cửa', async () => {
        const doorTypeMenu = page.getByText(/loại cửa/i).first();

        await capture('Chọn chức năng Loại cửa', doorTypeMenu);
        await doorTypeMenu.click();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', doorTypePage.createButton);
        await doorTypePage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Nhập thông tin loại cửa', async () => {
        await guideFill(page, doorTypePage.nameInput, doorType.name);
        await doorTypePage.reportTypeDropdown.click();
        await page.getByRole('option', { name: doorType.reportType, exact: true }).click();
        await capture('Nhập tên và chọn loại báo cáo', doorTypePage.nameInput);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Lưu dữ liệu', async () => {
        await capture('Lưu loại cửa', doorTypePage.saveButton);
        await doorTypePage.save();
        await guidePause(page, 3_000);
      });

      await test.step('Bước 7 - Kiểm tra kết quả', async () => {
        await capture('Trở lại danh sách Loại cửa', doorTypePage.backButton);
        await doorTypePage.backToList();
        await guidePause(page, 2_000);
      });
    },
  );
});
