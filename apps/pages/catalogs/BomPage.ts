import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

export class BomPage extends BasePage {
  readonly productDropdown: Locator;
  readonly warehouseDropdown: Locator;
  readonly totalWidthInput: Locator;
  readonly totalHeightInput: Locator;
  readonly profileTab: Locator;

  constructor(page: Page) {
    super(page, { createButtonName: /tạo mới|create/i });

    /*
     * Đã kiểm tra DOM thực tế (form "Chi tiết định mức NVL"):
     * - "Định mức - HTK" hiển thị bằng <div>/<span> thường, KHÔNG phải thẻ
     *   <label>, nên cả getByLabel() lẫn findDropdownInput() (dò theo
     *   <label>) đều không tìm ra field này — phải lấy theo vị trí: đây
     *   luôn là combobox ĐẦU TIÊN trên form khi vừa mở "Tạo mới".
     * - "Kho hàng" thì có thẻ <label> thật nên dùng được findDropdownInput().
     */
    this.productDropdown = page.locator('[role="combobox"], .p-select, .p-dropdown').first();

    // BasePage.findDropdownInput() đi qua ancestor div/td/section rồi lấy
    // combobox đầu tiên bên trong — trên form này ancestor đó lại bao luôn
    // cả cột "Định mức - HTK", nên trả nhầm combobox đầu tiên của trang.
    // Đi thẳng theo "following" từ label "Kho hàng" cho ra đúng field hơn.
    const warehouseLabel = page.locator('label').filter({ hasText: /^kho hàng\s*\*?$/i }).first();

    this.warehouseDropdown = warehouseLabel.locator(
      ['xpath=following::*[', 'contains(@class,"p-select") or ', 'contains(@class,"p-dropdown") or ', '@role="combobox"', '][1]'].join(
        '',
      ),
    );

    // "Tổng số W/H mặc định" cũng không phải thẻ <label> (giống "Định mức -
    // HTK" ở trên), nên dò theo text bằng getByText() thay vì locator('label').
    const inputAfterLabel = (labelPattern: RegExp): Locator =>
      page.getByText(labelPattern).first().locator('xpath=following::input[1]');

    this.totalWidthInput = inputAfterLabel(/^tổng số w mặc định\s*\*?$/i);
    this.totalHeightInput = inputAfterLabel(/^tổng số h mặc định\s*\*?$/i);

    // Tab "Profile" là tab mặc định được chọn khi vừa chọn xong HTK + Kho hàng.
    this.profileTab = page.getByRole('tab', { name: /^profile$/i }).or(page.getByText(/^profile$/i)).first();
  }

  async verifyPageOpened(): Promise<void> {
    await expect(this.page.getByText(/danh sách định mức nvl/i).first()).toBeVisible({ timeout: 15_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/bom-details/i, { timeout: 30_000 });
    await expect(this.productDropdown).toBeVisible({ timeout: 20_000 });
  }

  protected getVisibleDropdownOptions(): Locator {
    return this.page.locator(
      [
        '.p-select-overlay:visible .p-select-option',
        '.p-dropdown-panel:visible .p-dropdown-item',
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',
      ].join(', '),
    );
  }

  protected async clickDropdownControl(dropdown: Locator): Promise<void> {
    const clickablePart = dropdown
      .locator(
        ['.p-select-label', '.p-select-dropdown', '.p-dropdown-label', '.p-dropdown-trigger', 'input', '[role="combobox"]'].join(
          ', ',
        ),
      )
      .first();

    if (await clickablePart.isVisible().catch(() => false)) {
      await clickablePart.click({ force: true });
      return;
    }

    await dropdown.click({ force: true });
  }

  /** Tìm và chọn Định mức - HTK (thành phẩm) theo mã, ví dụ "SQ-01-TDA-55-1.2". */
  async selectProduct(searchCode: string): Promise<string> {
    await this.productDropdown.scrollIntoViewIfNeeded();
    await this.clickDropdownControl(this.productDropdown);

    await this.page.keyboard.type(searchCode, { delay: 40 });
    await this.page.waitForTimeout(900);

    const option = this.getVisibleDropdownOptions().filter({ hasText: new RegExp(escapeRegExp(searchCode), 'i') }).first();

    await expect(option).toBeVisible({ timeout: 15_000 });

    const selectedText = (await option.innerText()).trim();

    await option.click();
    await this.page.waitForTimeout(800);

    return selectedText;
  }

  /** Chọn Kho hàng theo tên, ví dụ "Hóc Môn". */
  async selectWarehouse(warehouseName: string): Promise<string> {
    await this.warehouseDropdown.scrollIntoViewIfNeeded();
    await this.clickDropdownControl(this.warehouseDropdown);

    const options = this.getVisibleDropdownOptions();

    await expect(options.first()).toBeVisible({ timeout: 15_000 });

    const option = options.filter({ hasText: new RegExp(`^${escapeRegExp(warehouseName)}$`, 'i') }).first();

    await expect(option).toBeVisible({ timeout: 15_000 });

    const selectedText = (await option.innerText()).trim();

    await option.click();
    await this.page.waitForTimeout(800);

    return selectedText;
  }

  private async fillSpinButton(input: Locator, value: string): Promise<void> {
    // Đây là PrimeVue InputNumber (spinbutton) — locator.fill() đặt thẳng
    // value nên bị component tự định dạng lại sai (ví dụ "1200" -> "10").
    // Click, chọn hết nội dung cũ rồi gõ từng ký tự để component nhận
    // đúng giá trị.
    await input.click();
    await input.press('Control+A');
    await input.pressSequentially(value, { delay: 30 });
    await input.blur();
  }

  async fillTotalSize(width: string, height: string): Promise<void> {
    await expect(this.totalWidthInput).toBeVisible({ timeout: 15_000 });
    await this.fillSpinButton(this.totalWidthInput, width);

    await expect(this.totalHeightInput).toBeVisible({ timeout: 15_000 });
    await this.fillSpinButton(this.totalHeightInput, height);
  }

  protected getComponentRows(): Locator {
    /*
     * Mỗi dòng thành phần thực ra chiếm NHIỀU <tr> trong <tbody>: 1 dòng
     * chính (có nút xoá/kéo-thả, số thứ tự, và các combobox), 1 dòng ẩn
     * chứa <table> lồng bên trong, và 1 dòng "HTK thay thế: ..." — dòng
     * này CŨNG có thẻ <b> nên lọc theo <b> vẫn khớp nhầm (đã kiểm chứng:
     * cả dòng chính và dòng "HTK thay thế" đều có <b>). Lọc theo sự xuất
     * hiện của combobox (ô chọn Thành phần HTK) mới tách đúng dòng chính
     * duy nhất.
     */
    return this.page
      .locator('table tbody tr')
      .filter({ has: this.page.locator('[role="combobox"], .p-select, .p-dropdown') });
  }

  /**
   * Bấm nút Thêm ở tab đang active (mặc định là tab "Profile") để tạo một
   * dòng thành phần NVL mới, rồi trả về locator của dòng vừa tạo.
   */
  async addComponentRow(): Promise<Locator> {
    const rows = this.getComponentRows();
    const rowCountBefore = await rows.count();

    const addButton = this.page.locator('button:visible').filter({ hasText: /^\s*thêm\s*$/i }).first();

    await expect(addButton).toBeVisible({ timeout: 15_000 });
    await expect(addButton).toBeEnabled({ timeout: 15_000 });

    await addButton.click();

    await expect
      .poll(async () => rows.count(), {
        timeout: 15_000,
        message: 'Không thấy dòng thành phần NVL mới sau khi bấm nút Thêm',
      })
      .toBeGreaterThan(rowCountBefore);

    return rows.last();
  }

  /** Chọn Thành phần HTK cho một dòng vừa thêm, ví dụ "C3202-TDA-T-1.2". */
  async selectComponent(row: Locator, searchCode: string): Promise<string> {
    const componentDropdown = row.locator('[role="combobox"], .p-select, .p-dropdown').first();

    await expect(componentDropdown).toBeVisible({ timeout: 15_000 });
    await this.clickDropdownControl(componentDropdown);

    await this.page.keyboard.type(searchCode, { delay: 40 });
    await this.page.waitForTimeout(900);

    const options = this.getVisibleDropdownOptions();

    await expect(options.first()).toBeVisible({ timeout: 15_000 });

    const option = options.filter({ hasText: new RegExp(escapeRegExp(searchCode), 'i') }).first();

    await expect(option).toBeVisible({ timeout: 15_000 });

    const selectedText = (await option.innerText()).trim();

    await option.click();
    await this.page.waitForTimeout(800);

    return selectedText;
  }
}
