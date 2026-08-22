import {
  expect,
  test,
} from '@playwright/test';

import { PriceStatusPage } from '../../pages/production/PriceStatusPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuidePriceStatus } from '../../test-data/priceStatus.data';

test.describe(
  'UG-031 - Chuyển trạng thái và tạo lệnh sản xuất',
  () => {
    test(
      'Hướng dẫn yêu cầu sản xuất từ đơn bán hàng',
      {
        tag: [
          '@user-guide',
          '@sales',
          '@production',
          '@price-status',
        ],
      },
      async ({ page }, testInfo) => {
        const priceStatusPage =
          new PriceStatusPage(page);
        const priceStatus =
          createGuidePriceStatus();

        let salesOrderCode =
          priceStatus.salesOrderCode;

        await test.step(
          'Bước 1 - Mở hệ thống',
          async () => {
            await page.goto('/');

            await expect(page).not.toHaveURL(
              /login/i,
              { timeout: 15_000 },
            );

            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 1,
              title: 'Mở trang chính Tanka',
            });

            await guidePause(page, 1_000);
          },
        );

        await test.step(
          'Bước 2 - Mở danh sách Đơn bán hàng',
          async () => {
            await priceStatusPage
              .openSalesOrderList();

            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 2,
              title: 'Mở danh sách Đơn bán hàng',
              target: priceStatusPage.salesOrderListHeading,
            });

            await guidePause(page, 1_500);
          },
        );

        await test.step(
          'Bước 3 - Mở đơn bán hàng mới tạo',
          async () => {
            salesOrderCode =
              await priceStatusPage
                .openNewestDraftSalesOrder(
                  salesOrderCode,
                );

            console.log(
              `Đơn bán hàng được chọn: ${salesOrderCode}`,
            );

            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 3,
              title: 'Mở đơn bán hàng mới tạo',
              target: priceStatusPage.currentStatus,
            });

            await priceStatusPage
              .expectCurrentStatus('Nháp');

            await guidePause(page, 1_500);
          },
        );

        await test.step(
          'Bước 4 - Chuyển trạng thái sang Đã gửi',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-031-create-price-status',
              stepNumber: 4,
              title:
                'Chuyển trạng thái sang Đã gửi',
              target:
                priceStatusPage.statusActionButton,
            });

            /*
             * Nháp → Đã gửi.
             *
             * changeStatus sẽ thực hiện:
             * - Bấm nút Chuyển trạng thái.
             * - Chọn button.dropdown-item "Đã gửi".
             * - Chờ popup Chuyển trạng thái sang: Đã gửi.
             * - Bấm Cập nhật.
             * - Bấm Đồng ý tại popup Xác nhận.
             */
            await priceStatusPage.changeStatus(
              priceStatus.sentStatus,
              priceStatus.statusNote,
            );

            /*
             * Sau khi cập nhật, giao diện có thể hiển thị:
             * "Đã gửi" hoặc "Đã gửi từ báo giá".
             * Regex trong expectCurrentStatus vẫn khớp được "Đã gửi".
             */
            await priceStatusPage.expectCurrentStatus(
              priceStatus.sentStatus,
            );

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
          'Bước 5 - Chuyển trạng thái sang Đã duyệt',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-031-create-price-status',
              stepNumber: 5,
              title:
                'Chuyển trạng thái sang Đã duyệt',
              target:
                priceStatusPage.statusActionButton,
            });

            /*
             * Đã gửi → Đã duyệt.
             */
            await priceStatusPage.changeStatus(
              priceStatus.approvedStatus,
              priceStatus.statusNote,
            );

            await priceStatusPage.expectCurrentStatus(
              priceStatus.approvedStatus,
            );

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
          'Bước 6 - Chuyển trạng thái sang Đã yêu cầu SX',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-031-create-price-status',
              stepNumber: 6,
              title:
                'Chuyển trạng thái sang Đã yêu cầu SX',
              target:
                priceStatusPage.statusActionButton,
            });

            /*
             * Đã duyệt → Đã yêu cầu SX.
             */
            await priceStatusPage.changeStatus(
              priceStatus.productionRequestedStatus,
              priceStatus.statusNote,
            );

            await priceStatusPage.expectCurrentStatus(
              priceStatus.productionRequestedStatus,
            );

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
          'Bước 7 - Mở Quản lý sản xuất',
          async () => {
            await priceStatusPage
              .openProductionManagement();

            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 7,
              title: 'Mở màn hình Quản lý sản xuất',
              target: priceStatusPage.productionHeading,
            });

            await guidePause(page, 1_500);
          },
        );

        await test.step(
          'Bước 8 - Chọn Tạo mới',
          async () => {
            await expect(
              priceStatusPage.createButton,
            ).toBeVisible({ timeout: 15_000 });

            await expect(
              priceStatusPage.createButton,
            ).toBeEnabled({ timeout: 15_000 });

            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 8,
              title: 'Chọn nút Tạo mới',
              target: priceStatusPage.createButton,
            });

            await priceStatusPage
              .openProductionCreateForm();

            await guidePause(page, 1_000);
          },
        );

        await test.step(
          'Bước 9 - Chọn kho hàng',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 9,
              title: `Chọn kho hàng ${priceStatus.warehouse}`,
              target: priceStatusPage.warehouseDropdown,
            });

            const selectedWarehouse =
              await priceStatusPage.selectDropdownOption(
                priceStatusPage.warehouseDropdown,
                priceStatus.warehouse,
              );

            console.log(
              `Kho hàng đã chọn: ${selectedWarehouse}`,
            );

            await guidePause(page, 1_000);
          },
        );

        await test.step(
          'Bước 10 - Chọn các dòng của đơn bán hàng',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId: 'UG-031-create-price-status',
              stepNumber: 10,
              title: 'Chọn các đơn bán hàng để sản xuất',
              target: priceStatusPage.chooseSalesOrdersButton,
            });

            await priceStatusPage
              .chooseSalesOrderLines(salesOrderCode);

            await guidePause(page, 1_500);
          },
        );

        await test.step(
          'Bước 11 - Lưu đơn sản xuất',
          async () => {
            await expect(
              priceStatusPage.saveButton,
            ).toBeVisible({
              timeout: 20_000,
            });

            await expect(
              priceStatusPage.saveButton,
            ).toBeEnabled({
              timeout: 15_000,
            });

            await priceStatusPage.saveButton
              .scrollIntoViewIfNeeded();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-031-create-price-status',
              stepNumber: 11,
              title:
                'Chọn nút Lưu',
              target:
                priceStatusPage.saveButton,
            });

            await priceStatusPage
              .saveProductionOrder();

            await guidePause(
              page,
              2_000,
            );
          },
        );
      },
    );
  },
);