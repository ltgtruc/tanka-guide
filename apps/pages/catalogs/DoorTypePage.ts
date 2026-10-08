import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';

export class DoorTypePage extends BasePage {
  readonly nameInput: Locator;
  readonly reportTypeDropdown: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = this.formInput(/^\s*tên\s*\*?\s*$/i);
    this.reportTypeDropdown = this.formDropdown(/loại báo cáo/i);
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    // Chờ form chi tiết thay hẳn trang danh sách (ô tìm kiếm của danh sách
    // cũng là textbox, fill sớm sẽ trúng node đã bị gỡ khỏi DOM).
    await expect(this.page).toHaveURL(/\/catalogs\/door-type-details/i, { timeout: 10_000 });
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });
  }
}
