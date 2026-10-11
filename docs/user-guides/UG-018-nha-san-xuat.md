# HƯỚNG DẪN SỬ DỤNG — NHÀ SẢN XUẤT

**Đường dẫn:** Danh mục > Nhà sản xuất  
**Mục tiêu:** Tạo nhà sản xuất (NSX) với mã, thời hạn bảo hành và loại nguyên vật liệu cung cấp.  
**Dành cho:** Người mới sử dụng TANKA Door

## Trước khi bắt đầu

**Cần có sẵn:**

- Thông tin nhà sản xuất: tên, mã viết tắt, thời hạn bảo hành, loại NVL cung cấp.

**Quyền cần có:** Tài khoản thuộc nhóm có quyền Xem/Tạo/Sửa module **Danh mục** (UG-063). Nếu không thấy menu hoặc nút như trong ảnh, liên hệ quản trị hệ thống.

> Ảnh minh họa được chụp bằng tài khoản quản trị trên hệ thống thử nghiệm. Thuật ngữ viết tắt (HTK, NVL, BH, SX, YCMH...) và thứ tự các nghiệp vụ: xem **UG-000 Tổng quan**.

## 1. Khái niệm

NSX (ví dụ XINGFA, TIẾN ĐẠT, MAXPRO, CMECH) là hãng của vật tư. **Mã** NSX (XF, TDA...) thường xuất hiện trong mã hàng. **Loại NVL** (Profile, Phụ kiện, Vật tư phụ, Gioăng, Kính) quyết định NSX hiện ở đâu: ví dụ ô "NSX phụ kiện" khi cấu hình cửa trên báo giá. **Thời hạn bảo hành** dùng cho bảo hành sản phẩm.

## 2. Ví dụ dữ liệu nhập

Ví dụ dưới đây giúp bạn hình dung cách nhập. Hãy nhập dữ liệu thật của công ty bạn; tên/mã có hậu tố số trong ảnh là dữ liệu thử nghiệm, mã chứng từ (BG_, BH_, SX_, MH_...) do hệ thống tự sinh nên của bạn sẽ khác.

| Trường | Giá trị |
| --- | --- |
| Tên / Mã | EUROWINDOW / EW |
| Thời hạn bảo hành | 2 Năm |
| Loại NVL | Profile, Phụ kiện |

> **Không xoá danh mục đã dùng.** Khi không dùng nữa, bỏ tích **Hoạt động** rồi **Lưu**: bản ghi không còn hiện trong ô chọn khi lập chứng từ mới nhưng vẫn giữ nguyên trên chứng từ cũ. Ảnh minh họa có bước bỏ tích này ở cuối — bạn chỉ làm bước đó khi thật sự ngừng sử dụng.

## 3. Quy trình thao tác từng bước

### Bước 1. Mở trang chủ Tanka Door

**Kết quả mong đợi:** menu chức năng hiện ở bên trái màn hình.

![Hình 1: Mở trang chủ Tanka Door.](images/UG-018-nha-san-xuat/01-mo-trang-chinh-tanka.png)

*Hình 1: Mở trang chủ Tanka Door.*

<video src="videos/UG-018-nha-san-xuat/01.webm" controls muted width="100%"></video>

### Bước 2. Mở Danh mục > Nhà sản xuất

**Kết quả mong đợi:** màn hình **Nhà sản xuất** hiện ra với danh sách dữ liệu và các ô lọc.

![Hình 2: Mở Danh mục > Nhà sản xuất.](images/UG-018-nha-san-xuat/02-chon-module-danh-muc-chuc-nang-nha-san-xuat.png)

*Hình 2: Mở Danh mục > Nhà sản xuất.*

<video src="videos/UG-018-nha-san-xuat/02.webm" controls muted width="100%"></video>

### Bước 3. Xem danh sách

Cột Mã, Thời hạn và Đơn vị bảo hành, Loại NVL; lọc theo Loại NVL.

![Hình 3: Xem danh sách.](images/UG-018-nha-san-xuat/03-danh-sach-nsx-ma-thoi-han-bao-hanh-loai-nvl.png)

*Hình 3: Xem danh sách.*

<video src="videos/UG-018-nha-san-xuat/03.webm" controls muted width="100%"></video>

### Bước 4. Bấm Tạo mới

**Kết quả mong đợi:** form nhập mới mở ra; các ô có dấu * là bắt buộc.

![Hình 4: Bấm Tạo mới.](images/UG-018-nha-san-xuat/04-chon-nut-tao-moi.png)

*Hình 4: Bấm Tạo mới.*

<video src="videos/UG-018-nha-san-xuat/04.webm" controls muted width="100%"></video>

### Bước 5. Nhập thông tin NSX

Nhập **Tên ***, **Mã *** (viết tắt, dùng trong mã hàng), **Thời hạn bảo hành** + **Đơn vị bảo hành** (Ngày / Tháng / Năm), chọn **Loại NVL *** (chọn nhiều).

![Hình 5: Nhập thông tin NSX.](images/UG-018-nha-san-xuat/05-nhap-ten-ma-thoi-han-don-vi-bao-hanh-chon-loai-nvl.png)

*Hình 5: Nhập thông tin NSX.*

<video src="videos/UG-018-nha-san-xuat/05.webm" controls muted width="100%"></video>

### Bước 6. Bấm Lưu

**Kết quả mong đợi:** thông báo xanh **"Lưu thành công"** hiện ở góc phải, nút **Lưu** mờ lại.

![Hình 6: Bấm Lưu.](images/UG-018-nha-san-xuat/06-bam-luu.png)

*Hình 6: Bấm Lưu.*

<video src="videos/UG-018-nha-san-xuat/06.webm" controls muted width="100%"></video>

### Bước 7. Ngừng làm việc với NSX (khi cần)

Bỏ tích **Hoạt động** rồi **Lưu**.

![Hình 7: Ngừng làm việc với NSX (khi cần).](images/UG-018-nha-san-xuat/07-bo-tich-hoat-dong-khi-ngung-lam-viec-voi-nsx-roi-luu.png)

*Hình 7: Ngừng làm việc với NSX (khi cần).*

<video src="videos/UG-018-nha-san-xuat/07.webm" controls muted width="100%"></video>

### Bước 8. Kiểm tra trong danh sách

**Kết quả mong đợi:** bản ghi vừa tạo/sửa hiện trong danh sách.

![Hình 8: Kiểm tra trong danh sách.](images/UG-018-nha-san-xuat/08-tim-theo-ten-nsx-moi.png)

*Hình 8: Kiểm tra trong danh sách.*

<video src="videos/UG-018-nha-san-xuat/08.webm" controls muted width="100%"></video>

## 4. Khi không thao tác được

| Hiện tượng | Cách xử lý ngay |
| --- | --- |
| NSX không hiện ở ô NSX phụ kiện / kính | Kiểm tra Loại NVL của NSX đã có loại tương ứng. |
| Nút Lưu đang mờ | Còn ô có dấu * chưa nhập/chọn, hoặc form chưa có thay đổi nào. |
| Bấm Lưu nhưng không thấy phản hồi | Không bấm thêm; chờ thông báo rồi tìm lại bản ghi trong danh sách. |
| Muốn bỏ một danh mục không dùng nữa | Bỏ tích **Hoạt động** rồi Lưu (khuyến nghị) thay vì xoá — bản ghi cũ vẫn giữ trên các chứng từ đã lập, nhưng không còn được chọn khi lập chứng từ mới. |

## 5. Checklist dành cho người mới

- [ ] Đã nhập đủ các ô có dấu *.
- [ ] Đã bấm Lưu và thấy thông báo "Lưu thành công".
- [ ] Đã tìm lại được bản ghi trong danh sách.
- [ ] Dùng bỏ tích Hoạt động thay vì xoá khi không dùng nữa.

---

_Tài liệu này được biên soạn dựa trên thao tác thực tế trên hệ thống door-v1.test.tankasoft.com. Ảnh minh họa có thể thay đổi theo phiên bản giao diện._
