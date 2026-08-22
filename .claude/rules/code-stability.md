# Lưu ý về độ ổn định của code hiện tại

Codebase này **chưa ổn định**, đặc biệt là hai phần:

1. **Locator trong Page Object** (`apps/pages/**`) phần lớn là suy đoán ban
   đầu, chưa xác minh với DOM thật của Tanka. `LoginPage.ts` còn nguyên comment
   gốc: "Các locator dưới đây là mẫu. Bạn cần kiểm tra DOM thực tế của Tanka
   và điều chỉnh." Nhiều nơi khác dùng `getByRole('textbox').nth(n)`
   (`CustomerPage.ts`) — rất dễ vỡ nếu form đổi thứ tự field.
2. **Logic điều hướng & bố cục các bước trong spec** (`apps/tests/**`) còn
   đang được user chỉnh sửa dần theo thực tế chạy thử (còn `console.log`
   debug trong `UG-020-create-customer.spec.ts`, `privacy.helper.ts` đang
   rỗng/chưa triển khai).

## Vì vậy

- **Không tự tạo thêm skill "chuẩn" cho logic nghiệp vụ hoặc trình tự bước
  hướng dẫn** cho tới khi user xác nhận pattern đã ổn định và yêu cầu tạo
  skill cho phần đó. Hai skill hiện có (`playwright-pom`, `playwright-fom`)
  chỉ chuẩn hoá **hình thức khai báo** class/fixture (constructor, kiểu dữ
  liệu, cách đặt tên locator...), không áp đặt logic nghiệp vụ bên trong.
- Khi tạo/sửa Page Object mới: **ưu tiên xác minh locator thật** bằng
  `npx playwright codegen`, Playwright Inspector, hoặc trace/screenshot có sẵn
  trong `apps/test-results/` và `apps/playwright-report/` — không đoán theo
  tên field rồi khẳng định là đúng.
- **Không tự ý dọn dẹp** những gì trông như "chưa xong" (xoá `console.log`
  debug, hoàn thiện `privacy.helper.ts` rỗng, đổi cấu trúc bước, gộp file...)
  trừ khi user yêu cầu trực tiếp cho việc đang làm — có thể đó là code dở
  dang user đang debug, không phải rác.
- Khi sửa một spec, chỉ sửa đúng phạm vi được yêu cầu; không refactor lan
  sang các spec khác "cho đồng bộ" nếu không được yêu cầu.
