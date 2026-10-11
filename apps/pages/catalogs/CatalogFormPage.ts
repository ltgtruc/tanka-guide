import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

/**
 * Page Object dùng chung cho các danh mục đơn giản dưới /catalogs/<name>-list
 * (Nhóm HTK, ĐVT, Chi nhánh, Mã nẹp kính, NSX, Thuộc tính, Màu sắc, Thuế
 * suất, Nhân viên, Hệ profile).
 * Đã kiểm tra DOM thực tế:
 * - Danh sách: ô "Từ khóa tìm kiếm" (Enter để lọc), cột Hoạt động là checkbox.
 * - Form: mỗi ô là `.c-component > label + input/.p-select/.p-multiselect`;
 *   các checkbox (Hoạt động, Đơn vị đếm, Có nẹp kính...) là `.p-checkbox`
 *   đứng trước `<span>` nhãn.
 * - Lưu thành công: toast "Lưu thành công", URL chuyển sang .../<id>.
 * - Cũng dùng cho các danh mục đơn giản ở module khác (Đội thuê ngoài, Nhà cung
 *   cấp, Nhóm giá bán...) bằng cách truyền moduleMenuName.
 * - Xoá dòng: nút thùng rác trên dòng mở alertdialog "Xác nhận" (Không / Đồng ý).
 */
export class CatalogFormPage extends BasePage {
  readonly catalogsMenu: Locator;
  readonly listMenu: Locator;
  readonly listRows: Locator;
  readonly keywordInput: Locator;

  private readonly listPath: string;
  private readonly detailPattern: RegExp;

  constructor(page: Page, listPath: string, detailPattern: RegExp, moduleMenuName: RegExp = /^\W*danh mục\W*$/i) {
    super(page);

    this.listPath = listPath;
    this.detailPattern = detailPattern;
    this.catalogsMenu = page.getByRole('link', { name: moduleMenuName }).first();
    this.listMenu = page.locator(`a[href="${listPath}"]`);
    this.listRows = page.locator('main table tbody tr');
    this.keywordInput = this.formInput(/từ khóa tìm kiếm/i);
  }

  async openList(): Promise<void> {
    if (!(await this.listMenu.isVisible().catch(() => false))) {
      await expect(this.catalogsMenu).toBeVisible({ timeout: 15_000 });
      await this.catalogsMenu.click();
    }

    await expect(this.listMenu).toBeVisible({ timeout: 15_000 });
    await this.listMenu.click();

    await this.page.waitForURL(new RegExp(escapeRegExp(this.listPath)), { timeout: 30_000 });
    await expect(this.listRows.first()).toBeVisible({ timeout: 20_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(this.detailPattern, { timeout: 30_000 });
    await expect(this.saveButton).toBeVisible({ timeout: 20_000 });
  }

  field(label: RegExp): Locator {
    return this.formField(label);
  }

  input(label: RegExp): Locator {
    return this.formInput(label);
  }

  dropdown(label: RegExp): Locator {
    return this.formField(label).locator('.p-select, .p-multiselect').first();
  }

  async fillText(label: RegExp, value: string): Promise<void> {
    const input = this.formInput(label);

    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill(value);
  }

  async fillNumber(label: RegExp, value: string): Promise<void> {
    const input = this.formInput(label);

    await input.click();
    await input.press('Control+A');
    await input.pressSequentially(value, { delay: 30 });
    await input.press('Tab');
  }

  /** Chọn 1 giá trị trong p-select (searchText: gõ để tìm phía server). */
  async selectOption(label: RegExp, option: string, searchText?: string): Promise<void> {
    await this.dropdown(label).click();

    if (searchText) {
      await this.page.keyboard.type(searchText, { delay: 50 });
    }

    const item = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(option)}\\s*$`, 'i') })
      .first();

    await expect(item).toBeVisible({ timeout: 15_000 });
    await item.click();
    await expect(this.page.locator('.p-select-overlay')).toHaveCount(0, { timeout: 10_000 });
  }

  /** Tích nhiều giá trị trong p-multiselect rồi đóng. */
  async selectMany(label: RegExp, options: string[]): Promise<void> {
    await this.dropdown(label).click();

    for (const option of options) {
      const item = this.page
        .locator('.p-multiselect-overlay:visible [role="option"]')
        .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(option)}\\s*$`, 'i') })
        .first();

      await expect(item).toBeVisible({ timeout: 15_000 });
      await item.click();
    }

    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('.p-multiselect-overlay')).toHaveCount(0, { timeout: 10_000 });
  }

  /** Checkbox có nhãn chữ đứng sau (Hoạt động, Đơn vị đếm..., Có nẹp kính...). */
  checkbox(labelText: RegExp): Locator {
    return this.page
      .locator('main span, main label')
      .filter({ hasText: labelText })
      .first()
      .locator('xpath=preceding-sibling::div[contains(@class,"p-checkbox")][1]');
  }

  async setCheckbox(labelText: RegExp, checked: boolean): Promise<void> {
    const box = this.checkbox(labelText);

    await expect(box).toBeVisible({ timeout: 10_000 });

    const isChecked = /p-checkbox-checked/.test((await box.getAttribute('class')) ?? '');

    if (isChecked !== checked) {
      await box.click();
    }

    await expect(box).toHaveClass(checked ? /p-checkbox-checked/ : /^(?!.*p-checkbox-checked)/, { timeout: 5_000 });
  }

  async saveRecord(): Promise<void> {
    await this.save();

    await expect(this.page.getByText(/lưu thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await this.page.waitForURL(new RegExp(`${this.detailPattern.source}/[0-9a-f-]{36}`, 'i'), { timeout: 20_000 });
    // Lưu xong form không còn thay đổi nên nút Lưu mờ lại.
    await expect(this.saveButton).toBeDisabled({ timeout: 20_000 });
  }

  async searchList(keyword: string): Promise<Locator> {
    await expect(this.keywordInput).toBeVisible({ timeout: 15_000 });
    await this.keywordInput.fill(keyword);
    await this.keywordInput.press('Enter');

    const row = this.listRows.filter({ hasText: keyword }).first();

    await expect(row).toBeVisible({ timeout: 20_000 });

    return row;
  }

  deleteButton(row: Locator): Locator {
    return row.locator('button:has(.fa-trash-can)');
  }

  confirmDeleteButton(): Locator {
    return this.page.getByRole('alertdialog', { name: /xác nhận/i }).getByRole('button', { name: /đồng ý/i });
  }

  /** Bấm thùng rác trên dòng rồi Đồng ý; chờ dòng biến mất. */
  async deleteRow(row: Locator): Promise<void> {
    await this.deleteButton(row).click();
    await expect(this.confirmDeleteButton()).toBeVisible({ timeout: 10_000 });
    await this.confirmDeleteButton().click();
    await expect(row).toBeHidden({ timeout: 20_000 });
  }

  async backToListPage(): Promise<void> {
    await this.backToList();
    await this.page.waitForURL(new RegExp(escapeRegExp(this.listPath)), { timeout: 30_000 });
  }
}
