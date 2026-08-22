# tanka-guide

@.claude/rules/project-conventions.md
@.claude/rules/code-stability.md

## Tổng quan

Dự án Playwright dùng để **tự động quay hướng dẫn sử dụng** (video + ảnh chụp
từng bước, tiếng Việt) cho hệ thống Tanka Door ERP
(`https://door-v1.test.tankasoft.com`). Test không phải test kiểm thử thông
thường — mỗi spec là một kịch bản thao tác thật trên UI, được Playwright thực
thi, highlight từng phần tử, hiển thị banner mô tả bước, rồi chụp ảnh/quay
video để làm tài liệu hướng dẫn (`apps/user-guide-output/`).

## Cấu trúc thư mục

```
apps/
  playwright.config.ts   # testDir = './tests', workers: 1, headless: false
  .env / .env.example    # BASE_URL, TANKA_ADMIN_EMAIL, TANKA_ADMIN_PASSWORD, GUIDE_MODE
  auth/                  # storageState sau khi login (admin.json) — gitignored
  fixtures/               # custom test fixtures (Fixture Object Model / FOM)
  pages/                  # Page Object Model (POM), chia theo domain
    catalogs/ production/ sales/
  helpers/                 # hàm tiện ích không gắn vòng đời test (capture, highlight, video, console, privacy)
  test-data/               # factory tạo dữ liệu giả cho từng luồng (customer.data.ts, ...)
  tests/                   # spec theo domain, đặt tên UG-XXX-slug.spec.ts
    authentication/ catalogs/ sales/ production/ purchasing/ accounting/ system/ setup/
docs/                     # tài liệu nghiệp vụ gốc (BOM, guideline...) — không phải code
```

## Lệnh hay dùng

Chạy từ thư mục `apps/` (nơi đặt `playwright.config.ts`):

```
npx playwright test                     # chạy toàn bộ (tuần tự, workers=1)
npx playwright test tests/sales/UG-020-create-customer.spec.ts
npx playwright test --project=setup     # chỉ chạy bước đăng nhập/lưu storageState
npx playwright show-report               # xem báo cáo HTML
npx playwright codegen door-v1.test.tankasoft.com   # sinh/kiểm tra locator thật
```

`package.json` ở gốc repo hiện chưa có `scripts` — luôn gọi `npx playwright ...`
trực tiếp trong `apps/`, đừng tự thêm script khi chưa được yêu cầu.

## Skill & Agent sẵn có

- Skill `playwright-pom`: chuẩn hoá cách viết Page Object mới trong `apps/pages/**`.
- Skill `playwright-fom`: chuẩn hoá cách viết custom fixture mới trong `apps/fixtures/**`.
- Agent `playwright-object-builder`: dựng/sửa Page Object & Fixture theo hai skill trên.
- Agent `playwright-test-debugger`: chẩn đoán spec UG-XXX bị fail dựa trên trace/report/screenshot.

Xem chi tiết quy ước và lưu ý về độ ổn định code trong hai file rule được
import ở đầu file này.
