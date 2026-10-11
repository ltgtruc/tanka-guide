import { expect, Locator, Page } from '@playwright/test';

import { escapeRegExp } from '../../helpers/text.helper';

/**
 * Giám sát tiến độ SX (/work-orders/production-supervision).
 * Đã kiểm tra DOM thực tế: bảng 2 dòng header (nhóm + cột), mỗi ô sửa được
 * là `div.editable-cell`; bấm vào thì hiện select (đội) hoặc datepicker có
 * nút `button.p-datepicker-dropdown`. Chọn xong app tự lưu
 * (mutation updateProductionLine), không có nút Lưu.
 * Thanh công cụ: "Kế hoạch GH&LĐ" (dialog "Theo ngày": Ngày kế hoạch + Xuất
 * Excel), "Cột" (dialog "Hiển thị / ẩn cột", checkbox theo nhóm + "Hiện tất
 * cả"), "100%" (thu phóng). Bộ lọc: Mã BH, ĐNSX, Từ/Đến ngày, Chi nhánh,
 * Trạng thái + nút "Tìm kiếm".
 */
export class ProductionSupervisionPage {
  readonly page: Page;

  readonly productionMenu: Locator;
  readonly supervisionMenu: Locator;
  readonly heading: Locator;
  readonly table: Locator;
  readonly planButton: Locator;
  readonly columnsButton: Locator;
  readonly searchButton: Locator;
  readonly dialog: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productionMenu = page.getByRole('link', { name: /^\W*sản xuất\W*$/i }).first();
    this.supervisionMenu = page.locator('a[href="/work-orders/production-supervision"]');
    this.heading = page.getByText(/^\s*giám sát tiến độ sx\s*$/i).first();
    this.table = page.locator('main table').first();
    this.planButton = page.locator('main').getByRole('button', { name: /kế hoạch gh/i });
    this.columnsButton = page.locator('main').getByRole('button', { name: /^\W*cột\W*$/i });
    this.searchButton = page.locator('main').getByRole('button', { name: /tìm kiếm/i });
    this.dialog = page.locator('.p-dialog:visible');
  }

  async open(): Promise<void> {
    if (!(await this.supervisionMenu.isVisible().catch(() => false))) {
      await expect(this.productionMenu).toBeVisible({ timeout: 15_000 });
      await this.productionMenu.click();
    }

    await expect(this.supervisionMenu).toBeVisible({ timeout: 15_000 });
    await this.supervisionMenu.click();

    await expect(this.heading).toBeVisible({ timeout: 20_000 });
    await expect(this.page.locator('main table tbody tr').first()).toBeVisible({ timeout: 20_000 });
  }

  filterDropdown(label: RegExp): Locator {
    return this.page
      .locator('main .c-component')
      .filter({ has: this.page.locator('label', { hasText: label }) })
      .locator('.p-select, .p-multiselect')
      .first();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.filterDropdown(/trạng thái/i).click();

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(status)}\\s*$`, 'i') })
      .first();

    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
    await this.page.keyboard.press('Escape');
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Checkbox nhóm cột (chữ đậm) trong dialog "Hiển thị / ẩn cột". */
  columnGroupCheckbox(group: string): Locator {
    return this.dialog
      .locator('.d-flex.align-items-center')
      .filter({ has: this.page.locator('strong', { hasText: new RegExp(`^\\s*${escapeRegExp(group)}\\s*$`) }) })
      .locator('.p-checkbox')
      .first();
  }

  private row(productionCode: string): Locator {
    return this.page.locator('main table tbody tr').filter({ hasText: productionCode }).first();
  }

  /** Ô của dòng lệnh SX ở cột có header bắt đầu bằng `columnName` (vd. "Đội LĐ"). */
  async cell(productionCode: string, columnName: string): Promise<Locator> {
    const headers = (await this.page.locator('main table thead tr').nth(1).locator('th').allInnerTexts()).map((text) =>
      text.trim().replace(/\s+/g, ' '),
    );
    const columnIndex = headers.findIndex((header) => header.startsWith(columnName));

    if (columnIndex < 0) {
      throw new Error(`Không tìm thấy cột "${columnName}" trên màn hình Giám sát tiến độ SX.`);
    }

    const cell = this.row(productionCode).locator('td').nth(columnIndex);

    await expect(cell).toBeVisible({ timeout: 15_000 });
    await cell.scrollIntoViewIfNeeded();

    return cell;
  }

  async selectTeam(productionCode: string, columnName: string, team: string): Promise<void> {
    const cell = await this.cell(productionCode, columnName);

    await cell.click();

    const dropdown = cell.locator('[role="combobox"]').first();

    await expect(dropdown).toBeVisible({ timeout: 10_000 });
    await dropdown.click();

    const option = this.page
      .locator('[role="option"]:visible')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(team)}\\s*$`, 'i') })
      .first();

    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();

    await expect(cell).toContainText(team, { timeout: 15_000 });
  }

  async selectDate(productionCode: string, columnName: string, date: Date): Promise<void> {
    const cell = await this.cell(productionCode, columnName);

    await cell.click();
    await cell.locator('button.p-datepicker-dropdown').click();

    const panel = this.page.locator('.p-datepicker-panel:visible').first();

    await expect(panel).toBeVisible({ timeout: 10_000 });
    await panel
      .locator('td:not(.p-datepicker-other-month) > span')
      .filter({ hasText: new RegExp(`^${date.getDate()}$`) })
      .first()
      .click();

    const expected = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    await expect(cell).toContainText(expected, { timeout: 15_000 });
  }
}
