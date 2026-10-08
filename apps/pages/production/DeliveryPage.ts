import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

/**
 * Phiếu giao hàng (Sản xuất > Phiếu giao hàng, /work-orders/delivery-*).
 * Đã kiểm tra DOM thực tế:
 * - Form tạo mới: Khách hàng *, Đơn bán hàng * (mở khi đã chọn khách),
 *   Ngày giao hàng * (datepicker readonly — phải chọn trên lịch), nút
 *   "Thêm dòng hàng" mở dialog "Chọn dòng hàng để giao".
 * - Trạng thái phiếu: Nháp → Đang giao → Hoàn thành. Chuyển phiếu sang
 *   Đang giao/Hoàn thành thì lệnh SX tự chuyển Đang giao hàng/Đã giao hàng.
 */
export class DeliveryPage extends BasePage {
  readonly productionMenu: Locator;
  readonly deliveryMenu: Locator;

  readonly customerDropdown: Locator;
  readonly salesOrderDropdown: Locator;
  readonly deliveryDateInput: Locator;
  readonly addLinesButton: Locator;
  readonly lineDialog: Locator;

  readonly statusValue: Locator;
  readonly statusToggleButton: Locator;

  constructor(page: Page) {
    super(page);

    this.productionMenu = page.getByRole('link', { name: /^\W*sản xuất\W*$/i }).first();
    this.deliveryMenu = page.locator('a[href="/work-orders/delivery-list"]');

    this.customerDropdown = this.formDropdown(/^\s*khách hàng\s*\*?\s*$/i);
    this.salesOrderDropdown = this.formDropdown(/^\s*đơn bán hàng\s*\*?\s*$/i);
    this.deliveryDateInput = this.formInput(/^\s*ngày giao hàng\s*\*?\s*$/i);
    this.addLinesButton = page.getByRole('button', { name: /thêm dòng hàng/i });
    this.lineDialog = page.getByRole('dialog', { name: /chọn dòng hàng để giao/i });

    const statusField = this.formField(/^\s*trạng thái\s*$/i);

    this.statusValue = statusField.locator('input').first();
    this.statusToggleButton = statusField.locator('button.dropdown-toggle').first();
  }

  async openDeliveryList(): Promise<void> {
    if (!(await this.deliveryMenu.isVisible().catch(() => false))) {
      await expect(this.productionMenu).toBeVisible({ timeout: 15_000 });
      await this.productionMenu.click();
    }

    await expect(this.deliveryMenu).toBeVisible({ timeout: 15_000 });
    await this.deliveryMenu.click();

    await this.page.waitForURL(/delivery-list/i, { timeout: 30_000 });
    await expect(this.createButton).toBeVisible({ timeout: 20_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/delivery-details/i, { timeout: 30_000 });
    await expect(this.customerDropdown).toBeVisible({ timeout: 20_000 });
  }

  private async pickOption(dropdown: Locator, optionText: string): Promise<void> {
    await expect(dropdown).toBeVisible({ timeout: 15_000 });
    await dropdown.click();

    const filterInput = this.page.locator('.p-select-overlay:visible input').first();

    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill(optionText);
    }

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(optionText)}\\s*$`, 'i') })
      .first();

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
  }

  async selectCustomer(customer: string): Promise<void> {
    await this.pickOption(this.customerDropdown, customer);
  }

  async selectSalesOrder(salesOrderCode: string): Promise<void> {
    await expect(this.salesOrderDropdown).toBeEnabled({ timeout: 15_000 });
    await this.pickOption(this.salesOrderDropdown, salesOrderCode);
  }

  /**
   * Chọn ngày giao trên lịch (input readonly). Dùng ngày hôm qua: app đang
   * báo "Phiếu giao đang để ngày ... ở tương lai" khi Hoàn thành phiếu có
   * ngày giao là hôm nay (quan sát lúc 23h giờ VN ngày 07/10/2026).
   */
  async selectDeliveryDate(date: Date): Promise<void> {
    await this.deliveryDateInput.click();

    const panel = this.page.locator('.p-datepicker-panel:visible').first();

    await expect(panel).toBeVisible({ timeout: 10_000 });

    if (date.getMonth() !== new Date().getMonth()) {
      await panel.locator('button.p-datepicker-prev-button, .p-datepicker-prev').first().click();
    }

    await panel
      .locator('td:not(.p-datepicker-other-month) > span')
      .filter({ hasText: new RegExp(`^${date.getDate()}$`) })
      .first()
      .click();

    await expect(panel).toBeHidden({ timeout: 10_000 });
  }

  async addAllProductionLines(): Promise<void> {
    await this.addLinesButton.click();

    await expect(this.lineDialog).toBeVisible({ timeout: 15_000 });

    const selectAll = this.lineDialog.getByRole('checkbox', { name: /all items/i }).first();

    await expect(selectAll).toBeEnabled({ timeout: 15_000 });
    await selectAll.click();

    // Tên nút có ký tự icon font phía trước ("+ Thêm") nên không neo ^.
    await this.lineDialog.getByRole('button', { name: /thêm\s*$/i }).click();

    await expect(this.lineDialog).toBeHidden({ timeout: 15_000 });
  }

  async saveDelivery(): Promise<void> {
    await this.save();

    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.statusValue).toHaveValue(/nháp/i, { timeout: 20_000 });
  }

  /** Đổi trạng thái phiếu: chọn trong menu, nhập lý do, bấm "Xác nhận". */
  async changeStatus(targetStatus: string, note = ''): Promise<void> {
    await expect(this.statusToggleButton).toBeEnabled({ timeout: 15_000 });
    await this.statusToggleButton.click();

    // Mục menu có icon phía trước nên không neo ^.
    const item = this.page
      .locator('.dropdown-menu.show button')
      .filter({ hasText: new RegExp(`${escapeRegExp(targetStatus)}\\s*$`, 'i') });

    await expect(item).toBeVisible({ timeout: 10_000 });
    await item.click();

    const dialog = this.page.locator('.p-dialog:visible').filter({ hasText: /chuyển trạng thái sang/i }).first();

    await expect(dialog).toBeVisible({ timeout: 15_000 });

    const noteInput = dialog.locator('textarea').last();

    if (note && (await noteInput.isVisible().catch(() => false))) {
      await noteInput.fill(note);
    }

    await dialog.getByRole('button', { name: /xác nhận\s*$/i }).click();

    // Có thể có thêm hộp thoại "Xác nhận ... Đồng ý" tuỳ trạng thái đích.
    const agreeButton = this.page.getByRole('alertdialog').getByRole('button', { name: /đồng ý/i });

    const needsAgree = await agreeButton
      .waitFor({ state: 'visible', timeout: 2_000 })
      .then(() => true)
      .catch(() => false);

    if (needsAgree) {
      await agreeButton.click();
    }

    await expect(this.statusValue).toHaveValue(new RegExp(escapeRegExp(targetStatus), 'i'), { timeout: 20_000 });
  }
}
