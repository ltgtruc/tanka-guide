import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

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
    await expect(
      this.page.getByText(
        /khách hàng|chi tiết khách hàng/i,
      ),
    ).toBeVisible({
      timeout: 10000,
    });
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

  async verifyCreated(
    customerName: string,
  ): Promise<void> {
    await expect(
      this.page.getByText(customerName),
    ).toBeVisible({
      timeout: 10000,
    });
  }
}