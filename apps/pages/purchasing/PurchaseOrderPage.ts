import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

/**
 * Đơn mua hàng (purchase-order-view) và Phiếu nhận hàng (purchase-receipt).
 * Đã kiểm tra DOM thực tế:
 * - Trạng thái đơn MH là `.c-component` gồm input readonly + nút
 *   `.dropdown-toggle` mở `.dropdown-menu` (Đã duyệt / Không duyệt).
 * - Duyệt đơn MH → hộp thoại "Xác nhận" → mỗi kho nhận sinh 1 phiếu NH nháp.
 * - Phiếu NH nháp: nút "Ghi sổ" → "Xác nhận" → toast "Đã ghi sổ: NK_...".
 */
export class PurchaseOrderPage extends BasePage {
  readonly purchasingMenu: Locator;
  readonly purchaseOrderMenu: Locator;
  readonly listHeading: Locator;
  readonly orderRows: Locator;

  readonly statusValue: Locator;
  readonly statusToggleButton: Locator;
  readonly confirmButton: Locator;
  readonly receiptLink: Locator;
  readonly postReceiptButton: Locator;

  constructor(page: Page) {
    super(page);

    this.purchasingMenu = page.getByRole('link', { name: /^\W*mua hàng\W*$/i }).first();
    this.purchaseOrderMenu = page.locator('a[href="/purchases/purchase-order-list"]');
    this.listHeading = page.getByText(/^\s*đơn mua hàng\s*$/i).first();
    this.orderRows = page.locator('main table tbody tr');

    const statusField = this.formField(/^\s*trạng thái\s*$/i);

    this.statusValue = statusField.locator('input').first();
    this.statusToggleButton = statusField.locator('button.dropdown-toggle').first();
    this.confirmButton = page.getByRole('alertdialog', { name: /xác nhận/i }).getByRole('button', { name: /đồng ý/i });
    this.receiptLink = page.locator('main a[href*="/purchases/purchase-receipt/"]').first();
    this.postReceiptButton = page.locator('main').getByRole('button', { name: /ghi sổ/i });
  }

  async openPurchaseOrderList(): Promise<void> {
    if (!(await this.purchaseOrderMenu.isVisible().catch(() => false))) {
      await expect(this.purchasingMenu).toBeVisible({ timeout: 15_000 });
      await this.purchasingMenu.click();
    }

    await expect(this.purchaseOrderMenu).toBeVisible({ timeout: 15_000 });
    await this.purchaseOrderMenu.click();

    await this.page.waitForURL(/purchase-order-list/i, { timeout: 30_000 });
    await expect(this.orderRows.first()).toBeVisible({ timeout: 20_000 });
  }

  private draftRows(): Locator {
    // Chỉ lấy dòng có ô Trạng thái đúng bằng "Nháp".
    return this.orderRows.filter({ has: this.page.locator('td').filter({ hasText: /^\s*nháp\s*$/i }) });
  }

  /** Mã lệnh SX của đơn MH nháp mới nhất (đầu danh sách). */
  async getNewestDraftProductionCode(): Promise<string> {
    const row = this.draftRows().first();

    await expect(row).toBeVisible({ timeout: 20_000 });

    const productionCode = (await row.innerText()).match(/SX_\d+_\d+/)?.[0];

    if (!productionCode) {
      throw new Error('Không tìm thấy mã lệnh SX trên dòng đơn mua hàng nháp mới nhất.');
    }

    return productionCode;
  }

  async getDraftOrderCodes(productionCode: string): Promise<string[]> {
    const rows = this.draftRows().filter({ hasText: new RegExp(escapeRegExp(productionCode)) });
    const texts = await rows.locator('a[href*="purchase-order-view"]').allInnerTexts();

    return texts.map((text) => text.replace(/\s+/g, ''));
  }

  orderLink(orderCode: string): Locator {
    return this.page.locator('main a[href*="purchase-order-view"]').filter({ hasText: orderCode }).first();
  }

  async openOrder(orderCode: string): Promise<void> {
    const link = this.orderLink(orderCode);

    await expect(link).toBeVisible({ timeout: 15_000 });
    await link.click();

    await this.page.waitForURL(/purchase-order-view/i, { timeout: 30_000 });
    await expect(this.statusValue).toHaveValue(/nháp/i, { timeout: 20_000 });
  }

  async approveOrder(): Promise<void> {
    await expect(this.statusToggleButton).toBeVisible({ timeout: 15_000 });
    await this.statusToggleButton.click();

    const approveItem = this.page.locator('.dropdown-menu.show button').filter({ hasText: /^\s*đã duyệt\s*$/i });

    await expect(approveItem).toBeVisible({ timeout: 10_000 });
    await approveItem.click();

    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    await expect(this.statusValue).toHaveValue(/đã duyệt/i, { timeout: 20_000 });
    await expect(this.receiptLink).toBeVisible({ timeout: 20_000 });
  }

  /** Mã các phiếu NH của đơn MH đang mở (mỗi kho nhận một phiếu). */
  async getReceiptCodes(): Promise<string[]> {
    await expect(this.receiptLink).toBeVisible({ timeout: 15_000 });

    const texts = await this.page.locator('main a[href*="/purchases/purchase-receipt/"]').allInnerTexts();

    return texts.map((text) => text.replace(/\s+/g, ''));
  }

  receiptLinkByCode(receiptCode: string): Locator {
    return this.page.locator('main a[href*="/purchases/purchase-receipt/"]').filter({ hasText: receiptCode }).first();
  }

  async openReceipt(receiptCode: string): Promise<void> {
    const link = this.receiptLinkByCode(receiptCode);

    await expect(link).toBeVisible({ timeout: 15_000 });
    await link.click();

    await this.page.waitForURL(/purchases\/purchase-receipt\//i, { timeout: 30_000 });
    await expect(this.postReceiptButton).toBeVisible({ timeout: 20_000 });
  }

  /** Từ phiếu NH, bấm link mã đơn MH ở bảng Chi tiết để quay lại đơn MH. */
  async backToOrderFromReceipt(orderCode: string): Promise<void> {
    await this.orderLink(orderCode).click();

    await this.page.waitForURL(/purchase-order-view/i, { timeout: 30_000 });
    await expect(this.statusValue).toBeVisible({ timeout: 20_000 });
  }

  async postReceipt(): Promise<void> {
    await expect(this.postReceiptButton).toBeEnabled({ timeout: 15_000 });
    await this.postReceiptButton.click();

    await expect(this.confirmButton).toBeVisible({ timeout: 15_000 });
    await this.confirmButton.click();

    await expect(this.page.getByText(/đã ghi sổ/i).first()).toBeVisible({ timeout: 30_000 });
  }
}
