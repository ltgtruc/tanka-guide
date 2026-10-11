import { expect, Locator, Page } from '@playwright/test';

/**
 * Quản lý kho > Kỳ kho (/inventories/inventory-period-*).
 * Đã kiểm tra DOM thực tế:
 * - Danh sách: Năm, Tháng (link tới chi tiết), Trạng thái (Đang mở...), Ngày
 *   tạo, Người tạo; lọc theo Năm (spinbutton).
 * - Chi tiết "Kỳ kho MM/YYYY": nút "Khóa kỳ", "Trạng thái: ...", bảng "Số liệu
 *   kỳ" (Tên HTK, Kho, Đầu kỳ / Nhập / Xuất / Cuối kỳ theo SL và GT, Giá BQ kỳ).
 * - KHÔNG bấm "Khóa kỳ" trong guide: khóa kỳ hiện tại sẽ chặn ghi sổ mọi
 *   chứng từ trong tháng.
 */
export class InventoryPeriodPage {
  readonly page: Page;

  readonly inventoryMenu: Locator;
  readonly periodMenu: Locator;
  readonly listRows: Locator;
  readonly lockButton: Locator;
  readonly statusText: Locator;
  readonly figuresHeading: Locator;
  readonly figuresTable: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.periodMenu = page.locator('a[href="/inventories/inventory-period-list"]');
    this.listRows = page.locator('main table tbody tr');
    this.lockButton = page.locator('main').getByRole('button', { name: /khóa kỳ/i });
    this.statusText = page.locator('main').getByText(/^\s*trạng thái:/i).first();
    this.figuresHeading = page.getByRole('heading', { name: /số liệu kỳ/i });
    this.figuresTable = page.locator('main table').first();
  }

  async openPeriodList(): Promise<void> {
    if (!(await this.periodMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.periodMenu).toBeVisible({ timeout: 15_000 });
    await this.periodMenu.click();

    await this.page.waitForURL(/inventory-period-list/i, { timeout: 30_000 });
    await expect(this.listRows.first().locator('a').first()).toBeVisible({ timeout: 20_000 });
  }

  /** Dòng kỳ đang mở mới nhất. */
  openPeriodRow(): Locator {
    return this.listRows.filter({ hasText: /đang mở/i }).first();
  }

  async openPeriod(row: Locator): Promise<string> {
    const link = row.locator('a').last();
    const period = `${(await row.locator('a').first().innerText()).trim()}/${(await link.innerText()).trim()}`;

    await link.click();

    await this.page.waitForURL(/inventory-period-details/i, { timeout: 30_000 });
    await expect(this.figuresHeading).toBeVisible({ timeout: 20_000 });
    await expect(this.figuresTable.locator('tbody tr').first()).toBeVisible({ timeout: 20_000 });

    return period;
  }
}
