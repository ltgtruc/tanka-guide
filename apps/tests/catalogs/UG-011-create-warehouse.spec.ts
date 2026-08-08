import { test, expect } from '@playwright/test';

import { NavigationPage } from '../../pages/NavigationPage';
import { WarehousePage } from '../../pages/catalogs/WarehousePage';

import { captureGuideStep } from '../../helpers/guide-step.helper';

import {
  guideFill,
  guidePause,
} from '../../helpers/video.helper';

import { createGuideWarehouse } from '../../test-data/warehouse.data';

test.describe('UG-011 - Tạo kho hàng', () => {
  test(
    'Hướng dẫn tạo kho mới',
    {
      tag: ['@user-guide', '@catalogs', '@warehouse'],
    },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const warehousePage = new WarehousePage(page);

      const warehouse = createGuideWarehouse();

      await test.step(
        'Bước 1 - Mở hệ thống',
        async () => {
          await page.goto('/');

          await expect(page).not.toHaveURL(/login/i);

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 1,
            title: 'Mở trang chính Tanka',
          });

          await guidePause(page, 1_000);
        },
      );

      await test.step(
        'Bước 2 - Mở module Danh mục',
        async () => {
          const catalogsMenu = page
            .getByRole('link', {
              name: /danh mục/i,
              exact: false,
            })
            .first();

          await expect(catalogsMenu).toBeVisible();
          await expect(catalogsMenu).toBeEnabled();

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 2,
            title: 'Chọn module Danh mục',
            target: catalogsMenu,
          });

          await catalogsMenu.click();

          await guidePause(page, 1500);
        },
      );

      await test.step(
        'Bước 3 - Mở chức năng Kho hàng',
        async () => {
          const warehouseMenu = page
            .getByRole('link', {
              name: /kho hàng|warehouse/i,
            })
            .first();

          await expect(warehouseMenu).toBeVisible({
            timeout: 10_000,
          });

          await expect(warehouseMenu).toBeEnabled();

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 3,
            title: 'Chọn chức năng Kho hàng',
            target: warehouseMenu,
          });

          await warehouseMenu.click();

          await warehousePage.verifyPageOpened();

          await guidePause(page, 1_000);
        },
      );

      await test.step(
        'Bước 4 - Chọn Tạo mới',
        async () => {
          const createButton = page
            .getByRole('button', {
              name: /tạo mới|create new|create/i,
            })
            .first();

          const warehouseNameInput = page
            .getByLabel(/^tên\s*\*?$/i)
            .or(
              page.locator('input[type="text"]').first(),
            )
            .first();

          const saveButton = page
            .getByRole('button', {
              name: /lưu|save/i,
            })
            .first();

          await expect(createButton).toBeVisible({
            timeout: 10_000,
          });

          await expect(createButton).toBeEnabled();

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 4,
            title: 'Chọn nút Tạo mới',
            target: createButton,
          });

          await createButton.click();

          await expect(warehouseNameInput).toBeVisible({
            timeout: 10_000,
          });

          await expect(saveButton).toBeVisible({
            timeout: 10_000,
          });

          await guidePause(page, 900);
        },
      );

      await test.step(
        'Bước 5 - Nhập tên kho',
        async () => {
          await expect(
            warehousePage.nameInput,
          ).toBeVisible({
            timeout: 10_000,
          });

          await guideFill(
            page,
            warehousePage.nameInput,
            warehouse.name,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 5,
            title: 'Nhập tên kho',
            target: warehousePage.nameInput,
          });
        },
      );

      await test.step(
        'Bước 6 - Nhập địa chỉ kho',
        async () => {
          await guideFill(
            page,
            warehousePage.address1Input,
            warehouse.address1,
          );

          await guideFill(
            page,
            warehousePage.address2Input,
            warehouse.address2,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 6,
            title: 'Nhập địa chỉ kho',
            target: warehousePage.address1Input,
          });
        },
      );

      await test.step(
        'Bước 7 - Nhập thành phố',
        async () => {
          await guideFill(
            page,
            warehousePage.cityInput,
            warehouse.city,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 7,
            title: 'Nhập thành phố',
            target: warehousePage.cityInput,
          });
        },
      );

      await test.step(
        'Bước 8 - Nhập số điện thoại',
        async () => {
          await guideFill(
            page,
            warehousePage.phoneInput,
            warehouse.phone,
          );

          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 8,
            title: 'Nhập số điện thoại',
            target: warehousePage.phoneInput,
          });
        },
      );

      await test.step(
        'Bước 9 - Lưu kho',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 9,
            title: 'Chọn nút Lưu',
            target: warehousePage.saveButton,
          });

          await warehousePage.save();

          await guidePause(page, 1_500);
        },
      );

      await test.step(
        'Bước 10 - Trở lại danh sách kho hàng',
        async () => {
          await captureGuideStep({
            page,
            testInfo,
            guideId: 'UG-011-create-warehouse',
            stepNumber: 10,
            title: 'Chọn nút Trở lại',
            target: warehousePage.backButton,
          });

          await warehousePage.backToList();

          await warehousePage.verifyCreated(
            warehouse.name,
          );

          await guidePause(page, 2_000);
        },
      );
    },
  );
});