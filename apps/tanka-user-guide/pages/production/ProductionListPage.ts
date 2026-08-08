import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class ProductionListPage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  readonly warehouseDropdown: Locator;
  readonly descriptionInput: Locator;

  readonly chooseSalesOrderButton: Locator;

  readonly salesOrderCheckbox: Locator;
  readonly popupSelectButton: Locator;

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

    this.warehouseDropdown = page
      .locator('input')
      .nth(0);

    this.descriptionInput = page
      .getByRole('textbox')
      .last();

    this.chooseSalesOrderButton = page
      .getByRole('button', {
        name: /chọn các đơn bh/i,
      });

    this.salesOrderCheckbox = page
      .locator('input[type="checkbox"]')
      .nth(1);

    this.popupSelectButton = page
      .getByRole('button', {
        name: /^chọn$/i,
      })
      .last();
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