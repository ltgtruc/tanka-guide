import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage, BasePageOptions } from '../BasePage';

export class BaseSalesDocumentPage extends BasePage {
  readonly addButton: Locator;
  readonly updateButton: Locator;
  readonly closeDetailButton: Locator;

  constructor(page: Page, options: BasePageOptions = {}) {
    super(page, options);

    this.addButton = page.locator('button.p-button:visible').filter({ hasText: /^\s*Thêm\s*$/i }).first();

    this.updateButton = page
      .locator(['.p-dialog:visible button', '[role="dialog"]:visible button', '.modal:visible button'].join(', '))
      .filter({ hasText: /^\s*cập nhật\s*$/i })
      .first();

    this.closeDetailButton = page
      .locator('.p-dialog:visible button.p-button')
      .filter({ hasText: /^\s*đóng\s*$/i })
      .last();
  }

  async selectDropdownOption(dropdown: Locator, preferredText?: string): Promise<string> {
    await expect(dropdown).toBeVisible({ timeout: 15_000 });
    await expect(dropdown).toBeEnabled({ timeout: 15_000 });

    await dropdown.scrollIntoViewIfNeeded();
    await this.closeExistingDropdown();
    await this.clickDropdownControl(dropdown);

    const visibleOptions = this.getVisibleDropdownOptions();

    await expect(visibleOptions.first()).toBeVisible({ timeout: 15_000 });

    const selectedText = await this.selectOptionFromList(visibleOptions, preferredText);

    await this.page.waitForTimeout(500);

    return selectedText;
  }

  protected getVisibleDropdownOptions(): Locator {
    return this.page.locator(
      [
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',
        '.p-select-overlay:visible .p-select-option',
        '.p-select-list:visible .p-select-option',
        '.p-dropdown-panel:visible .p-dropdown-item',
        '.p-autocomplete-panel:visible .p-autocomplete-item',
        '.p-overlay:visible [role="option"]',
        '.ng-dropdown-panel:visible .ng-option',
        '.ng-option:visible',
        '.mat-mdc-select-panel:visible mat-option',
        '.mat-select-panel:visible mat-option',
        'mat-option:visible',
        '.ant-select-dropdown:visible .ant-select-item-option',
        '.dropdown-menu.show .dropdown-item',
        '.dropdown-menu:visible .dropdown-item',
        '.autocomplete-menu:visible > *',
        '.suggestion-list:visible > *',
        'ul[role="listbox"]:visible li',
      ].join(', '),
    );
  }

  protected async closeExistingDropdown(): Promise<void> {
    const openedOption = this.getVisibleDropdownOptions().first();

    if (await openedOption.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  protected async clickDropdownControl(dropdown: Locator): Promise<void> {
    const clickablePart = dropdown
      .locator(
        [
          '.p-select-label',
          '.p-select-dropdown',
          '.p-dropdown-label',
          '.p-dropdown-trigger',
          '.p-autocomplete-input',
          '.ng-select-container',
          'input',
          '[role="combobox"]',
        ].join(', '),
      )
      .first();

    if (await clickablePart.isVisible().catch(() => false)) {
      await clickablePart.click({ force: true });
      return;
    }

    await dropdown.click({ force: true });
  }

  protected async selectOptionFromList(options: Locator, preferredText?: string): Promise<string> {
    await expect(options.first()).toBeVisible({ timeout: 15_000 });

    let optionToSelect = options.first();

    const requestedText = preferredText?.trim() ?? '';

    if (requestedText) {
      const matchingOption = options.filter({ hasText: new RegExp(escapeRegExp(requestedText), 'i') }).first();

      if (await matchingOption.isVisible().catch(() => false)) {
        optionToSelect = matchingOption;
      }
    }

    const selectedText = (await optionToSelect.innerText()).trim();

    await optionToSelect.click();

    return selectedText;
  }

  protected getLineItemsTable(): Locator {
    return this.page.locator('table').filter({ hasText: /tên\s*htk/i }).first();
  }

  protected getLineItemRows(): Locator {
    return this.getLineItemsTable().locator('tbody tr');
  }

  async addNewLineItem(): Promise<Locator> {
    const rows = this.getLineItemRows();
    const rowCountBefore = await rows.count();

    await expect(this.addButton).toBeVisible({ timeout: 20_000 });
    await expect(this.addButton).toBeEnabled({ timeout: 15_000 });

    await this.addButton.click();

    await expect
      .poll(async () => rows.count(), {
        timeout: 20_000,
        message: 'Không thấy dòng HTK mới sau khi bấm nút Thêm',
      })
      .toBeGreaterThan(rowCountBefore);

    const newRow = rows.last();

    await expect(newRow).toBeVisible({ timeout: 15_000 });

    return newRow;
  }

  getInventoryDropdownInRow(row: Locator): Locator {
    const byValidationMessage = row
      .getByText(/tên\s*htk\s*bắt\s*buộc/i)
      .first()
      .locator(
        [
          'xpath=preceding::*[',
          '@role="combobox" or ',
          'self::input or ',
          'contains(@class,"p-select") or ',
          'contains(@class,"p-dropdown") or ',
          'contains(@class,"p-autocomplete")',
          '][1]',
        ].join(''),
      );

    const byFirstControl = row
      .locator(['.p-select', '.p-dropdown', '.p-autocomplete', '[role="combobox"]', 'input'].join(', '))
      .first();

    return byValidationMessage.or(byFirstControl).first();
  }

  async openInventoryDropdown(row: Locator): Promise<Locator> {
    const inventoryDropdown = this.getInventoryDropdownInRow(row);

    await expect(inventoryDropdown).toBeVisible({ timeout: 15_000 });

    await inventoryDropdown.scrollIntoViewIfNeeded();
    await this.closeExistingDropdown();
    await this.clickDropdownControl(inventoryDropdown);

    await expect(
      this.getInventorySearchInput().or(this.getVisibleDropdownOptions().first()).first(),
    ).toBeVisible({ timeout: 15_000 });

    return inventoryDropdown;
  }

  protected getInventorySearchInput(): Locator {
    return this.page
      .locator(
        [
          '.p-select-overlay:visible input',
          '.p-select-filter-container:visible input',
          '.p-dropdown-panel:visible input',
          '.p-autocomplete-panel:visible input',
          '.p-overlay:visible input',
          '[role="listbox"]:visible input',
          '.ng-dropdown-panel:visible input',
          'input[placeholder*="Tìm"]:visible',
          'input[placeholder*="tìm"]:visible',
          'input[placeholder*="search"]:visible',
        ].join(', '),
      )
      .first();
  }

  async openNewestInventoryDropdown(): Promise<Locator> {
    const rows = this.getLineItemRows();

    await expect
      .poll(async () => rows.count(), {
        timeout: 15_000,
        message: 'Không tìm thấy dòng HTK mới trong bảng',
      })
      .toBeGreaterThan(0);

    const newestRow = rows.last();

    await expect(newestRow).toBeVisible({ timeout: 15_000 });

    await newestRow.scrollIntoViewIfNeeded();

    return this.openInventoryDropdown(newestRow);
  }

  async searchAndSelectInventory(inventoryCode: string): Promise<string> {
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (attempt > 0) {
        await this.openNewestInventoryDropdown();
      }

      const searchInput = this.getInventorySearchInput();

      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(inventoryCode);
      } else {
        await this.page.keyboard.type(inventoryCode, { delay: 60 });
      }

      await this.page.waitForTimeout(800);

      const options = this.getVisibleDropdownOptions();
      const matchingOptions = options.filter({ hasText: new RegExp(escapeRegExp(inventoryCode), 'i') });
      const optionCount = await matchingOptions.count();

      if (optionCount === 0) {
        throw new Error(`Không tìm thấy HTK chứa mã "${inventoryCode}".`);
      }

      if (attempt >= optionCount) {
        throw new Error(
          [
            `Đã thử ${optionCount} HTK chứa mã "${inventoryCode}",`,
            'nhưng tất cả đều không có giá hoặc không mở được form thông số.',
          ].join(' '),
        );
      }

      const optionToSelect = matchingOptions.nth(attempt);

      await expect(optionToSelect).toBeVisible({ timeout: 15_000 });

      const selectedText = (await optionToSelect.innerText()).trim();

      await optionToSelect.click();

      await this.page.waitForTimeout(1_000);

      if (await this.isMissingPriceDialog()) {
        console.log(`Bỏ qua HTK chưa có giá: ${selectedText}`);

        await this.closeMissingPriceDialog();
        await this.page.waitForTimeout(500);

        continue;
      }

      const drawingInput = this.getVisibleDrawingCodeInput();

      if (await drawingInput.isVisible().catch(() => false)) {
        console.log(`HTK hợp lệ đã chọn: ${selectedText}`);
        return selectedText;
      }

      throw new Error(
        [
          `Sau khi chọn HTK "${selectedText}",`,
          'popup không có cảnh báo "Chưa có giá"',
          'nhưng cũng không tìm thấy trường Mã bản vẽ.',
        ].join(' '),
      );
    }

    throw new Error(`Không tìm được HTK hợp lệ cho mã "${inventoryCode}".`);
  }

  async fillDrawingCode(drawingCode: string): Promise<void> {
    const detailDialog = this.getVisibleItemDetailDialog();

    await expect(detailDialog).toBeVisible({ timeout: 20_000 });

    if (await this.isMissingPriceDialog()) {
      throw new Error(['HTK đang chọn chưa có giá.', 'Không thể nhập Mã bản vẽ.'].join(' '));
    }

    const drawingInput = this.getVisibleDrawingCodeInput();

    await expect(drawingInput).toBeVisible({ timeout: 20_000 });
    await expect(drawingInput).toBeEditable({ timeout: 15_000 });

    await drawingInput.click();
    await drawingInput.fill(drawingCode);

    await expect(drawingInput).toHaveValue(drawingCode, { timeout: 10_000 });
  }

  async selectGlass(glassSearchCode: string): Promise<string> {
    await expect(this.itemDetailDialog).toBeVisible({ timeout: 20_000 });
    await expect(this.glassDropdown).toBeVisible({ timeout: 20_000 });

    await this.closeExistingDropdown();

    const clickableGlassControl = this.glassDropdown
      .locator(
        [
          '.p-select-label',
          '.p-select-dropdown',
          '.p-dropdown-label',
          '.p-dropdown-trigger',
          '[role="combobox"]',
          'input',
        ].join(', '),
      )
      .first();

    if (await clickableGlassControl.isVisible().catch(() => false)) {
      await clickableGlassControl.click({ force: true });
    } else {
      await this.glassDropdown.click({ force: true });
    }

    const glassOptions = this.getVisibleGlassOptions();
    const glassSearchInput = this.getVisibleGlassSearchInput();

    await expect(glassSearchInput.or(glassOptions.first()).first()).toBeVisible({ timeout: 15_000 });

    if (await glassSearchInput.isVisible().catch(() => false)) {
      await glassSearchInput.click();
      await glassSearchInput.fill(glassSearchCode);
    } else {
      await this.page.keyboard.type(glassSearchCode, { delay: 60 });
    }

    await this.page.waitForTimeout(800);

    const matchingGlass = glassOptions.filter({ hasText: new RegExp(escapeRegExp(glassSearchCode), 'i') }).first();

    await expect(matchingGlass).toBeVisible({ timeout: 20_000 });

    const selectedText = (await matchingGlass.innerText()).trim();

    await matchingGlass.click();

    await expect(matchingGlass).toBeHidden({ timeout: 10_000 }).catch(() => {});

    await this.page.waitForTimeout(500);

    return selectedText;
  }

  protected getVisibleGlassSearchInput(): Locator {
    return this.page
      .locator(
        [
          '.p-select-overlay:visible input',
          '.p-select-list-container:visible input',
          '.p-select-filter-container:visible input',
          '.p-select-overlay:visible .p-inputtext',
          '.p-dropdown-panel:visible input',
          '.p-dropdown-filter-container:visible input',
          '.p-overlay:visible input',
          '[role="listbox"]:visible input',
          'input[placeholder*="Tìm"]:visible',
          'input[placeholder*="tìm"]:visible',
          'input[placeholder*="Search"]:visible',
          'input[placeholder*="search"]:visible',
        ].join(', '),
      )
      .first();
  }

  protected getVisibleGlassOptions(): Locator {
    return this.page.locator(
      [
        '.p-select-overlay:visible .p-select-option',
        '.p-select-list:visible .p-select-option',
        '.p-dropdown-panel:visible .p-dropdown-item',
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',
        '.ng-dropdown-panel:visible .ng-option',
        '.dropdown-menu.show .dropdown-item',
      ].join(', '),
    );
  }

  async reviewAttributeOptions(): Promise<void> {
    await expect(this.attributeOptionsTab).toBeVisible({ timeout: 15_000 });

    await this.attributeOptionsTab.scrollIntoViewIfNeeded();
    await this.attributeOptionsTab.click();

    await this.page.waitForTimeout(1_200);
  }

  async updateItemDetails(): Promise<void> {
    await expect(this.updateButton).toBeVisible({ timeout: 20_000 });
    await expect(this.updateButton).toBeEnabled({ timeout: 15_000 });

    await this.updateButton.click();

    await this.page.waitForTimeout(1_000);
  }

  protected getVisibleItemDetailDialog(): Locator {
    return this.page
      .locator(['.p-dialog:visible', '[role="dialog"]:visible', '.modal:visible'].join(', '))
      .filter({ hasText: /thông số chi tiết cho/i })
      .first();
  }

  protected getMissingPriceMessage(): Locator {
    return this.getVisibleItemDetailDialog().getByText(/chưa có giá/i).first();
  }

  protected async isMissingPriceDialog(): Promise<boolean> {
    return this.getMissingPriceMessage().isVisible().catch(() => false);
  }

  protected async closeMissingPriceDialog(): Promise<void> {
    const warningDialog = this.getVisibleItemDetailDialog();
    const closeButton = warningDialog.getByRole('button', { name: /đóng/i }).last();

    await expect(closeButton).toBeVisible({ timeout: 10_000 });

    await closeButton.click();

    await expect(warningDialog).toBeHidden({ timeout: 10_000 });
  }

  protected getVisibleDrawingCodeInput(): Locator {
    const detailDialog = this.getVisibleItemDetailDialog();

    const byLabel = detailDialog.getByLabel(/mã bản vẽ/i).first();
    const byText = detailDialog.getByText(/mã bản vẽ/i).first().locator('xpath=following::input[1]');
    const byLabelElement = detailDialog
      .locator('label')
      .filter({ hasText: /mã bản vẽ/i })
      .first()
      .locator('xpath=following::input[1]');

    return byLabel.or(byLabelElement).or(byText).first();
  }

  async saveAndWaitForSuccess(): Promise<void> {
    await this.save();

    const successMessage = this.page.getByText(/lưu thành công|thành công/i).first();

    await expect(successMessage).toBeVisible({ timeout: 20_000 });
  }

  declare readonly itemDetailDialog: Locator;
  declare readonly drawingCodeInput: Locator;
  declare readonly glassDropdown: Locator;
  declare readonly attributeOptionsTab: Locator;
}
