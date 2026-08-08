import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    /*
     * Các locator dưới đây là mẫu.
     * Bạn cần kiểm tra DOM thực tế của Tanka và điều chỉnh.
     */
    this.emailInput = page
      .getByLabel(/email/i)
      .or(page.locator('input[type="email"]'));

    this.passwordInput = page
      .getByLabel(/mật khẩu|password/i)
      .or(page.locator('input[type="password"]'));

    this.loginButton = page.getByRole('button', {
      name: /đăng nhập|login/i,
    });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async verifyLoginSuccess(): Promise<void> {
    await expect(this.page).not.toHaveURL(/login/i);

    await expect(
      this.page
        .getByText(/dashboard|tổng quan|danh mục/i)
        .first(),
    ).toBeVisible();
  }
}