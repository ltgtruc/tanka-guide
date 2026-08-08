import { test, expect } from '@playwright/test';

import { NavigationPage } from '../../pages/NavigationPage';
import { ProductionListPage } from '../../pages/production/ProductionListPage';

import { captureGuideStep } from '../../helpers/guide-step.helper';

import {
  guideFill,
  guidePause,
} from '../../helpers/video.helper';

import {
  createGuideProductionList,
} from '../../test-data/productionList.data';

test.describe(
  'UG-030 - Tạo đơn theo dõi sản xuất',
  () => {
    test(
      'Hướng dẫn tạo đơn theo dõi sản xuất',
      {
        tag: [
          '@user-guide',
          '@production',
        ],
      },
      async ({ page }, testInfo) => {
        const navigation =
          new NavigationPage(page);

        const productionPage =
          new ProductionListPage(page);

        const production =
          createGuideProductionList();

        await test.step(
          'Bước 1 - Mở hệ thống',
          async () => {
            await page.goto('/');

            await expect(page)
              .not.toHaveURL(/login/i);

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 1,
              title:
                'Mở trang chính Tanka',
            });

            await guidePause(
              page,
              1000,
            );
          },
        );

        await test.step(
          'Bước 2 - Mở module Sản xuất',
          async () => {
            const productionMenu =
              page
                .getByRole('link', {
                  name: /sản xuất/i,
                })
                .first();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 2,
              title:
                'Chọn module Sản xuất',
              target:
                productionMenu,
            });

            await productionMenu.click();

            await guidePause(
              page,
              1500,
            );
          },
        );

        await test.step(
          'Bước 3 - Mở Quản lý SX',
          async () => {
            const productionListMenu =
              page
                .getByText(
                  /quản lý sx/i,
                )
                .first();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 3,
              title:
                'Chọn chức năng Quản lý SX',
              target:
                productionListMenu,
            });

            await productionListMenu.click();

            await guidePause(
              page,
              2000,
            );
          },
        );

        await test.step(
          'Bước 4 - Chọn Tạo mới',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 4,
              title:
                'Chọn nút Tạo mới',
              target:
                productionPage
                  .createButton,
            });

            await productionPage.openCreateForm();

            await guidePause(
              page,
              1000,
            );
          },
        );

        await test.step(
          'Bước 5 - Nhập thông tin bắt buộc',
          async () => {
            await productionPage
              .warehouseDropdown
              .click();

            await page
              .getByText(
                production.warehouse,
              )
              .click();

            await guideFill(
              page,
              productionPage
                .descriptionInput,
              production.description,
            );

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 5,
              title:
                'Chọn kho hàng và nhập diễn giải',
              target:
                productionPage
                  .descriptionInput,
            });

            await guidePause(
              page,
              1000,
            );
          },
        );

        await test.step(
          'Bước 6 - Chọn các đơn BH',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 6,
              title:
                'Chọn các đơn BH để sản xuất',
              target:
                productionPage
                  .chooseSalesOrderButton,
            });

            await productionPage
              .chooseSalesOrderButton
              .click();

            await guidePause(
              page,
              1500,
            );
          },
        );

        await test.step(
          'Bước 7 - Chọn đơn hàng',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 7,
              title:
                'Tích chọn dòng đơn hàng',
              target:
                productionPage
                  .salesOrderCheckbox,
            });

            await productionPage
              .salesOrderCheckbox
              .check();

            await guidePause(
              page,
              1000,
            );
          },
        );

        await test.step(
          'Bước 8 - Xác nhận chọn',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 8,
              title:
                'Chọn đơn hàng',
              target:
                productionPage
                  .popupSelectButton,
            });

            await productionPage
              .popupSelectButton
              .click();

            await guidePause(
              page,
              1500,
            );
          },
        );

        await test.step(
          'Bước 9 - Lưu dữ liệu',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 9,
              title:
                'Lưu đơn theo dõi sản xuất',
              target:
                productionPage
                  .saveButton,
            });

            await productionPage.save();

            await guidePause(
              page,
              3000,
            );
          },
        );

        await test.step(
          'Bước 10 - Kiểm tra kết quả',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-030-create-production-list',
              stepNumber: 10,
              title:
                'Trở lại danh sách Quản lý SX',
              target:
                productionPage
                  .backButton,
            });

            await productionPage
              .backToList();

            await guidePause(
              page,
              2000,
            );
          },
        );
      },
    );
  },
);