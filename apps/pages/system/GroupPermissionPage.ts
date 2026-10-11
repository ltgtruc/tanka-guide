import { expect, Locator, Page } from '@playwright/test';

/**
 * Hệ thống > Phân quyền nhóm (/systems/group-permissions).
 * Đã kiểm tra DOM thực tế:
 * - Bên trái là cây nhóm (treeitem Admin / Nhân viên / Quản lý...) + nút
 *   "Tạo mới" mở dialog "Tạo mới": Tên *, Diễn giải, Nhóm cha, Lưu / Đóng.
 * - Bên phải 2 tab: "Thông tin" (Tên, Diễn giải, Nhóm cha, nút Sửa / Xoá) và
 *   "Phân quyền" (ô "Tìm quyền…", lọc module/loại/trạng thái; mỗi dòng quyền
 *   có nút "Cho phép" / "Từ chối").
 */
export class GroupPermissionPage {
  readonly page: Page;

  readonly systemMenu: Locator;
  readonly groupMenu: Locator;
  readonly tree: Locator;
  readonly createButton: Locator;
  readonly dialog: Locator;
  readonly infoTab: Locator;
  readonly permissionTab: Locator;
  readonly permissionSearch: Locator;
  readonly permissionRows: Locator;

  constructor(page: Page) {
    this.page = page;

    this.systemMenu = page.getByRole('link', { name: /^\W*hệ thống\W*$/i }).first();
    this.groupMenu = page.locator('a[href="/systems/group-permissions"]');
    this.tree = page.locator('main').getByRole('tree');
    this.createButton = page.locator('main').getByRole('button', { name: /tạo mới/i });
    this.dialog = page.locator('.p-dialog:visible');
    this.infoTab = page.getByRole('tab', { name: /^\s*thông tin\s*$/i });
    this.permissionTab = page.getByRole('tab', { name: /^\s*phân quyền\s*$/i });
    this.permissionSearch = page.getByRole('textbox', { name: /tìm quyền/i });
    this.permissionRows = page.locator('main [role="tabpanel"] table tbody tr');
  }

  async open(): Promise<void> {
    if (!(await this.groupMenu.isVisible().catch(() => false))) {
      await expect(this.systemMenu).toBeVisible({ timeout: 15_000 });
      await this.systemMenu.click();
    }

    await expect(this.groupMenu).toBeVisible({ timeout: 15_000 });
    await this.groupMenu.click();
    await this.page.waitForURL(/\/systems\/group-permissions/, { timeout: 30_000 });
    await expect(this.tree.getByRole('treeitem').first()).toBeVisible({ timeout: 20_000 });
  }

  group(name: string): Locator {
    return this.tree.getByRole('treeitem', { name, exact: true });
  }

  dialogInput(label: RegExp): Locator {
    return this.dialog
      .locator('.c-component')
      .filter({ has: this.page.locator('label', { hasText: label }) })
      .locator('input, textarea')
      .first();
  }

  async saveDialog(): Promise<void> {
    await this.dialog.getByRole('button', { name: /lưu/i }).click();
    await expect(this.page.getByText(/thành công/i).first()).toBeVisible({ timeout: 20_000 });
    await this.dialog
      .getByRole('button', { name: /đóng/i })
      .click({ timeout: 3_000 })
      .catch(() => undefined);
    await expect(this.dialog).toBeHidden({ timeout: 10_000 });
  }

  async searchPermission(keyword: string): Promise<Locator> {
    await this.permissionSearch.fill(keyword);
    await this.permissionSearch.press('Enter');

    const row = this.permissionRows.filter({ hasText: keyword }).first();

    await expect(row).toBeVisible({ timeout: 15_000 });

    return row;
  }
}
