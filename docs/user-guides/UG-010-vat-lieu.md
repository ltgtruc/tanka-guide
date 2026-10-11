# HƯỚNG DẪN SỬ DỤNG — VẬT LIỆU (HÀNG TỒN KHO)

**Đường dẫn:** Danh mục > Hàng tồn kho  
**Mục tiêu:** Khai báo một vật liệu (hàng tồn kho — HTK) mới với mã, tên, nhóm HTK và đơn vị tính lưu kho.  
**Dành cho:** Người mới sử dụng TANKA Door

## Trước khi bắt đầu

**Cần có sẵn:**

- Đã có Nhóm hàng tồn kho (UG-014) và Đơn vị tính (UG-015) phù hợp.
- Đã thống nhất quy ước đặt mã mặt hàng trong công ty.

**Nên đọc trước:** UG-014, UG-015.

**Quyền cần có:** Tài khoản thuộc nhóm có quyền Xem/Tạo/Sửa module **Danh mục** (UG-063). Nếu không thấy menu hoặc nút như trong ảnh, liên hệ quản trị hệ thống.

> Ảnh minh họa được chụp bằng tài khoản quản trị trên hệ thống thử nghiệm. Thuật ngữ viết tắt (HTK, NVL, BH, SX, YCMH...) và thứ tự các nghiệp vụ: xem **UG-000 Tổng quan**.

## 1. Ví dụ dữ liệu nhập

Ví dụ dưới đây giúp bạn hình dung cách nhập. Hãy nhập dữ liệu thật của công ty bạn; tên/mã có hậu tố số trong ảnh là dữ liệu thử nghiệm, mã chứng từ (BG_, BH_, SX_, MH_...) do hệ thống tự sinh nên của bạn sẽ khác.

| Trường | Giá trị |
| --- | --- |
| Mã | AL-XF55-K01 |
| Tên | Thanh khung bao Xingfa 55 - 1.4mm |
| Nhóm HTK | ALU |
| ĐVT lưu kho | mm |

## 2. Sơ đồ quy trình tóm tắt

BẮT ĐẦU → Mở Danh mục > Hàng tồn kho → Bấm Tạo mới → Nhập Mã, Tên → Chọn Nhóm HTK, ĐVT lưu kho → Bấm Lưu → Kiểm tra thông báo Lưu thành công

## 3. Quy trình thao tác từng bước

### Bước 1. Mở trang chủ Tanka Door

Đăng nhập vào hệ thống, màn hình **Trang chủ** hiện ra.

![Hình 1: Trang chủ sau khi đăng nhập.](images/UG-010-vat-lieu/01-mo-trang-chinh-tanka.png)

*Hình 1: Trang chủ sau khi đăng nhập.*

<video src="videos/UG-010-vat-lieu/01.webm" controls muted width="100%"></video>

### Bước 2. Mở menu Danh mục

Ở menu bên trái, bấm vào **Danh mục** để xổ ra các chức năng con.

![Hình 2: Mở menu Danh mục.](images/UG-010-vat-lieu/02-chon-module-danh-muc.png)

*Hình 2: Mở menu Danh mục.*

<video src="videos/UG-010-vat-lieu/02.webm" controls muted width="100%"></video>

### Bước 3. Chọn Hàng tồn kho

Bấm **Hàng tồn kho**. Màn hình **Danh sách hàng tồn kho** hiện ra với các ô lọc (Từ khóa, NSX, Loại NVL, Màu, Nhóm HTK...).

![Hình 3: Chọn chức năng Hàng tồn kho.](images/UG-010-vat-lieu/03-chon-chuc-nang-vat-lieu.png)

*Hình 3: Chọn chức năng Hàng tồn kho.*

<video src="videos/UG-010-vat-lieu/03.webm" controls muted width="100%"></video>

### Bước 4. Bấm nút Tạo mới

Trước khi tạo mới, có thể dùng ô **Từ khóa tìm kiếm** để kiểm tra mã đã tồn tại chưa. Nếu chưa có, bấm **Tạo mới** để mở **Chi tiết hàng tồn kho**.

![Hình 4: Bấm nút Tạo mới.](images/UG-010-vat-lieu/04-chon-nut-tao-moi.png)

*Hình 4: Bấm nút Tạo mới.*

<video src="videos/UG-010-vat-lieu/04.webm" controls muted width="100%"></video>

### Bước 5. Nhập Mã vật liệu

Nhập **Mã *** — mã duy nhất của vật liệu.

![Hình 5: Nhập Mã vật liệu.](images/UG-010-vat-lieu/05-nhap-ma-vat-lieu.png)

*Hình 5: Nhập Mã vật liệu.*

<video src="videos/UG-010-vat-lieu/05.webm" controls muted width="100%"></video>

### Bước 6. Nhập Tên vật liệu

Nhập **Tên *** của vật liệu.

![Hình 6: Nhập Tên vật liệu.](images/UG-010-vat-lieu/06-nhap-ten-vat-lieu.png)

*Hình 6: Nhập Tên vật liệu.*

<video src="videos/UG-010-vat-lieu/06.webm" controls muted width="100%"></video>

### Bước 7. Chọn Nhóm HTK và ĐVT lưu kho

Ở tab **Thông tin chung**:

- **Nhóm HTK** — chọn nhóm (ví dụ **ALU**).
- **ĐVT lưu kho *** — chọn đơn vị tính lưu kho (ví dụ **mm**).

> **Quan trọng:** ĐVT bán hàng và ĐVT mua hàng mặc định là **mm**. Nếu chọn ĐVT lưu kho khác (ví dụ "Bình") mà chưa khai báo quy đổi giữa hai đơn vị, khi Lưu hệ thống báo lỗi _"ĐVT mm chưa có quy đổi sang ĐVT lưu kho ... Hãy thêm quy đổi cho ĐVT trước"_. Khi đó chọn ĐVT lưu kho trùng ĐVT bán/mua, hoặc khai báo quy đổi ở **Danh mục > Đơn vị tính** trước.

![Hình 7: Chọn Nhóm HTK và ĐVT lưu kho.](images/UG-010-vat-lieu/07-chon-nhom-htk-va-dvt-luu-kho.png)

*Hình 7: Chọn Nhóm HTK và ĐVT lưu kho.*

<video src="videos/UG-010-vat-lieu/07.webm" controls muted width="100%"></video>

### Bước 8. Bấm Lưu

Kiểm tra lại các ô bắt buộc rồi bấm **Lưu** đúng một lần.

![Hình 8: Bấm nút Lưu.](images/UG-010-vat-lieu/08-chon-nut-luu.png)

*Hình 8: Bấm nút Lưu.*

<video src="videos/UG-010-vat-lieu/08.webm" controls muted width="100%"></video>

### Bước 9. Kiểm tra kết quả

Thông báo xanh **"Thành công — Lưu thành công"** hiện ra. Màn hình **vẫn ở lại form chi tiết** với dữ liệu vừa lưu; bấm **Trở lại** để về danh sách và tìm lại vật liệu theo mã.

![Hình 9: Vật liệu được tạo thành công.](images/UG-010-vat-lieu/09-vat-lieu-duoc-tao-thanh-cong.png)

*Hình 9: Vật liệu được tạo thành công.*

<video src="videos/UG-010-vat-lieu/09.webm" controls muted width="100%"></video>

## 4. Khi không thao tác được

| Hiện tượng | Cách xử lý ngay |
| --- | --- |
| Ô Nhóm HTK / ĐVT lưu kho viền đỏ "bắt buộc" | Chọn một giá trị trong danh sách sổ xuống trước khi Lưu. |
| Lưu báo "ĐVT ... chưa có quy đổi sang ĐVT lưu kho ..." | Chọn ĐVT lưu kho trùng ĐVT bán hàng/mua hàng, hoặc khai báo quy đổi đơn vị trước (xem lưu ý Bước 7). |
| Lưu báo trùng mã | Mã đã tồn tại — đổi sang mã khác hoặc tìm và sửa vật liệu đã có. |
| Bấm Lưu nhưng không thấy phản hồi | Không bấm thêm lần nữa; chờ thông báo rồi tìm lại vật liệu trong danh sách. |

## 5. Dấu hiệu hoàn thành

- Thông báo "Thành công — Lưu thành công" xuất hiện.
- Tìm theo mã trong Danh sách hàng tồn kho thấy vật liệu mới với đúng Nhóm HTK và ĐVT lưu kho.

## 6. Checklist dành cho người mới

- [ ] Đã nhập Mã, Tên.
- [ ] Đã chọn Nhóm HTK và ĐVT lưu kho phù hợp với ĐVT bán/mua.
- [ ] Chỉ bấm Lưu một lần và đã thấy thông báo Thành công.

---

_Tài liệu này được biên soạn dựa trên thao tác thực tế trên hệ thống door-v1.test.tankasoft.com. Ảnh minh họa có thể thay đổi theo phiên bản giao diện._
