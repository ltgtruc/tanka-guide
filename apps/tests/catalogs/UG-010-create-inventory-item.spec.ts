import { expect, Locator, test } from '@playwright/test';
import { NavigationPage } from '../../pages/NavigationPage';
import { InventoryPage } from '../../pages/catalogs/InventoryPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideInventoryItem } from '../../test-data/inventory.data';

const GUIDE_ID = 'UG-010-create-inventory-item';

test.describe('UG-010 - Tạo vật liệu tồn kho', () => {
  test(
    'Hướng dẫn tạo vật liệu mới',
    { tag: ['@user-guide', '@catalogs', '@inventory'] },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const inventoryPage = new InventoryPage(page);

      const inventoryItem = createGuideInventoryItem();

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
        await capture('Chọn module Danh mục', navigation.catalogsMenu);
        await navigation.catalogsMenu.click();
        await guidePause(page, 900);
      });

      await test.step('Bước 3 - Mở chức năng Vật liệu', async () => {
        const inventoryMenu = page.getByText(/^Hàng tồn kho$|^inventory$/i, { exact: false });

        await expect(inventoryMenu).toBeVisible({ timeout: 5_000 });
        await capture('Chọn chức năng Vật liệu', inventoryMenu);
        await inventoryMenu.click();
        await inventoryPage.verifyPageOpened();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await capture('Chọn nút Tạo mới', inventoryPage.createButton);
        await inventoryPage.openCreateForm();
        await guidePause(page, 900);
      });

      await test.step('Bước 5 - Nhập mã vật liệu', async () => {
        await guideFill(page, inventoryPage.codeInput, inventoryItem.code);
        await capture('Nhập mã vật liệu', inventoryPage.codeInput);
      });

      await test.step('Bước 6 - Nhập tên vật liệu', async () => {
        await guideFill(page, inventoryPage.nameInput, inventoryItem.name);
        await capture('Nhập tên vật liệu', inventoryPage.nameInput);
      });

      await test.step('Bước 7 - Nhập mô tả', async () => {
        await guideFill(page, inventoryPage.descriptionInput, inventoryItem.description);
        await capture('Nhập mô tả vật liệu', inventoryPage.descriptionInput);
      });

      await test.step('Bước 8 - Lưu vật liệu', async () => {
        await capture('Chọn nút Lưu', inventoryPage.saveButton);
        await inventoryPage.save();
        await inventoryPage.verifyCreated(inventoryItem.name);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 9 - Kiểm tra kết quả', async () => {
        await capture('Vật liệu được tạo thành công');
        await guidePause(page, 2_000);
      });
    },
  );
});
