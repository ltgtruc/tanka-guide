import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

export interface DocumentLine {
  /** "Nhập" / "Xuất" — phiếu Chuyển kho cố định "Xuất" nên bỏ trống. */
  direction?: string;
  itemCode: string;
  quantity: string;
  /** Bỏ trống để hệ thống tự lấy giá bình quân. */
  unitPrice?: string;
  /** Lý do (chỉ phiếu Điều chỉnh): Tồn đầu kỳ, Điều chỉnh kiểm kê, Hao hụt, Phế liệu, Nhập sai, Khác. */
  reason?: string;
}

/**
 * Quản lý kho > Phiếu kho (/inventories/inventory-document-*).
 * Đã kiểm tra DOM thực tế:
 * - Tạo tay được 4 loại: Phiếu xuất, Chuyển kho, Điều chỉnh, Đánh giá lại.
 *   Form: Loại phiếu *, Kho *, Ngày *, Điểm đối ứng *, Ghi chú; Chuyển kho có
 *   thêm Kho nhận *.
 * - Dòng chi tiết (nút "+ Thêm"): Chiều (Nhập/Xuất), Tên HTK (p-select có ô lọc
 *   tìm phía server — phải GÕ từng phím, fill() không kích hoạt tìm), ĐVT,
 *   Số lượng, Đơn giá, Thành tiền, Lý do (Điều chỉnh), Số lô.
 * - Nháp: Lưu / Ghi sổ / Hủy. Ghi sổ phiếu thường mở alertdialog "Xác nhận";
 *   phiếu Chuyển kho mở dialog "Ghi sổ phiếu chuyển kho" có ô "Nhận ngay".
 * - Đã ghi sổ: "Xuất phiếu đảo"; Chuyển kho chưa nhận có thêm "Nhận hàng".
 */
export class InventoryDocumentPage extends BasePage {
  readonly inventoryMenu: Locator;
  readonly documentMenu: Locator;
  readonly listRows: Locator;
  readonly typeFilter: Locator;

  readonly typeDropdown: Locator;
  readonly warehouseDropdown: Locator;
  readonly counterpartDropdown: Locator;
  readonly receivingWarehouseDropdown: Locator;
  readonly noteInput: Locator;
  readonly codeInput: Locator;
  readonly addLineButton: Locator;
  readonly lineRows: Locator;

  readonly postButton: Locator;
  readonly reverseButton: Locator;
  readonly receiveButton: Locator;
  readonly confirmButton: Locator;
  readonly transferPostDialog: Locator;
  readonly transferReceiveDialog: Locator;
  readonly receiptSection: Locator;

  constructor(page: Page) {
    super(page);

    this.inventoryMenu = page.getByRole('link', { name: /^\W*quản lý kho\W*$/i }).first();
    this.documentMenu = page.locator('a[href="/inventories/inventory-document-list"]');
    this.listRows = page.locator('main table tbody tr');
    this.typeFilter = this.formField(/^\s*loại phiếu\s*$/i).locator('.p-multiselect, .p-select').first();

    this.typeDropdown = this.formField(/^\s*loại phiếu\s*\*?\s*$/i).locator('.p-select').first();
    this.warehouseDropdown = this.formField(/^\s*kho\s*\*\s*$/i).locator('.p-select').first();
    this.counterpartDropdown = this.formField(/^\s*điểm đối ứng\s*\*?\s*$/i).locator('.p-select').first();
    this.receivingWarehouseDropdown = this.formField(/^\s*kho nhận\s*\*?\s*$/i).locator('.p-select').first();
    this.noteInput = this.formInput(/^\s*ghi chú\s*$/i);
    this.codeInput = this.formInput(/^\s*số phiếu\s*$/i);
    // Tên nút là "+ Thêm" (ký tự + ở đầu), không trùng nút nào khác trên form.
    this.addLineButton = page.locator('main').getByRole('button', { name: /^\W*thêm$/i });
    this.lineRows = page.locator('main table tbody tr').filter({ has: page.locator('[role="combobox"]') });

    this.postButton = page.locator('main').getByRole('button', { name: /^\W*ghi sổ$/i });
    this.reverseButton = page.locator('main').getByRole('button', { name: /xuất phiếu đảo/i });
    this.receiveButton = page.locator('main').getByRole('button', { name: /^\W*nhận hàng$/i });
    this.confirmButton = page.getByRole('alertdialog', { name: /xác nhận/i }).getByRole('button', { name: /đồng ý/i });
    this.transferPostDialog = page.getByRole('dialog', { name: /ghi sổ phiếu chuyển kho/i });
    this.transferReceiveDialog = page.getByRole('dialog', { name: /nhận hàng chuyển kho/i });
    this.receiptSection = page.getByRole('heading', { name: /^phiếu nhận$/i });
  }

  async openDocumentList(): Promise<void> {
    if (!(await this.documentMenu.isVisible().catch(() => false))) {
      await expect(this.inventoryMenu).toBeVisible({ timeout: 15_000 });
      await this.inventoryMenu.click();
    }

    await expect(this.documentMenu).toBeVisible({ timeout: 15_000 });
    await this.documentMenu.click();

    await this.page.waitForURL(/inventory-document-list/i, { timeout: 30_000 });
    await expect(this.listRows.first()).toBeVisible({ timeout: 20_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/inventory-document-details$/i, { timeout: 30_000 });
    await expect(this.typeDropdown).toBeVisible({ timeout: 20_000 });
  }

  private async pick(dropdown: Locator, optionText: string, searchText?: string): Promise<void> {
    await expect(dropdown).toBeVisible({ timeout: 15_000 });
    await dropdown.click();

    if (searchText) {
      // Ô lọc tìm phía server, chỉ chạy khi có sự kiện bàn phím.
      await this.page.keyboard.type(searchText, { delay: 50 });
    }

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(optionText)}`, 'i') })
      .first();

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
  }

  async selectType(type: string): Promise<void> {
    await this.pick(this.typeDropdown, type);
  }

  async selectWarehouse(warehouse: string): Promise<void> {
    await this.pick(this.warehouseDropdown, warehouse);
  }

  async selectCounterpart(counterpart: string): Promise<void> {
    await this.pick(this.counterpartDropdown, counterpart);
  }

  async selectReceivingWarehouse(warehouse: string): Promise<void> {
    await this.pick(this.receivingWarehouseDropdown, warehouse);
  }

  private async fillNumber(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.press('Control+A');
    await input.pressSequentially(value, { delay: 30 });
    await input.press('Tab');
  }

  /** Bấm "+ Thêm" rồi điền dòng chi tiết mới. */
  async addLine(line: DocumentLine): Promise<void> {
    const countBefore = await this.lineRows.count();

    await this.addLineButton.click();
    await expect(this.lineRows).toHaveCount(countBefore + 1, { timeout: 10_000 });

    const row = this.lineRows.last();
    const comboboxes = row.locator('[role="combobox"]');
    const numbers = row.locator('[role="spinbutton"]');

    if (line.direction) {
      await this.pick(comboboxes.nth(0), line.direction);
    }

    await this.pick(comboboxes.nth(1), line.itemCode, line.itemCode);
    await expect(comboboxes.nth(1)).toContainText(line.itemCode, { timeout: 10_000 });
    await this.fillNumber(numbers.nth(0), line.quantity);

    if (line.unitPrice) {
      await this.fillNumber(numbers.nth(1), line.unitPrice);
    }

    if (line.reason) {
      await this.pick(comboboxes.last(), line.reason);
    }
  }

  async saveDocument(): Promise<string> {
    await this.save();

    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.codeInput).toHaveValue(/[A-Z]+_\d+_\d+/, { timeout: 20_000 });
    await expect(this.postButton).toBeVisible({ timeout: 15_000 });

    return this.codeInput.inputValue();
  }

  /** Ghi sổ phiếu thường (Điều chỉnh, Phiếu xuất, Đánh giá lại). */
  async post(): Promise<void> {
    await this.postButton.click();

    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    await expect(this.page.getByText(/đã ghi sổ phiếu/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.reverseButton).toBeVisible({ timeout: 20_000 });
  }

  /** Ghi sổ phiếu Chuyển kho; receiveNow = tích "Nhận ngay" (ghi sổ luôn phiếu nhận). */
  async postTransfer(receiveNow: boolean): Promise<void> {
    await this.postButton.click();

    await expect(this.transferPostDialog).toBeVisible({ timeout: 15_000 });

    const receiveNowCheckbox = this.transferPostDialog.getByRole('checkbox');

    if (receiveNow) {
      await receiveNowCheckbox.check();
    }

    await this.transferPostDialog.getByRole('button', { name: /^ghi sổ$/i }).click();

    await expect(this.page.getByText(/đã ghi sổ phiếu/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.reverseButton).toBeVisible({ timeout: 20_000 });
  }

  /** Nhận hàng chuyển kho tại kho nhận; quantity bỏ trống = nhận đủ. Trả về mã phiếu nhận. */
  async receiveTransfer(note?: string, quantity?: string): Promise<string> {
    await this.receiveButton.click();

    await expect(this.transferReceiveDialog).toBeVisible({ timeout: 15_000 });

    if (note) {
      await this.transferReceiveDialog.getByRole('textbox').first().fill(note);
    }

    if (quantity) {
      await this.fillNumber(this.transferReceiveDialog.getByRole('spinbutton').first(), quantity);
    }

    await this.transferReceiveDialog.getByRole('button', { name: /^nhận hàng$/i }).click();

    const toast = this.page.getByText(/đã nhận hàng bằng phiếu/i).first();

    await expect(toast).toBeVisible({ timeout: 30_000 });

    return ((await toast.innerText()).match(/CK_\d+_\d+/) ?? [''])[0];
  }

  /** Link phiếu (theo mã) trong danh sách Phiếu kho. */
  documentLink(code: string): Locator {
    return this.page.getByRole('link', { name: code, exact: true }).first();
  }
}
