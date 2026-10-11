import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';

/**
 * Quản lý kho > Tồn kho (/inventories/stock-balance-list) — chỉ tra cứu.
 * Đã kiểm tra DOM thực tế:
 * - Lọc: Tên HTK (p-select tìm phía server — phải gõ từng phím), Kho (p-select).
 * - Cột: Tên HTK, Kho, ĐVT, Tồn, Đã giữ cho SX, Khả dụng, Đang đặt mua,
 *   Đang chuyển đến, Giá bình quân, Giá nhập gần nhất.
 * - Mỗi dòng có nút "Row Collapsed" để mở "Tồn theo lô".
 * - Nút "Tính lại tồn kho" (ghi dữ liệu) — guide chỉ giới thiệu, không bấm.
 */
export class StockBalancePage {
  readonly page: Page;

  readonly inventoryMenu: Locator;
  readonly balanceMenu: Locator;
  readonly heading: Locator;
  readonly listRows: Locator;
  readonly tableHeader: Locator;
  readonly itemFilter: Locator;
  readonly warehouseFilter: Locator;
  readonly recalculateButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.balanceMenu = page.locator('a[href="/inventories/stock-balance-list"]');
    this.heading = page.getByText(/^\s*tồn kho\s*$/i).first();
    this.listRows = page.locator('main table tbody tr');
    this.tableHeader = page.locator('main table thead').first();

    const filter = (label: RegExp) =>
      page
        .locator('.c-component')
        .filter({ has: page.locator('label', { hasText: label }) })
        .first()
        .locator('.p-select')
        .first();

    this.itemFilter = filter(/^\s*tên htk\s*$/i);
    this.warehouseFilter = filter(/^\s*kho\s*$/i);
    this.recalculateButton = page.getByRole('button', { name: /tính lại tồn kho/i });
  }

  async openBalanceList(): Promise<void> {
    if (!(await this.balanceMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.balanceMenu).toBeVisible({ timeout: 15_000 });
    await this.balanceMenu.click();

    await this.page.waitForURL(/stock-balance-list/i, { timeout: 30_000 });
    await expect(this.listRows.first()).toBeVisible({ timeout: 20_000 });
  }

  itemRow(itemCode: string): Locator {
    return this.listRows.filter({ hasText: itemCode }).first();
  }

  async filterByItem(itemCode: string): Promise<void> {
    await this.itemFilter.click();
    await this.page.keyboard.type(itemCode, { delay: 50 });

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(itemCode)}`) })
      .first();

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();

    await expect(this.listRows.filter({ hasNotText: itemCode })).toHaveCount(0, { timeout: 20_000 });
  }

  async filterByWarehouse(warehouse: string): Promise<void> {
    await this.warehouseFilter.click();
    await this.page.getByRole('option', { name: warehouse, exact: true }).click();

    await expect(this.listRows.first()).toContainText(warehouse, { timeout: 20_000 });
  }

  /** Mở dòng để xem "Tồn theo lô"; trả về locator vùng chi tiết vừa mở. */
  async expandRow(row: Locator): Promise<Locator> {
    await row.getByRole('button', { name: /row collapsed/i }).click();

    const detail = this.page.getByText(/tồn theo lô/i).first();

    await expect(detail).toBeVisible({ timeout: 15_000 });

    return detail;
  }
}
