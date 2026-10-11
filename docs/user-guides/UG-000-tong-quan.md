# HƯỚNG DẪN SỬ DỤNG — TỔNG QUAN TANKA DOOR

**Mục tiêu:** Giúp người mới biết nên đọc tài liệu nào trước, các nghiệp vụ nối với nhau ra sao, và hiểu các thuật ngữ viết tắt trên màn hình.  
**Dành cho:** Người mới sử dụng TANKA Door

## 1. Cách dùng bộ tài liệu

Mỗi tài liệu UG-xxx hướng dẫn **một chức năng** trên menu, gồm các phần:

- **Trước khi bắt đầu** — dữ liệu phải có sẵn, tài liệu nên đọc trước, quyền cần có. Đọc phần này trước tiên: phần lớn lỗi "không chọn được", "không thấy dữ liệu" là do thiếu bước chuẩn bị.
- **Khái niệm / Ví dụ dữ liệu nhập** — giải thích các ô và một bộ dữ liệu ví dụ. Hãy nhập dữ liệu thật của công ty bạn.
- **Quy trình thao tác từng bước** — mỗi bước có ảnh chụp, phần được **khoanh viền cam** là ô/nút cần bấm. Dòng **Kết quả mong đợi** giúp bạn tự kiểm tra đã làm đúng chưa.
- **Khi không thao tác được** và **Checklist** — tra cứu khi gặp lỗi và tự rà soát trước khi kết thúc.

> Ảnh được chụp bằng tài khoản quản trị trên hệ thống thử nghiệm. Tài khoản của bạn có thể thấy ít menu/nút hơn tuỳ nhóm quyền (UG-063) — khi thiếu, liên hệ quản trị hệ thống.

## 2. Thiết lập ban đầu (làm một lần, theo thứ tự)

Quản trị hệ thống và người phụ trách danh mục thực hiện trước khi các bộ phận bắt đầu làm việc:

| Thứ tự | Việc cần làm | Tài liệu |
| --- | --- | --- |
| 1 | Cập nhật thông tin công ty | UG-062 |
| 2 | Tạo nhóm quyền theo vai trò, tạo tài khoản người dùng | UG-063, UG-060 |
| 3 | Chi nhánh, Kho hàng, Khu vực lưu trữ | UG-016, UG-011, UG-072 |
| 4 | Đơn vị tính, Nhóm hàng tồn kho, Thuế suất | UG-015, UG-014, UG-081 |
| 5 | Nhà sản xuất, Màu sắc, Hệ profile, Loại cửa, Mã nẹp kính, Thuộc tính | UG-018, UG-080, UG-083, UG-012, UG-017, UG-019 |
| 6 | Hàng tồn kho (vật tư, thành phẩm), cập nhật hàng loạt, Định mức NVL | UG-010, UG-084, UG-013 |
| 7 | Nhân viên, Khách hàng, Nhà cung cấp | UG-082, UG-020, UG-042 |
| 8 | Nhóm giá bán, Giá bán | UG-024, UG-023 |
| 9 | Đội thuê ngoài và đơn giá cho đội | UG-034, UG-038 |

## 3. Luồng nghiệp vụ hằng ngày

Một đơn hàng cửa đi qua các bước sau. Mỗi bước chỉ làm được khi bước trước đã xong:

```
BÁN HÀNG     Báo giá (UG-021) → Đơn bán hàng (UG-022)
                 → chuyển "Đã yêu cầu SX" (UG-031)
SẢN XUẤT     Tạo lệnh SX từ đơn BH (UG-030)
                 → Tối ưu cắt, duyệt, lập Yêu cầu mua hàng (UG-032)
MUA HÀNG     YCMH → Đơn mua hàng theo từng NCC (UG-032)
                 → Duyệt đơn MH, Phiếu nhận hàng Ghi sổ (UG-040)
SẢN XUẤT     Đang SX (xuất kho vật tư) → Đã SX → Phiếu giao hàng
                 → Đang lắp đặt → Đã lắp đặt (UG-033)
                 Giám sát tiến độ: gán Đội SX/LĐ/VS, ngày hoàn thành (UG-039)
QUYẾT TOÁN   Khách hàng (UG-035), Lắp đặt (UG-036), Sản xuất (UG-037)
```

Nghiệp vụ kho phát sinh song song: nhận ngoài đơn, trả hàng NCC, đảo phiếu (UG-041); điều chỉnh tồn (UG-070); chuyển kho (UG-071); tra cứu tồn (UG-073); lô hàng (UG-074); đầu thừa (UG-075); kiểm kê (UG-077); kỳ kho (UG-076).

## 4. Trạng thái chứng từ

| Chứng từ | Trạng thái theo thứ tự | Ghi chú |
| --- | --- | --- |
| Báo giá | Nháp → Chờ duyệt → Đã duyệt | UG-021 |
| Đơn bán hàng | Nháp → Đã gửi → Đã duyệt → Đã yêu cầu SX | Chỉ đơn "Đã yêu cầu SX" mới đưa vào lệnh SX (UG-031) |
| Lệnh sản xuất | Nháp → Đã duyệt → Đã kế hoạch → Đã mua hàng → Đang SX → Đã SX → Đang giao hàng → Đã giao hàng → Đang lắp đặt → Đã lắp đặt → Đã quyết toán / Đã hoàn tất (hoặc Đã hủy) | "Đã mua hàng" cần có đơn mua hàng; "Đang SX" tự xuất kho vật tư |
| Yêu cầu mua hàng | Nháp → Đã duyệt → Đã lập đơn | UG-032 |
| Đơn mua hàng | Nháp → Đã duyệt → Đã hoàn tất / Đã nhận đủ | Duyệt đơn tự tạo phiếu nhận hàng nháp (UG-040) |
| Phiếu nhận hàng / Phiếu kho | Nháp → Đã ghi sổ (→ Đã đảo nếu đảo phiếu) | Chỉ khi Ghi sổ tồn kho mới thay đổi |
| Phiếu giao hàng | Đang giao → Hoàn thành | Lệnh SX tự chuyển Đang giao hàng / Đã giao hàng |
| Quyết toán | Nháp → Đã gửi → Đã duyệt → Hoàn thành | UG-035, UG-036, UG-037 |

## 5. Thuật ngữ viết tắt

| Viết tắt | Ý nghĩa |
| --- | --- |
| HTK | Hàng tồn kho — mọi mặt hàng: vật tư, thành phẩm (mẫu cửa), dịch vụ |
| NVL | Nguyên vật liệu (Profile, Phụ kiện, Vật tư phụ, Gioăng, Kính) |
| NSX | Nhà sản xuất (hãng profile, phụ kiện) |
| NCC | Nhà cung cấp |
| ĐVT | Đơn vị tính |
| BG / BH | Báo giá / Đơn bán hàng (mã BG_..., BH_...) |
| SX | Sản xuất; lệnh sản xuất (mã SX_...) |
| YCMH / MH | Yêu cầu mua hàng / Đơn mua hàng (mã YCMH_..., MH_...) |
| NH / TH | Phiếu nhận hàng / Phiếu trả hàng NCC (mã NH_..., TH_...) |
| NK / XK / DC / CK / KK | Phiếu nhập kho / xuất kho / điều chỉnh / chuyển kho / kiểm kê |
| GH | Phiếu giao hàng |
| LĐ / VS | Lắp đặt / Vệ sinh |
| HTSX / HTLĐ / HTVS | Ngày hoàn thành sản xuất / lắp đặt / vệ sinh |
| BĐVS | Ngày bắt đầu vệ sinh |
| QTKH / QTLD / QTSX | Quyết toán khách hàng / lắp đặt / sản xuất |
| BOM | Định mức nguyên vật liệu (UG-013) |
| FEFO | Hết hạn trước — xuất trước (cách chọn lô, UG-074) |

## 6. Danh sách tài liệu

| Module | Tài liệu |
| --- | --- |
| Đăng nhập | UG-001 Đăng nhập · UG-002 Đăng xuất |
| Danh mục | UG-010 Vật liệu (Hàng tồn kho) · UG-011 Kho hàng · UG-012 Loại cửa · UG-013 Định mức NVL · UG-014 Nhóm hàng tồn kho · UG-015 Đơn vị tính · UG-016 Chi nhánh · UG-017 Mã nẹp kính · UG-018 Nhà sản xuất · UG-019 Thuộc tính · UG-080 Màu sắc · UG-081 Thuế suất · UG-082 Nhân viên · UG-083 Hệ profile · UG-084 Cập nhật hàng loạt HTK |
| Bán hàng | UG-020 Khách hàng · UG-021 Báo giá · UG-022 Đơn bán hàng · UG-023 Giá bán · UG-024 Nhóm giá bán · UG-031 Yêu cầu sản xuất từ đơn BH |
| Sản xuất | UG-030 Tạo lệnh SX · UG-032 Tối ưu và mua hàng cho lệnh SX · UG-033 Sản xuất, giao hàng, lắp đặt · UG-034 Đội thuê ngoài · UG-038 CP cho đội thuê ngoài · UG-039 Giám sát tiến độ SX · UG-035 Quyết toán khách hàng · UG-036 Quyết toán lắp đặt · UG-037 Quyết toán sản xuất |
| Mua hàng | UG-040 Duyệt đơn mua và nhận hàng · UG-041 Nhận ngoài đơn, trả hàng NCC, đảo phiếu · UG-042 Nhà cung cấp |
| Quản lý kho | UG-070 Phiếu điều chỉnh · UG-071 Chuyển kho · UG-072 Khu vực lưu trữ · UG-073 Tồn kho · UG-074 Lô hàng · UG-075 Đầu thừa · UG-076 Kỳ kho · UG-077 Kiểm kê |
| Hệ thống | UG-060 Người dùng · UG-061 Tài khoản của tôi · UG-062 Tổ chức của tôi · UG-063 Phân quyền nhóm · UG-064 Mẫu báo cáo |

---

_Tài liệu này được biên soạn dựa trên thao tác thực tế trên hệ thống door-v1.test.tankasoft.com. Ảnh minh họa có thể thay đổi theo phiên bản giao diện._
