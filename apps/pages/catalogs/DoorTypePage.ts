import { Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';

export class DoorTypePage extends BasePage {
  readonly nameInput: Locator;
  readonly reportTypeDropdown: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByRole('textbox').nth(0);
    this.reportTypeDropdown = page.getByRole('combobox');
  }
}