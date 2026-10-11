import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

/**
 * Quản lý kho > Khu vực lưu trữ (/inventories/stock-location-*).
 * Đã kiểm tra DOM thực tế:
 * - Danh sách: STT, Tên, Loại, Kho; lọc Từ khóa + Loại.
 * - Loại: Kho vật lý, Nhà cung cấp, Sản xuất, Phế liệu, Điều chỉnh, Khách
 *   hàng, Hàng đang chuyển. Loại "Kho vật lý" có thêm ô Kho * — mỗi kho chỉ
 *   một khu vực, không đổi được sau khi tạo; dropdown Kho vẫn liệt kê cả kho
 *   đã có khu vực.
 */
export class StockLocationPage extends BasePage {
  readonly inventoryMenu: Locator;
  readonly locationMenu: Locator;
  readonly listRows: Locator;

  readonly typeDropdown: Locator;
  readonly nameInput: Locator;
  readonly warehouseDropdown: Locator;

  constructor(page: Page) {
    super(page);

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.locationMenu = page.locator('a[href="/inventories/stock-location-list"]');
    this.listRows = page.locator('main table tbody tr');

    this.typeDropdown = this.formField(/^\s*loại\s*\*?\s*$/i).locator('.p-select').first();
    this.nameInput = this.formInput(/^\s*tên\s*\*?\s*$/i);
    this.warehouseDropdown = this.formField(/^\s*kho\s*\*?\s*$/i).locator('.p-select').first();
  }

  async openLocationList(): Promise<void> {
    if (!(await this.locationMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.locationMenu).toBeVisible({ timeout: 15_000 });
    await this.locationMenu.click();

    await this.page.waitForURL(/stock-location-list/i, { timeout: 30_000 });
    await expect(this.listRows.first()).toBeVisible({ timeout: 20_000 });
  }

  /** Tên kho (cột Kho) của các khu vực Kho vật lý đã có. */
  async getWarehousesWithLocation(): Promise<string[]> {
    const physicalRows = this.listRows.filter({ hasText: /kho vật lý/i });

    // Đợi dữ liệu thật thay cho dòng chờ tải trước khi đọc.
    await expect(physicalRows.first()).toBeVisible({ timeout: 20_000 });

    const texts = await physicalRows.locator('td:last-child').allInnerTexts();

    return texts.map((text) => text.trim()).filter(Boolean);
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/stock-location-details$/i, { timeout: 30_000 });
    await expect(this.typeDropdown).toBeVisible({ timeout: 20_000 });
  }

  async selectType(type: string): Promise<void> {
    await this.typeDropdown.click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
    // Đợi danh sách Loại đóng hẳn, tránh đọc nhầm lựa chọn khi mở ô Kho.
    await expect(this.page.locator('.p-select-overlay')).toHaveCount(0, { timeout: 10_000 });
  }

  /** Chọn kho cuối cùng trong danh sách chưa có khu vực (kho mới tạo gần nhất). */
  async selectNewestWarehouseWithoutLocation(existing: string[]): Promise<string> {
    await expect(this.warehouseDropdown).toBeVisible({ timeout: 10_000 });
    await this.warehouseDropdown.click();

    // Chỉ đọc listbox của chính ô Kho; danh sách tải bất đồng bộ — bỏ qua dòng
    // "No available options" lúc đang tải.
    const listboxId = await this.warehouseDropdown.locator('[role="combobox"]').getAttribute('aria-controls');
    const options = this.page
      .locator(`[id="${listboxId}"] [role="option"]`)
      .filter({ hasNotText: /no available options/i });

    await expect(options.first()).toBeVisible({ timeout: 10_000 });

    const names = (await options.allInnerTexts()).map((text) => text.trim());
    const free = names.filter((name) => !existing.includes(name));
    const target = free[free.length - 1];

    if (!target) {
      throw new Error('Mọi kho đều đã có khu vực lưu trữ — chạy UG-011 để tạo kho mới trước.');
    }

    await options.filter({ hasText: new RegExp(`^\\s*${escapeRegExp(target)}\\s*$`) }).first().click();

    return target;
  }

  async saveLocation(): Promise<void> {
    await this.save();

    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await this.page.waitForURL(/stock-location-details\/[0-9a-f-]+/i, { timeout: 20_000 });
  }

  locationRow(name: string): Locator {
    return this.listRows.filter({ hasText: name }).first();
  }
}
