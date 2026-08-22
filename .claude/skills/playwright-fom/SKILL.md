---
name: playwright-fom
description: Use when creating or updating a custom Playwright test fixture under apps/fixtures/** in the tanka-guide project. Defines the standard shape (test.extend, fixture options, lifecycle hooks, re-exports) so new fixtures match apps/fixtures/userGuide.fixture.ts. Does not cover stateless one-off helper functions — see apps/helpers for those.
---

# Playwright Fixture Object Model (FOM) — tanka-guide

Chuẩn hoá **hình thức** của một custom fixture mới, dựa trên file đã có:
`apps/fixtures/userGuide.fixture.ts`.

## Khi nào tạo fixture (thay vì helper)

- **Fixture**: gắn với vòng đời test/worker — cần setup trước test, teardown
  sau test, hoặc cần được các spec "khai báo dùng" qua tham số của
  `test(...)`. Ví dụ: `guideId`, quản lý video/attachment sau mỗi test.
- **Helper** (`apps/helpers/*.helper.ts`): hàm thuần, gọi tường minh ngay
  trong thân `test.step`, không gắn lifecycle riêng (ví dụ `captureGuideStep`,
  `guideFill`, `highlightElement`). Nếu logic mới chỉ là một hàm tiện ích gọi
  trực tiếp trong bước, tạo helper — **không** bọc thành fixture.

## Vị trí file

`apps/fixtures/<name>.fixture.ts`.

## Khung fixture

```ts
import { test as base, expect } from '@playwright/test';

export const test = base.extend<{
  someOption: string;
}>({
  someOption: [
    'default-value',
    { option: true }, // dùng cho fixture kiểu "option" (string/số cấu hình), không phải fixture tạo resource
  ],
});

test.afterEach(async ({ page, someOption }, testInfo) => {
  // side effect sau mỗi test — luôn early-return nếu resource không tồn tại
  const resource = page.video();
  if (!resource) return;

  // ...xử lý...
});

export { expect };
```

Quy tắc bắt buộc:

- Luôn `import { test as base, expect } from '@playwright/test'` rồi tạo
  `export const test = base.extend<...>({...})` — không tự tạo test runner
  riêng ngoài cơ chế `extend` của Playwright.
- Nếu fixture chỉ là một giá trị cấu hình (không phải resource cần
  setup/teardown riêng), khai báo theo tuple `[defaultValue, { option: true }]`
  như `guideId` trong `userGuide.fixture.ts`.
- Mọi side effect trong `beforeEach`/`afterEach` phải **an toàn khi resource
  không tồn tại** (guard `if (!x) return;`) — không throw làm fail toàn bộ
  test chỉ vì thiếu resource phụ (video, attachment...).
- File fixture luôn `export { expect }` lại (cùng với `test`) để spec import
  một chỗ duy nhất: `import { test, expect } from '../../fixtures/xxx.fixture'`.
- Muốn kết hợp nhiều fixture: `base.extend` trên `test` của một fixture khác
  (chaining), không copy logic giữa các file fixture.
- Đường dẫn output (thư mục ảnh/video...) dùng `path.resolve('user-guide-output', ...)`
  và `fs.mkdir(..., { recursive: true })` trước khi ghi file, giống
  `userGuide.fixture.ts`.

## Phạm vi

Fixture chỉ lo phần **hạ tầng** (lifecycle, attachment, cấu hình truyền vào
test). Không đặt logic nghiệp vụ hướng dẫn (thứ tự bước, nội dung banner...)
trong fixture — phần đó thuộc spec file, theo
`.claude/rules/project-conventions.md`.
