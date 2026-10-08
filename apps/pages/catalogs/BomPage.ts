import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

export class BomPage extends BasePage {
  readonly productDropdown: Locator;
  readonly siteDropdown: Locator;
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
     * - "Chi nhánh" (trước đây là "Kho hàng") có thẻ <label> thật trong .c-component.
     */
    this.productDropdown = page.locator('[role="combobox"], .p-select, .p-dropdown').first();

    this.siteDropdown = this.formDropdown(/^\s*chi nhánh\s*\*?\s*$/i);

    // "Tổng số W/H mặc định" cũng không phải thẻ <label> (giống "Định mức -
    // HTK" ở trên), nên dò theo text bằng getByText() thay vì locator('label').
    const inputAfterLabel = (labelPattern: RegExp): Locator =>
      page.getByText(labelPattern).first().locator('xpath=following::input[1]');

    this.totalWidthInput = inputAfterLabel(/^tổng số w mặc định\s*\*?$/i);
    this.totalHeightInput = inputAfterLabel(/^tổng số h mặc định\s*\*?$/i);

    // Tab "Profile" là tab mặc định được chọn khi vừa chọn xong HTK + Chi nhánh.
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

  /**
   * Trên trang danh sách: tìm theo `searchCode` và trả về mã HTK đã có định
   * mức ở chi nhánh `site` (mỗi cặp HTK + chi nhánh chỉ tạo được 1 định mức).
   * Xoá ô tìm kiếm sau khi đọc xong.
   */
  async getExistingProductCodes(searchCode: string, site: string): Promise<string[]> {
    // Ô "Từ khóa tìm kiếm" là textbox đầu tiên của trang danh sách.
    const searchInput = this.page.locator('main').getByRole('textbox').first();
    const rows = this.page.locator('main table tbody tr');

    await expect(searchInput).toBeVisible({ timeout: 15_000 });
    await searchInput.fill(searchCode);
    await searchInput.press('Enter');
    await expect(rows.filter({ hasText: new RegExp(escapeRegExp(searchCode), 'i') }).first()).toBeVisible({
      timeout: 15_000,
    });

    const codes = (await rows.filter({ hasText: site }).allInnerTexts())
      .map((text) => text.match(/[A-Z]{2}-\d{2}-[A-Z0-9-]+?-\d\.\d/)?.[0] ?? '')
      .filter(Boolean);

    await searchInput.fill('');
    await searchInput.press('Enter');

    return codes;
  }

  /**
   * Tìm và chọn Định mức - HTK (thành phẩm) theo mã, ví dụ "TDA-55". Bỏ qua
   * các mã trong `excludeCodes` (đã có định mức ở chi nhánh định chọn).
   */
  async selectProduct(searchCode: string, excludeCodes: string[] = []): Promise<string> {
    await this.productDropdown.scrollIntoViewIfNeeded();
    await this.clickDropdownControl(this.productDropdown);

    await this.page.keyboard.type(searchCode, { delay: 40 });
    await this.page.waitForTimeout(900);

    const matchingOptions = this.getVisibleDropdownOptions().filter({ hasText: new RegExp(escapeRegExp(searchCode), 'i') });

    await expect(matchingOptions.first()).toBeVisible({ timeout: 15_000 });

    const optionTexts = await matchingOptions.allInnerTexts();
    const freeIndex = optionTexts.findIndex((text) => !excludeCodes.some((code) => text.trim().startsWith(code)));

    if (freeIndex < 0) {
      throw new Error(`Tất cả HTK chứa "${searchCode}" đều đã có định mức ở chi nhánh này — đổi productSearch/site.`);
    }

    const option = matchingOptions.nth(freeIndex);

    await expect(option).toBeVisible({ timeout: 15_000 });

    const selectedText = (await option.innerText()).trim();

    await option.click();
    await this.page.waitForTimeout(800);

    return selectedText;
  }

  /** Chọn Chi nhánh theo tên, ví dụ "Hóc Môn". */
  async selectSite(siteName: string): Promise<string> {
    await this.siteDropdown.scrollIntoViewIfNeeded();
    await this.clickDropdownControl(this.siteDropdown);

    const options = this.getVisibleDropdownOptions();

    await expect(options.first()).toBeVisible({ timeout: 15_000 });

    const option = options.filter({ hasText: new RegExp(`^${escapeRegExp(siteName)}$`, 'i') }).first();

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
