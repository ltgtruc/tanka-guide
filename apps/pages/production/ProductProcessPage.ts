import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

export class ProductProcessPage extends BasePage {
  readonly productionHeading: Locator;

  readonly optimizeTab: Locator;
  readonly purchaseOrderTab: Locator;

  readonly scrapPriceInput: Locator;
  readonly calculateOptimizeButton: Locator;
  readonly redoOptimizeDataButton: Locator;
  readonly optimizeSaveButton: Locator;

  readonly statusActionButton: Locator;
  readonly currentStatusValue: Locator;

  readonly createPurchaseOrderButton: Locator;

  constructor(page: Page) {
    super(page, { createButtonName: /tạo mới|create new/i });

    this.productionHeading = page.getByText(/^(quản lý sx|quản lý sản xuất)$/i).first();

    /*
     * Chỉ dùng getByRole('tab', ...), KHÔNG kèm getByText() fallback — trang
     * này có menu "Mua hàng" ở sidebar cũng chứa link text "Đơn mua hàng",
     * getByText().first() lấy nhầm link ẩn đó thay vì tab đang hiển thị
     * (đã kiểm chứng: getByText(/^đơn mua hàng$/i) trả về 2 match, match đầu
     * tiên theo thứ tự DOM là link sidebar không hiển thị).
     */
    this.optimizeTab = page.getByRole('tab', { name: /^tối ưu$/i }).first();
    this.purchaseOrderTab = page.getByRole('tab', { name: /đơn mua hàng/i }).first();

    // "Giá phế liệu (đồng/kg)" không phải thẻ <label>, dò theo text.
    const scrapPriceLabel = page.getByText(/giá phế liệu/i).first();

    this.scrapPriceInput = scrapPriceLabel.locator('xpath=following::input[1]');

    this.calculateOptimizeButton = page.locator('button:visible').filter({ hasText: /^\s*tính tối ưu\s*$/i }).first();
    this.redoOptimizeDataButton = page.locator('button:visible').filter({ hasText: /làm lại dữ liệu/i }).first();

    /*
     * Không dùng BasePage.saveButton (getByRole('button', {name: /lưu/i}))
     * vì ở trang "Chi tiết SX" có thêm 1 nút "Lưu" khác không hiển thị lẫn
     * trong DOM khiến getByRole khớp nhầm phần tử ẩn rồi bị timeout khi
     * click. Lọc theo button:visible + so khớp text chính xác để chỉ lấy
     * đúng nút "Lưu" đang hiển thị trên khung trên cùng của trang.
     */
    this.optimizeSaveButton = page.locator('button:visible').filter({ hasText: /^\s*lưu\s*$/i }).first();

    const statusField = page
      .locator('label')
      .filter({ hasText: /^trạng thái$/i })
      .first()
      .locator('xpath=ancestor::*[self::div or self::td or self::section][1]');

    const statusByText = page
      .getByText(/^trạng thái$/i)
      .first()
      .locator('xpath=ancestor::*[self::div or self::td or self::section][1]');

    const resolvedStatusField = statusField.or(statusByText).first();

    this.currentStatusValue = resolvedStatusField
      .locator(['input', '.p-inputtext', '.p-select-label', '.p-dropdown-label', '[role="combobox"]'].join(', '))
      .first();

    this.statusActionButton = resolvedStatusField.locator('button:visible').first();

    this.createPurchaseOrderButton = page
      .locator('button:visible')
      .filter({ hasText: /tiến hành tạo đơn mua hàng/i })
      .first();
  }

  async openProductionManagement(): Promise<void> {
    const productionMenu = this.page
      .getByRole('link', { name: /^sản xuất$/i })
      .or(this.page.getByText(/^sản xuất$/i))
      .first();

    await expect(productionMenu).toBeVisible({ timeout: 15_000 });

    await productionMenu.click();

    const managementMenu = this.page
      .getByRole('link', { name: /quản lý sx|quản lý sản xuất/i })
      .or(this.page.getByText(/^(quản lý sx|quản lý sản xuất)$/i))
      .first();

    await expect(managementMenu).toBeVisible({ timeout: 15_000 });

    await managementMenu.click();

    await expect(this.productionHeading).toBeVisible({ timeout: 20_000 });
  }

  /** Chọn mã sản xuất có trạng thái "Nháp" trong danh sách Quản lý SX. */
  async openDraftProductionOrder(): Promise<string> {
    const table = this.page.locator('table').filter({ hasText: /trạng thái/i }).first();

    await expect(table).toBeVisible({ timeout: 20_000 });

    const rows = table.locator('tbody tr');
    const draftRows = rows.filter({ hasText: /nháp/i });

    const targetRow = (await draftRows.count()) > 0 ? draftRows.first() : rows.first();

    await expect(targetRow).toBeVisible({ timeout: 20_000 });

    const detailLink = targetRow.locator('a').first();
    const productionCode = (await detailLink.innerText()).trim();

    await detailLink.click();

    await expect(this.page.getByText(/chi tiết sx/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.currentStatusValue).toBeVisible({ timeout: 20_000 });

    return productionCode;
  }

  async openOptimizeTab(): Promise<void> {
    await expect(this.optimizeTab).toBeVisible({ timeout: 15_000 });

    await this.optimizeTab.click();

    await expect(this.scrapPriceInput).toBeVisible({ timeout: 15_000 });
  }

  async calculateOptimize(): Promise<void> {
    await expect(this.calculateOptimizeButton).toBeVisible({ timeout: 15_000 });
    await expect(this.calculateOptimizeButton).toBeEnabled({ timeout: 15_000 });

    await this.calculateOptimizeButton.click();

    // Dữ liệu tối ưu tính xong thì nút "Làm lại dữ liệu" mới xuất hiện —
    // dùng tín hiệu này để biết phép tính đã hoàn tất trước khi Lưu.
    await expect(this.redoOptimizeDataButton).toBeVisible({ timeout: 20_000 });
  }

  async redoOptimizeData(): Promise<void> {
    await expect(this.redoOptimizeDataButton).toBeVisible({ timeout: 15_000 });

    await this.redoOptimizeDataButton.click();

    await expect(this.scrapPriceInput).toBeVisible({ timeout: 15_000 });
  }

  async saveOptimizeResult(): Promise<void> {
    await expect(this.optimizeSaveButton).toBeVisible({ timeout: 15_000 });
    await expect(this.optimizeSaveButton).toBeEnabled({ timeout: 15_000 });

    await this.optimizeSaveButton.click();

    await this.expectSuccessMessage();
  }

  async changeStatus(targetStatus: string, note = ''): Promise<void> {
    await expect(this.statusActionButton).toBeVisible({ timeout: 15_000 });
    await expect(this.statusActionButton).toBeEnabled({ timeout: 15_000 });

    await this.statusActionButton.click();

    const statusOption = this.page.getByText(new RegExp(`^${escapeRegExp(targetStatus)}$`, 'i')).last();

    await expect(statusOption).toBeVisible({ timeout: 15_000 });

    await statusOption.click();

    const transitionDialog = this.page
      .locator('.p-dialog:visible, [role="dialog"]:visible, .modal:visible')
      .filter({ hasText: /chuyển trạng thái sang/i })
      .first();

    await expect(transitionDialog).toBeVisible({ timeout: 20_000 });

    const noteInput = this.page.locator('textarea:visible').last();

    await expect(noteInput).toBeVisible({ timeout: 15_000 });
    await expect(noteInput).toBeEditable({ timeout: 15_000 });

    await noteInput.click();
    await noteInput.fill(note);

    await expect(noteInput).toHaveValue(note, { timeout: 10_000 });

    const updateButton = this.page.locator('button:visible').filter({ hasText: /^\s*Cập nhật\s*$/i }).last();

    await expect(updateButton).toBeVisible({ timeout: 15_000 });
    await expect(updateButton).toBeEnabled({ timeout: 15_000 });

    await updateButton.click();

    const confirmDialog = this.page
      .locator('.p-dialog:visible, [role="dialog"]:visible, .modal:visible')
      .filter({ hasText: /xác nhận|bạn có chắc chắn/i })
      .last();

    await expect(confirmDialog).toBeVisible({ timeout: 15_000 });

    const agreeButton = confirmDialog.getByRole('button', { name: /đồng ý|xác nhận|yes/i }).last();

    await expect(agreeButton).toBeEnabled({ timeout: 15_000 });

    await agreeButton.click();

    await expect(confirmDialog).toBeHidden({ timeout: 20_000 });

    await this.expectSuccessMessage();
  }

  async expectCurrentStatus(expectedStatus: string): Promise<void> {
    const expected = new RegExp(escapeRegExp(expectedStatus), 'i');

    await expect
      .poll(
        async () => {
          const value = await this.currentStatusValue.inputValue().catch(() => '');
          const text = await this.currentStatusValue.innerText().catch(() => '');

          return `${value} ${text}`;
        },
        { timeout: 20_000, message: `Trạng thái chưa chuyển thành "${expectedStatus}"` },
      )
      .toMatch(expected);
  }

  async openPurchaseOrderTab(): Promise<void> {
    await expect(this.purchaseOrderTab).toBeVisible({ timeout: 15_000 });

    await this.purchaseOrderTab.click();

    await expect(this.createPurchaseOrderButton).toBeVisible({ timeout: 15_000 });
  }

  /** Bấm "Tiến hành tạo đơn mua hàng" ở tab Đơn mua hàng — mở màn hình chọn nhà cung cấp. */
  async startCreatePurchaseOrder(): Promise<void> {
    await expect(this.createPurchaseOrderButton).toBeVisible({ timeout: 15_000 });
    await expect(this.createPurchaseOrderButton).toBeEnabled({ timeout: 15_000 });

    await this.createPurchaseOrderButton.click();

    await this.page.waitForURL(/production-purchase-orders/i, { timeout: 30_000 });
    await expect(this.page.getByText(/chọn nhà cung cấp/i).first()).toBeVisible({ timeout: 20_000 });
  }

  /** Cuộn xuống cuối màn hình chọn NCC rồi bấm lại "Tiến hành tạo đơn mua hàng" để hoàn thành. */
  async confirmCreatePurchaseOrder(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await this.page.waitForTimeout(500);

    await expect(this.createPurchaseOrderButton).toBeVisible({ timeout: 15_000 });
    await expect(this.createPurchaseOrderButton).toBeEnabled({ timeout: 15_000 });

    await this.createPurchaseOrderButton.click();

    await this.page.waitForURL(/production-details/i, { timeout: 30_000 });
    await expect(this.currentStatusValue).toBeVisible({ timeout: 20_000 });
  }

  private async expectSuccessMessage(): Promise<void> {
    const successMessage = this.page.getByText(/lưu thành công|thành công/i).first();

    await expect(successMessage).toBeVisible({ timeout: 20_000 });
  }
}
