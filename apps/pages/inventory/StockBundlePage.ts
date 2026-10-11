import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';

/**
 * Quản lý kho > Đầu thừa (/inventories/stock-bundle-list).
 * Đã kiểm tra DOM thực tế:
 * - Danh sách: Mã đầu thừa (DT_...), Mặt hàng, Kho, Chiều dài, Chiều dài
 *   thanh gốc, Lô, Nguồn (Từ kế hoạch cắt / Đăng ký tay), Trạng thái (Sẵn
 *   dùng / Đã dùng hết / Đã huỷ), Đang giữ cho; cột cuối có icon thùng rác
 *   "Huỷ". Lọc: Từ khóa, Mặt hàng (p-select tìm phía server), Kho, Trạng thái.
 * - Dialog "Đăng ký đầu thừa": Kho *, bảng Mặt hàng / Chiều dài (mm) / Số
 *   đoạn, nút Thêm, Nhập từ file, Đăng ký đầu thừa. Đăng ký KHÔNG đổi số tồn.
 */
export class StockBundlePage {
  readonly page: Page;

  readonly inventoryMenu: Locator;
  readonly bundleMenu: Locator;
  readonly listRows: Locator;
  readonly itemFilter: Locator;
  readonly registerButton: Locator;
  readonly registerDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.bundleMenu = page.locator('a[href="/inventories/stock-bundle-list"]');
    this.listRows = page.locator('main table tbody tr');
    this.itemFilter = page
      .locator('.c-component')
      .filter({ has: page.locator('label', { hasText: /^\s*mặt hàng\s*$/i }) })
      .locator('.p-select')
      .first();
    this.registerButton = page.locator('main').getByRole('button', { name: /đăng ký đầu thừa/i });
    this.registerDialog = page.getByRole('dialog', { name: /đăng ký đầu thừa/i });
  }

  async openBundleList(): Promise<void> {
    if (!(await this.bundleMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.bundleMenu).toBeVisible({ timeout: 15_000 });
    await this.bundleMenu.click();

    await this.page.waitForURL(/stock-bundle-list/i, { timeout: 30_000 });
    await expect(this.listRows.first()).toBeVisible({ timeout: 20_000 });
  }

  async openRegisterDialog(): Promise<void> {
    await this.registerButton.click();
    await expect(this.registerDialog).toBeVisible({ timeout: 15_000 });
  }

  private async fillNumber(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.press('Control+A');
    await input.pressSequentially(value, { delay: 30 });
    await input.press('Tab');
  }

  async fillRegistration(warehouse: string, itemCode: string, lengthMm: string, pieces: string): Promise<void> {
    await this.registerDialog.locator('.p-select').first().click();
    await this.page.getByRole('option', { name: warehouse, exact: true }).click();

    const row = this.registerDialog.locator('tbody tr').first();

    await row.locator('[role="combobox"]').click();
    await this.page.keyboard.type(itemCode, { delay: 50 });

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(itemCode)}`) })
      .first();

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();

    const numbers = row.locator('[role="spinbutton"]');

    await this.fillNumber(numbers.nth(0), lengthMm);
    await this.fillNumber(numbers.nth(1), pieces);
  }

  async submitRegistration(): Promise<void> {
    await this.registerDialog.getByRole('button', { name: /đăng ký đầu thừa/i }).click();

    await expect(this.page.getByText(/đã đăng ký \d+ đầu thừa/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.registerDialog).toBeHidden({ timeout: 15_000 });
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

  /** Đoạn đăng ký tay, đang Sẵn dùng, đúng chiều dài (mới nhất nếu trùng). */
  manualBundleRow(lengthText: string): Locator {
    return this.listRows
      .filter({ hasText: /đăng ký tay/i })
      .filter({ hasText: /sẵn dùng/i })
      // textContent của dòng ghép các ô liền nhau, nên khớp đúng một ô bằng chiều dài.
      .filter({ has: this.page.locator('td').filter({ hasText: new RegExp(`^\\s*${escapeRegExp(lengthText)}\\s*$`) }) })
      .last();
  }

  cancelIcon(row: Locator): Locator {
    return row.locator('i[title="Huỷ"]').first();
  }

  cancelDialog(): Locator {
    return this.page.getByRole('dialog', { name: /huỷ đầu thừa/i });
  }

  /** Bấm thùng rác → dialog "Huỷ đầu thừa DT_..." → nhập Lý do → bấm Huỷ. */
  async cancelBundle(row: Locator, reason: string): Promise<void> {
    const code = ((await row.innerText()).match(/DT_[A-Z0-9]+/) ?? [''])[0];

    await this.cancelIcon(row).click();

    const dialog = this.cancelDialog();

    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await dialog.locator('textarea').fill(reason);
    await dialog.getByRole('button', { name: /^\W*huỷ$/i }).click();

    await expect(this.listRows.filter({ hasText: code }).filter({ hasText: /đã huỷ/i })).toBeVisible({ timeout: 20_000 });
  }
}
