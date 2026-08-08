import { test, expect } from '@playwright/test';

import { NavigationPage } from '../../pages/NavigationPage';
import { InventoryPage } from '../../pages/catalogs/InventoryPage';

import { captureGuideStep } from '../../helpers/guide-step.helper';

import {
  guideFill,
  guidePause,
} from '../../helpers/video.helper';

import { createGuideInventoryItem } from '../../test-data/inventory.data';

test.describe('UG-010 - Tạo vật liệu tồn kho', () => {
  test(
    'Hướng dẫn tạo vật liệu mới',
    {
      tag: ['@user-guide', '@catalogs', '@inventory'],
    },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const inventoryPage = new InventoryPage(page);

      const inventoryItem = createGuideInventoryItem();

      await test.step(
        'Bước 1 - Mở hệ thống',
        async () => {
          await page.goto('/');

          await expect(page).not.toHaveURL(/login/i);

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 1,
            title: 'Mở trang chính Tanka',
          });

          await guidePause(page, 1_000);
        },
      );

      await test.step(
        'Bước 2 - Mở module Danh mục',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 2,
            title: 'Chọn module Danh mục',
            target: navigation.catalogsMenu,
          });

          await navigation.catalogsMenu.click();

          await guidePause(page, 900);
        },
      );

      await test.step(
        'Bước 3 - Mở chức năng Vật liệu',
        async () => {
          const inventoryMenu = page.getByText(
            /Hàng tồn kho|inventory/i,
            {
              exact: false,
            },
          );

          await expect(inventoryMenu).toBeVisible({ timeout: 5000 });

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 3,
            title: 'Chọn chức năng Vật liệu',
            target: inventoryMenu,
          });

          await inventoryMenu.click();

          await inventoryPage.verifyPageOpened();

          await guidePause(page, 1_000);
        },
      );

      await test.step(
        'Bước 4 - Chọn Tạo mới',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 4,
            title: 'Chọn nút Tạo mới',
            target: inventoryPage.createButton,
          });

          await inventoryPage.openCreateForm();

          await guidePause(page, 900);
        },
      );

      await test.step(
        'Bước 5 - Nhập mã vật liệu',
        async () => {
          await guideFill(
            page,
            inventoryPage.codeInput,
            inventoryItem.code,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 5,
            title: 'Nhập mã vật liệu',
            target: inventoryPage.codeInput,
          });
        },
      );

      await test.step(
        'Bước 6 - Nhập tên vật liệu',
        async () => {
          await guideFill(
            page,
            inventoryPage.nameInput,
            inventoryItem.name,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 6,
            title: 'Nhập tên vật liệu',
            target: inventoryPage.nameInput,
          });
        },
      );

      await test.step(
        'Bước 7 - Nhập mô tả',
        async () => {
          await guideFill(
            page,
            inventoryPage.descriptionInput,
            inventoryItem.description,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 7,
            title: 'Nhập mô tả vật liệu',
            target: inventoryPage.descriptionInput,
          });
        },
      );

      await test.step(
        'Bước 8 - Lưu vật liệu',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 8,
            title: 'Chọn nút Lưu',
            target: inventoryPage.saveButton,
          });

          await inventoryPage.save();

          await inventoryPage.verifyCreated(
            inventoryItem.name,
          );

          await guidePause(page, 1_500);
        },
      );

      await test.step(
        'Bước 9 - Kiểm tra kết quả',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-010-create-inventory-item',
            stepNumber: 9,
            title: 'Vật liệu được tạo thành công',
          });

          await guidePause(page, 2_000);
        },
      );
    },
  );
});
