import { expect, Locator, Page } from '@playwright/test';

import { waitToSeeText } from '../../helpers/action.helper';
import { BasePage } from '../BasePage';

export class InventoryPage extends BasePage {
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    /*
     * Các locator dưới đây là mẫu.
     * Bạn cần kiểm tra DOM thực tế của Tanka và điều chỉnh.
     */
    super(page, { createButtonName: /tạo mới|create|add/i });

    this.codeInput = page.getByLabel(/mã|code/i).or(page.locator('input[name*="code"]'));
    this.nameInput = page.getByLabel(/tên|name/i).or(page.locator('input[name*="name"]'));
    this.descriptionInput = page.getByLabel(/mô tả|description/i).or(page.locator('textarea[name*="description"]'));
    this.cancelButton = page.getByRole('button', { name: /hủy|cancel/i });
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
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
