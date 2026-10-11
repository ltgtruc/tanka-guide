import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';

/**
 * Quản lý kho > Kiểm kê (/inventories/physical-count-*).
 * Đã kiểm tra DOM thực tế:
 * - Form: Loại kiểm kê * (Toàn kho / Từng phần), Kho *, Ngày kiểm kê *, Ghi
 *   chú; Phạm vi: Mặt hàng (p-multiselect, ô lọc phải bấm vào rồi gõ chậm),
 *   Nhóm hàng, Loại HTK, Loại vật tư, Chưa kiểm trong (ngày), Chỉ hàng tồn âm.
 * - Nháp: Lưu, "Bắt đầu kiểm kê" (xác nhận — KHOÁ sổ các mặt hàng được chọn
 *   đến khi đối chiếu/huỷ), Huỷ phiếu.
 * - Đang đếm: bảng thẻ (SL đếm, không hiện SL sổ sách), "Lưu số đếm",
 *   "Chuyển duyệt", "Đặt 0 cho thẻ chưa đếm", "+ Thêm thẻ".
 * - Đang duyệt: hiện SL sổ sách / SL đếm / Chênh lệch / Giá trị; "Đếm lại",
 *   "Đối chiếu & điều chỉnh" (xác nhận — sinh phiếu Điều chỉnh DC_..., mở khoá).
 */
export class PhysicalCountPage extends BasePage {
  readonly inventoryMenu: Locator;
  readonly countMenu: Locator;
  readonly listRows: Locator;

  readonly countTypeDropdown: Locator;
  readonly warehouseDropdown: Locator;
  readonly noteInput: Locator;
  readonly itemMultiSelect: Locator;
  readonly codeInput: Locator;

  readonly startCountButton: Locator;
  readonly saveCountsButton: Locator;
  readonly submitReviewButton: Locator;
  readonly recountButton: Locator;
  readonly reconcileButton: Locator;
  readonly confirmButton: Locator;
  readonly tagRows: Locator;
  readonly adjustmentLink: Locator;

  constructor(page: Page) {
    super(page);

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.countMenu = page.locator('a[href="/inventories/physical-count-list"]');
    this.listRows = page.locator('main table tbody tr');

    this.countTypeDropdown = this.formField(/^\s*loại kiểm kê\s*\*?\s*$/i).locator('.p-select').first();
    this.warehouseDropdown = this.formField(/^\s*kho\s*\*?\s*$/i).locator('.p-select').first();
    this.noteInput = this.formInput(/^\s*ghi chú\s*$/i);
    this.itemMultiSelect = this.formField(/^\s*mặt hàng\s*$/i).locator('.p-multiselect').first();
    this.codeInput = this.formInput(/^\s*số phiếu\s*$/i);

    const main = page.locator('main');

    this.startCountButton = main.getByRole('button', { name: /bắt đầu kiểm kê/i });
    this.saveCountsButton = main.getByRole('button', { name: /lưu số đếm/i });
    this.submitReviewButton = main.getByRole('button', { name: /chuyển duyệt/i });
    this.recountButton = main.getByRole('button', { name: /đếm lại/i });
    this.reconcileButton = main.getByRole('button', { name: /đối chiếu/i });
    this.confirmButton = page.getByRole('alertdialog', { name: /xác nhận/i }).getByRole('button', { name: /đồng ý/i });
    this.tagRows = main.locator('table tbody tr').filter({ has: page.locator('td') });
    this.adjustmentLink = main.locator('a[href*="inventory-document-details"]').first();
  }

  async openCountList(): Promise<void> {
    if (!(await this.countMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.countMenu).toBeVisible({ timeout: 15_000 });
    await this.countMenu.click();

    await this.page.waitForURL(/physical-count-list/i, { timeout: 30_000 });
    await expect(this.listRows.first()).toBeVisible({ timeout: 20_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/physical-count-details$/i, { timeout: 30_000 });
    await expect(this.warehouseDropdown).toBeVisible({ timeout: 20_000 });
  }

  async selectWarehouse(warehouse: string): Promise<void> {
    await this.warehouseDropdown.click();
    await this.page.getByRole('option', { name: warehouse, exact: true }).click();
  }

  /** Chọn mặt hàng trong phạm vi kiểm kê (multiselect, nhãn là mã hàng). */
  async selectScopeItem(itemCode: string): Promise<void> {
    await this.itemMultiSelect.click();

    const overlay = this.page.locator('.p-multiselect-overlay:visible').first();
    const filterInput = overlay.locator('input.p-multiselect-filter');

    await expect(filterInput).toBeVisible({ timeout: 10_000 });
    // Bấm vào ô lọc rồi gõ chậm: gõ lúc danh sách chưa tải xong thì không lọc.
    await filterInput.click();
    await filterInput.pressSequentially(itemCode, { delay: 80 });

    const option = overlay.getByRole('option', { name: itemCode, exact: true });

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
    await this.page.keyboard.press('Escape');

    await expect(this.itemMultiSelect).toContainText(itemCode, { timeout: 10_000 });
  }

  async saveCount(): Promise<string> {
    await this.save();

    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.startCountButton).toBeVisible({ timeout: 20_000 });
    await expect(this.codeInput).toHaveValue(/KK_\d+_\d+/, { timeout: 20_000 });

    return this.codeInput.inputValue();
  }

  async startCounting(): Promise<void> {
    await this.startCountButton.click();
    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    await expect(this.page.getByText(/đã tạo \d+ thẻ kiểm kê/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.saveCountsButton).toBeVisible({ timeout: 20_000 });
  }

  tagRow(itemCode: string): Locator {
    return this.tagRows.filter({ hasText: itemCode }).first();
  }

  async enterCount(itemCode: string, quantity: string): Promise<void> {
    const input = this.tagRow(itemCode).getByRole('spinbutton').first();

    await input.click();
    await input.press('Control+A');
    await input.pressSequentially(quantity, { delay: 30 });
    await input.press('Tab');
  }

  async saveCounts(): Promise<void> {
    await this.saveCountsButton.click();
    await expect(this.page.getByText(/đã lưu số đếm/i).first()).toBeVisible({ timeout: 20_000 });
  }

  async submitForReview(): Promise<void> {
    await this.submitReviewButton.click();
    await expect(this.reconcileButton).toBeVisible({ timeout: 20_000 });
  }

  async reconcile(): Promise<string> {
    await this.reconcileButton.click();
    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    const toast = this.page.getByText(/đã đối chiếu bằng phiếu/i).first();

    await expect(toast).toBeVisible({ timeout: 30_000 });
    await expect(this.adjustmentLink).toBeVisible({ timeout: 20_000 });

    return ((await toast.innerText()).match(/DC_\d+_\d+/) ?? [''])[0];
  }
}
