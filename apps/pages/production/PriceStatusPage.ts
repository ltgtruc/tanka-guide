import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class PriceStatusPage {
  readonly page: Page;

  readonly salesOrderListHeading: Locator;
  readonly currentStatus: Locator;
  readonly statusActionButton: Locator;

  readonly productionHeading: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly warehouseDropdown: Locator;
  readonly chooseSalesOrdersButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.salesOrderListHeading = page
      .getByText(/^đơn bán hàng$/i)
      .first();

    const statusField = page
      .locator('label')
      .filter({ hasText: /^trạng thái$/i })
      .first()
      .locator(
        'xpath=ancestor::*[self::div or self::td or self::section][1]',
      );

    const statusByText = page
      .getByText(/^trạng thái$/i)
      .first()
      .locator(
        'xpath=ancestor::*[self::div or self::td or self::section][1]',
      );

    const resolvedStatusField =
      statusField.or(statusByText).first();

    this.currentStatus = resolvedStatusField
      .locator(
        [
          'input',
          '.p-inputtext',
          '.p-select-label',
          '.p-dropdown-label',
          '[role="combobox"]',
        ].join(', '),
      )
      .first();

    this.statusActionButton = resolvedStatusField
      .locator('button:visible')
      .first();

    this.productionHeading = page
      .getByText(/^(quản lý sx|quản lý sản xuất)$/i)
      .first();

    this.createButton = page
      .getByRole('button', {
        name: /tạo mới|create new/i,
      })
      .first();

    this.saveButton = page
      .getByRole('button', {
        name: /lưu|save/i,
      })
      .first();

    this.warehouseDropdown =
      this.findDropdownInput(/kho hàng /i);

    this.chooseSalesOrdersButton = page
      .getByRole('button', {
        name: /chọn các đơn bh|chọn.*đơn bán hàng/i,
      })
      .first();
  }

  /**
   * ============================================================
   * ĐƠN BÁN HÀNG
   * ============================================================
   */

  async openSalesOrderList(): Promise<void> {
    const salesMenu = this.page
      .getByRole('link', { name: /bán hàng/i })
      .or(this.page.getByText(/^bán hàng$/i))
      .first();

    await expect(salesMenu).toBeVisible({
      timeout: 15_000,
    });

    await salesMenu.click();

    const salesOrderMenu = this.page
      .getByRole('link', { name: /^đơn bán hàng$/i })
      .or(this.page.getByText(/^đơn bán hàng$/i))
      .first();

    await expect(salesOrderMenu).toBeVisible({
      timeout: 15_000,
    });

    await salesOrderMenu.click();

    await expect(this.salesOrderListHeading).toBeVisible({
      timeout: 20_000,
    });
  }

  async openNewestDraftSalesOrder(
    preferredCode?: string,
  ): Promise<string> {
    const table = this.page
      .locator('table')
      .filter({ hasText: /trạng thái/i })
      .first();

    await expect(table).toBeVisible({
      timeout: 20_000,
    });

    const rows = table.locator('tbody tr');
    let targetRow: Locator;

    if (preferredCode?.trim()) {
      targetRow = rows
        .filter({
          hasText: new RegExp(
            this.escapeRegExp(preferredCode.trim()),
            'i',
          ),
        })
        .first();
    } else {
      const draftRows = rows.filter({
        hasText: /nháp/i,
      });

      targetRow = (await draftRows.count()) > 0
        ? draftRows.first()
        : rows.first();
    }

    await expect(targetRow).toBeVisible({
      timeout: 20_000,
    });

    const detailLink = targetRow
      .locator('a')
      .filter({ hasText: /BH[_-]|BH\d|\d{4}/i })
      .first()
      .or(targetRow.locator('a').first())
      .first();

    const salesOrderCode = (
      await detailLink.innerText()
    ).trim();

    await detailLink.click();

    await expect(
      this.page.getByText(/chi tiết đơn bh/i).first(),
    ).toBeVisible({ timeout: 20_000 });

    await expect(this.currentStatus).toBeVisible({
      timeout: 20_000,
    });

    return salesOrderCode;
  }

  async changeStatus(
    targetStatus: string,
    note = '',
  ): Promise<void> {
    await expect(this.statusActionButton).toBeVisible({
      timeout: 15_000,
    });

    await expect(this.statusActionButton).toBeEnabled({
      timeout: 15_000,
    });

    await this.statusActionButton.click();

    const statusOption = this.page
      .getByText(
        new RegExp(
          `^${this.escapeRegExp(targetStatus)}$`,
          'i',
        ),
      )
      .last();

    await expect(statusOption).toBeVisible({
      timeout: 15_000,
    });

    await statusOption.click();

    const transitionDialog = this.page
      .locator(
        '.p-dialog:visible, [role="dialog"]:visible, .modal:visible',
      )
      .filter({ hasText: /chuyển trạng thái sang/i })
      .first();

    await expect(transitionDialog).toBeVisible({
      timeout: 20_000,
    });

    const noteInput = this.page
      .locator('textarea:visible')
      .last();

    await expect(noteInput).toBeVisible({
      timeout: 15_000,
    });

    await expect(noteInput).toBeEditable({
      timeout: 15_000,
    });

    await noteInput.click();
    await noteInput.fill(note);

    await expect(noteInput).toHaveValue(note, {
      timeout: 10_000,
    });

    const updateButton = this.page
      .locator('button:visible')
      .filter({
        hasText: /^\s*Cập nhật\s*$/i,
      })
      .last();

    await expect(updateButton).toBeVisible({
      timeout: 15_000,
    });

    await expect(updateButton).toBeEnabled({
      timeout: 15_000,
    });

    await updateButton.click();

    const confirmDialog = this.page
      .locator(
        '.p-dialog:visible, [role="dialog"]:visible, .modal:visible',
      )
      .filter({ hasText: /xác nhận|bạn có chắc chắn/i })
      .last();

    await expect(confirmDialog).toBeVisible({
      timeout: 15_000,
    });

    const agreeButton = confirmDialog
      .getByRole('button', {
        name: /đồng ý|xác nhận|yes/i,
      })
      .last();

    await expect(agreeButton).toBeEnabled({
      timeout: 15_000,
    });

    await agreeButton.click();

    await expect(confirmDialog).toBeHidden({
      timeout: 20_000,
    });

    await this.expectSuccessMessage();
  }

  async expectCurrentStatus(
    expectedStatus: string,
  ): Promise<void> {
    const expected = new RegExp(
      this.escapeRegExp(expectedStatus),
      'i',
    );

    await expect
      .poll(
        async () => {
          const value = await this.currentStatus
            .inputValue()
            .catch(() => '');
          const text = await this.currentStatus
            .innerText()
            .catch(() => '');

          return `${value} ${text}`;
        },
        {
          timeout: 20_000,
          message:
            `Trạng thái chưa chuyển thành "${expectedStatus}"`,
        },
      )
      .toMatch(expected);
  }

  /**
   * ============================================================
   * QUẢN LÝ SẢN XUẤT
   * ============================================================
   */

  async openProductionManagement(): Promise<void> {
    const productionMenu = this.page
      .getByRole('link', { name: /^sản xuất$/i })
      .or(this.page.getByText(/^sản xuất$/i))
      .first();

    await expect(productionMenu).toBeVisible({
      timeout: 15_000,
    });

    await productionMenu.click();

    const managementMenu = this.page
      .getByRole('link', {
        name: /quản lý sx|quản lý sản xuất/i,
      })
      .or(
        this.page.getByText(
          /^(quản lý sx|quản lý sản xuất)$/i,
        ),
      )
      .first();

    await expect(managementMenu).toBeVisible({
      timeout: 15_000,
    });

    await managementMenu.click();

    await expect(this.productionHeading).toBeVisible({
      timeout: 20_000,
    });

    await expect(this.createButton).toBeVisible({
      timeout: 20_000,
    });
  }

  async openProductionCreateForm(): Promise<void> {
    await expect(this.createButton).toBeVisible({
      timeout: 15_000,
    });

    await expect(this.createButton).toBeEnabled({
      timeout: 15_000,
    });

    await this.createButton.click();

    await expect(
      this.page.getByText(/chi tiết sx/i).first(),
    ).toBeVisible({ timeout: 20_000 });

    await expect(this.warehouseDropdown).toBeVisible({
      timeout: 20_000,
    });
  }

  async chooseSalesOrderLines(
    salesOrderCode?: string,
  ): Promise<void> {
    await expect(
      this.chooseSalesOrdersButton,
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      this.chooseSalesOrdersButton,
    ).toBeEnabled({ timeout: 15_000 });

    await this.chooseSalesOrdersButton.click();

    const dialog = this.page
      .locator(
        '.p-dialog:visible, [role="dialog"]:visible, .modal:visible',
      )
      .filter({
        hasText: /chọn các dòng đơn bh để sx|chọn.*đơn bh/i,
      })
      .first();

    await expect(dialog).toBeVisible({
      timeout: 20_000,
    });

    const rows = dialog.locator('tbody tr');
    let targetRows = rows;

    if (salesOrderCode?.trim()) {
      const matchedRows = rows.filter({
        hasText: new RegExp(
          this.escapeRegExp(salesOrderCode.trim()),
          'i',
        ),
      });

      if ((await matchedRows.count()) > 0) {
        targetRows = matchedRows;
      }
    }

    await expect(targetRows.first()).toBeVisible({
      timeout: 20_000,
    });

    const targetCount = await targetRows.count();

    for (let index = 0; index < targetCount; index += 1) {
      const row = targetRows.nth(index);
      const checkbox = row.locator(
        'input[type="checkbox"], .p-checkbox-box, [role="checkbox"]',
      ).first();

      await expect(checkbox).toBeVisible({
        timeout: 10_000,
      });

      const checked = await checkbox
        .isChecked()
        .catch(async () =>
          (await checkbox.getAttribute('aria-checked')) === 'true',
        );

      if (!checked) {
        await checkbox.click();
      }
    }

    /*
 * Tìm tiêu đề popup đang hiển thị.
 */
    const dialogTitle = this.page
      .getByText(
        /^Chọn các dòng đơn BH để SX$/i,
      )
      .last();

    await expect(dialogTitle).toBeVisible({
      timeout: 20_000,
    });

    /*
     * Đi từ tiêu đề lên phần tử cha bao toàn bộ popup,
     * bao gồm nội dung bảng và footer chứa nút Chọn.
     */
    const salesOrderDialog = dialogTitle
      .locator(
        [
          'xpath=ancestor::*[',
          '@role="dialog" or ',
          'contains(@class,"p-dialog") or ',
          'contains(@class,"modal-content") or ',
          'contains(@class,"modal-dialog")',
          '][1]',
        ].join(''),
      );

    /*
     * Tìm nút Chọn bên trong đúng popup.
     */
    const chooseButton = this.page
      .locator('button:visible')
      .filter({
        hasText: /Chọn/i,
      })
      .last();

    await expect(chooseButton).toBeVisible({
      timeout: 15_000,
    });

    await expect(chooseButton).toBeEnabled({
      timeout: 15_000,
    });

    await chooseButton.scrollIntoViewIfNeeded();

    await chooseButton.click({
      force: true,
    });

    /*
     * Kiểm tra popup đã đóng.
     */
    await expect(salesOrderDialog).toBeHidden({
      timeout: 20_000,
    });

    const productionRows = this.page
      .locator('table tbody tr')
      .filter({ hasText: /BH[_-]|BH\d|\d{4}/i });

    await expect(productionRows.first()).toBeVisible({
      timeout: 20_000,
    });
  }

  async saveProductionOrder(): Promise<void> {
    await expect(this.saveButton).toBeVisible({
      timeout: 20_000,
    });

    await expect(this.saveButton).toBeEnabled({
      timeout: 15_000,
    });

    await this.saveButton.scrollIntoViewIfNeeded();
    await this.saveButton.click();

    await this.expectSuccessMessage();
  }

  async expectProductionStatusDraft(): Promise<void> {
    const draftStatus = this.page
      .getByText(/^nháp$/i)
      .or(this.page.locator('input[value="Nháp"]'))
      .first();

    await expect(draftStatus).toBeVisible({
      timeout: 20_000,
    });
  }

  /**
   * ============================================================
   * DROPDOWN / HELPERS
   * ============================================================
   */

  private findDropdownInput(
    labelPattern: RegExp,
  ): Locator {
    const byAccessibleLabel = this.page
      .getByLabel(labelPattern)
      .first();

    const byContainer = this.page
      .locator('label')
      .filter({ hasText: labelPattern })
      .first()
      .locator(
        'xpath=ancestor::*[self::div or self::td or self::section][1]',
      )
      .locator(
        [
          '[role="combobox"]',
          'input',
          '.p-select',
          '.p-dropdown',
          '.p-autocomplete',
          'ng-select',
        ].join(', '),
      )
      .first();

    const byFollowing = this.page
      .getByText(labelPattern)
      .first()
      .locator(
        'xpath=following::*[@role="combobox" or self::input][1]',
      );

    return byAccessibleLabel
      .or(byContainer)
      .or(byFollowing)
      .first();
  }

  async selectDropdownOption(
    dropdown: Locator,
    preferredText?: string,
  ): Promise<string> {
    await expect(dropdown).toBeVisible({
      timeout: 15_000,
    });

    await dropdown.scrollIntoViewIfNeeded();
    await this.closeExistingDropdown();

    /*
     * Click ô dropdown Kho hàng.
     */
    await this.clickDropdownControl(
      dropdown,
    );

    await this.page.waitForTimeout(
      500,
    );

    const options =
      this.getVisibleDropdownOptions();

    await expect(
      options.first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    const requestedText =
      preferredText?.trim() ?? '';

    let optionToSelect =
      options.first();

    if (requestedText) {
      const matchingOption =
        options
          .filter({
            hasText: new RegExp(
              this.escapeRegExp(
                requestedText,
              ),
              'i',
            ),
          })
          .first();

      await expect(
        matchingOption,
      ).toBeVisible({
        timeout: 15_000,
      });

      optionToSelect =
        matchingOption;
    }

    const selectedText = (
      await optionToSelect.innerText()
    ).trim();

    await optionToSelect.click({
      force: true,
    });

    await this.page.waitForTimeout(
      700,
    );

    return selectedText;
  }

  private async clickDropdownControl(
    dropdown: Locator,
  ): Promise<void> {
    const clickable = dropdown
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

    if (
      await clickable
        .isVisible()
        .catch(() => false)
    ) {
      await clickable.click({
        force: true,
      });

      return;
    }

    await dropdown.click({
      force: true,
    });
  }

  private getVisibleDropdownOptions(): Locator {
    return this.page.locator(
      [
        /*
         * Dropdown custom của Tanka.
         */
        'button.dropdown-item:visible',
        '.dropdown-menu:visible button.dropdown-item',
        '.dropdown-menu.show button.dropdown-item',
        '.dropdown-menu:visible .dropdown-item',

        /*
         * PrimeNG/PrimeVue.
         */
        '.p-select-overlay:visible .p-select-option',
        '.p-dropdown-panel:visible .p-dropdown-item',
        '.p-autocomplete-panel:visible .p-autocomplete-item',

        /*
         * ARIA/ng-select.
         */
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',
        '.ng-dropdown-panel:visible .ng-option',
        'ul[role="listbox"]:visible li',
      ].join(', '),
    );
  }

  private async closeExistingDropdown(): Promise<void> {
    const visibleOption =
      this.getVisibleDropdownOptions()
        .first();

    if (
      await visibleOption
        .isVisible()
        .catch(() => false)
    ) {
      await this.page.keyboard.press(
        'Escape',
      );

      await this.page.waitForTimeout(
        300,
      );
    }
  }

  private async expectSuccessMessage(): Promise<void> {
    const successMessage =
      this.page
        .getByText(
          /lưu thành công|thành công/i,
        )
        .first();

    await expect(
      successMessage,
    ).toBeVisible({
      timeout: 20_000,
    });
  }

  private escapeRegExp(
    value: string,
  ): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
  }
} 