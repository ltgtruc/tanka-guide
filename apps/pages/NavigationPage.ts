import { expect, Locator, Page } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;

  readonly catalogsMenu: Locator;
  readonly salesMenu: Locator;
  readonly productionMenu: Locator;
  readonly purchasingMenu: Locator;
  readonly accountingMenu: Locator;
  readonly systemMenu: Locator;

  constructor(page: Page) {
    this.page = page;

    this.catalogsMenu = page.getByText(
      /danh mục|catalogs/i,
      {
        exact: true,
      },
    );

    this.salesMenu = page.getByText(
      /bán hàng|sales/i,
      {
        exact: true,
      },
    );

    this.productionMenu = page.getByText(
      /sản xuất|production/i,
      {
        exact: true,
      },
    );

    this.purchasingMenu = page.getByText(
      /mua hàng|purchasing/i,
      {
        exact: true,
      },
    );

    this.accountingMenu = page.getByText(
      /quyết toán|accounting/i,
      {
        exact: true,
      },
    );

    this.systemMenu = page.getByText(
      /hệ thống|system/i,
      {
        exact: true,
      },
    );
  }

  async openSales(): Promise<void> {
    await this.salesMenu.click();
  }

  async openCustomers(): Promise<void> {
    await this.openSales();

    const customerMenu = this.page.getByText(
      /khách hàng|customer/i,
      {
        exact: true,
      },
    );

    await expect(customerMenu).toBeVisible();
    await customerMenu.click();
  }

  async openQuotation(): Promise<void> {
    await this.openSales();

    const quotationMenu = this.page.getByText(
      /báo giá|quotation/i,
      {
        exact: true,
      },
    );

    await expect(quotationMenu).toBeVisible();
    await quotationMenu.click();
  }
}