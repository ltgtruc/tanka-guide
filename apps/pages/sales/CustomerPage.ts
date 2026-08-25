import { Locator, Page } from '@playwright/test';

import { waitToSeeText } from '../../helpers/action.helper';
import { BasePage } from '../BasePage';

export class CustomerPage extends BasePage {
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    super(page);

    // Theo snapshot màn hình Chi tiết khách hàng
    // 0 = Tên
    // 1 = Số ĐT
    // 2 = Email
    // 3 = Mã số thuế
    // 4 = Diễn giải

    this.nameInput = page.getByRole('textbox').nth(0);
    this.phoneInput = page.getByRole('textbox').nth(1);
    this.emailInput = page.getByRole('textbox').nth(2);
  }

  async verifyPageOpened(): Promise<void> {
    await waitToSeeText(this.page, /khách hàng|chi tiết khách hàng/i);
  }

  async verifyCreated(customerName: string): Promise<void> {
    await waitToSeeText(this.page, customerName);
  }
}