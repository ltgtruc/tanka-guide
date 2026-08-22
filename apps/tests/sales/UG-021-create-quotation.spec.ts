
import {
  expect,
  test,
} from '@playwright/test';

import { QuotationPage } from '../../pages/sales/QuotationPage';

import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideQuotation } from '../../test-data/quotation.data';

test.describe(
  'UG-021 - Tạo báo giá',
  () => {
    test(
      'Hướng dẫn tạo báo giá mới',
      {
        tag: [
          '@user-guide',
          '@sales',
          '@quotation',
        ],
      },
      async (
        {
          page,
        },
        testInfo,
      ) => {
        const quotationPage =
          new QuotationPage(page);

        const quotation =
          createGuideQuotation();

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
                'UG-021-create-quotation',
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
            const salesMenu = page
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
                'UG-021-create-quotation',
              stepNumber: 2,
              title:
                'Chọn module Bán hàng',
              target: salesMenu,
            });

            await salesMenu.click();

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
          'Bước 3 - Mở chức năng Báo giá',
          async () => {
            const quotationMenu =
              page
                .getByText(
                  /^báo giá$/i,
                )
                .first();

            await expect(
              quotationMenu,
            ).toBeVisible({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-021-create-quotation',
              stepNumber: 3,
              title:
                'Chọn chức năng Báo giá',
              target:
                quotationMenu,
            });

            await quotationMenu.click();

            /*
             * Chờ trang danh sách báo giá
             * hiển thị nút Tạo mới.
             */
            await quotationPage
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
              quotationPage.createButton,
            ).toBeVisible({
              timeout: 15_000,
            });

            await expect(
              quotationPage.createButton,
            ).toBeEnabled({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-021-create-quotation',
              stepNumber: 4,
              title:
                'Chọn nút Tạo mới',
              target:
                quotationPage.createButton,
            });

            await quotationPage
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
            /*
             * Chụp bước hướng dẫn tại
             * dropdown Khách hàng.
             */
            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-021-create-quotation',
              stepNumber: 5,
              title:
                'Chọn các thông tin bắt buộc',
              target:
                quotationPage
                  .customerDropdown,
            });

            /*
             * Khách hàng.
             *
             * Nếu quotation.customer rỗng
             * hoặc không tồn tại trong danh sách,
             * Page Object sẽ chọn option đầu tiên.
             */
            const selectedCustomer =
              await quotationPage
                .selectDropdownOption(
                  quotationPage
                    .customerDropdown,
                  quotation.customer,
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
              await quotationPage
                .selectDropdownOption(
                  quotationPage
                    .warehouseDropdown,
                  quotation.warehouse,
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
              await quotationPage
                .selectDropdownOption(
                  quotationPage
                    .quotationEmployeeDropdown,
                  quotation
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
             * Nhân viên kinh doanh.
             */
            const selectedSalesEmployee =
              await quotationPage
                .selectDropdownOption(
                  quotationPage
                    .salesEmployeeDropdown,
                  quotation.salesEmployee,
                );

            console.log(
              `Nhân viên kinh doanh đã chọn: ${selectedSalesEmployee}`,
            );

            await guidePause(
              page,
              700,
            );

            /*
             * Nhân viên thiết kế.
             */
            const selectedDesignerEmployee =
              await quotationPage
                .selectDropdownOption(
                  quotationPage
                    .designerEmployeeDropdown,
                  quotation
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
            /*
             * Giống hoàn toàn pattern của nút Tạo mới:
             * visible -> enabled -> capture -> Page Object click.
             */
            await expect(
              quotationPage.addButton,
            ).toBeVisible({
              timeout: 20_000,
            });

            await expect(
              quotationPage.addButton,
            ).toBeEnabled({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-021-create-quotation',
              stepNumber: 6,
              title:
                'Chọn nút Thêm',
              target:
                quotationPage.addButton,
            });

            /*
             * addNewLineItem() tự bấm nút Thêm
             * và trả về dòng mới.
             */
            const newRow =
              await quotationPage
                .addNewLineItem();

            await guidePause(
              page,
              1_000,
            );

            /*
             * Mở ô trống Tên HTK trong dòng vừa tạo.
             */
            await quotationPage
              .openInventoryDropdown(
                newRow,
              );

            await guidePause(
              page,
              500,
            );

            /*
             * Tìm DQ-01-TDA và chọn kết quả.
             */
            const selectedInventory =
              await quotationPage
                .searchAndSelectInventory(
                  quotation.lineItem
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
             * Nhập Mã bản vẽ D1.
             */
            await quotationPage
              .fillDrawingCode(
                quotation.lineItem
                  .drawingCode,
              );

            await guidePause(
              page,
              700,
            );

            /*
             * Chọn loại Kính.
             */
            await quotationPage
              .selectGlass(
                quotation.lineItem.glass,
              );

            await guidePause(
              page,
              1_000,
            );

            /*
             * Xem tab Các lựa chọn thuộc tính
             * và quay lại Thông số chung.
             */
            await quotationPage
              .reviewAttributeOptions();

            await guidePause(
              page,
              1_000,
            );

            /*
             * Cập nhật thông số.
             */
            await quotationPage
              .updateItemDetails();

            await guidePause(
              page,
              1_000,
            );

            /*
             * Đóng popup chi tiết.
             */
            await quotationPage
              .closeItemDetails();

            await guidePause(
              page,
              1_500,
            );
          },
        );

        await test.step(
  'Bước 7 - Lưu báo giá',
  async () => {
    // Cuộn lên đầu trang để hiển thị nút Lưu
    await page.evaluate(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    await guidePause(page, 1_500);

    await expect(
      quotationPage.saveButton,
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(
      quotationPage.saveButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await quotationPage.saveButton
      .scrollIntoViewIfNeeded();

    await captureGuideStep({
      page,
      testInfo,
      guideId: 'UG-021-create-quotation',
      stepNumber: 7,
      title: 'Chọn nút Lưu',
      target: quotationPage.saveButton,
    });

    await quotationPage.saveButton.click();

    await guidePause(page, 3_000);
  },
);

        await test.step(
          'Bước 8 - Trở lại danh sách',
          async () => {
            await expect(
              quotationPage.backButton,
            ).toBeVisible({
              timeout: 15_000,
            });

            await captureGuideStep({
              page,
              testInfo,
              guideId:
                'UG-021-create-quotation',
              stepNumber: 8,
              title:
                'Trở lại danh sách báo giá',
              target:
                quotationPage.backButton,
            });

            await quotationPage
              .backToQuotationList();

            await guidePause(
              page,
              2_000,
            );
          },
        );

        await test.step(
          'Bước 9 - Kiểm tra báo giá vừa tạo',
          async () => {
            await expect(
              page,
            ).toHaveURL(
              /sales-quote-list|sales-order-list/i,
              {
                timeout: 30_000,
              },
            );

            /*
             * Xác nhận đã trở về một trong hai màn hình
             * danh sách được thể hiện bởi phiên bản hệ thống.
             */
            const listHeading = page
              .getByText(
                /báo giá|đơn bán hàng/i,
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
                'UG-021-create-quotation',
              stepNumber: 9,
              title:
                'Kiểm tra báo giá vừa tạo',
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
