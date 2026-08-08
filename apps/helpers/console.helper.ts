import { Page, TestInfo } from '@playwright/test';

interface BrowserIssue {
  type: 'console' | 'pageerror' | 'response';
  message: string;
  url?: string;
  status?: number;
}

export function collectBrowserIssues(
  page: Page,
): BrowserIssue[] {
  const issues: BrowserIssue[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    issues.push({
      type: 'console',
      message: message.text(),
    });
  });

  page.on('pageerror', (error) => {
    issues.push({
      type: 'pageerror',
      message: error.message,
    });
  });

  page.on('response', (response) => {
    if (response.status() < 400) {
      return;
    }

    issues.push({
      type: 'response',
      message: `${response.status()} ${response.statusText()}`,
      status: response.status(),
      url: response.url(),
    });
  });

  return issues;
}

export async function attachBrowserIssues(
  issues: BrowserIssue[],
  testInfo: TestInfo,
): Promise<void> {
  await testInfo.attach('Browser issues', {
    body: Buffer.from(
      JSON.stringify(issues, null, 2),
      'utf-8',
    ),
    contentType: 'application/json',
  });
}