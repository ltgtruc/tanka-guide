import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from '../BasePage';

export class WarehousePage extends BasePage {
  readonly nameInput: Locator;
  readonly activeCheckbox: Locator;
  readonly siteDropdown: Locator;

  constructor(page: Page) {
    super(page);

    // Form Kho hàng (warehouse-details) hiện chỉ còn: Tên, Chi nhánh, Hoạt động.
    this.nameInput = this.formInput(/^\s*tên\s*\*?\s*$/i);
    this.activeCheckbox = page.getByRole('checkbox', { name: /hoạt động/i }).first();
    this.siteDropdown = this.formDropdown(/chi nhánh/i);
  }

  async verifyPageOpened(): Promise<void> {
    await expect(this.createButton).toBeVisible({ timeout: 10_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await expect(this.page).toHaveURL(/\/catalogs\/warehouse-details/i, { timeout: 10_000 });
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
    await expect(this.saveButton).toBeVisible({ timeout: 10_000 });
  }

  async selectSite(site: string): Promise<void> {
    await expect(this.siteDropdown).toBeVisible({ timeout: 10_000 });
    await this.siteDropdown.click();

    const option = this.page.getByRole('option', { name: site, exact: true });

    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async verifyCreated(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  }
}
