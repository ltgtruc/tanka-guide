import { Page } from '@playwright/test';

export function isGuideMode(): boolean {
  return process.env.GUIDE_MODE === 'true';
}

export async function guidePause(
  page: Page,
  milliseconds = 1_000,
): Promise<void> {
  if (!isGuideMode()) {
    return;
  }

  await page.waitForTimeout(milliseconds);
}

export async function slowFill(
  page: Page,
  locator: Parameters<Page['locator']>[0] extends never
    ? never
    : import('@playwright/test').Locator,
  value: string,
): Promise<void> {
  await locator.click();

  if (isGuideMode()) {
    await locator.pressSequentially(value, {
      delay: 60,
    });
  } else {
    await locator.fill(value);
  }
}

export async function guideFill(
  page: Page,
  locator: Parameters<Page['locator']>[0] extends never
    ? never
    : import('@playwright/test').Locator,
  value: string,
): Promise<void> {
  await slowFill(page, locator, value);
}   