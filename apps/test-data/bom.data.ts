export interface GuideBom {
  productSearch: string;
  site: string;
  totalWidth: string;
  totalHeight: string;
  componentSearch: string;
}

export function createGuideBom(): GuideBom {
  return {
    /*
     * Theo khảo sát DOM thực tế trên door-v1.test.tankasoft.com:
     * - Định mức - HTK: tìm "TDA-55" (hệ Tiến Đạt 55, 19 HTK) và chọn HTK đầu
     *   tiên CHƯA có định mức ở chi nhánh dưới đây — mỗi cặp HTK + chi nhánh
     *   chỉ tạo được 1 định mức ("Định mức NVL and chi nhánh đã tồn tại").
     * - Chi nhánh: Quận 12 (ở Hóc Môn cả 19 HTK TDA-55 đều đã có định mức).
     * - Tổng số W/H mặc định: bắt buộc, là SỐ LƯỢNG kích thước W/H (0-10, aria-valuemax=10),
     *   không phải kích thước mm. Các định mức có sẵn dùng 1 x 1.
     * - Thành phần NVL (tab Profile, mặc định): tìm "TDA" và chọn dòng
     *   cùng hệ khung với Định mức - HTK đã chọn ở trên.
     */
    productSearch: 'TDA-55',
    site: 'Quận 12',
    totalWidth: '1',
    totalHeight: '1',
    componentSearch: 'TDA',
  };
}
