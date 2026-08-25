import { expect, Locator, Page } from '@playwright/test';

import { BaseSalesDocumentPage } from './BaseSalesDocumentPage';

export class QuotationPage extends BaseSalesDocumentPage {
  readonly customerDropdown: Locator;
  readonly warehouseDropdown: Locator;
  readonly quotationEmployeeDropdown: Locator;
  readonly salesEmployeeDropdown: Locator;
  readonly designerEmployeeDropdown: Locator;

  readonly itemDetailDialog: Locator;
  readonly drawingCodeInput: Locator;
  readonly glassDropdown: Locator;

  readonly generalInfoTab: Locator;
  readonly attributeOptionsTab: Locator;

  constructor(page: Page) {
    super(page, { createButtonName: /tạo mới|create new/i });

    this.customerDropdown = this.findDropdownInput(/khách hàng/i);
    this.warehouseDropdown = this.findDropdownInput(/kho hàng /i);
    this.quotationEmployeeDropdown = this.findDropdownInput(/nhân viên\s*(bg|báo giá)/i);
    this.salesEmployeeDropdown = this.findDropdownInput(/nhân viên\s*(kd|kinh doanh)/i);
    this.designerEmployeeDropdown = this.findDropdownInput(/nhân viên\s*thiết kế/i);

    const detailDialogByPrimeVue = page
      .locator(['.p-dialog:visible', '.p-dialog-mask:visible .p-dialog', '[role="dialog"]:visible'].join(', '))
      .filter({ hasText: /thông số chi tiết cho/i })
      .first();

    const detailDialogByHeading = page
      .getByText(/thông số chi tiết cho/i)
      .first()
      .locator(
        [
          'xpath=ancestor::*[',
          'contains(@class,"p-dialog") or ',
          'contains(@class,"dialog") or ',
          '@role="dialog"',
          '][1]',
        ].join(''),
      );

    this.itemDetailDialog = detailDialogByPrimeVue.or(detailDialogByHeading).first();

    const drawingLabel = this.itemDetailDialog.locator('label').filter({ hasText: /mã bản vẽ/i }).first();
    const drawingByLabel = drawingLabel.locator('xpath=following::input[1]');
    const drawingByText = this.itemDetailDialog
      .getByText(/^mã bản vẽ\s*\*?$/i)
      .first()
      .locator('xpath=following::input[1]');

    this.drawingCodeInput = drawingByLabel.or(drawingByText).first();

    const glassLabel = this.itemDetailDialog.locator('label').filter({ hasText: /^kính$/i }).first();

    const glassByLabel = glassLabel.locator(
      [
        'xpath=following::*[',
        'contains(@class,"p-select") or ',
        'contains(@class,"p-dropdown") or ',
        '@role="combobox"',
        '][1]',
      ].join(''),
    );

    const glassByText = this.itemDetailDialog
      .getByText(/^kính $/i)
      .first()
      .locator(
        [
          'xpath=following::*[',
          'contains(@class,"p-select") or ',
          'contains(@class,"p-dropdown") or ',
          '@role="combobox"',
          '][1]',
        ].join(''),
      );

    this.glassDropdown = glassByLabel.or(glassByText).first();

    this.generalInfoTab = this.itemDetailDialog.getByText(/^thông số chung$/i).first();
    this.attributeOptionsTab = this.itemDetailDialog.getByText(/^các lựa chọn thuộc tính$/i).first();
  }

  async verifyPageOpened(): Promise<void> {
    await expect(this.createButton).toBeVisible({ timeout: 15_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/sales-quote-details|quote-details/i, { timeout: 30_000 });

    await expect(this.customerDropdown).toBeVisible({ timeout: 20_000 });
  }

  async clickAddButton(): Promise<void> {
    await expect(this.addButton).toBeVisible({ timeout: 20_000 });
    await expect(this.addButton).toBeEnabled({ timeout: 15_000 });

    await this.addButton.scrollIntoViewIfNeeded();

    try {
      await this.addButton.click({ timeout: 10_000 });
    } catch {
      await this.addButton.click({ force: true });
    }
  }

  async openAttributeOptionsTab(): Promise<void> {
    await expect(this.attributeOptionsTab).toBeVisible({ timeout: 15_000 });

    await this.attributeOptionsTab.click();

    await this.page.waitForTimeout(1_200);
  }

  async closeItemDetails(): Promise<void> {
    const visibleDialog = this.page.locator('.p-dialog:visible').filter({ hasText: /thông số chi tiết cho/i }).first();

    if (!(await visibleDialog.isVisible().catch(() => false))) {
      return;
    }

    const footerCloseButton = visibleDialog.locator('button').filter({ hasText: /^\s*đóng\s*$/i }).last();

    await expect(footerCloseButton).toBeVisible({ timeout: 15_000 });
    await expect(footerCloseButton).toBeEnabled({ timeout: 15_000 });

    console.log('Nút đóng popup:', (await footerCloseButton.innerText()).trim());

    await footerCloseButton.click();

    await expect(visibleDialog).toBeHidden({ timeout: 20_000 });
    await expect(this.addButton).toBeVisible({ timeout: 15_000 });
  }

  async backToQuotationList(): Promise<void> {
    await this.backToList();

    await this.page.waitForURL(/sales-quote-list|sales-order-list/i, { timeout: 30_000 });
  }

  private getVisibleAddButton(): Locator {
    const visibleButton = this.page
      .locator(['button:visible', 'a:visible', '[role="button"]:visible'].join(', '))
      .filter({ hasText: /^\s*thêm\s*$/i })
      .last();

    const buttonFromText = this.page
      .getByText(/^\s*thêm\s*$/i)
      .last()
      .locator('xpath=ancestor-or-self::*[self::button or self::a or @role="button"][1]');

    return visibleButton.or(buttonFromText).first();
  }

  async clickAddLineButton(): Promise<void> {
    const addButton = this.getVisibleAddButton();

    await expect(addButton).toBeVisible({ timeout: 20_000 });

    await addButton.scrollIntoViewIfNeeded();

    await expect(addButton).toBeEnabled({ timeout: 15_000 });

    try {
      await addButton.click({ timeout: 10_000 });
    } catch {
      await addButton.click({ force: true });
    }
  }
}
