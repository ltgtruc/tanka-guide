import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '../BasePage';

export class WarehousePage extends BasePage {
  readonly nameInput: Locator;
  readonly activeCheckbox: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly cityInput: Locator;
  readonly phoneInput: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByLabel(/^tên\s*\*?$/i).or(page.locator('input[type="text"]').nth(0)).first();
    this.activeCheckbox = page.getByRole('checkbox', { name: /hoạt động/i }).first();
    this.address1Input = page.getByLabel(/địa chỉ 1/i).or(page.locator('input[type="text"]').nth(1)).first();
    this.address2Input = page.getByLabel(/địa chỉ 2/i).or(page.locator('input[type="text"]').nth(2)).first();
    this.cityInput = page.getByLabel(/thành phố/i).or(page.locator('input[type="text"]').nth(3)).first();
    this.phoneInput = page
      .getByLabel(/số đt|số điện thoại|phone/i)
      .or(page.locator('input[type="text"]').nth(4))
      .first();
  }

  async verifyPageOpened(): Promise<void> {
    await expect(this.createButton).toBeVisible({ timeout: 10_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await expect(this.page).toHaveURL(/\/catalogs\/site-details/i, { timeout: 10_000 });
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
    await expect(this.saveButton).toBeVisible({ timeout: 10_000 });
  }

  async verifyCreated(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  }
}