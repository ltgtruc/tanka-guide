import { Locator, Page } from '@playwright/test';

const DETACHED_ELEMENT_PATTERN = /not attached to the DOM/i;

/**
 * Sau khi Lưu/submit, app hay re-render vùng chứa nút (toast, disabled
 * state...) khiến node đã resolve trước đó bị gỡ khỏi DOM giữa chừng.
 * Retry để Locator resolve lại node mới thay vì fail ngay.
 */
async function retryOnDetached(
  action: () => Promise<void>,
  attempts = 3,
  delayMs = 300,
): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await action();
      return;
    } catch (error) {
      const isDetached =
        error instanceof Error &&
        DETACHED_ELEMENT_PATTERN.test(error.message);

      if (!isDetached || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function highlightElement(locator: Locator): Promise<void> {
  const target = locator.first();

  await retryOnDetached(async () => {
    await target.scrollIntoViewIfNeeded();

    await target.evaluate((element) => {
      const htmlElement = element as HTMLElement;

      htmlElement.dataset.originalOutline =
        htmlElement.style.outline;

      htmlElement.dataset.originalOutlineOffset =
        htmlElement.style.outlineOffset;

      htmlElement.dataset.originalBoxShadow =
        htmlElement.style.boxShadow;

      htmlElement.style.outline = '4px solid #ff9800';
      htmlElement.style.outlineOffset = '4px';
      htmlElement.style.boxShadow =
        '0 0 0 8px rgba(255, 152, 0, 0.25)';
    });
  });
}

export async function removeHighlight(locator: Locator): Promise<void> {
  const target = locator.first();

  await retryOnDetached(async () => {
    await target.evaluate((element) => {
      const htmlElement = element as HTMLElement;

      htmlElement.style.outline =
        htmlElement.dataset.originalOutline || '';

      htmlElement.style.outlineOffset =
        htmlElement.dataset.originalOutlineOffset || '';

      delete htmlElement.dataset.originalOutline;
      delete htmlElement.dataset.originalOutlineOffset;
    });
  });
}

export async function showGuideBanner(
  page: Page,
  message: string,
): Promise<void> {
  await page.evaluate((text) => {
    document
      .querySelector('#playwright-user-guide-banner')
      ?.remove();

    const banner = document.createElement('div');

    banner.id = 'playwright-user-guide-banner';
    banner.textContent = text;

    Object.assign(banner.style, {
      position: 'fixed',
      top: '18px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '2147483647',
      background: '#ffffff',
      border: '2px solid #222222',
      borderRadius: '8px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      padding: '12px 22px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontWeight: '700',
      maxWidth: '80%',
      textAlign: 'center',
      pointerEvents: 'none',
    });

    document.body.appendChild(banner);
  }, message);
}

export async function removeGuideBanner(
  page: Page,
): Promise<void> {
  await page
    .locator('#playwright-user-guide-banner')
    .evaluate((element) => element.remove())
    .catch(() => undefined);
}