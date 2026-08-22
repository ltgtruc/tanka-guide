import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class SalesOrderPage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly addButton: Locator;

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

  readonly updateButton: Locator;
  readonly closeDetailButton: Locator;

  constructor(page: Page) {
    this.page = page;

    /*
     * Các nút chính của Đơn bán hàng.
     */
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

    this.backButton = page
      .getByRole('button', {
        name: /trở lại|back/i,
      })
      .first();

    /*
     * Chỉ lấy nút Thêm dòng đang hiển thị.
     * PrimeVue/PrimeNG có thể giữ button ẩn trong DOM,
     * vì vậy dùng :visible.
     */
    this.addButton = page
      .locator('button.p-button:visible')
      .filter({
        hasText: /^\s*Thêm\s*$/i,
      })
      .first();

    /*
     * Các dropdown bắt buộc trên form Chi tiết đơn BH.
     */
    this.customerDropdown =
      this.findDropdownInput(
        /khách hàng/i,
      );

    this.warehouseDropdown =
      this.findDropdownInput(
        /kho hàng /i,
      );

    this.quotationEmployeeDropdown =
      this.findDropdownInput(
        /nhân viên\s*(bg|báo giá)/i,
      );

    this.salesEmployeeDropdown =
      this.findDropdownInput(
        /nhân viên\s*(bh|bán hàng|kd|kinh doanh)/i,
      );

    this.designerEmployeeDropdown =
      this.findDropdownInput(
        /nhân viên\s*thiết kế/i,
      );

    /*
     * Popup "Thông số chi tiết cho: ...".
     */
    const detailDialogByPrimeVue = page
      .locator(
        [
          '.p-dialog:visible',
          '.p-dialog-mask:visible .p-dialog',
          '[role="dialog"]:visible',
        ].join(', '),
      )
      .filter({
        hasText: /thông số chi tiết cho/i,
      })
      .first();

    const detailDialogByHeading = page
      .getByText(
        /thông số chi tiết cho/i,
      )
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

    this.itemDetailDialog =
      detailDialogByPrimeVue
        .or(detailDialogByHeading)
        .first();

    /*
     * Mã bản vẽ.
     */
    const drawingLabel =
      this.itemDetailDialog
        .locator('label')
        .filter({
          hasText: /mã bản vẽ/i,
        })
        .first();

    const drawingByLabel =
      drawingLabel.locator(
        'xpath=following::input[1]',
      );

    const drawingByText =
      this.itemDetailDialog
        .getByText(
          /mã bản vẽ/i,
        )
        .first()
        .locator(
          'xpath=following::input[1]',
        );

    this.drawingCodeInput =
      drawingByLabel
        .or(drawingByText)
        .first();

    /*
     * Dropdown Kính.
     */
    const glassLabel =
      this.itemDetailDialog
        .locator('label')
        .filter({
          hasText: /^kính$/i,
        })
        .first();

    const glassByLabel =
      glassLabel.locator(
        [
          'xpath=following::*[',
          'contains(@class,"p-select") or ',
          'contains(@class,"p-dropdown") or ',
          '@role="combobox"',
          '][1]',
        ].join(''),
      );

    const glassByText =
      this.itemDetailDialog
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

    this.glassDropdown =
      glassByLabel
        .or(glassByText)
        .first();

    this.generalInfoTab =
      this.itemDetailDialog
        .getByText(
          /^thông số chung$/i,
        )
        .first();

    this.attributeOptionsTab =
      this.itemDetailDialog
        .getByText(
          /^các lựa chọn thuộc tính$/i,
        )
        .first();

    this.updateButton = page
      .locator(
        [
          '.p-dialog:visible button',
          '[role="dialog"]:visible button',
          '.modal:visible button',
        ].join(', '),
      )
      .filter({
        hasText: /^\s*cập nhật\s*$/i,
      })
      .first();

    this.closeDetailButton = page
      .locator(
        '.p-dialog:visible button.p-button',
      )
      .filter({
        hasText: /^\s*đóng\s*$/i,
      })
      .last();
  }

  /**
   * ============================================================
   * FORM ĐƠN BÁN HÀNG
   * ============================================================
   */

  private findDropdownInput(
    labelPattern: RegExp,
  ): Locator {
    const byAccessibleLabel =
      this.page
        .getByLabel(labelPattern)
        .first();

    const byFormContainer =
      this.page
        .locator('label')
        .filter({
          hasText: labelPattern,
        })
        .first()
        .locator(
          [
            'xpath=ancestor::*[',
            'self::div or ',
            'self::td or ',
            'self::section',
            '][1]',
          ].join(''),
        )
        .locator(
          [
            '[role="combobox"]',
            'input',
            '.p-select',
            '.p-dropdown',
            '.p-autocomplete',
          ].join(', '),
        )
        .first();

    const byFollowingInput =
      this.page
        .getByText(labelPattern)
        .first()
        .locator(
          'xpath=following::input[1]',
        );

    const byFollowingCombobox =
      this.page
        .getByText(labelPattern)
        .first()
        .locator(
          'xpath=following::*[@role="combobox"][1]',
        );

    return byAccessibleLabel
      .or(byFormContainer)
      .or(byFollowingInput)
      .or(byFollowingCombobox)
      .first();
  }

  async verifyPageOpened(): Promise<void> {
    await expect(
      this.createButton,
    ).toBeVisible({
      timeout: 15_000,
    });
  }

  async openCreateForm(): Promise<void> {
    await expect(
      this.createButton,
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      this.createButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await this.createButton.click();

    await this.page.waitForURL(
      /sales-order-details|order-details/i,
      {
        timeout: 30_000,
      },
    );

    await expect(
      this.customerDropdown,
    ).toBeVisible({
      timeout: 20_000,
    });
  }

  async selectDropdownOption(
    dropdown: Locator,
    preferredText?: string,
  ): Promise<string> {
    await expect(
      dropdown,
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      dropdown,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await dropdown
      .scrollIntoViewIfNeeded();

    await this.closeExistingDropdown();

    await this.clickDropdownControl(
      dropdown,
    );

    const visibleOptions =
      this.getVisibleDropdownOptions();

    await expect(
      visibleOptions.first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    const selectedText =
      await this.selectOptionFromList(
        visibleOptions,
        preferredText,
      );

    await this.page.waitForTimeout(
      500,
    );

    return selectedText;
  }

  private getVisibleDropdownOptions(): Locator {
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

  private async closeExistingDropdown(): Promise<void> {
    const openedOption =
      this.getVisibleDropdownOptions()
        .first();

    if (
      await openedOption
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

  private async clickDropdownControl(
    dropdown: Locator,
  ): Promise<void> {
    const clickablePart =
      dropdown
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
      await clickablePart
        .isVisible()
        .catch(() => false)
    ) {
      await clickablePart.click({
        force: true,
      });

      return;
    }

    await dropdown.click({
      force: true,
    });
  }

  private async selectOptionFromList(
    options: Locator,
    preferredText?: string,
  ): Promise<string> {
    await expect(
      options.first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    let optionToSelect =
      options.first();

    const requestedText =
      preferredText?.trim() ?? '';

    if (requestedText) {
      const escapedText =
        this.escapeRegExp(
          requestedText,
        );

      const matchingOption =
        options
          .filter({
            hasText: new RegExp(
              escapedText,
              'i',
            ),
          })
          .first();

      if (
        await matchingOption
          .isVisible()
          .catch(() => false)
      ) {
        optionToSelect =
          matchingOption;
      }
    }

    const selectedText = (
      await optionToSelect.innerText()
    ).trim();

    await optionToSelect.click();

    return selectedText;
  }

  /**
   * ============================================================
   * CÁC DÒNG HTK
   * ============================================================
   */

  private getLineItemsTable(): Locator {
    return this.page
      .locator('table')
      .filter({
        hasText: /tên\s*htk/i,
      })
      .first();
  }

  private getLineItemRows(): Locator {
    return this.getLineItemsTable()
      .locator('tbody tr');
  }

  async addNewLineItem(): Promise<Locator> {
    const rows =
      this.getLineItemRows();

    const rowCountBefore =
      await rows.count();

    await expect(
      this.addButton,
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(
      this.addButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await this.addButton.click();

    await expect
      .poll(
        async () => rows.count(),
        {
          timeout: 20_000,
          message:
            'Không thấy dòng HTK mới sau khi bấm nút Thêm',
        },
      )
      .toBeGreaterThan(
        rowCountBefore,
      );

    const newRow = rows.last();

    await expect(
      newRow,
    ).toBeVisible({
      timeout: 15_000,
    });

    return newRow;
  }

  getInventoryDropdownInRow(
    row: Locator,
  ): Locator {
    const byValidationMessage =
      row
        .getByText(
          /tên\s*htk\s*bắt\s*buộc/i,
        )
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

    const byFirstControl =
      row
        .locator(
          [
            '.p-select',
            '.p-dropdown',
            '.p-autocomplete',
            '[role="combobox"]',
            'input',
          ].join(', '),
        )
        .first();

    return byValidationMessage
      .or(byFirstControl)
      .first();
  }

  async openInventoryDropdown(
    row: Locator,
  ): Promise<Locator> {
    const inventoryDropdown =
      this.getInventoryDropdownInRow(
        row,
      );

    await expect(
      inventoryDropdown,
    ).toBeVisible({
      timeout: 15_000,
    });

    await inventoryDropdown
      .scrollIntoViewIfNeeded();

    await this.closeExistingDropdown();

    await this.clickDropdownControl(
      inventoryDropdown,
    );

    await expect(
      this.getInventorySearchInput()
        .or(
          this.getVisibleDropdownOptions()
            .first(),
        )
        .first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    return inventoryDropdown;
  }

  private getInventorySearchInput(): Locator {
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
    const rows =
      this.getLineItemRows();

    await expect
      .poll(
        async () => rows.count(),
        {
          timeout: 15_000,
          message:
            'Không tìm thấy dòng HTK mới trong bảng',
        },
      )
      .toBeGreaterThan(0);

    const newestRow =
      rows.last();

    await expect(
      newestRow,
    ).toBeVisible({
      timeout: 15_000,
    });

    await newestRow
      .scrollIntoViewIfNeeded();

    return this.openInventoryDropdown(
      newestRow,
    );
  }

  async searchAndSelectInventory(
    inventoryCode: string,
  ): Promise<string> {
    const maxAttempts = 10;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt += 1
    ) {
      if (attempt > 0) {
        await this.openNewestInventoryDropdown();
      }

      const searchInput =
        this.getInventorySearchInput();

      if (
        await searchInput
          .isVisible()
          .catch(() => false)
      ) {
        await searchInput.fill(
          inventoryCode,
        );
      } else {
        await this.page.keyboard.type(
          inventoryCode,
          {
            delay: 60,
          },
        );
      }

      await this.page.waitForTimeout(
        800,
      );

      const options =
        this.getVisibleDropdownOptions();

      const escapedCode =
        this.escapeRegExp(
          inventoryCode,
        );

      const matchingOptions = options
        .filter({
          hasText: new RegExp(
            escapedCode,
            'i',
          ),
        });

      const optionCount =
        await matchingOptions.count();

      if (optionCount === 0) {
        throw new Error(
          `Không tìm thấy HTK chứa mã "${inventoryCode}".`,
        );
      }

      if (attempt >= optionCount) {
        throw new Error(
          [
            `Đã thử ${optionCount} HTK chứa mã "${inventoryCode}",`,
            'nhưng tất cả đều không có giá hoặc không mở được form thông số.',
          ].join(' '),
        );
      }

      const optionToSelect =
        matchingOptions.nth(attempt);

      await expect(
        optionToSelect,
      ).toBeVisible({
        timeout: 15_000,
      });

      const selectedText = (
        await optionToSelect.innerText()
      ).trim();

      await optionToSelect.click();

      await this.page.waitForTimeout(
        1_000,
      );

      if (
        await this.isMissingPriceDialog()
      ) {
        console.log(
          `Bỏ qua HTK chưa có giá: ${selectedText}`,
        );

        await this.closeMissingPriceDialog();

        await this.page.waitForTimeout(
          500,
        );

        continue;
      }

      const drawingInput =
        this.getVisibleDrawingCodeInput();

      if (
        await drawingInput
          .isVisible()
          .catch(() => false)
      ) {
        console.log(
          `HTK hợp lệ đã chọn: ${selectedText}`,
        );

        return selectedText;
      }

      throw new Error(
        [
          `Sau khi chọn HTK "${selectedText}",`,
          'không thấy popup thông số hợp lệ.',
        ].join(' '),
      );
    }

    throw new Error(
      `Không tìm được HTK hợp lệ cho mã "${inventoryCode}".`,
    );
  }

  /**
   * ============================================================
   * POPUP THÔNG SỐ
   * ============================================================
   */

  async fillDrawingCode(
    drawingCode: string,
  ): Promise<void> {
    const detailDialog =
      this.getVisibleItemDetailDialog();

    await expect(
      detailDialog,
    ).toBeVisible({
      timeout: 20_000,
    });

    if (
      await this.isMissingPriceDialog()
    ) {
      throw new Error(
        [
          'HTK đang chọn chưa có giá.',
          'Không thể nhập Mã bản vẽ.',
        ].join(' '),
      );
    }

    const drawingInput =
      this.getVisibleDrawingCodeInput();

    await expect(
      drawingInput,
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(
      drawingInput,
    ).toBeEditable({
      timeout: 15_000,
    });

    await drawingInput.click();
    await drawingInput.fill(
      drawingCode,
    );

    await expect(
      drawingInput,
    ).toHaveValue(
      drawingCode,
      {
        timeout: 10_000,
      },
    );
  }

  async selectGlass(
    glassSearchCode: string,
  ): Promise<string> {
    await expect(
      this.itemDetailDialog,
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(
      this.glassDropdown,
    ).toBeVisible({
      timeout: 20_000,
    });

    await this.closeExistingDropdown();

    const clickableGlassControl =
      this.glassDropdown
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

    if (
      await clickableGlassControl
        .isVisible()
        .catch(() => false)
    ) {
      await clickableGlassControl.click({
        force: true,
      });
    } else {
      await this.glassDropdown.click({
        force: true,
      });
    }

    const glassOptions =
      this.getVisibleGlassOptions();

    const glassSearchInput =
      this.getVisibleGlassSearchInput();

    await expect(
      glassSearchInput
        .or(glassOptions.first())
        .first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    if (
      await glassSearchInput
        .isVisible()
        .catch(() => false)
    ) {
      await glassSearchInput.click();
      await glassSearchInput.fill(
        glassSearchCode,
      );
    } else {
      await this.page.keyboard.type(
        glassSearchCode,
        {
          delay: 60,
        },
      );
    }

    await this.page.waitForTimeout(
      800,
    );

    const escapedCode =
      this.escapeRegExp(
        glassSearchCode,
      );

    const matchingGlass =
      glassOptions
        .filter({
          hasText: new RegExp(
            escapedCode,
            'i',
          ),
        })
        .first();

    await expect(
      matchingGlass,
    ).toBeVisible({
      timeout: 20_000,
    });

    const selectedText = (
      await matchingGlass.innerText()
    ).trim();

    await matchingGlass.click();

    await this.page.waitForTimeout(
      500,
    );

    return selectedText;
  }

  private getVisibleGlassSearchInput(): Locator {
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

  private getVisibleGlassOptions(): Locator {
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
    await expect(
      this.attributeOptionsTab,
    ).toBeVisible({
      timeout: 15_000,
    });

    await this.attributeOptionsTab
      .scrollIntoViewIfNeeded();

    await this.attributeOptionsTab.click();

    await this.page.waitForTimeout(
      1_200,
    );
  }

  async updateItemDetails(): Promise<void> {
    await expect(
      this.updateButton,
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(
      this.updateButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await this.updateButton.click();

    await this.page.waitForTimeout(
      1_000,
    );
  }

  async closeItemDetails(): Promise<void> {
    const visibleDialog =
      this.getVisibleItemDetailDialog();

    if (
      !(await visibleDialog
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }

    const footerCloseButton =
      visibleDialog
        .locator('button')
        .filter({
          hasText:
            /^\s*đóng\s*$/i,
        })
        .last();

    await expect(
      footerCloseButton,
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      footerCloseButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await footerCloseButton.click();

    await expect(
      visibleDialog,
    ).toBeHidden({
      timeout: 20_000,
    });

    await expect(
      this.addButton,
    ).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * ============================================================
   * LƯU / TRỞ LẠI
   * ============================================================
   */

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    await this.page.waitForTimeout(
      1_500,
    );
  }

  async save(): Promise<void> {
    await this.scrollToTop();

    await expect(
      this.saveButton,
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(
      this.saveButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await this.saveButton
      .scrollIntoViewIfNeeded();

    await this.saveButton.click();
  }

  async saveAndWaitForSuccess(): Promise<void> {
    await this.save();

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

  async backToList(): Promise<void> {
    await expect(
      this.backButton,
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      this.backButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await this.backButton.click();
  }

  async backToSalesOrderList(): Promise<void> {
    await this.backToList();

    await this.page.waitForURL(
      /sales-order-list|orders\/sales-order(?!-details)/i,
      {
        timeout: 30_000,
      },
    );
  }

  /**
   * ============================================================
   * HELPERS POPUP
   * ============================================================
   */

  private getVisibleItemDetailDialog(): Locator {
    return this.page
      .locator(
        [
          '.p-dialog:visible',
          '[role="dialog"]:visible',
          '.modal:visible',
        ].join(', '),
      )
      .filter({
        hasText: /thông số chi tiết cho/i,
      })
      .first();
  }

  private getMissingPriceMessage(): Locator {
    return this.getVisibleItemDetailDialog()
      .getByText(
        /chưa có giá/i,
      )
      .first();
  }

  private async isMissingPriceDialog(): Promise<boolean> {
    return this.getMissingPriceMessage()
      .isVisible()
      .catch(() => false);
  }

  private async closeMissingPriceDialog(): Promise<void> {
    const warningDialog =
      this.getVisibleItemDetailDialog();

    const closeButton =
      warningDialog
        .getByRole('button', {
          name: /đóng/i,
        })
        .last();

    await expect(
      closeButton,
    ).toBeVisible({
      timeout: 10_000,
    });

    await closeButton.click();

    await expect(
      warningDialog,
    ).toBeHidden({
      timeout: 10_000,
    });
  }

  private getVisibleDrawingCodeInput(): Locator {
    const detailDialog =
      this.getVisibleItemDetailDialog();

    const byLabel =
      detailDialog
        .getByLabel(/mã bản vẽ/i)
        .first();

    const byText =
      detailDialog
        .getByText(
          /mã bản vẽ/i,
        )
        .first()
        .locator(
          'xpath=following::input[1]',
        );

    const byLabelElement =
      detailDialog
        .locator('label')
        .filter({
          hasText: /mã bản vẽ/i,
        })
        .first()
        .locator(
          'xpath=following::input[1]',
        );

    return byLabel
      .or(byLabelElement)
      .or(byText)
      .first();
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