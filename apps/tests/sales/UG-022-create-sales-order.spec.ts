import {
  expect,
  test,
} from '@playwright/test';

import { SalesOrderPage } from '../../pages/sales/SalesOrderPage';

import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideSalesOrder } from '../../test-data/saleOrder.data';

test.describe(
  'UG-022 - Tạo đơn bán hàng',
  () => {
    test(
      'Hướng dẫn tạo đơn bán hàng mới',
      {
        tag: [
          '@user-guide',
          '@sales',
          '@sales-order',
        ],
      },
      async (
        {
          page,
        },
        testInfo,
      ) => {
        const salesOrderPage =
          new SalesOrderPage(page);
      
        const salesOrder =
          createGuideSalesOrder();

        await test.step(
          'Bước 1 - Mở hệ thống',
          async () => {
            await page.goto('/');

            await expect(
              page,
            ).not.toHaveURL(
              /login/i,
              {
                timeout: 15_000,
              },
            );

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 1,
              title:
                'Mở trang chính Tanka',
            });

            await guidePause(
              page,
              1_000,
            );
          },
        );

        await test.step(
          'Bước 2 - Mở module Bán hàng',
          async () => {
            const salesMenu =
              page
                .getByRole(
                  'link',
                  {
                    name: /bán hàng/i,
                  },
                )
                .first();

            await expect(
              salesMenu,
            ).toBeVisible({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 2,
              title:
                'Chọn module Bán hàng',
              target:
                salesMenu,
            });

            await salesMenu.click();

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
          'Bước 3 - Mở chức năng Đơn bán hàng',
          async () => {
            const salesOrderMenu =
              page
                .getByText(
                  /^đơn bán hàng$/i,
                )
                .first();

            await expect(
              salesOrderMenu,
            ).toBeVisible({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 3,
              title:
                'Chọn chức năng Đơn bán hàng',
              target:
                salesOrderMenu,
            });

            await salesOrderMenu.click();

            await salesOrderPage
              .verifyPageOpened();

            await guidePause(
              page,
              2_000,
            );
          },
        );

        await test.step(
          'Bước 4 - Chọn Tạo mới',
          async () => {
            await expect(
              salesOrderPage.createButton,
            ).toBeVisible({
              timeout: 15_000,
            });

            await expect(
              salesOrderPage.createButton,
            ).toBeEnabled({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 4,
              title:
                'Chọn nút Tạo mới',
              target:
                salesOrderPage.createButton,
            });

            await salesOrderPage
              .openCreateForm();

            await guidePause(
              page,
              1_000,
            );
          },
        );

        await test.step(
          'Bước 5 - Chọn thông tin bắt buộc',
          async () => {
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 5,
              title:
                'Chọn các thông tin bắt buộc',
              target:
                salesOrderPage
                  .customerDropdown,
            });

            /*
             * Khách hàng.
             */
            const selectedCustomer =
              await salesOrderPage
                .selectDropdownOption(
                  salesOrderPage
                    .customerDropdown,
                  salesOrder.customer,
                );

            console.log(
              `Khách hàng đã chọn: ${selectedCustomer}`,
            );

            await guidePause(
              page,
              700,
            );

            /*
             * Kho hàng.
             */
            const selectedWarehouse =
              await salesOrderPage
                .selectDropdownOption(
                  salesOrderPage
                    .warehouseDropdown,
                  salesOrder.warehouse,
                );

            console.log(
              `Kho hàng đã chọn: ${selectedWarehouse}`,
            );

            await guidePause(
              page,
              700,
            );

            /*
             * Nhân viên báo giá.
             */
            const selectedQuotationEmployee =
              await salesOrderPage
                .selectDropdownOption(
                  salesOrderPage
                    .quotationEmployeeDropdown,
                  salesOrder
                    .quotationEmployee,
                );

            console.log(
              `Nhân viên BG đã chọn: ${selectedQuotationEmployee}`,
            );

            await guidePause(
              page,
              700,
            );

            /*
             * Nhân viên bán hàng.
             */
            const selectedSalesEmployee =
              await salesOrderPage
                .selectDropdownOption(
                  salesOrderPage
                    .salesEmployeeDropdown,
                  salesOrder.salesEmployee,
                );

            console.log(
              `Nhân viên BH đã chọn: ${selectedSalesEmployee}`,
            );

            await guidePause(
              page,
              700,
            );

            /*
             * Nhân viên thiết kế.
             */
            const selectedDesignerEmployee =
              await salesOrderPage
                .selectDropdownOption(
                  salesOrderPage
                    .designerEmployeeDropdown,
                  salesOrder
                    .designerEmployee,
                );

            console.log(
              `Nhân viên thiết kế đã chọn: ${selectedDesignerEmployee}`,
            );

            await guidePause(
              page,
              1_000,
            );
          },
        );

        await test.step(
          'Bước 6 - Thêm và cấu hình dòng HTK',
          async () => {
            await expect(
              salesOrderPage.addButton,
            ).toBeVisible({
              timeout: 20_000,
            });

            await expect(
              salesOrderPage.addButton,
            ).toBeEnabled({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 6,
              title:
                'Chọn nút Thêm',
              target:
                salesOrderPage.addButton,
            });

            const newRow =
              await salesOrderPage
                .addNewLineItem();

            await guidePause(
              page,
              1_000,
            );

            /*
             * Mở Tên HTK của dòng vừa tạo.
             */
            await salesOrderPage
              .openInventoryDropdown(
                newRow,
              );

            await guidePause(
              page,
              500,
            );

            /*
             * Tìm HTK và chọn một dòng có giá.
             */
            const selectedInventory =
              await salesOrderPage
                .searchAndSelectInventory(
                  salesOrder.lineItem
                    .inventorySearch,
                );

            console.log(
              `HTK đã chọn: ${selectedInventory}`,
            );

            await guidePause(
              page,
              1_000,
            );

            /*
             * Nhập Mã bản vẽ.
             */
            await salesOrderPage
              .fillDrawingCode(
                salesOrder.lineItem
                  .drawingCode,
              );

            await guidePause(
              page,
              700,
            );

            /*
             * Chọn Kính.
             */
            const selectedGlass =
              await salesOrderPage
                .selectGlass(
                  salesOrder.lineItem
                    .glass,
                );

            console.log(
              `Kính đã chọn: ${selectedGlass}`,
            );

            await guidePause(
              page,
              1_000,
            );

            /*
             * Xem Các lựa chọn thuộc tính.
             * Video xem phần cấu hình trước khi cập nhật.
             */
            await salesOrderPage
              .reviewAttributeOptions();

            await guidePause(
              page,
              1_000,
            );

            /*
             * Cập nhật dòng HTK.
             */
            await salesOrderPage
              .updateItemDetails();

            await guidePause(
              page,
              1_000,
            );

            /*
             * Đóng popup nếu popup chưa tự đóng.
             */
            await salesOrderPage
              .closeItemDetails();

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
          'Bước 7 - Lưu đơn bán hàng',
          async () => {
            /*
             * Giống video: sau khi cấu hình HTK đang ở phần dưới,
             * cuộn lên đầu form trước khi bấm Lưu.
             */
            await salesOrderPage
              .scrollToTop();

            await expect(
              salesOrderPage.saveButton,
            ).toBeVisible({
              timeout: 20_000,
            });

            await expect(
              salesOrderPage.saveButton,
            ).toBeEnabled({
              timeout: 15_000,
            });

            await salesOrderPage.saveButton
              .scrollIntoViewIfNeeded();

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 7,
              title:
                'Chọn nút Lưu',
              target:
                salesOrderPage.saveButton,
            });

            /*
             * Click trực tiếp giống UG-021 đang chạy ổn.
             * Không bắt buộc toast phải xuất hiện.
             */
            await salesOrderPage
              .saveButton
              .click();

            await guidePause(
              page,
              3_000,
            );
          },
        );

        await test.step(
          'Bước 8 - Trở lại danh sách',
          async () => {
            await expect(
              salesOrderPage.backButton,
            ).toBeVisible({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 8,
              title:
                'Trở lại danh sách đơn bán hàng',
              target:
                salesOrderPage.backButton,
            });

            await salesOrderPage
              .backToSalesOrderList();

            await guidePause(
              page,
              2_000,
            );
          },
        );

        await test.step(
          'Bước 9 - Kiểm tra đơn bán hàng vừa tạo',
          async () => {
            await expect(
              page,
            ).toHaveURL(
              /sales-order-list|orders\/sales-order(?!-details)/i,
              {
                timeout: 30_000,
              },
            );

            const listHeading =
              page
                .getByText(
                  /đơn bán hàng/i,
                )
                .first();

            await expect(
              listHeading,
            ).toBeVisible({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-022-create-sales-order',
              stepNumber: 9,
              title:
                'Kiểm tra đơn bán hàng vừa tạo',
            });

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