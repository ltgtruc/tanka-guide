

import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class QuotationPage {
  readonly page: Page;

  /*
   * Các nút chính.
   */
  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly addButton: Locator;

  /*
   * Các dropdown thông tin bắt buộc ở bước 5.
   */
  readonly customerDropdown: Locator;
  readonly warehouseDropdown: Locator;
  readonly quotationEmployeeDropdown: Locator;
  readonly salesEmployeeDropdown: Locator;
  readonly designerEmployeeDropdown: Locator;

  /*
   * Thành phần của dòng HTK ở bước 6.
   */
  readonly itemDetailDialog: Locator;
  readonly drawingCodeInput: Locator;
  readonly glassDropdown: Locator;

  readonly generalInfoTab: Locator;
  readonly attributeOptionsTab: Locator;

  readonly updateButton: Locator;
  readonly closeDetailButton: Locator;

  constructor(page: Page) {
    this.page = page;

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
 * Chỉ lấy nút Thêm đang hiển thị.
 *
 * Không dùng .last() vì trang có thể chứa
 * một nút Thêm khác đang ẩn trong component.
 */
    this.addButton = page
      .getByRole('button', {
        name: /thêm |add/i,
      })
      .first();
    /*
     * Giữ nguyên cách tìm dropdown của bước 5.
     */
    /*
 * Nút Thêm dòng hàng nằm ở bên phải khu vực
 * các tab phía trên bảng Các dòng.
 */
    const addButtonByRole = page
      .getByRole('button', {
        name: /thêm|add/i,
      });

    const addButtonByElement = page
      .locator(
        [
          'button:visible',
          'a:visible',
          '[role="button"]:visible',
          '[aria-label*="Thêm"]:visible',
          '[title*="Thêm"]:visible',
        ].join(', '),
      )
      .filter({
        hasText: /thêm/i,
      });

    const addButtonByText = page
      .getByText(
        /^\s*thêm\s*$/i,
      )
      .locator(
        'xpath=ancestor-or-self::*[self::button or self::a or @role="button"][1]',
      );

    /*
 * Nút Thêm dòng HTK đang hiển thị.
 *
 * Giao diện sử dụng PrimeNG p-button.
 * :visible loại bỏ các button ẩn trong DOM.
 */
    this.addButton = page
      .locator('button.p-button:visible')
      .filter({
        hasText: /^\s*Thêm\s*$/i,
      })
      .first();

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
        /nhân viên\s*(kd|kinh doanh)/i,
      );

    this.designerEmployeeDropdown =
      this.findDropdownInput(
        /nhân viên\s*thiết kế/i,
      );

    /*
     * Popup "Thông số chi tiết cho: ..."
     *
     * Ưu tiên role dialog. Nếu giao diện không khai báo
     * role dialog thì fallback về container có nội dung
     * "Thông số chi tiết cho".
     */
    const dialogByRole = page
      .getByRole('dialog')
      .filter({
        hasText: /thông số chi tiết cho/i,
      })
      .first();

    const dialogByText = page
      .getByText(
        /thông số chi tiết cho/i,
      )
      .first()
      .locator(
        [
          'xpath=ancestor::*[',
          'contains(@class,"modal") or ',
          'contains(@class,"dialog") or ',
          'contains(@class,"p-dialog")',
          '][1]',
        ].join(''),
      );

    // this.itemDetailDialog = dialogByRole
    //   .or(dialogByText)
    //   .first();

    // /*
    //  * Ô Mã bản vẽ trong popup.
    //  */
    // this.drawingCodeInput =
    //   this.findInputInsideDialog(
    //     /mã bản vẽ/i,
    //   );

    // /*
    //  * Dropdown Kính trong popup.
    //  */
    // this.glassDropdown =
    //   this.findDropdownInsideDialog(
    //     /^kính$/i,
    //   );
    /*
     * Popup Thông số chi tiết.
     *
     * Giao diện trong video là PrimeVue dialog.
     * Không phụ thuộc hoàn toàn vào role="dialog".
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
     * Input Mã bản vẽ.
     *
     * Trong video, input nằm ngay bên dưới nhãn
     * "Mã bản vẽ *".
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
          /^mã bản vẽ\s*\*?$/i,
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
     *
     * PrimeVue phiên bản mới có thể dùng class:
     * - p-select
     * - p-dropdown
     * - role="combobox"
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

    this.glassDropdown =
      glassByLabel
        .or(glassByText)
        .first();
    /*
     * Hai tab trong popup.
     */
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

    /*
     * Nút Cập nhật và Đóng trong popup.
     */
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

    /*
 * Nút Đóng có chữ hiển thị ở cuối popup.
 *
 * Không chọn nút X hoặc nút phóng to trên header.
 */
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
   * PHẦN DÙNG CHO BƯỚC 1–5
   * ============================================================
   */

  /**
   * Tìm ô input hoặc dropdown theo nhãn.
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

  /**
   * Kiểm tra trang danh sách Báo giá đã mở.
   */
  async verifyPageOpened(): Promise<void> {
    await expect(
      this.createButton,
    ).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Mở màn hình tạo Báo giá.
   */
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
      /sales-quote-details|quote-details/i,
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

  /**
   * Click dropdown, mở danh sách và click trực tiếp
   * một dòng trong danh sách.
   *
   * Hàm này tiếp tục được dùng cho bước 5.
   */
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

    await dropdown.scrollIntoViewIfNeeded();

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

  /**
   * Danh sách option chung cho dropdown bước 5,
   * dropdown Tên HTK và dropdown Kính.
   */
  private getVisibleDropdownOptions(): Locator {
    return this.page.locator(
      [
        /*
         * Accessibility chuẩn.
         */
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',

        /*
         * PrimeNG.
         */
        '.p-dropdown-panel:visible .p-dropdown-item',
        '.p-autocomplete-panel:visible .p-autocomplete-item',
        '.p-overlay:visible [role="option"]',

        /*
         * Angular ng-select.
         */
        '.ng-dropdown-panel:visible .ng-option',
        '.ng-option:visible',

        /*
         * Angular Material.
         */
        '.mat-mdc-select-panel:visible mat-option',
        '.mat-select-panel:visible mat-option',
        'mat-option:visible',

        /*
         * Ant Design.
         */
        '.ant-select-dropdown:visible .ant-select-item-option',

        /*
         * Bootstrap hoặc component tùy chỉnh.
         */
        '.dropdown-menu.show .dropdown-item',
        '.dropdown-menu:visible .dropdown-item',
        '.autocomplete-menu:visible > *',
        '.suggestion-list:visible > *',

        /*
         * Danh sách dạng ul/li.
         */
        'ul[role="listbox"]:visible li',
      ].join(', '),
    );
  }

  /**
   * Đóng dropdown đang mở.
   */
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

  /**
   * Click đúng phần nhận thao tác của dropdown.
   */
  private async clickDropdownControl(
    dropdown: Locator,
  ): Promise<void> {
    const clickablePart =
      dropdown
        .locator(
          [
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

  /**
   * Chọn option theo nội dung.
   *
   * Nếu preferredText rỗng hoặc không tồn tại,
   * chọn option đầu tiên.
   */
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
   * PHẦN MỚI DÙNG CHO BƯỚC 6
   * ============================================================
   */

  /**
   * Tìm bảng chứa cột Tên HTK.
   */
  private getLineItemsTable(): Locator {
    return this.page
      .locator('table')
      .filter({
        hasText: /tên\s*htk/i,
      })
      .first();
  }

  /**
   * Lấy các dòng dữ liệu bên trong bảng HTK.
   */
  private getLineItemRows(): Locator {
    return this.getLineItemsTable()
      .locator('tbody tr');
  }

  /**
 * Bấm nút Thêm đang hiển thị để tạo dòng HTK mới.
 */
  async clickAddButton(): Promise<void> {
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

    await this.addButton
      .scrollIntoViewIfNeeded();

    try {
      await this.addButton.click({
        timeout: 10_000,
      });
    } catch {
      await this.addButton.click({
        force: true,
      });
    }
  }

  /**
 * Bấm nút Thêm và chờ một dòng mới xuất hiện.
 *
 * Trả về locator của dòng vừa được thêm.
 */
  /**
 * Bấm nút Thêm để tạo một dòng HTK mới.
 */
  /**
 * Bấm nút Thêm và chờ dòng HTK mới xuất hiện.
 */
  async addNewLineItem(): Promise<Locator> {
    const lineItemsTable = this.page
      .locator('table')
      .filter({
        hasText: /tên\s*htk/i,
      })
      .first();

    const rows = lineItemsTable.locator(
      'tbody tr',
    );

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

    /*
     * Không gọi scrollIntoViewIfNeeded().
     * Nút Thêm đã xuất hiện sẵn trên màn hình.
     */
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

  /**
   * Tìm dropdown Tên HTK trong một dòng.
   *
   * Tên HTK là control đầu tiên có thể chọn
   * trong dòng mới.
   */
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
            'contains(@class,"p-dropdown") or ',
            'contains(@class,"p-autocomplete")',
            '][1]',
          ].join(''),
        );

    const byFirstControl =
      row
        .locator(
          [
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

  /**
   * Mở dropdown Tên HTK trong dòng mới.
   */
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

    /*
     * Sau khi click, danh sách hoặc ô search
     * phải xuất hiện.
     */
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

  /**
   * Lấy ô search đang hiển thị trong dropdown Tên HTK.
   */
  private getInventorySearchInput(): Locator {
    return this.page
      .locator(
        [
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

  /**
   * Gõ mã DQ-01-TDA và click dòng kết quả.
   */
  /**
 * Mở dropdown Tên HTK của dòng mới nhất.
 *
 * Hàm này được gọi sau khi test đã bấm nút Thêm
 * và dòng mới đã xuất hiện trong bảng.
 */
  async openNewestInventoryDropdown(): Promise<Locator> {
    const rows =
      this.getLineItemRows();

    /*
     * Đảm bảo bảng đã có ít nhất một dòng dữ liệu.
     */
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

    /*
     * Dòng được thêm mới luôn là dòng cuối cùng.
     */
    const newestRow =
      rows.last();

    await expect(
      newestRow,
    ).toBeVisible({
      timeout: 15_000,
    });

    await newestRow
      .scrollIntoViewIfNeeded();

    /*
     * Dùng lại hàm mở dropdown theo dòng
     * đã có trong QuotationPage.
     */
    return this.openInventoryDropdown(
      newestRow,
    );
  }
  /**
 * Tìm HTK theo mã và chọn một dòng có thể cấu hình.
 *
 * Nếu một dòng mở popup "Chưa có giá":
 * - đóng popup;
 * - mở lại dropdown;
 * - thử dòng kết quả tiếp theo.
 */
  async searchAndSelectInventory(
    inventoryCode: string,
  ): Promise<string> {
    const maxAttempts = 10;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt += 1
    ) {
      /*
       * Từ lần thử thứ hai trở đi,
       * mở lại dropdown của dòng mới nhất.
       */
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

      /*
       * Khi dropdown mở lại, thử dòng theo index attempt.
       * Nếu số kết quả ít hơn số lần thử thì dừng.
       */
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

      /*
       * Chờ popup phản hồi sau khi chọn HTK.
       */
      await this.page.waitForTimeout(
        1_000,
      );

      /*
       * Trường hợp HTK không có giá.
       */
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

      /*
       * Chỉ xem là thành công khi popup có
       * input Mã bản vẽ.
       */
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
          'popup không có cảnh báo "Chưa có giá"',
          'nhưng cũng không tìm thấy trường Mã bản vẽ.',
        ].join(' '),
      );
    }

    throw new Error(
      `Không tìm được HTK hợp lệ cho mã "${inventoryCode}".`,
    );
  }

  /**
   * Tìm dropdown bên trong popup theo nhãn.
   */
  private findDropdownInsideDialog(
    labelPattern: RegExp,
  ): Locator {
    const byLabel =
      this.itemDetailDialog
        .getByLabel(labelPattern)
        .first();

    const byContainer =
      this.itemDetailDialog
        .locator('label')
        .filter({
          hasText: labelPattern,
        })
        .first()
        .locator(
          [
            'xpath=ancestor::*[',
            'self::div or ',
            'self::td',
            '][1]',
          ].join(''),
        )
        .locator(
          [
            '.p-dropdown',
            '.p-autocomplete',
            '[role="combobox"]',
            'input',
          ].join(', '),
        )
        .first();

    const byFollowing =
      this.itemDetailDialog
        .getByText(labelPattern)
        .first()
        .locator(
          [
            'xpath=following::*[',
            '@role="combobox" or ',
            'self::input or ',
            'contains(@class,"p-dropdown") or ',
            'contains(@class,"p-autocomplete")',
            '][1]',
          ].join(''),
        );

    return byLabel
      .or(byContainer)
      .or(byFollowing)
      .first();
  }

  /**
   * Nhập Mã bản vẽ.
   */
  /**
 * Nhập D1 vào ô Mã bản vẽ.
 */
  /**
 * Nhập D1 vào trường Mã bản vẽ
 * trong popup thông số hợp lệ.
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

    /*
     * Không được tiếp tục nếu popup hiện tại
     * vẫn là cảnh báo chưa có giá.
     */
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

  /**
 * Chọn Kính theo đúng thao tác trong video:
 *
 * 1. Click ô Kính.
 * 2. Nhập mã 08-CL-KD-VFG.
 * 3. Chờ dòng kết quả xuất hiện.
 * 4. Click dòng:
 *    08-CL-KD-VFG - Kính đơn 8 mm trong (VFG).
 */
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

    /*
     * Click dropdown Kính.
     */
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

    /*
     * Chờ dropdown Kính mở.
     */
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

    /*
     * Nhập mã tìm kiếm: 08-CL-KD-VFG.
     */
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
      /*
       * Một số dropdown dùng chính control đang focus
       * làm ô tìm kiếm.
       */
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

    /*
     * Tìm đúng dòng kết quả theo mã.
     */
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

    /*
     * Click trực tiếp vào dòng kết quả.
     */
    await matchingGlass.click();

    /*
     * Chờ dropdown đóng.
     */
    await expect(
      matchingGlass,
    )
      .toBeHidden({
        timeout: 10_000,
      })
      .catch(() => {
        /*
         * Một số PrimeVue component giữ option
         * trong DOM nhưng overlay đã đóng.
         */
      });

    await this.page.waitForTimeout(
      500,
    );

    return selectedText;
  }

  /**
 * Lấy ô tìm kiếm đang hiển thị trong dropdown Kính.
 */
  private getVisibleGlassSearchInput(): Locator {
    return this.page
      .locator(
        [
          /*
           * PrimeVue Select mới.
           */
          '.p-select-overlay:visible input',
          '.p-select-list-container:visible input',
          '.p-select-filter-container:visible input',
          '.p-select-overlay:visible .p-inputtext',

          /*
           * PrimeNG/PrimeVue Dropdown cũ.
           */
          '.p-dropdown-panel:visible input',
          '.p-dropdown-filter-container:visible input',

          /*
           * Overlay chung.
           */
          '.p-overlay:visible input',
          '[role="listbox"]:visible input',

          /*
           * Fallback theo placeholder.
           */
          'input[placeholder*="Tìm"]:visible',
          'input[placeholder*="tìm"]:visible',
          'input[placeholder*="Search"]:visible',
          'input[placeholder*="search"]:visible',
        ].join(', '),
      )
      .first();
  }
  /**
 * Lấy các dòng Kính đang hiển thị trong dropdown.
 */
  private getVisibleGlassOptions(): Locator {
    return this.page.locator(
      [
        /*
         * PrimeVue Select mới.
         */
        '.p-select-overlay:visible .p-select-option',
        '.p-select-list:visible .p-select-option',

        /*
         * PrimeNG/PrimeVue Dropdown cũ.
         */
        '.p-dropdown-panel:visible .p-dropdown-item',

        /*
         * Accessibility.
         */
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',

        /*
         * Các component khác.
         */
        '.ng-dropdown-panel:visible .ng-option',
        '.dropdown-menu.show .dropdown-item',
      ].join(', '),
    );
  }
  /**
   * Mở tab Các lựa chọn thuộc tính để xem.
   */
  async openAttributeOptionsTab(): Promise<void> {
    await expect(
      this.attributeOptionsTab,
    ).toBeVisible({
      timeout: 15_000,
    });

    await this.attributeOptionsTab.click();

    await this.page.waitForTimeout(
      1_200,
    );
  }

  // /**
  //  * Quay lại tab Thông số chung trước khi cập nhật.
  //  */
  // async openGeneralInfoTab(): Promise<void> {
  //   await expect(
  //     this.generalInfoTab,
  //   ).toBeVisible({
  //     timeout: 15_000,
  //   });

  //   await this.generalInfoTab.click();

  //   await this.page.waitForTimeout(
  //     500,
  //   );
  // }

  /**
   * Bấm Cập nhật thông số chi tiết.
   */
  /**
 * Bấm Cập nhật sau khi xem tab
 * Các lựa chọn thuộc tính.
 */
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

  /**
 * Bấm đúng nút Đóng ở footer của popup,
 * sau đó trở lại màn hình Chi tiết báo giá.
 */
  async closeItemDetails(): Promise<void> {
    const visibleDialog = this.page
      .locator(
        '.p-dialog:visible',
      )
      .filter({
        hasText: /thông số chi tiết cho/i,
      })
      .first();

    /*
     * Nếu popup đã tự đóng sau Cập nhật,
     * không cần thao tác thêm.
     */
    if (
      !(await visibleDialog
        .isVisible()
        .catch(() => false))
    ) {
      return;
    }

    /*
     * Chỉ tìm button có text chính xác "Đóng".
     * Không lấy nút icon trên header.
     */
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

    /*
     * Ghi log để kiểm tra đúng button.
     */
    console.log(
      'Nút đóng popup:',
      (
        await footerCloseButton
          .innerText()
      ).trim(),
    );

    await footerCloseButton.click();

    /*
     * PrimeVue có animation đóng dialog,
     * chờ overlay hoặc dialog biến mất.
     */
    await expect(
      visibleDialog,
    ).toBeHidden({
      timeout: 20_000,
    });

    /*
     * Xác nhận đã trở lại màn hình
     * Chi tiết báo giá.
     */
    await expect(
      this.addButton,
    ).toBeVisible({
      timeout: 15_000,
    });
  }



  /**
   * ============================================================
   * LƯU VÀ TRỞ LẠI
   * ============================================================
   */

  /**
   * Lưu Báo giá.
   *
   * Giữ hàm save() để tương thích code cũ.
   */
  async save(): Promise<void> {
    await expect(
      this.saveButton,
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      this.saveButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    await this.saveButton.click();
  }

  /**
   * Lưu và chờ thông báo thành công.
   */
  async saveAndWaitForSuccess(): Promise<void> {
    await this.saveButton
      .scrollIntoViewIfNeeded();

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

  /**
   * Trở lại danh sách.
   *
   * Giữ hàm backToList() để tương thích code cũ.
   */
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

  /**
   * Trở lại và chờ trang danh sách xuất hiện.
   */
  async backToQuotationList(): Promise<void> {
    await this.backToList();

    await this.page.waitForURL(
      /sales-quote-list|sales-order-list/i,
      {
        timeout: 30_000,
      },
    );
  }

  /**
   * Escape nội dung để dùng an toàn trong RegExp.
   */
  private escapeRegExp(
    value: string,
  ): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
  }
  /**
 * Mở tab Các lựa chọn thuộc tính để xem.
 *
 * Sau khi xem xong, giữ nguyên tab hiện tại
 * và tiếp tục bấm nút Cập nhật.
 */
  async reviewAttributeOptions(): Promise<void> {
    await expect(
      this.attributeOptionsTab,
    ).toBeVisible({
      timeout: 15_000,
    });

    await this.attributeOptionsTab
      .scrollIntoViewIfNeeded();

    await this.attributeOptionsTab.click();

    /*
     * Giữ nội dung tab hiển thị đủ lâu
     * để video ghi lại.
     */
    await this.page.waitForTimeout(
      1_200,
    );

    /*
     * Không quay lại generalInfoTab.
     * Bước tiếp theo sẽ bấm Cập nhật trực tiếp.
     */
  }
  /**
 * Trả về đúng nút Thêm dòng hàng đang hiển thị.
 *
 * Nút nằm ở bên phải khu vực tab phía trên bảng Các dòng.
 */
  private getVisibleAddButton(): Locator {
    /*
     * Cách 1:
     * tìm button hoặc a đang hiển thị và có text Thêm.
     */
    const visibleButton = this.page
      .locator(
        [
          'button:visible',
          'a:visible',
          '[role="button"]:visible',
        ].join(', '),
      )
      .filter({
        hasText: /^\s*thêm\s*$/i,
      })
      .last();

    /*
     * Cách 2:
     * tìm text Thêm rồi lấy ancestor có thể click.
     */
    const buttonFromText = this.page
      .getByText(
        /^\s*thêm\s*$/i,
      )
      .last()
      .locator(
        'xpath=ancestor-or-self::*[self::button or self::a or @role="button"][1]',
      );

    return visibleButton
      .or(buttonFromText)
      .first();
  }
  /**
 * Bấm nút Thêm để tạo một dòng HTK mới.
 */
  async clickAddLineButton(): Promise<void> {
    const addButton =
      this.getVisibleAddButton();

    await expect(
      addButton,
    ).toBeVisible({
      timeout: 20_000,
    });

    await addButton
      .scrollIntoViewIfNeeded();

    await expect(
      addButton,
    ).toBeEnabled({
      timeout: 15_000,
    });

    /*
     * Click thông thường trước.
     */
    try {
      await addButton.click({
        timeout: 10_000,
      });
    } catch {
      /*
       * Nếu icon hoặc lớp giao diện che nút,
       * dùng force click.
       */
      await addButton.click({
        force: true,
      });
    }
  }
  /**
 * Popup Thông số chi tiết đang hiển thị.
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

  /**
   * Nội dung cảnh báo HTK chưa có giá.
   */
  private getMissingPriceMessage(): Locator {
    return this.getVisibleItemDetailDialog()
      .getByText(
        /chưa có giá/i,
      )
      .first();
  }

  /**
   * Kiểm tra popup hiện tại có phải cảnh báo
   * "Chưa có giá" hay không.
   */
  private async isMissingPriceDialog(): Promise<boolean> {
    return this.getMissingPriceMessage()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Đóng popup cảnh báo chưa có giá.
   */
  private async closeMissingPriceDialog(): Promise<void> {
    const warningDialog =
      this.getVisibleItemDetailDialog();

    const closeButton = warningDialog
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

  /**
   * Tìm input Mã bản vẽ trong popup hợp lệ.
   *
   * Locator được tạo tại thời điểm sử dụng,
   * tránh nhầm với popup cảnh báo chưa có giá.
   */
  private getVisibleDrawingCodeInput(): Locator {
    const detailDialog =
      this.getVisibleItemDetailDialog();

    const byLabel = detailDialog
      .getByLabel(/mã bản vẽ/i)
      .first();

    const byText = detailDialog
      .getByText(
        /mã bản vẽ/i,
      )
      .first()
      .locator(
        'xpath=following::input[1]',
      );

    const byLabelElement = detailDialog
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
}