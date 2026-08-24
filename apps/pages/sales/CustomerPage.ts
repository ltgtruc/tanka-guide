import { Locator, Page } from '@playwright/test';

import { waitAndClick, waitToSeeText } from '../../helpers/action.helper';

export class CustomerPage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;

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

    // Theo snapshot màn hình Chi tiết khách hàng
    // 0 = Tên
    // 1 = Số ĐT
    // 2 = Email
    // 3 = Mã số thuế
    // 4 = Diễn giải

    this.nameInput = page
      .getByRole('textbox')
      .nth(0);

    this.phoneInput = page
      .getByRole('textbox')
      .nth(1);

    this.emailInput = page
      .getByRole('textbox')
      .nth(2);
  }

  async verifyPageOpened(): Promise<void> {
    await waitToSeeText(this.page, /khách hàng|chi tiết khách hàng/i);
  }

  async openCreateForm(): Promise<void> {
    await waitAndClick(this.createButton);
  }

  async save(): Promise<void> {
    await waitAndClick(this.saveButton);
  }

  async backToList(): Promise<void> {
    await waitAndClick(this.backButton);
  }

  async verifyCreated(customerName: string): Promise<void> {
    await waitToSeeText(this.page, customerName);
  }
}