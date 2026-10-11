import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

export interface OtherItemLine {
  item: string;
  unit: string;
  quantity: string;
  amount: string;
  /** Chỉ dùng cho mặt hàng có "Theo dõi lô/serial" = Theo lô. */
  lot?: {
    lotNumber: string;
    manufacturerLot: string;
    /** Ngày (trong tháng sau) chọn làm Hạn dùng trên lịch. */
    expiryDayNextMonth: number;
  };
}

export interface ReturnLine {
  item: string;
  quantity: number;
  reason: string;
  needsReplacement: boolean;
}

/**
 * Mua hàng > Phiếu nhận hàng (/purchases/purchase-receipt*), gồm cả Phiếu
 * trả hàng NCC (mã TH_...) dùng chung màn hình.
 * Đã kiểm tra DOM thực tế:
 * - Danh sách: lọc Loại phiếu / Trạng thái / Nhà cung cấp / Kho nhận là
 *   p-multiselect; nút "Tạo mới" là link tới /purchases/purchase-receipt.
 * - Form: Nhà cung cấp *, Kho nhận * (p-select), Ghi chú; nút "Thêm từ đơn
 *   mua hàng" và "+ Thêm mặt hàng khác" (dòng "Ngoài đơn": Mặt hàng, ĐVT là
 *   combobox; Số lượng nhận, Thành tiền là spinbutton).
 * - Nháp: Lưu / Ghi sổ (phiếu trả: "Xuất trả") / Hủy phiếu; đã ghi sổ: Đảo phiếu.
 * - Phiếu trả hàng: đổi Số lượng KHÔNG tự tính lại Giá trị trả — phải nhập lại.
 */
export class PurchaseReceiptPage extends BasePage {
  readonly purchasingMenu: Locator;
  readonly receiptMenu: Locator;
  readonly receiptRows: Locator;

  readonly supplierDropdown: Locator;
  readonly warehouseDropdown: Locator;
  readonly noteInput: Locator;
  readonly addOtherItemButton: Locator;
  readonly lineRows: Locator;
  readonly statusField: Locator;
  readonly codeInput: Locator;

  readonly postButton: Locator;
  readonly reverseButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.purchasingMenu = page.getByRole('link', { name: /^\W*mua hàng\W*$/i }).first();
    this.receiptMenu = page.locator('a[href="/purchases/purchase-receipt-list"]');
    this.receiptRows = page.locator('main table tbody tr');

    this.supplierDropdown = this.formField(/^\s*nhà cung cấp\s*\*?\s*$/i).locator('.p-select').first();
    this.warehouseDropdown = this.formField(/^\s*kho nhận\s*\*?\s*$/i).locator('.p-select').first();
    this.noteInput = this.formInput(/^\s*ghi chú\s*$/i);
    this.addOtherItemButton = page.getByRole('button', { name: /thêm mặt hàng khác/i });
    this.lineRows = page.locator('main table tbody tr');
    // Ô Trạng thái hiển thị dạng thẻ (Nháp / Đã ghi sổ / Đã đảo), không phải input.
    this.statusField = page.locator('main').getByText(/^\s*trạng thái\s*$/i).first().locator('xpath=..');
    this.codeInput = this.formInput(/^\s*mã\s*$/i);

    // Phiếu nhận: "Ghi sổ"; phiếu trả hàng NCC: "Xuất trả".
    this.postButton = page.locator('main').getByRole('button', { name: /ghi sổ|xuất trả/i });
    this.reverseButton = page.locator('main').getByRole('button', { name: /đảo phiếu/i });
    this.confirmButton = page.getByRole('alertdialog', { name: /xác nhận/i }).getByRole('button', { name: /đồng ý/i });
  }

  async openReceiptList(): Promise<void> {
    if (!(await this.receiptMenu.isVisible().catch(() => false))) {
      await expect(this.purchasingMenu).toBeVisible({ timeout: 15_000 });
      await this.purchasingMenu.click();
    }

    await expect(this.receiptMenu).toBeVisible({ timeout: 15_000 });
    await this.receiptMenu.click();

    await this.page.waitForURL(/purchase-receipt-list/i, { timeout: 30_000 });
    await expect(this.receiptRows.first()).toBeVisible({ timeout: 20_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/\/purchases\/purchase-receipt$/i, { timeout: 30_000 });
    await expect(this.supplierDropdown).toBeVisible({ timeout: 20_000 });
  }

  private async pickOption(dropdown: Locator, optionText: string): Promise<void> {
    await expect(dropdown).toBeVisible({ timeout: 15_000 });
    await dropdown.click();

    const filterInput = this.page.locator('.p-select-overlay:visible input').first();

    if (await filterInput.isVisible().catch(() => false)) {
      // Gõ từng phím: ô lọc mặt hàng tìm phía server, fill() không kích hoạt
      // tìm nên mặt hàng mới tạo sẽ không hiện.
      await filterInput.pressSequentially(optionText, { delay: 40 });
    }

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(optionText)}`, 'i') })
      .first();

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
  }

  async selectSupplier(supplier: string): Promise<void> {
    await this.pickOption(this.supplierDropdown, supplier);
  }

  async selectWarehouse(warehouse: string): Promise<void> {
    await this.pickOption(this.warehouseDropdown, warehouse);
  }

  private async fillNumber(input: Locator, value: string): Promise<void> {
    // InputNumber của PrimeVue: chọn hết rồi gõ để component tự định dạng.
    await input.click();
    await input.press('Control+A');
    await input.pressSequentially(value, { delay: 30 });
    await input.press('Tab');
  }

  /** Bấm "+ Thêm mặt hàng khác" và điền dòng "Ngoài đơn". */
  async addOtherItem(line: OtherItemLine): Promise<void> {
    await this.addOtherItemButton.click();

    const row = this.lineRows.filter({ hasText: /ngoài đơn/i }).last();
    const comboboxes = row.locator('[role="combobox"]');
    const numbers = row.locator('[role="spinbutton"]');

    await expect(row).toBeVisible({ timeout: 10_000 });
    await this.pickOption(comboboxes.nth(0), line.item);
    await this.pickOption(comboboxes.nth(1), line.unit);
    await this.fillNumber(numbers.nth(0), line.quantity);
    await this.fillNumber(numbers.nth(1), line.amount);

    await expect(comboboxes.nth(1)).toContainText(line.unit);

    if (line.lot) {
      // Mặt hàng theo lô: dòng có thêm 2 ô chữ (Số lô, Lô nhà sản xuất) và ô
      // Hạn dùng là datepicker readonly.
      const textInputs = row.locator('input:not([role])');

      await textInputs.nth(0).fill(line.lot.lotNumber);
      await textInputs.nth(1).fill(line.lot.manufacturerLot);

      const expiryInput = row.locator('input[role="combobox"]').last();

      await expiryInput.click();

      const panel = this.page.locator('.p-datepicker-panel:visible').first();

      await expect(panel).toBeVisible({ timeout: 10_000 });
      await panel.locator('button.p-datepicker-next-button, .p-datepicker-next').first().click();
      await panel
        .locator('td:not(.p-datepicker-other-month) > span')
        .filter({ hasText: new RegExp(`^${line.lot.expiryDayNextMonth}$`) })
        .first()
        .click();

      await expect(expiryInput).toHaveValue(/\d{2}\/\d{2}\/\d{4}/, { timeout: 10_000 });
    }
  }

  async saveReceipt(): Promise<string> {
    await this.save();

    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.statusField).toContainText(/nháp/i, { timeout: 20_000 });
    await expect(this.codeInput).toHaveValue(/(NH|TH)_\d+_\d+/, { timeout: 20_000 });

    return this.codeInput.inputValue();
  }

  /** Ghi sổ (phiếu nhận) / Xuất trả (phiếu trả) và xác nhận. */
  async post(): Promise<void> {
    await expect(this.postButton).toBeEnabled({ timeout: 15_000 });
    await this.postButton.click();

    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    await expect(this.page.getByText(/đã ghi sổ:/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.statusField).toContainText(/đã ghi sổ/i, { timeout: 20_000 });
  }

  /** Đảo phiếu đã ghi sổ: hệ thống tạo phiếu kho đảo ngược, phiếu chuyển "Đã đảo". */
  async reverse(): Promise<void> {
    await expect(this.reverseButton).toBeEnabled({ timeout: 15_000 });
    await this.reverseButton.click();

    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    await expect(this.page.getByText(/đã đảo bằng/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.statusField).toContainText(/đã đảo/i, { timeout: 20_000 });
  }

  /**
   * Trên phiếu trả hàng: xoá các dòng không phải `line.item`, rồi điền số
   * lượng trả, giá trị trả (= đơn giá gốc × số lượng), lý do và Cần giao bù.
   */
  async prepareReturnLine(line: ReturnLine): Promise<void> {
    const target = this.lineRows.filter({ hasText: line.item });

    await expect(target.first(), `Đơn mua hàng không có mặt hàng ${line.item}`).toBeVisible({ timeout: 15_000 });

    for (let guard = 0; guard < 50; guard += 1) {
      const other = this.lineRows.filter({ hasNotText: line.item }).filter({ has: this.page.locator('[role="spinbutton"]') });

      if ((await other.count()) === 0) {
        break;
      }

      // Nút xoá dòng là button đầu tiên của dòng (icon thùng rác).
      await other.first().locator('td').first().getByRole('button').click();
    }

    await expect(target).toHaveCount(1, { timeout: 10_000 });

    const row = target.first();
    const numbers = row.locator('[role="spinbutton"]');
    const toNumber = (text: string) => Number(text.replace(/\./g, '').replace(',', '.'));
    const unitPrice = toNumber(await numbers.nth(1).inputValue()) / toNumber(await numbers.nth(0).inputValue());
    const amount = String(Math.round(unitPrice * line.quantity * 100) / 100).replace('.', ',');

    await this.fillNumber(numbers.nth(0), String(line.quantity));
    await this.fillNumber(numbers.nth(1), amount);
    await this.pickOption(row.locator('[role="combobox"]').nth(1), line.reason);

    if (line.needsReplacement) {
      await row.getByRole('checkbox').check();
    }
  }
}
