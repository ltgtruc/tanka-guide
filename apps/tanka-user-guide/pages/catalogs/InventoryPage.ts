import { expect, Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    /*
     * Các locator dưới đây là mẫu.
     * Bạn cần kiểm tra DOM thực tế của Tanka và điều chỉnh.
     */
    this.createButton = page.getByRole('button', {
      name: /tạo mới|create|add/i,
    });

    this.codeInput = page
      .getByLabel(/mã|code/i)
      .or(page.locator('input[name*="code"]'));

    this.nameInput = page
      .getByLabel(/tên|name/i)
      .or(page.locator('input[name*="name"]'));

    this.descriptionInput = page
      .getByLabel(/mô tả|description/i)
      .or(page.locator('textarea[name*="description"]'));

    this.saveButton = page.getByRole('button', {
      name: /lưu|save/i,
    });

    this.cancelButton = page.getByRole('button', {
      name: /hủy|cancel/i,
    });
  }

  async verifyPageOpened(): Promise<void> {
    await expect(
      this.page.getByText(/vật liệu|inventory|item/i),
    ).toBeVisible();
  }

  async openCreateForm(): Promise<void> {
    await this.createButton.click();
    await expect(this.codeInput).toBeVisible();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async verifyCreated(name: string): Promise<void> {
    await expect(
      this.page.getByText(name),
    ).toBeVisible();
  }
}
