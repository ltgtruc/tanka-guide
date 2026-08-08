import {
  test as base,
  expect,
} from '@playwright/test';

import fs from 'node:fs/promises';
import path from 'node:path';

export const test = base.extend<{
  guideId: string;
}>({
  guideId: [
    'UG-UNKNOWN',
    {
      option: true,
    },
  ],
});

test.afterEach(async ({ page, guideId }, testInfo) => {
  const video = page.video();

  if (!video) {
    return;
  }

  const originalVideoPath = await video.path();

  const videoDirectory = path.resolve(
    'user-guide-output',
    'videos',
  );

  await fs.mkdir(videoDirectory, {
    recursive: true,
  });

  const safeTitle = testInfo.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  const targetPath = path.join(
    videoDirectory,
    `${guideId}-${safeTitle}.webm`,
  );

  await fs.copyFile(
    originalVideoPath,
    targetPath,
  );

  await testInfo.attach('User Guide Video', {
    path: targetPath,
    contentType: 'video/webm',
  });
});

export { expect };