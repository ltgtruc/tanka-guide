import { expect, Locator, Page } from '@playwright/test';

export interface BasePageOptions {
  createButtonName?: RegExp;
  saveButtonName?: RegExp;
  backButtonName?: RegExp;
}

export class BasePage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page, options: BasePageOptions = {}) {
    this.page = page;

    this.createButton = page
      .getByRole('button', { name: options.createButtonName ?? /tạo mới|create new|create/i })
      .first();
    this.saveButton = page.getByRole('button', { name: options.saveButtonName ?? /lưu|save/i }).first();
    this.backButton = page.getByRole('button', { name: options.backButtonName ?? /trở lại|back/i }).first();
  }

  async openCreateForm(): Promise<void> {
    await expect(this.createButton).toBeVisible({ timeout: 15_000 });
    await expect(this.createButton).toBeEnabled({ timeout: 15_000 });

    await this.createButton.click();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeVisible({ timeout: 15_000 });
    await expect(this.saveButton).toBeEnabled({ timeout: 15_000 });

    await this.saveButton.scrollIntoViewIfNeeded();
    await this.saveButton.click();
  }

  async backToList(): Promise<void> {
    await expect(this.backButton).toBeVisible({ timeout: 15_000 });
    await expect(this.backButton).toBeEnabled({ timeout: 15_000 });

    await this.backButton.click();
  }

  protected findDropdownInput(labelPattern: RegExp): Locator {
    const byAccessibleLabel = this.page.getByLabel(labelPattern).first();

    const byFormContainer = this.page
      .locator('label')
      .filter({ hasText: labelPattern })
      .first()
      .locator('xpath=ancestor::*[self::div or self::td or self::section][1]')
      .locator(['[role="combobox"]', 'input', '.p-select', '.p-dropdown', '.p-autocomplete', 'ng-select'].join(', '))
      .first();

    const byFollowingInput = this.page.getByText(labelPattern).first().locator('xpath=following::input[1]');
    const byFollowingCombobox = this.page
      .getByText(labelPattern)
      .first()
      .locator('xpath=following::*[@role="combobox"][1]');

    return byAccessibleLabel.or(byFormContainer).or(byFollowingInput).or(byFollowingCombobox).first();
  }
}
