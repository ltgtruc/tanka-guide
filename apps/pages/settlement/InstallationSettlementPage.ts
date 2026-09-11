import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';
import { BasePage } from '../BasePage';

export class InstallationSettlementPage extends BasePage {
  readonly settlementListHeading: Locator;
  readonly settlementDetailHeading: Locator;

  readonly teamDropdown: Locator;
  readonly productionDropdown: Locator;
  readonly addProductionButton: Locator;

  readonly statusActionButton: Locator;
  readonly currentStatusValue: Locator;

  readonly settlementSaveButton: Locator;
  readonly settlementBackButton: Locator;

  constructor(page: Page) {
    super(page, { createButtonName: /tạo mới|create new/i });

    this.settlementListHeading = page.getByText(/^danh sách quyết toán lắp đặt$/i).first();
    this.settlementDetailHeading = page.getByText(/^chi tiết quyết toán lắp đặt/i).first();

    /*
     * "Đội lắp đặt *" có thẻ <label> thật, nhưng BasePage.findDropdownInput()
     * (thử getByLabel trước) có thể trả về phần tử không mở được overlay khi
     * click (đã gặp lỗi tương tự ở CustomerSettlementPage) — đi thẳng theo
     * "ancestor div rồi lấy combobox đầu tiên bên trong" cho ra đúng field.
     */
    const teamLabel = page.locator('label').filter({ hasText: /đội lắp đặt/i }).first();

    this.teamDropdown = teamLabel
      .locator('xpath=ancestor::*[self::div][1]')
      .locator('[role="combobox"], .p-select, .p-dropdown, input')
      .first();

    /*
     * "Chọn mã sản xuất" KHÔNG phải thẻ <label> (giống "Chọn sản xuất để
     * quyết toán" ở CustomerSettlementPage). Trước khi thêm dòng nào, trang
     * chỉ có đúng 2 combobox thật: Đội lắp đặt (đầu) và field này (cuối) —
     * bảng danh sách dòng chỉ hiển thị dữ liệu tĩnh, không sinh thêm
     * combobox — nên lấy theo vị trí "combobox cuối cùng" ổn định trong
     * suốt vòng đời trang.
     *
     * KHÔNG thêm '[role="combobox"]' vào selector này: PrimeVue Select gắn
     * role="combobox" lên <span class="p-select-label"> nằm BÊN TRONG
     * <div class="p-select">, nên '[role="combobox"], .p-select' khớp 2
     * phần tử lồng nhau cho cùng 1 field — .last() khi đó có thể trả về
     * cái <span> lá (không còn control con nào để clickDropdownControl()
     * tìm thấy), khiến việc mở dropdown không ổn định (đã tái hiện lỗi này
     * ở ProductionSettlementPage với cùng pattern). Chỉ lấy theo
     * '.p-select, .p-dropdown' (khung ngoài) để .last() luôn ổn định.
     */
    this.productionDropdown = page.locator('.p-select, .p-dropdown').last();

    this.addProductionButton = page.locator('button:visible').filter({ hasText: /^\s*thêm\s*$/i }).first();

    const statusField = page
      .locator('label')
      .filter({ hasText: /^trạng thái$/i })
      .first()
      .locator('xpath=ancestor::*[self::div or self::td or self::section][1]');

    const statusByText = page
      .getByText(/^trạng thái$/i)
      .first()
      .locator('xpath=ancestor::*[self::div or self::td or self::section][1]');

    const resolvedStatusField = statusField.or(statusByText).first();

    this.currentStatusValue = resolvedStatusField
      .locator(['input', '.p-inputtext', '.p-select-label', '.p-dropdown-label', '[role="combobox"]'].join(', '))
      .first();

    this.statusActionButton = resolvedStatusField.locator('button.dropdown-toggle:visible, button:visible').first();

    /*
     * Không dùng BasePage.saveButton/backButton (getByRole('button', {name}))
     * vì có thể có phần tử "Lưu"/"Trở lại" ẩn khác trong DOM khiến getByRole
     * khớp nhầm rồi bị timeout khi click — lọc theo button:visible + so
     * khớp text chính xác để chỉ lấy đúng nút đang hiển thị.
     */
    this.settlementSaveButton = page.locator('button:visible').filter({ hasText: /^\s*lưu\s*$/i }).first();
    this.settlementBackButton = page.locator('button:visible').filter({ hasText: /^\s*trở lại\s*$/i }).first();
  }

  async openSettlementList(): Promise<void> {
    const productionMenu = this.page
      .getByRole('link', { name: /^sản xuất$/i })
      .or(this.page.getByText(/^sản xuất$/i))
      .first();

    const alreadyVisible = await this.page
      .getByText(/^quyết toán lắp đặt$/i)
      .first()
      .isVisible()
      .catch(() => false);

    if (!alreadyVisible) {
      await expect(productionMenu).toBeVisible({ timeout: 15_000 });
      await productionMenu.click();
    }

    const settlementMenu = this.page
      .getByRole('link', { name: /^quyết toán lắp đặt$/i })
      .or(this.page.getByText(/^quyết toán lắp đặt$/i))
      .first();

    await expect(settlementMenu).toBeVisible({ timeout: 15_000 });

    await settlementMenu.click();

    await expect(this.settlementListHeading).toBeVisible({ timeout: 20_000 });
  }

  async openCreateForm(): Promise<void> {
    await super.openCreateForm();

    await this.page.waitForURL(/installation-settlement-details/i, { timeout: 30_000 });
    await expect(this.settlementDetailHeading).toBeVisible({ timeout: 20_000 });
    await expect(this.teamDropdown).toBeVisible({ timeout: 20_000 });
  }

  private getVisibleDropdownOptions(): Locator {
    return this.page.locator(
      [
        '.p-select-overlay:visible .p-select-option',
        '.p-dropdown-panel:visible .p-dropdown-item',
        '[role="listbox"]:visible [role="option"]',
        '[role="option"]:visible',
      ].join(', '),
    );
  }

  /*
   * scrollIntoViewIfNeeded() rồi click({force:true}) có thể đặt field ngay
   * khớp mép trên viewport (top: 0) — đúng lúc đó field lại nằm NGAY DƯỚI
   * thanh header cố định (position: fixed) của app, nên force click rơi
   * trúng header thay vì field và dropdown không mở (đã tái hiện lỗi này ở
   * ProductionSettlementPage bằng getBoundingClientRect: field đo được
   * top=0 nhưng ảnh chụp cho thấy nó bị header che khuất hoàn toàn).
   * click() thường (không force) tự cuộn và tự kiểm tra phần tử thực sự
   * nhận được sự kiện chuột trước khi bấm nên tránh được đúng lỗi này —
   * chỉ dùng force làm phương án dự phòng khi click thường thất bại thật
   * sự.
   */
  private async clickDropdownControl(dropdown: Locator): Promise<void> {
    const clickablePart = dropdown
      .locator(
        ['.p-select-label', '.p-select-dropdown', '.p-dropdown-label', '.p-dropdown-trigger', 'input', '[role="combobox"]'].join(
          ', ',
        ),
      )
      .first();

    if (await clickablePart.isVisible().catch(() => false)) {
      try {
        await clickablePart.click({ timeout: 5_000 });
      } catch {
        await clickablePart.click({ force: true });
      }
      return;
    }

    await dropdown.click({ force: true });
  }

  /** Chọn Đội lắp đặt theo tên, ví dụ "Xuân LD". Không truyền tên thì lấy đội đầu tiên. */
  async selectTeam(preferredTeam?: string): Promise<string> {
    await this.clickDropdownControl(this.teamDropdown);

    const options = this.getVisibleDropdownOptions();

    await expect(options.first()).toBeVisible({ timeout: 15_000 });

    let optionToSelect = options.first();

    if (preferredTeam?.trim()) {
      const matchingOption = options.filter({ hasText: new RegExp(escapeRegExp(preferredTeam.trim()), 'i') }).first();

      await expect(matchingOption).toBeVisible({ timeout: 15_000 });

      optionToSelect = matchingOption;
    }

    const selectedText = (await optionToSelect.innerText()).trim();

    await optionToSelect.click();
    await this.page.waitForTimeout(800);

    return selectedText;
  }

  /**
   * Chọn 1 mã sản xuất để quyết toán lắp đặt. Danh sách chỉ hiển thị các đề
   * nghị SX có dòng đã lắp đặt 100%, có ngày HTLĐ và HTVS theo đội đã chọn
   * — không truyền mã cụ thể thì lấy mã đầu tiên trong danh sách.
   */
  async selectProduction(preferredCode?: string): Promise<string> {
    await expect(this.productionDropdown).toBeVisible({ timeout: 15_000 });

    await this.clickDropdownControl(this.productionDropdown);

    const options = this.getVisibleDropdownOptions();

    await expect(options.first()).toBeVisible({ timeout: 15_000 });

    let optionToSelect = options.first();

    if (preferredCode?.trim()) {
      const matchingOption = options.filter({ hasText: new RegExp(escapeRegExp(preferredCode.trim()), 'i') }).first();

      await expect(matchingOption).toBeVisible({ timeout: 15_000 });

      optionToSelect = matchingOption;
    }

    const selectedText = (await optionToSelect.innerText()).trim();

    await optionToSelect.click();
    await this.page.waitForTimeout(800);

    return selectedText;
  }

  /** Bấm nút "Thêm" bên cạnh "Chọn mã sản xuất" để thêm dòng vào bảng. */
  async addSelectedProduction(): Promise<void> {
    await expect(this.addProductionButton).toBeVisible({ timeout: 15_000 });
    await expect(this.addProductionButton).toBeEnabled({ timeout: 15_000 });

    await this.addProductionButton.click();

    await this.page.waitForTimeout(800);
  }

  async saveSettlement(): Promise<void> {
    await expect(this.settlementSaveButton).toBeVisible({ timeout: 15_000 });
    await expect(this.settlementSaveButton).toBeEnabled({ timeout: 15_000 });

    await this.settlementSaveButton.scrollIntoViewIfNeeded();
    await this.settlementSaveButton.click();

    await this.expectSuccessMessage();

    await expect(this.currentStatusValue).toBeVisible({ timeout: 20_000 });
  }

  async backToList(): Promise<void> {
    await expect(this.settlementBackButton).toBeVisible({ timeout: 15_000 });
    await expect(this.settlementBackButton).toBeEnabled({ timeout: 15_000 });

    await this.settlementBackButton.click();

    await expect(this.settlementListHeading).toBeVisible({ timeout: 20_000 });
  }

  async changeStatus(targetStatus: string, note = ''): Promise<void> {
    await expect(this.statusActionButton).toBeVisible({ timeout: 15_000 });
    await expect(this.statusActionButton).toBeEnabled({ timeout: 15_000 });

    await this.statusActionButton.click();

    /*
     * Text của lựa chọn trạng thái có icon mũi tên đứng trước nên innerText
     * thực tế là " Đã gửi" (có khoảng trắng đầu) — nới lỏng bằng \s* hai
     * đầu để vẫn khớp chính xác cả cụm từ mà không bắt nhầm trạng thái
     * khác chứa cùng từ khoá.
     */
    const statusOption = this.page.getByText(new RegExp(`^\\s*${escapeRegExp(targetStatus)}\\s*$`, 'i')).last();

    await expect(statusOption).toBeVisible({ timeout: 15_000 });

    await statusOption.click();

    const transitionDialog = this.page
      .locator('.p-dialog:visible, [role="dialog"]:visible, .modal:visible')
      .filter({ hasText: /chuyển trạng thái sang/i })
      .first();

    await expect(transitionDialog).toBeVisible({ timeout: 20_000 });

    const noteInput = this.page.locator('textarea:visible').last();

    await expect(noteInput).toBeVisible({ timeout: 15_000 });
    await expect(noteInput).toBeEditable({ timeout: 15_000 });

    await noteInput.click();
    await noteInput.fill(note);

    await expect(noteInput).toHaveValue(note, { timeout: 10_000 });

    const updateButton = this.page.locator('button:visible').filter({ hasText: /^\s*Cập nhật\s*$/i }).last();

    await expect(updateButton).toBeVisible({ timeout: 15_000 });
    await expect(updateButton).toBeEnabled({ timeout: 15_000 });

    await updateButton.click();

    const confirmDialog = this.page
      .locator('.p-dialog:visible, [role="dialog"]:visible, .modal:visible')
      .filter({ hasText: /xác nhận|bạn có chắc chắn/i })
      .last();

    await expect(confirmDialog).toBeVisible({ timeout: 15_000 });

    const agreeButton = confirmDialog.getByRole('button', { name: /đồng ý|xác nhận|yes/i }).last();

    await expect(agreeButton).toBeEnabled({ timeout: 15_000 });

    await agreeButton.click();

    await expect(confirmDialog).toBeHidden({ timeout: 20_000 });

    await this.expectSuccessMessage();
  }

  async expectCurrentStatus(expectedStatus: string): Promise<void> {
    const expected = new RegExp(escapeRegExp(expectedStatus), 'i');

    await expect
      .poll(
        async () => {
          const value = await this.currentStatusValue.inputValue().catch(() => '');
          const text = await this.currentStatusValue.innerText().catch(() => '');

          return `${value} ${text}`;
        },
        { timeout: 20_000, message: `Trạng thái chưa chuyển thành "${expectedStatus}"` },
      )
      .toMatch(expected);
  }

  private async expectSuccessMessage(): Promise<void> {
    const successMessage = this.page.getByText(/lưu thành công|thành công/i).first();

    await expect(successMessage).toBeVisible({ timeout: 20_000 });
  }
}
