import { expect, Locator, test } from '@playwright/test';
import { CatalogFormPage } from '../../pages/catalogs/CatalogFormPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-064-report-templates';

test.describe('UG-064 - Mẫu báo cáo', () => {
  test(
    'Hướng dẫn xem mẫu báo cáo và mở trình thiết kế mẫu',
    { tag: ['@user-guide', '@system', '@report-templates'] },
    async ({ page }, testInfo) => {
      // Chỉ xem — mẫu đang dùng để in báo giá/hợp đồng thật, không bấm Lưu.
      const templates = new CatalogFormPage(
        page,
        '/systems/report-templates-list',
        /\/systems\/report-templates-details/,
        /^\W*hệ thống\W*$/i,
      );
      const templateName = 'Báo giá tổng hợp';

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Hệ thống > Mẫu báo cáo', async () => {
        await capture('Chọn module Hệ thống, chức năng Mẫu báo cáo', templates.catalogsMenu);
        await templates.openList();
        await capture('Danh sách mẫu: Mã, Tên, Phân hệ, Loại (Excel / Pdf / Word)', templates.listRows.first());
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Lọc theo phân hệ', async () => {
        await templates.selectOption(/phân hệ/i, 'Bán hàng');
        await expect(templates.listRows.filter({ hasText: templateName }).first()).toBeVisible({ timeout: 20_000 });
        await capture('Lọc theo Phân hệ (Bán hàng, Mua hàng, Sản xuất...) và Loại', templates.dropdown(/phân hệ/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 4 - Mở chi tiết mẫu', async () => {
        const row = templates.listRows.filter({ hasText: templateName }).filter({ hasText: /excel/i }).first();

        await capture('Bấm vào mã mẫu để mở', row.locator('a').first());
        await row.locator('a').first().click();
        await page.waitForURL(/\/systems\/report-templates-details\//, { timeout: 30_000 });
        await expect(templates.input(/^\s*tên/i)).toBeVisible({ timeout: 20_000 });
        await capture('Thông tin chung: Tên, Phân hệ, Loại, Diễn giải, Hoạt động', templates.input(/^\s*tên/i));
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Mở trình thiết kế mẫu', async () => {
        const designButton = page.locator('main').getByRole('button', { name: /thiết kế mẫu bc/i });

        await capture('Bấm Thiết kế mẫu BC để sửa bố cục, công thức của file', designButton);
        await designButton.click();
        await page.waitForURL(/\/systems\/report-templates-editor\//, { timeout: 30_000 });

        const contentTab = page.locator('main').getByRole('button', { name: /^\s*nội dung\s*$/i });

        await expect(contentTab).toBeVisible({ timeout: 30_000 });
        await page.waitForLoadState('networkidle');
        await capture('Trình thiết kế dạng bảng tính: tab Nội dung / Xem trước, Nhập Excel để thay cả file mẫu', contentTab);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Xem trước và trở lại', async () => {
        const previewTab = page.locator('main').getByRole('button', { name: /^\s*xem trước\s*$/i });

        await previewTab.click();
        await page.waitForLoadState('networkidle');
        await capture('Xem trước mẫu; sửa xong bấm Lưu, nếu chỉ xem thì bấm Trở lại', previewTab);
        await page.locator('main').getByRole('button', { name: /trở lại/i }).click();
        await page.waitForURL(/\/systems\/report-templates-details\//, { timeout: 30_000 });
        await guidePause(page, 1_500);
      });
    },
  );
});
