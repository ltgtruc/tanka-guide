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

/**
 * Ghi mốc thời gian (giây, tính từ lúc bắt đầu quay video) của từng bước vào
 * user-guide-output/videos/<guideId>/timeline.json để cắt clip theo bước.
 * Thời điểm bắt đầu quay lấy từ thời gian tạo file video tạm của Playwright.
 */
async function recordStepTime(
  page: Page,
  testInfo: TestInfo,
  guideId: string,
  stepNumber: number,
  fileName: string,
): Promise<void> {
  const videoPath = await page.video()?.path().catch(() => undefined);

  if (!videoPath) {
    return;
  }

  const videoStart = (await fs.stat(videoPath)).birthtimeMs;
  const directory = path.resolve('user-guide-output', 'videos', guideId);
  const timelinePath = path.join(directory, 'timeline.json');

  await fs.mkdir(directory, { recursive: true });

  const timeline =
    stepNumber === 1
      ? { outputDir: testInfo.outputDir, steps: [] as { step: number; image: string; at: number }[] }
      : JSON.parse(await fs.readFile(timelinePath, 'utf8').catch(() => '{"steps":[]}'));

  timeline.outputDir = testInfo.outputDir;
  timeline.steps.push({ step: stepNumber, image: fileName, at: (Date.now() - videoStart) / 1000 });
  await fs.writeFile(timelinePath, JSON.stringify(timeline, null, 2));
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

  const fileName =
    `${String(stepNumber).padStart(2, '0')}-` +
    `${sanitizeFileName(title)}.png`;

  await recordStepTime(page, testInfo, guideId, stepNumber, fileName);

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