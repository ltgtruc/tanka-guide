import { expect, Locator, Page } from '@playwright/test';

/**
 * Các nút cập nhật hàng loạt ở danh sách Danh mục > Hàng tồn kho.
 * Đã kiểm tra DOM thực tế:
 * - "Cập nhật các loại hao hụt" / "Cập nhật quy cách": nhập điều kiện (Từ khóa,
 *   Nhóm HTK, Loại hàng, Loại NVL, NSX) → Tìm kiếm → bảng có ô tích; ô giá trị
 *   chỉ mở khi đã tích dòng; request chỉ gửi ID các dòng đã tích; không có
 *   hộp xác nhận, toast "Lưu thành công".
 * - "Cập nhật thuế suất": KHÔNG có bước tìm/tích — áp cho mọi mặt hàng khớp
 *   điều kiện. Guide chỉ giới thiệu, không bấm Cập nhật.
 * - "Import": dialog thả file Excel với khoảng 30 cột.
 */
export class InventoryBulkUpdatePage {
  readonly page: Page;

  readonly catalogsMenu: Locator;
  readonly inventoryMenu: Locator;
  readonly toolbar: Locator;
  readonly dialog: Locator;

  constructor(page: Page) {
    this.page = page;

    this.catalogsMenu = page.getByRole('link', { name: /^\W*danh mục\W*$/i }).first();
    this.inventoryMenu = page.locator('a[href="/catalogs/inventory-item-list"]');
    this.toolbar = page.locator('main .page-right-content').first();
    this.dialog = page.locator('.p-dialog:visible').first();
  }

  toolbarButton(name: RegExp): Locator {
    return this.page.locator('main').getByRole('button', { name }).first();
  }

  async openInventoryList(): Promise<void> {
    if (!(await this.inventoryMenu.isVisible().catch(() => false))) {
      await this.catalogsMenu.click();
    }

    await this.inventoryMenu.click();
    await this.page.waitForURL(/inventory-item-list/i, { timeout: 30_000 });
    await expect(this.page.locator('main table tbody tr').first()).toBeVisible({ timeout: 20_000 });
  }

  async openDialog(buttonName: RegExp): Promise<void> {
    await this.toolbarButton(buttonName).click();
    await expect(this.dialog).toBeVisible({ timeout: 15_000 });
  }

  /** Tìm theo từ khóa trong dialog, tích dòng đầu; trả về mã mặt hàng đã tích. */
  async searchAndSelectFirst(keyword: string): Promise<string> {
    await this.dialog.getByRole('textbox').first().fill(keyword);
    await this.dialog.getByRole('button', { name: /tìm kiếm/i }).click();

    const row = this.dialog.locator('tbody tr').filter({ hasText: keyword }).first();

    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.getByRole('checkbox').check();
    await expect(this.dialog.getByRole('spinbutton').first()).toBeEnabled({ timeout: 10_000 });

    return (await row.locator('td').nth(1).innerText()).trim();
  }

  async fillValues(values: string[]): Promise<void> {
    const inputs = this.dialog.getByRole('spinbutton');

    for (const [index, value] of values.entries()) {
      const input = inputs.nth(index);

      await input.click();
      await input.press('Control+A');
      await input.pressSequentially(value, { delay: 30 });
      await input.press('Tab');
    }
  }

  updateButton(): Locator {
    return this.dialog.getByRole('button', { name: /cập nhật/i });
  }

  async submit(): Promise<void> {
    await this.updateButton().click();
    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
  }

  /** Đóng dialog nếu còn mở (sau Cập nhật thành công dialog tự đóng). */
  async closeDialog(): Promise<void> {
    const dialogs = this.page.locator('.p-dialog');
    const closedByItself = await expect(dialogs)
      .toHaveCount(0, { timeout: 3_000 })
      .then(() => true)
      .catch(() => false);

    if (!closedByItself) {
      await this.dialog.getByRole('button', { name: /đóng/i }).last().click();
      await expect(dialogs).toHaveCount(0, { timeout: 10_000 });
    }
  }
}
