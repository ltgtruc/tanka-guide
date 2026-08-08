import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import fs from 'node:fs/promises';
import path from 'node:path';

console.log('BASE_URL:', process.env.BASE_URL);
console.log('ADMIN_EMAIL:', process.env.TANKA_ADMIN_EMAIL);
console.log(
  'ADMIN_PASSWORD loaded:',
  Boolean(process.env.TANKA_ADMIN_PASSWORD),
);

const authFile = path.resolve(
  __dirname,
  '../../auth/admin.json',
);

setup('Đăng nhập và lưu trạng thái Admin', async ({ page }) => {
  const email = process.env.TANKA_ADMIN_EMAIL;
  const password = process.env.TANKA_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Thiếu TANKA_ADMIN_EMAIL hoặc TANKA_ADMIN_PASSWORD trong file .env',
    );
  }

  await fs.mkdir(path.dirname(authFile), {
    recursive: true,
  });

  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login(email, password);
  await loginPage.verifyLoginSuccess();

  await expect(page).not.toHaveURL(/login/i);

  await page.context().storageState({
    path: authFile,
  });
});