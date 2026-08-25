import { expect, Locator, Page } from '@playwright/test';

import { BaseSalesDocumentPage } from './BaseSalesDocumentPage';

export class SalesOrderPage extends BaseSalesDocumentPage {
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
    this.salesEmployeeDropdown = this.findDropdownInput(/nhân viên\s*(bh|bán hàng|kd|kinh doanh)/i);
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
    const drawingByText = this.itemDetailDialog.getByText(/mã bản vẽ/i).first().locator('xpath=following::input[1]');

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
      .getByText(/^kính\s*$/i)
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

    await this.page.waitForURL(/sales-order-details|order-details/i, { timeout: 30_000 });

    await expect(this.customerDropdown).toBeVisible({ timeout: 20_000 });
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    await this.page.waitForTimeout(1_500);
  }

  async save(): Promise<void> {
    await this.scrollToTop();
    await super.save();
  }

  async backToSalesOrderList(): Promise<void> {
    await this.backToList();

    await this.page.waitForURL(/sales-order-list|orders\/sales-order(?!-details)/i, { timeout: 30_000 });
  }

  async closeItemDetails(): Promise<void> {
    const visibleDialog = this.getVisibleItemDetailDialog();

    if (!(await visibleDialog.isVisible().catch(() => false))) {
      return;
    }

    const footerCloseButton = visibleDialog.locator('button').filter({ hasText: /^\s*đóng\s*$/i }).last();

    await expect(footerCloseButton).toBeVisible({ timeout: 15_000 });
    await expect(footerCloseButton).toBeEnabled({ timeout: 15_000 });

    await footerCloseButton.click();

    await expect(visibleDialog).toBeHidden({ timeout: 20_000 });
    await expect(this.addButton).toBeVisible({ timeout: 15_000 });
  }
}
