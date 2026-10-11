import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { CatalogFormPage } from '../catalogs/CatalogFormPage';

/**
 * Hệ thống > Users (/systems/user-list).
 * Đã kiểm tra DOM thực tế:
 * - "Tạo mới" và nút sửa (fa-pen-to-square) mở dialog "Chi tiết User": Email *
 *   (khoá khi sửa), Tên *, Mật khẩu * (chỉ khi tạo), Nhóm quyền (multiselect),
 *   checkbox "Khoá tài khoản", nút Lưu / Đóng.
 * - Nút "Mật khẩu" (fa-key) mở dialog Mật khẩu * / Xác nhận mật khẩu *.
 * - Thùng rác mở alertdialog "Xác nhận" (Không / Đồng ý) — dùng deleteRow().
 */
export class UserPage extends CatalogFormPage {
  readonly dialog: Locator;
  readonly dialogSaveButton: Locator;

  constructor(page: Page) {
    super(page, '/systems/user-list', /\/systems\/user-list/, /^\W*hệ thống\W*$/i);

    this.dialog = page.locator('.p-dialog:visible');
    this.dialogSaveButton = this.dialog.getByRole('button', { name: /lưu/i });
  }

  dialogInput(label: RegExp): Locator {
    return this.dialog
      .locator('.c-component')
      .filter({ has: this.page.locator('label', { hasText: label }) })
      .locator('input')
      .first();
  }

  dialogCheckbox(labelText: RegExp): Locator {
    return this.dialog
      .locator('span, label')
      .filter({ hasText: labelText })
      .first()
      .locator('xpath=preceding-sibling::div[contains(@class,"p-checkbox")][1]');
  }

  async openCreateDialog(): Promise<void> {
    await this.createButton.click();
    await expect(this.dialog).toBeVisible({ timeout: 10_000 });
  }

  async selectGroup(group: string): Promise<void> {
    await this.dialog
      .locator('.c-component')
      .filter({ has: this.page.locator('label', { hasText: /nhóm quyền/i }) })
      .locator('.p-multiselect')
      .first()
      .click();

    // Nhóm quyền là multiselect — một người dùng có thể thuộc nhiều nhóm.
    const option = this.page
      .locator('.p-multiselect-overlay:visible [role="option"]')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(group)}\\s*$`, 'i') })
      .first();

    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('.p-multiselect-overlay')).toHaveCount(0, { timeout: 10_000 });
    await expect(
      this.dialog.locator('.c-component').filter({ has: this.page.locator('label', { hasText: /nhóm quyền/i }) }),
    ).toContainText(group, { timeout: 10_000 });
  }

  /** Bấm Lưu trong dialog, chờ thông báo; dialog còn mở thì đóng lại. */
  async saveDialog(): Promise<void> {
    await this.dialogSaveButton.click();
    await expect(this.page.getByText(/thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await this.dialog
      .getByRole('button', { name: /đóng/i })
      .click({ timeout: 3_000 })
      .catch(() => undefined);
    await expect(this.dialog).toBeHidden({ timeout: 10_000 });
  }

  editButton(row: Locator): Locator {
    return row.locator('button:has(.fa-pen-to-square)');
  }

  passwordButton(row: Locator): Locator {
    return row.locator('button:has(.fa-key)');
  }
}
