import { expect, Locator, Page } from '@playwright/test';

import { waitToSeeText } from '../../helpers/action.helper';
import { BasePage } from '../BasePage';

export class InventoryPage extends BasePage {
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly groupDropdown: Locator;
  readonly unitDropdown: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    /*
     * Đã kiểm tra DOM thực tế: các <label> trên form "Chi tiết hàng tồn kho"
     * không có thuộc tính for/id liên kết tới input (PrimeVue float label),
     * nên getByLabel() không tìm ra field — phải dò theo text label rồi lấy
     * input/textarea liền sau bằng xpath, giống cách BasePage.findDropdownInput làm.
     */
    super(page, { createButtonName: /tạo mới|create|add/i });

    const inputAfterLabel = (labelPattern: RegExp): Locator =>
      page
        .locator('label')
        .filter({ hasText: labelPattern })
        .first()
        .locator('xpath=following::*[self::input or self::textarea][1]');

    this.codeInput = inputAfterLabel(/^mã\s*\*?$/i);
    this.nameInput = inputAfterLabel(/^tên\s*\*?$/i);
    this.descriptionInput = inputAfterLabel(/^diễn giải\s*$/i);
    this.groupDropdown = this.findDropdownInput(/^nhóm htk\s*\*?$/i);
    this.unitDropdown = this.findDropdownInput(/^đvt lưu kho\s*\*?$/i);
    this.cancelButton = page.getByRole('button', { name: /hủy|cancel/i });
  }

  private getVisibleDropdownOptions(): Locator {
    return this.page.locator(
      [
        '.p-select-overlay:visible .p-select-option',
        '.p-dropdown-panel:visible .p-dropdown-item',
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',
      ].join(', '),
    );
  }

  async selectFirstOption(dropdown: Locator): Promise<string> {
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click({ force: true });

    const option = this.getVisibleDropdownOptions().first();

    await expect(option).toBeVisible({ timeout: 15_000 });

    const text = (await option.innerText()).trim();

    await option.click();

    return text;
  }

  async selectOption(dropdown: Locator, optionName: string): Promise<void> {
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click({ force: true });

    const option = this.page.getByRole('option', { name: optionName, exact: true });

    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
  }

  async verifyPageOpened(): Promise<void> {
    await waitToSeeText(this.page, /danh sách hàng tồn kho/i);
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();
    await expect(this.codeInput).toBeVisible();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async verifyCreated(name: string): Promise<void> {
    // Sau khi lưu, app ở lại form chi tiết và hiện toast "Lưu thành công"
    // (tên chỉ nằm trong value của input, không phải text).
    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(this.nameInput).toHaveValue(name);
  }
}
