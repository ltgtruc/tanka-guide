import { expect, Locator, test } from '@playwright/test';
import { ProductionSettlementPage } from '../../pages/settlement/ProductionSettlementPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideProductionSettlement } from '../../test-data/productionSettlement.data';

const GUIDE_ID = 'UG-037-create-production-settlement-list';

test.describe('UG-037 - Tạo quyết toán sản xuất', () => {
  test(
    'Hướng dẫn tạo quyết toán sản xuất và chuyển trạng thái đến Hoàn thành',
    { tag: ['@user-guide', '@production', '@production-settlement'] },
    async ({ page }, testInfo) => {
      const settlementPage = new ProductionSettlementPage(page);
      const settlement = createGuideProductionSettlement();

      let stepNumber = 0;

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở Quyết toán sản xuất', async () => {
        await capture('Mở module Sản xuất, chọn Quyết toán sản xuất');
        await settlementPage.openSettlementList();
        await capture('Màn hình Danh sách quyết toán sản xuất', settlementPage.settlementListHeading);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 3 - Chọn Tạo mới', async () => {
        await expect(settlementPage.createButton).toBeVisible({ timeout: 15_000 });
        await expect(settlementPage.createButton).toBeEnabled({ timeout: 15_000 });
        await capture('Bấm nút Tạo mới', settlementPage.createButton);
        await settlementPage.openCreateForm();
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn Đội sản xuất', async () => {
        await capture('Bấm vào Đội sản xuất để chọn từ danh sách', settlementPage.teamDropdown);

        const selectedTeam = await settlementPage.selectTeam(settlement.team);

        console.log(`Đội sản xuất đã chọn: ${selectedTeam}`);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 5 - Chọn mã sản xuất', async () => {
        await capture('Bấm Chọn mã sản xuất của đội vừa chọn', settlementPage.productionDropdown);

        const selectedProduction = await settlementPage.selectProduction(settlement.productionCode);

        console.log(`Sản xuất đã chọn: ${selectedProduction}`);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 6 - Thêm mã sản xuất vào bảng quyết toán', async () => {
        await capture('Bấm nút Thêm bên cạnh mã sản xuất vừa chọn', settlementPage.addProductionButton);
        await settlementPage.addSelectedProduction();

        /*
         * Nếu có phụ thu thì bấm "Thêm" ở khung Phụ thu, nếu có giảm trừ thì
         * bấm "Thêm" ở khung Giảm trừ — đều không bắt buộc nên hướng dẫn
         * không thao tác các phần này ở đây.
         */

        await guidePause(page, 1_500);
      });

      await test.step('Bước 7 - Lưu quyết toán', async () => {
        await capture('Bấm nút Lưu để hoàn thành việc tạo mới quyết toán', settlementPage.settlementSaveButton);
        await settlementPage.saveSettlement();
        await settlementPage.expectCurrentStatus('Nháp');
        await guidePause(page, 1_500);
      });

      await test.step('Bước 8 - Chuyển trạng thái sang Đã gửi', async () => {
        await capture('Bấm nút chuyển trạng thái, chọn Đã gửi', settlementPage.statusActionButton);
        await settlementPage.changeStatus(settlement.sentStatus, settlement.statusNote);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Xác nhận chuyển trạng thái Đã gửi', async () => {
        await settlementPage.expectCurrentStatus(settlement.sentStatus);
        await capture('Trạng thái đã chuyển sang Đã gửi', settlementPage.currentStatusValue);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 10 - Chuyển trạng thái sang Đã duyệt', async () => {
        await capture('Bấm nút chuyển trạng thái, chọn Đã duyệt', settlementPage.statusActionButton);
        await settlementPage.changeStatus(settlement.approvedStatus, settlement.statusNote);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 11 - Xác nhận chuyển trạng thái Đã duyệt', async () => {
        await settlementPage.expectCurrentStatus(settlement.approvedStatus);
        await capture('Trạng thái đã chuyển sang Đã duyệt', settlementPage.currentStatusValue);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 12 - Chuyển trạng thái sang Hoàn thành', async () => {
        await capture('Bấm nút chuyển trạng thái, chọn Hoàn thành', settlementPage.statusActionButton);
        await settlementPage.changeStatus(settlement.completedStatus, settlement.statusNote);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 13 - Xác nhận chuyển trạng thái Hoàn thành', async () => {
        await settlementPage.expectCurrentStatus(settlement.completedStatus);
        await capture('Trạng thái đã chuyển sang Hoàn thành', settlementPage.currentStatusValue);
        await guidePause(page, 1_500);
      });

      await test.step('Bước 14 - Trở lại kiểm tra đơn quyết toán vừa hoàn thành', async () => {
        await capture('Bấm nút Trở lại', settlementPage.settlementBackButton);
        await settlementPage.backToList();
        await capture('Danh sách quyết toán sản xuất sau khi hoàn thành', settlementPage.settlementListHeading);
        await guidePause(page, 1_000);
      });
    },
  );
});
