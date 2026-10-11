import { expect, Locator, Page } from '@playwright/test';

/**
 * Quản lý kho > Lô hàng (/inventories/stock-lot-*).
 * Đã kiểm tra DOM thực tế:
 * - Danh sách: Số lô (link chi tiết), Số lô NCC, Tên HTK, Ngày nhập, Hạn dùng,
 *   Đơn giá nhập; lọc Từ khóa tìm kiếm + Tên HTK.
 * - Chỉ có lô của mặt hàng bật "Theo dõi lô/serial"; lô sinh ra khi ghi sổ
 *   phiếu nhận hàng có Số lô.
 * - Chi tiết lô: sửa được Số lô NCC, Hạn dùng; nút Lưu, Đổi số lô, Trở lại.
 */
export class StockLotPage {
  readonly page: Page;

  readonly inventoryMenu: Locator;
  readonly lotMenu: Locator;
  readonly listRows: Locator;
  readonly keywordInput: Locator;
  readonly changeLotNumberButton: Locator;
  readonly expiryInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.lotMenu = page.locator('a[href="/inventories/stock-lot-list"]');
    this.listRows = page.locator('main table tbody tr');
    this.keywordInput = page
      .locator('.c-component')
      .filter({ has: page.locator('label', { hasText: /từ khóa tìm kiếm/i }) })
      .locator('input')
      .first();
    this.changeLotNumberButton = page.locator('main').getByRole('button', { name: /đổi số lô/i });
    this.expiryInput = page
      .locator('.c-component')
      .filter({ has: page.locator('label', { hasText: /^\s*hạn dùng\s*$/i }) })
      .locator('input')
      .first();
  }

  async openLotList(): Promise<void> {
    if (!(await this.lotMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.lotMenu).toBeVisible({ timeout: 15_000 });
    await this.lotMenu.click();

    await this.page.waitForURL(/stock-lot-list/i, { timeout: 30_000 });
    await expect(this.keywordInput).toBeVisible({ timeout: 20_000 });
  }

  async searchLot(lotNumber: string): Promise<Locator> {
    await this.keywordInput.fill(lotNumber);
    await this.keywordInput.press('Enter');

    const row = this.listRows.filter({ hasText: lotNumber }).first();

    await expect(row).toBeVisible({ timeout: 20_000 });

    return row;
  }

  lotLink(lotNumber: string): Locator {
    return this.page.getByRole('link', { name: lotNumber, exact: true }).first();
  }

  async openLot(lotNumber: string): Promise<void> {
    await this.lotLink(lotNumber).click();

    await this.page.waitForURL(/stock-lot-details/i, { timeout: 30_000 });
    await expect(this.changeLotNumberButton).toBeVisible({ timeout: 20_000 });
  }
}
