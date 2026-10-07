# HƯỚNG DẪN SỬ DỤNG — TẠO QUYẾT TOÁN SẢN XUẤT

**Đường dẫn:** Sản xuất > Quyết toán sản xuất  
**Mục tiêu:** Tạo một quyết toán sản xuất cho 1 đội sản xuất từ các lệnh sản xuất đủ điều kiện, rồi chuyển trạng thái từ Nháp đến Hoàn thành.  
**Dành cho:** Người mới sử dụng TANKA Door

## 1. Dữ liệu mẫu dùng trong hướng dẫn

Các bước 1-6 dưới đây minh họa bằng ảnh chụp thật trên hệ thống. Từ bước 7 trở đi, giao diện chuyển trạng thái giống hệt hướng dẫn "Quyết toán khách hàng" nên được mô tả theo đúng thao tác thật đã kiểm chứng ở đó, chưa kèm ảnh riêng vì tại thời điểm biên soạn chưa có lệnh sản xuất nào đủ điều kiện (có ngày HTSX và hoàn thành) để minh họa trọn vẹn — hãy tự đối chiếu ảnh thực tế khi hệ thống có dữ liệu phù hợp.

| Trường | Giá trị |
| --- | --- |
| Đội sản xuất | Anh Danh - GC Sản xuất |
| Điều kiện lệnh sản xuất | Chỉ chọn được lệnh SX có dòng đã có ngày HTSX và hoàn thành (theo đội đã chọn) |
| Ghi chú khi chuyển trạng thái | đã hoàn thành bước này |

## 2. Sơ đồ quy trình tóm tắt

BẮT ĐẦU → Tạo mới, chọn Đội sản xuất và lệnh sản xuất đủ điều kiện → Bấm Thêm, rồi Lưu → Chuyển trạng thái Nháp → Đã gửi → Đã duyệt → Hoàn thành → Trở lại kiểm tra kết quả

## 3. Quy trình thao tác từng bước

### Bước 1. Mở trang chủ Tanka Door

Đăng nhập vào hệ thống, màn hình **Trang chủ** hiện ra.

![Hình 1: Trang chủ sau khi đăng nhập.](images/UG-037-quyet-toan-san-xuat/01-mo-trang-chinh-tanka.png)

*Hình 1: Trang chủ sau khi đăng nhập.*

### Bước 2. Mở Quyết toán sản xuất

Ở menu bên trái, mở **Sản xuất**, trong danh sách sổ xuống bấm **Quyết toán sản xuất**.

![Hình 2: Mở menu Sản xuất, chọn Quyết toán sản xuất.](images/UG-037-quyet-toan-san-xuat/02-mo-module-san-xuat-chon-quyet-toan-san-xuat.png)

*Hình 2: Mở menu Sản xuất, chọn Quyết toán sản xuất.*

### Bước 3. Màn hình Danh sách quyết toán sản xuất

Màn hình hiện ra với danh sách các quyết toán sản xuất đã có.

![Hình 3: Danh sách quyết toán sản xuất.](images/UG-037-quyet-toan-san-xuat/03-man-hinh-danh-sach-quyet-toan-san-xuat.png)

*Hình 3: Danh sách quyết toán sản xuất.*

### Bước 4. Bấm nút Tạo mới

Bấm nút **Tạo mới** ở góc phải màn hình để mở màn hình **Chi tiết quyết toán sản xuất**.

![Hình 4: Bấm nút Tạo mới.](images/UG-037-quyet-toan-san-xuat/04-bam-nut-tao-moi.png)

*Hình 4: Bấm nút Tạo mới.*

### Bước 5. Chọn Đội sản xuất

Bấm vào ô **Đội sản xuất**, chọn 1 đội từ danh sách sổ xuống hiện ra.

![Hình 5: Chọn Đội sản xuất.](images/UG-037-quyet-toan-san-xuat/05-bam-vao-doi-san-xuat-de-chon-tu-danh-sach.png)

*Hình 5: Chọn Đội sản xuất.*

### Bước 6. Chọn mã sản xuất

Bấm vào ô **Chọn lệnh sản xuất** để chọn 1 lệnh sản xuất của đội đó.

![Hình 6: Chọn lệnh sản xuất.](images/UG-037-quyet-toan-san-xuat/06-bam-chon-ma-san-xuat-va-chon-1-ma-san-xuat-cua-doi-do.png)

*Hình 6: Chọn lệnh sản xuất.*

> Chỉ chọn được lệnh SX có dòng đã có ngày HTSX (Hoàn thành sản xuất) và hoàn thành, theo đội đã chọn — nếu danh sách hiện "No available options" nghĩa là đội này chưa có lệnh sản xuất nào đủ điều kiện.

### Bước 7. Thêm mã sản xuất vào bảng

Bấm nút **Thêm** bên cạnh mã sản xuất vừa chọn để đưa dòng vào bảng quyết toán. Nếu có phụ thu thì bấm nút Thêm ở khung Phụ thu; nếu có giảm trừ thì bấm nút Thêm ở khung Giảm trừ.

### Bước 8. Bấm Lưu để hoàn thành tạo mới

Kiểm tra lại dòng vừa thêm rồi bấm nút **Lưu** đúng một lần để hoàn thành việc tạo mới quyết toán. Sau khi Lưu, màn hình hiện thêm khung **Trạng thái** với giá trị ban đầu là **Nháp**.

### Bước 9. Chuyển trạng thái sang Đã gửi

Ở khung Trạng thái, bấm nút mũi tên (⇄) bên cạnh chữ Nháp, chọn **Đã gửi**. Màn hình chuyển trạng thái hiện ra, nhập ghi chú (ví dụ "đã hoàn thành bước này") vào ô text, bấm **Cập nhật**, rồi bấm **Đồng ý** ở popup xác nhận.

### Bước 10. Chuyển trạng thái sang Đã duyệt

Lặp lại thao tác: bấm nút chuyển trạng thái, chọn **Đã duyệt**, nhập ghi chú, bấm Cập nhật rồi Đồng ý.

### Bước 11. Chuyển trạng thái sang Hoàn thành

Lặp lại thao tác lần cuối: bấm nút chuyển trạng thái, chọn **Hoàn thành**, nhập ghi chú, bấm Cập nhật rồi Đồng ý.

### Bước 12. Bấm nút Trở lại

Bấm nút **Trở lại** ở góc trên bên phải để quay về danh sách và kiểm tra đơn quyết toán sản xuất vừa hoàn thành.

## 4. Khi không thao tác được

| Hiện tượng | Cách xử lý ngay |
| --- | --- |
| Nút Lưu đang mờ / không bấm được | Tìm ô có dấu * chưa nhập hoặc dropdown chưa chọn; cuộn hết form để kiểm tra. |
| Ô hiện viền đỏ kèm thông báo lỗi | Đọc đúng thông báo dưới ô, sửa lại giá trị rồi bấm ra ngoài ô để hệ thống kiểm tra lại. |
| Gõ vào dropdown nhưng không thấy dữ liệu | Xóa bớt từ khóa, gõ lại đúng một phần mã/tên và chờ vài giây để danh sách tải xong. |
| Bấm Lưu nhưng không thấy phản hồi | Không bấm thêm lần nữa; chờ hệ thống xử lý xong rồi tìm lại bản ghi trong danh sách. |
| Ô "Chọn lệnh sản xuất" hiện "No available options" | Đội sản xuất đã chọn chưa có lệnh SX nào có dòng đã có ngày HTSX và hoàn thành — cần hoàn tất ghi nhận sản xuất cho lệnh SX trước. |
| Nút Thêm bên cạnh mã sản xuất bị mờ | Phải chọn xong 1 lệnh sản xuất hợp lệ ở ô "Chọn lệnh sản xuất" trước khi nút Thêm sáng lên. |

## 5. Dấu hiệu hoàn thành

- Ô Trạng thái hiển thị "Hoàn thành".
- Bản ghi quyết toán sản xuất xuất hiện trong danh sách với đúng đội sản xuất và trạng thái Hoàn thành.

## 6. Checklist dành cho người mới

- [ ] Đã chọn đúng Đội sản xuất và đúng lệnh sản xuất đủ điều kiện cần quyết toán.
- [ ] Đã bấm Thêm để đưa dòng vào bảng trước khi Lưu.
- [ ] Đã chuyển đủ chuỗi trạng thái Nháp → Đã gửi → Đã duyệt → Hoàn thành.
- [ ] Đã bấm Trở lại và thấy bản ghi trong danh sách với trạng thái Hoàn thành.

---

_Tài liệu này được biên soạn dựa trên thao tác thực tế trên hệ thống door-v1.test.tankasoft.com. Ảnh minh họa có thể thay đổi theo phiên bản giao diện._
