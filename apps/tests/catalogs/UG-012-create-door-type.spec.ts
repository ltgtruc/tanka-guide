import { test, expect } from '@playwright/test';

import { NavigationPage } from '../../pages/NavigationPage';
import { DoorTypePage } from '../../pages/catalogs/DoorTypePage';

import { captureGuideStep } from '../../helpers/guide-step.helper';

import {
  guideFill,
  guidePause,
} from '../../helpers/video.helper';

import {
  createGuideDoorType,
} from '../../test-data/doorType.data';

test.describe(
  'UG-012 - Tạo loại cửa',
  () => {
    test(
      'Hướng dẫn tạo loại cửa mới',
      {
        tag: [
          '@user-guide',
          '@catalog',
          '@door-type',
        ],
      },
      async ({ page }, testInfo) => {
        const navigation =
          new NavigationPage(page);

        const doorTypePage =
          new DoorTypePage(page);

        const doorType =
          createGuideDoorType();

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
                'UG-012-create-door-type',
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
          'Bước 2 - Mở module Danh mục',
          async () => {
            const catalogMenu =
              page
                .getByRole('link', {
                  name: /danh mục/i,
                })
                .first();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-012-create-door-type',
              stepNumber: 2,
              title:
                'Chọn module Danh mục',
              target:
                catalogMenu,
            });

            await catalogMenu.click();

            await guidePause(
              page,
              1500,
            );
          },
        );

        await test.step(
          'Bước 3 - Mở chức năng Loại cửa',
          async () => {
            const doorTypeMenu =
              page
                .getByText(
                  /loại cửa/i,
                )
                .first();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-012-create-door-type',
              stepNumber: 3,
              title:
                'Chọn chức năng Loại cửa',
              target:
                doorTypeMenu,
            });

            await doorTypeMenu.click();

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
                'UG-012-create-door-type',
              stepNumber: 4,
              title:
                'Chọn nút Tạo mới',
              target:
                doorTypePage
                  .createButton,
            });

            await doorTypePage.openCreateForm();

            await guidePause(
              page,
              1000,
            );
          },
        );

        await test.step(
          'Bước 5 - Nhập thông tin loại cửa',
          async () => {
            await guideFill(
              page,
              doorTypePage.nameInput,
              doorType.name,
            );

            await doorTypePage
              .reportTypeDropdown
              .click();

            await page
              .getByText(
                doorType.reportType,
              )
              .click();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-012-create-door-type',
              stepNumber: 5,
              title:
                'Nhập tên và chọn loại báo cáo',
              target:
                doorTypePage.nameInput,
            });

            await guidePause(
              page,
              1000,
            );
          },
        );

        await test.step(
          'Bước 6 - Lưu dữ liệu',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-012-create-door-type',
              stepNumber: 6,
              title:
                'Lưu loại cửa',
              target:
                doorTypePage
                  .saveButton,
            });

            await doorTypePage.save();

            await guidePause(
              page,
              3000,
            );
          },
        );

        await test.step(
          'Bước 7 - Kiểm tra kết quả',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-012-create-door-type',
              stepNumber: 7,
              title:
                'Trở lại danh sách Loại cửa',
              target:
                doorTypePage
                  .backButton,
            });

            await doorTypePage
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