import { Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';

export class ProductionListPage extends BasePage {
  readonly warehouseDropdown: Locator;
  readonly descriptionInput: Locator;

  readonly chooseSalesOrderButton: Locator;

  readonly salesOrderCheckbox: Locator;
  readonly popupSelectButton: Locator;

  constructor(page: Page) {
    super(page);

    this.warehouseDropdown = page.locator('input').nth(0);
    this.descriptionInput = page.getByRole('textbox').last();
    this.chooseSalesOrderButton = page.getByRole('button', { name: /chọn các đơn bh/i });
    this.salesOrderCheckbox = page.locator('input[type="checkbox"]').nth(1);
    this.popupSelectButton = page.getByRole('button', { name: /^chọn$/i }).last();
  }
}