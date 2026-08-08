import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class DoorTypePage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  readonly nameInput: Locator;
  readonly reportTypeDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createButton = page
      .getByRole('button', {
        name: /tạo mới|create/i,
      })
      .first();

    this.saveButton = page
      .getByRole('button', {
        name: /lưu|save/i,
      })
      .first();

    this.backButton = page
      .getByRole('button', {
        name: /trở lại|back/i,
      })
      .first();

    this.nameInput = page
      .getByRole('textbox')
      .nth(0);

    this.reportTypeDropdown = page
      .locator('input')
      .nth(1);
  }

  async openCreateForm(): Promise<void> {
    await expect(
      this.createButton,
    ).toBeVisible({
      timeout: 10000,
    });

    await this.createButton.click();
  }

  async save(): Promise<void> {
    await expect(
      this.saveButton,
    ).toBeVisible({
      timeout: 10000,
    });

    await this.saveButton.click();
  }

  async backToList(): Promise<void> {
    await expect(
      this.backButton,
    ).toBeVisible({
      timeout: 10000,
    });

    await this.backButton.click();
  }
}