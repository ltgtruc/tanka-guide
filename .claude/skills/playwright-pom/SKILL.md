---
name: playwright-pom
description: Use when creating or updating a Playwright Page Object class under apps/pages/** in the tanka-guide project. Defines the standard shape (fields, constructor, locator style, action/verify methods) so new page objects match LoginPage.ts, NavigationPage.ts, CustomerPage.ts. Does not cover the business/narrative logic of a spec file — only the page-object structure.
---

# Playwright Page Object Model (POM) — tanka-guide

Chuẩn hoá **hình thức** của một Page Object mới, dựa trên các file đã có:
`apps/pages/LoginPage.ts`, `apps/pages/NavigationPage.ts`,
`apps/pages/sales/CustomerPage.ts`.

## Vị trí file

- Trang dùng chung toàn hệ thống (login, điều hướng...): `apps/pages/<Name>Page.ts`.
- Trang thuộc một domain cụ thể: `apps/pages/<domain>/<Name>Page.ts`
  (domain khớp với thư mục test tương ứng: `catalogs`, `production`, `sales`, ...).

## Khung class

```ts
import { expect, Locator, Page } from '@playwright/test';

export class XxxPage {
  readonly page: Page;

  readonly createButton: Locator;
  readonly saveButton: Locator;
  // ... các locator khác

  constructor(page: Page) {
    this.page = page;

    this.createButton = page
      .getByRole('button', { name: /tạo mới|create/i })
      .first();

    // ...
  }

  async openCreateForm(): Promise<void> {
    await expect(this.createButton).toBeVisible({ timeout: 10000 });
    await this.createButton.click();
  }
}
```

Quy tắc bắt buộc:

- `readonly page: Page` luôn là field đầu tiên; các `Locator` khai báo
  `readonly` ngay sau, gán giá trị trong `constructor(page: Page)`.
- Không có logic ngoài gán locator trong constructor — mọi hành động
  (click, fill, verify) là **method riêng**, trả về `Promise<void>`
  (hoặc kiểu cụ thể nếu method trả dữ liệu).
- Method verify đặt tên `verifyXxx`, method thao tác đặt tên theo hành động
  (`open`, `login`, `save`, `backToList`, `openCreateForm`...).
- Method thao tác trên phần tử có thể biến mất/chậm load nên tự chờ
  `expect(locator).toBeVisible({ timeout: 10000 })` trước khi tương tác, như
  `openCreateForm()`, `save()`, `backToList()` trong `CustomerPage.ts`.

## Locator

- Ưu tiên thứ tự: `getByRole` > `getByLabel` > `getByText` > CSS selector.
  Chỉ dùng CSS/`locator()` thô khi không còn cách nào khác, và để lại comment
  giải thích vì sao.
- Vì UI có cả tiếng Việt lẫn tiếng Anh (nhãn có thể đổi theo locale), luôn
  dùng regex không phân biệt hoa thường kèm cả hai: `/tạo mới|create/i`,
  `/lưu|save/i`, `/mật khẩu|password/i`.
- Khi nhiều phần tử khớp cùng một role/text, dùng `.first()` hoặc `.nth(n)` —
  nếu dùng `.nth(n)`, **bắt buộc có comment liệt kê thứ tự field theo DOM
  thực tế đã quan sát** (xem ví dụ `nameInput`/`phoneInput`/`emailInput` trong
  `CustomerPage.ts`), vì đây là kiểu locator dễ vỡ nhất khi form đổi bố cục.
- Nếu locator được suy đoán mà **chưa** xác minh với DOM thật (chưa chạy
  `npx playwright codegen` hoặc chưa xem trace/screenshot thật), thêm comment
  cảnh báo tương tự `LoginPage.ts`: "cần kiểm tra DOM thực tế của Tanka và
  điều chỉnh". Xem thêm `.claude/rules/code-stability.md`.

## Phạm vi của Page Object

- Page Object chỉ chứa thao tác **tái sử dụng được** trên một trang (click,
  fill, verify trạng thái). **Không** chứa trình tự nghiệp vụ nhiều bước hay
  logic chụp ảnh hướng dẫn (`captureGuideStep`, `test.step`) — phần đó thuộc
  về spec file, xem quy ước ở `.claude/rules/project-conventions.md`.
- Không import `test`/`test.step` trong Page Object.
