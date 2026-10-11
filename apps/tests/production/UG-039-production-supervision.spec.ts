import { expect, Locator, test } from '@playwright/test';
import { ProductionSupervisionPage } from '../../pages/production/ProductionSupervisionPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';

const GUIDE_ID = 'UG-039-production-supervision';

test.describe('UG-039 - Giám sát tiến độ SX', () => {
  test(
    'Hướng dẫn theo dõi tiến độ sản xuất, lọc, ẩn/hiện cột và xuất kế hoạch giao hàng & lắp đặt',
    { tag: ['@user-guide', '@production', '@production-supervision'] },
    async ({ page }, testInfo) => {
      // Chỉ xem/lọc/xuất file — không sửa ô nào (gán đội/ngày đã có ở UG-033).
      const supervision = new ProductionSupervisionPage(page);

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Sản xuất > Giám sát tiến độ SX', async () => {
        await capture('Chọn module Sản xuất, chức năng Giám sát tiến độ SX', supervision.productionMenu);
        await supervision.open();
        await capture(
          'Mỗi dòng là một cửa của lệnh SX; cột chia nhóm Thông tin chung, Yêu cầu giao hàng, Sản xuất, Giao hàng, Lắp đặt, Vệ sinh, Quyết toán & chi phí',
          supervision.table.locator('thead tr').first(),
        );
        await guidePause(page, 1_000);
      });

      await test.step('Bước 3 - Lọc theo trạng thái', async () => {
        await supervision.filterByStatus('Đang SX');
        await capture('Lọc theo Mã BH, ĐNSX, khoảng ngày, Chi nhánh, Trạng thái rồi bấm Tìm kiếm', supervision.searchButton);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Ẩn/hiện cột', async () => {
        await supervision.columnsButton.click();
        await expect(supervision.dialog).toBeVisible({ timeout: 10_000 });

        const groupCheckbox = supervision.columnGroupCheckbox('Thông tin chung');

        await groupCheckbox.click();
        await capture('Nút Cột: bỏ tích nhóm/cột không cần xem để bảng gọn hơn', groupCheckbox);
        await supervision.dialog.getByRole('button', { name: /hiện tất cả/i }).click();
        await supervision.dialog.getByRole('button', { name: /^\W*đóng\W*$/i }).click();
        await expect(supervision.dialog).toBeHidden({ timeout: 10_000 });
        await guidePause(page, 800);
      });

      await test.step('Bước 5 - Kế hoạch giao hàng & lắp đặt theo ngày', async () => {
        await supervision.planButton.click();
        await expect(supervision.dialog).toBeVisible({ timeout: 10_000 });

        const exportButton = supervision.dialog.getByRole('button', { name: /xuất excel/i });

        await capture('Kế hoạch GH&LĐ: chọn Ngày kế hoạch rồi bấm Xuất Excel', exportButton);

        const download = page.waitForEvent('download', { timeout: 30_000 }).catch(() => null);

        await exportButton.click();
        await download;
        await guidePause(page, 800);
        await supervision.dialog
          .getByRole('button', { name: /^\W*đóng\W*$/i })
          .click({ timeout: 5_000 })
          .catch(() => undefined);
        await expect(supervision.dialog).toBeHidden({ timeout: 10_000 });
      });

      await test.step('Bước 6 - Cập nhật đội và ngày trực tiếp trên bảng', async () => {
        const installGroup = supervision.table.locator('thead tr').first().locator('th').filter({ hasText: /^\s*lắp đặt\s*$/i });

        await installGroup.scrollIntoViewIfNeeded();
        await capture('Bấm vào ô Đội SX / Đội LĐ / Đội VS hoặc ô ngày để chọn — hệ thống tự lưu (xem UG-033)', installGroup);
        await guidePause(page, 2_000);
      });
    },
  );
});
