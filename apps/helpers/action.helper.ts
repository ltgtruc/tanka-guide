import { expect, Locator, Page } from '@playwright/test';

import { guideFill } from './video.helper';

export async function waitVisible(
  locator: Locator,
  timeout = 10_000,
): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
}

export async function waitHidden(
  locator: Locator,
  timeout = 10_000,
): Promise<void> {
  await expect(locator).toBeHidden({ timeout });
}

export async function waitAndClick(
  locator: Locator,
  timeout = 10_000,
): Promise<void> {
  await waitVisible(locator, timeout);
  await locator.click();
}

export async function waitAndFill(
  page: Page,
  locator: Locator,
  value: string,
  timeout = 10_000,
): Promise<void> {
  await waitVisible(locator, timeout);
  await guideFill(page, locator, value);
}

export async function waitToSeeText(
  page: Page,
  text: string | RegExp,
  timeout = 10_000,
): Promise<Locator> {
  const locator = page.getByText(text).first();

  await waitVisible(locator, timeout);

  return locator;
}

export async function clickButtonByName(
  page: Page,
  name: string | RegExp,
  timeout = 10_000,
): Promise<Locator> {
  const locator = page.getByRole('button', { name }).first();

  await waitAndClick(locator, timeout);

  return locator;
}
