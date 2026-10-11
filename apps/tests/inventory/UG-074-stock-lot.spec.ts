import { expect, Locator, test } from '@playwright/test';
import { NavigationPage } from '../../pages/NavigationPage';
import { InventoryPage } from '../../pages/catalogs/InventoryPage';
import { StockBalancePage } from '../../pages/inventory/StockBalancePage';
import { StockLotPage } from '../../pages/inventory/StockLotPage';
import { PurchaseReceiptPage } from '../../pages/purchasing/PurchaseReceiptPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guideFill, guidePause } from '../../helpers/video.helper';
import { createGuideStockLot } from '../../test-data/stockLot.data';

const GUIDE_ID = 'UG-074-stock-lot';

test.describe('UG-074 - Lô hàng', () => {
  test(
    'Hướng dẫn bật theo dõi lô cho vật liệu, nhận hàng có số lô và tra cứu lô hàng',
    { tag: ['@user-guide', '@inventory', '@stock-lot'] },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const inventoryPage = new InventoryPage(page);
      const receiptPage = new PurchaseReceiptPage(page);
      const lotPage = new StockLotPage(page);
      const balancePage = new StockBalancePage(page);
      const data = createGuideStockLot();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      // ===== Phần A: Vật liệu có theo dõi lô =====

      await test.step('Bước 2 - Mở Danh mục > Hàng tồn kho, Tạo mới', async () => {
        await navigation.catalogsMenu.click();

        const inventoryMenu = page.locator('a[href="/catalogs/inventory-item-list"]');

        await expect(inventoryMenu).toBeVisible({ timeout: 10_000 });
        await inventoryMenu.click();
        await capture('Mở Danh mục > Hàng tồn kho, bấm Tạo mới', inventoryPage.createButton);
        await inventoryPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Nhập mã, tên, nhóm và ĐVT lưu kho', async () => {
        await guideFill(page, inventoryPage.codeInput, data.item.code);
        await guideFill(page, inventoryPage.nameInput, data.item.name);
        await inventoryPage.selectFirstOption(inventoryPage.groupDropdown);
        await inventoryPage.selectOption(inventoryPage.unitDropdown, data.item.storageUnit);
        await capture('Nhập Mã, Tên, chọn Nhóm HTK và ĐVT lưu kho', inventoryPage.unitDropdown);
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Bật theo dõi lô', async () => {
        await inventoryPage.setLotTracking(data.item.lotTracking, data.item.lotPicking, data.item.shelfLifeDays);
        await capture('Chọn Theo dõi lô, cách chọn lô khi xuất (FEFO) và Hạn dùng (ngày)', inventoryPage.lotTrackingDropdown);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 5 - Lưu vật liệu', async () => {
        await capture('Bấm Lưu vật liệu', inventoryPage.saveButton);
        await inventoryPage.save();
        await inventoryPage.verifyCreated(data.item.name);
        await guidePause(page, 1_000);
      });

      // ===== Phần B: Nhận hàng có số lô =====

      await test.step('Bước 6 - Mở Mua hàng > Phiếu nhận hàng, Tạo mới', async () => {
        await receiptPage.openReceiptList();
        await capture('Mở Mua hàng > Phiếu nhận hàng, bấm Tạo mới', receiptPage.createButton);
        await receiptPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Chọn nhà cung cấp, kho nhận và nhập ghi chú', async () => {
        await receiptPage.selectSupplier(data.receipt.supplier);
        await receiptPage.selectWarehouse(data.receipt.warehouse);
        await guideFill(page, receiptPage.noteInput, data.receipt.note);
        await capture('Chọn nhà cung cấp, kho nhận; Ghi chú bắt buộc khi nhận ngoài đơn', receiptPage.noteInput);
        await guidePause(page, 800);
      });

      await test.step('Bước 8 - Thêm hàng và nhập thông tin lô', async () => {
        await receiptPage.addOtherItem({
          item: data.item.code,
          unit: data.receipt.unit,
          quantity: data.receipt.quantity,
          amount: data.receipt.amount,
          lot: {
            lotNumber: data.receipt.lotNumber,
            manufacturerLot: data.receipt.manufacturerLot,
            expiryDayNextMonth: data.receipt.expiryDayNextMonth,
          },
        });
        await capture('Nhập Số lô, Lô nhà sản xuất, Hạn dùng cho dòng hàng', receiptPage.lineRows.last());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Lưu và ghi sổ phiếu nhận', async () => {
        const receiptCode = await receiptPage.saveReceipt();

        console.log(`Phiếu nhận có lô: ${receiptCode}, số lô ${data.receipt.lotNumber}`);
        await capture('Bấm Ghi sổ để nhập kho và tạo lô', receiptPage.postButton);
        await receiptPage.post();
        await guidePause(page, 1_000);
      });

      // ===== Phần C: Tra cứu lô hàng =====

      await test.step('Bước 10 - Mở Quản lý kho > Lô hàng', async () => {
        await expect(lotPage.inventoryMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Quản lý kho, chức năng Lô hàng', lotPage.inventoryMenu);
        await lotPage.openLotList();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 11 - Tìm lô vừa nhập', async () => {
        const row = await lotPage.searchLot(data.receipt.lotNumber);

        await capture('Tìm theo số lô: Số lô NCC, Ngày nhập, Hạn dùng, Đơn giá nhập', row);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 12 - Mở chi tiết lô', async () => {
        await lotPage.openLot(data.receipt.lotNumber);
        await capture('Chi tiết lô: sửa Số lô NCC, Hạn dùng; nút Đổi số lô', lotPage.expiryInput);
        await guidePause(page, 1_200);
      });

      await test.step('Bước 13 - Xem tồn theo lô ở màn hình Tồn kho', async () => {
        await balancePage.openBalanceList();
        await balancePage.filterByItem(data.item.code);

        const detail = await balancePage.expandRow(balancePage.itemRow(data.item.code));

        await capture('Tồn kho > mở dòng để xem tồn theo từng lô', detail);
        await guidePause(page, 2_000);
      });
    },
  );
});
