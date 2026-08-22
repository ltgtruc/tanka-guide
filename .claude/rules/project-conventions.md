# Quy ước dự án tanka-guide

## Đặt tên & tổ chức spec

- ID hướng dẫn theo dạng `UG-<số 3 chữ số>`, nhóm theo domain (
  `001-002` authentication, `010-012` catalogs, `020-022` sales, `030-031`
  production, `040` purchasing, `050` accounting, `060` system).
- File spec: `apps/tests/<domain>/UG-XXX-slug-tieng-anh.spec.ts`. Tên
  `describe`/`test` dùng tiếng Việt, có `tag` mô tả domain, ví dụ
  `{ tag: ['@user-guide', '@sales', '@customer'] }`.
- `guideId` truyền vào `captureGuideStep` phải **trùng khớp** tên thư mục ảnh
  mong muốn dưới `apps/user-guide-output/images/<guideId>/` (thường trùng tên
  file spec bỏ phần mở rộng, ví dụ `UG-020-create-customer`).

## Cấu trúc một bước hướng dẫn

Mỗi bước là một `test.step('Bước N - <mô tả tiếng Việt>', async () => { ... })`
theo đúng thứ tự:

1. Đợi phần tử liên quan `toBeVisible` (timeout 10_000 trở lên khi chờ trang
   load, 30_000 khi chờ hành động ghi dữ liệu).
2. Gọi `captureGuideStep({ page, testInfo, guideId, stepNumber, title, target })`
   **trước khi** click/submit — ảnh chụp phải thể hiện trạng thái trước hành
   động, với phần tử liên quan được highlight.
3. Thực hiện hành động (click/fill).
4. `guidePause(page, ms)` để giữ nhịp khi quay video (`GUIDE_MODE=true`).

Không đảo thứ tự capture/action trừ khi mục tiêu bước là chụp *kết quả sau*
hành động (ví dụ bước cuối "kiểm tra kết quả").

## Nhập liệu & thao tác

- Dùng `guideFill(page, locator, value)` (từ `apps/helpers/video.helper.ts`)
  thay vì `locator.fill()` trực tiếp — khi `GUIDE_MODE=true` sẽ gõ từng ký tự
  (`pressSequentially`) để video mượt, ngược lại fallback về `fill()`.
- Không gọi `page.waitForTimeout` trực tiếp trong spec để "chờ cho chắc" — dùng
  `guidePause` (tự tắt khi không quay guide) hoặc `expect(...).toBeVisible()`.

## Biến môi trường

`apps/.env` (không commit, xem `apps/.env.example`):
`BASE_URL`, `TANKA_ADMIN_EMAIL`, `TANKA_ADMIN_PASSWORD`, `GUIDE_MODE`.
Khi sửa `.env.example`, chỉ để placeholder, không để giá trị thật hay ký tự
thừa (hiện có dấu `'` thừa cuối dòng `GUIDE_MODE=true'` — sửa khi được yêu cầu
dọn file này, không tự ý sửa nếu không liên quan tới việc đang làm).

## Playwright config

- `workers: 1`, `fullyParallel: false` — bắt buộc vì quay guide phải tuần tự,
  không tự ý bật parallel khi thêm test.
- `headless: false`, `video: 'on'`, `screenshot: 'only-on-failure'`,
  `trace: 'retain-on-failure'` — giữ nguyên trừ khi user yêu cầu đổi.
- Project `setup` (`*.setup.ts`) chạy trước, lưu `storageState` vào
  `apps/auth/admin.json`; project chính `tanka-user-guide` phụ thuộc `setup`.

## Ngôn ngữ

Toàn bộ chuỗi hiển thị cho người dùng (title bước, tên nút giả lập trong
regex, mô tả) dùng tiếng Việt để nhất quán với phần còn lại của codebase.
Tên biến/hàm/class vẫn dùng tiếng Anh theo quy ước TypeScript thông thường.
