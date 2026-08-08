import {
  expect,
  type Locator,
  type Page,
} from '@playwright/test';

export class WarehousePage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly nameInput: Locator;
  readonly activeCheckbox: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly cityInput: Locator;
  readonly phoneInput: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createButton = page
      .getByRole('button', {
        name: /tạo mới|create new|create/i,
      })
      .first();

    this.nameInput = page
      .getByLabel(/^tên\s*\*?$/i)
      .or(
        page.locator('input[type="text"]').nth(0),
      )
      .first();

    this.activeCheckbox = page
      .getByRole('checkbox', {
        name: /hoạt động/i,
      })
      .first();

    this.address1Input = page
      .getByLabel(/địa chỉ 1/i)
      .or(
        page.locator('input[type="text"]').nth(1),
      )
      .first();

    this.address2Input = page
      .getByLabel(/địa chỉ 2/i)
      .or(
        page.locator('input[type="text"]').nth(2),
      )
      .first();

    this.cityInput = page
      .getByLabel(/thành phố/i)
      .or(
        page.locator('input[type="text"]').nth(3),
      )
      .first();

    this.phoneInput = page
      .getByLabel(/số đt|số điện thoại|phone/i)
      .or(
        page.locator('input[type="text"]').nth(4),
      )
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
  }

  async verifyPageOpened(): Promise<void> {
    await expect(this.createButton).toBeVisible({
      timeout: 10_000,
    });
  }

  async openCreateForm(): Promise<void> {
    await expect(this.createButton).toBeVisible({
      timeout: 10_000,
    });

    await expect(this.createButton).toBeEnabled();

    await this.createButton.click();

    await expect(this.page).toHaveURL(
      /\/catalogs\/site-details/i,
      {
        timeout: 10_000,
      },
    );

    await expect(this.nameInput).toBeVisible({
      timeout: 10_000,
    });

    await expect(this.saveButton).toBeVisible({
      timeout: 10_000,
    });
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeVisible({
      timeout: 10_000,
    });

    await expect(this.saveButton).toBeEnabled();

    await this.saveButton.click();
  }

  async verifyCreated(name: string): Promise<void> {
    await expect(
      this.page
        .getByText(name, {
          exact: true,
        })
        .first(),
    ).toBeVisible({
      timeout: 15_000,
    });
  }
  async backToList(): Promise<void> {
  await expect(this.backButton).toBeVisible({
    timeout: 10_000,
  });

  await this.backButton.click();
}
}