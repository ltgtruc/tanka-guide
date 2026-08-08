import {
  Locator,
  Page,
  TestInfo,
} from '@playwright/test';

import fs from 'node:fs/promises';
import path from 'node:path';

import {
  highlightElement,
  removeGuideBanner,
  removeHighlight,
  showGuideBanner,
} from './highlight.helper';

interface CaptureGuideStepOptions {
  page: Page;
  testInfo: TestInfo;
  guideId: string;
  stepNumber: number;
  title: string;
  target?: Locator;
  fullPage?: boolean;
  pauseBefore?: number;
  mask?: Locator[];
}

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export async function captureGuideStep(
  options: CaptureGuideStepOptions,
): Promise<string> {
  const {
    page,
    testInfo,
    guideId,
    stepNumber,
    title,
    target,
    fullPage = false,
    pauseBefore = 600,
    mask = [],
  } = options;

  const directory = path.resolve(
    'user-guide-output',
    'images',
    guideId,
  );

  await fs.mkdir(directory, {
    recursive: true,
  });

  if (target) {
    await highlightElement(target);
  }

  await showGuideBanner(
    page,
    `Bước ${stepNumber}: ${title}`,
  );

  if (pauseBefore > 0) {
    await page.waitForTimeout(pauseBefore);
  }

  const fileName =
    `${String(stepNumber).padStart(2, '0')}-` +
    `${sanitizeFileName(title)}.png`;

  const filePath = path.join(directory, fileName);

  await page.screenshot({
    path: filePath,
    fullPage,
    animations: 'disabled',
    caret: 'hide',
    mask,
  });

  await testInfo.attach(
    `Bước ${stepNumber} - ${title}`,
    {
      path: filePath,
      contentType: 'image/png',
    },
  );

  if (target) {
    await removeHighlight(target);
  }

  await removeGuideBanner(page);

  return filePath;
}