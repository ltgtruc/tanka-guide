import { expect, Locator, test } from '@playwright/test';
import { NavigationPage } from '../../pages/NavigationPage';
import { BomPage } from '../../pages/catalogs/BomPage';
import { captureGuideStep } from '../../helpers/guide-step.helper';
import { guidePause } from '../../helpers/video.helper';
import { createGuideBom } from '../../test-data/bom.data';

const GUIDE_ID = 'UG-013-create-bom';

test.describe('UG-013 - Tạo định mức vật tư (BOM)', () => {
  test(
    'Hướng dẫn tạo định mức NVL mới',
    { tag: ['@user-guide', '@catalogs', '@bom'] },
    async ({ page }, testInfo) => {
      const navigation = new NavigationPage(page);
      const bomPage = new BomPage(page);

      const bom = createGuideBom();

      let stepNumber = 0;
      let existingProductCodes: string[] = [];

      const capture = (title: string, target?: Locator) =>
        captureGuideStep({ page, testInfo, guideId: GUIDE_ID, stepNumber: ++stepNumber, title, target });

      await test.step('Bước 1 - Mở hệ thống', async () => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
        await capture('Mở trang chính Tanka');
        await guidePause(page, 1_000);
      });

      await test.step('Bước 2 - Mở module Danh mục', async () => {
        await expect(navigation.catalogsMenu).toBeVisible({ timeout: 15_000 });
        await capture('Chọn module Danh mục', navigation.catalogsMenu);
        await navigation.catalogsMenu.click();
        await guidePause(page, 900);
      });

      await test.step('Bước 3 - Mở chức năng Định mức NVL', async () => {
        const bomMenu = page.getByText(/^định mức nvl$/i).first();

        await expect(bomMenu).toBeVisible({ timeout: 10_000 });
        await capture('Chọn chức năng Định mức NVL', bomMenu);
        await bomMenu.click();
        await bomPage.verifyPageOpened();
        existingProductCodes = await bomPage.getExistingProductCodes(bom.productSearch, bom.site);
        console.log(`HTK đã có định mức ở ${bom.site}: ${existingProductCodes.join(', ') || '(không có)'}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 4 - Chọn Tạo mới', async () => {
        await expect(bomPage.createButton).toBeVisible({ timeout: 15_000 });
        await expect(bomPage.createButton).toBeEnabled({ timeout: 15_000 });
        await capture('Chọn nút Tạo mới', bomPage.createButton);
        await bomPage.openCreateForm();
        await guidePause(page, 900);
      });

      await test.step('Bước 5 - Chọn Định mức - HTK (thành phẩm)', async () => {
        await capture('Chọn Định mức - HTK', bomPage.productDropdown);

        const selectedProduct = await bomPage.selectProduct(bom.productSearch, existingProductCodes);

        console.log(`Định mức - HTK đã chọn: ${selectedProduct}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 6 - Chọn Chi nhánh', async () => {
        await capture('Chọn Chi nhánh', bomPage.siteDropdown);

        const selectedSite = await bomPage.selectSite(bom.site);

        console.log(`Chi nhánh đã chọn: ${selectedSite}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 7 - Nhập Tổng số W/H mặc định', async () => {
        await capture('Nhập Tổng số W/H mặc định', bomPage.totalWidthInput);
        await bomPage.fillTotalSize(bom.totalWidth, bom.totalHeight);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 8 - Thêm dòng thành phần NVL', async () => {
        await expect(bomPage.profileTab).toBeVisible({ timeout: 15_000 });
        await capture('Bấm nút Thêm ở tab Profile', bomPage.profileTab);

        const newRow = await bomPage.addComponentRow();

        await guidePause(page, 800);

        const selectedComponent = await bomPage.selectComponent(newRow, bom.componentSearch);

        console.log(`Thành phần NVL đã chọn: ${selectedComponent}`);
        await guidePause(page, 1_000);
      });

      await test.step('Bước 9 - Lưu định mức NVL', async () => {
        await expect(bomPage.saveButton).toBeVisible({ timeout: 15_000 });
        await expect(bomPage.saveButton).toBeEnabled({ timeout: 15_000 });
        await capture('Chọn nút Lưu', bomPage.saveButton);
        await bomPage.save();
        await guidePause(page, 2_000);
      });

      await test.step('Bước 10 - Trở lại danh sách và kiểm tra kết quả', async () => {
        await expect(bomPage.backButton).toBeVisible({ timeout: 15_000 });
        await capture('Trở lại danh sách Định mức NVL', bomPage.backButton);
        await bomPage.backToList();
        await page.waitForURL(/bom-list/i, { timeout: 30_000 });
        await bomPage.verifyPageOpened();
        await capture('Định mức NVL vừa tạo xuất hiện trong danh sách');
        await guidePause(page, 2_000);
      });
    },
  );
});
