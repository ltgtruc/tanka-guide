import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';

export class ProductionListPage extends BasePage {
  readonly siteDropdown: Locator;
  readonly descriptionInput: Locator;

  readonly chooseSalesOrderButton: Locator;

  readonly salesOrderCheckbox: Locator;
  readonly popupSelectButton: Locator;
  readonly salesOrderDialog: Locator;

  constructor(page: Page) {
    super(page);

    // Form "Chi tiết SX" hiện tại: Diễn giải, Ngày tạo SX *, Chi nhánh *.
    this.siteDropdown = this.formDropdown(/^\s*chi nhánh\s*\*?\s*$/i);
    this.descriptionInput = this.formInput(/^\s*diễn giải\s*$/i);
    this.chooseSalesOrderButton = page.getByRole('button', { name: /chọn các đơn bh/i });
    this.salesOrderCheckbox = page.locator('input[type="checkbox"]').nth(1);
    this.salesOrderDialog = page.getByRole('dialog', { name: /chọn các dòng đơn bh/i });
    // Accessible name có ký tự icon font phía trước (" Chọn") nên không neo ^.
    this.popupSelectButton = page
      .getByRole('dialog', { name: /chọn các dòng đơn bh/i })
      .getByRole('button', { name: /chọn\s*$/i });
  }

  /**
   * Checkbox ở dòng tiêu đề nhóm của đơn BH mới nhất trong popup "Chọn các
   * dòng đơn BH để SX" (dòng nhóm có dạng "#1 - BH_202610_0001, Khách hàng...";
   * tích dòng nhóm là chọn tất cả dòng của đơn BH đó). Chỉ chọn một đơn BH
   * để lệnh SX không giữ vật tư của các đơn khác.
   */
  async newestSalesOrderGroupCheckbox(): Promise<{ salesOrderCode: string; checkbox: Locator }> {
    const groupRows = this.salesOrderDialog.locator('tbody tr').filter({ hasText: /#\d+\s*-\s*BH/ });

    await expect(groupRows.first(), 'Không còn đơn BH nào có dòng chờ sản xuất').toBeVisible({ timeout: 15_000 });

    const codes = (await groupRows.allInnerTexts()).map(
      (text) => text.replace(/\s+/g, '').match(/BH_\d+_\d+/)?.[0] ?? '',
    );
    const newestCode = [...codes].sort().pop() ?? '';
    const newestRow = groupRows.nth(codes.indexOf(newestCode));

    return {
      salesOrderCode: newestCode,
      checkbox: newestRow.locator('input[type="checkbox"], [role="checkbox"]').first(),
    };
  }
}
