export interface GuideBom {
  productSearch: string;
  warehouse: string;
  totalWidth: string;
  totalHeight: string;
  componentSearch: string;
}

export function createGuideBom(): GuideBom {
  return {
    /*
     * Theo khảo sát DOM thực tế trên door-v1.test.tankasoft.com:
     * - Định mức - HTK: chọn "SQ-01-TDA-55-1.2" (Cửa sổ mở quay 1 cánh - Tiến Đạt).
     * - Kho hàng: Hóc Môn.
     * - Tổng số W/H mặc định: bắt buộc, dùng kích thước mẫu 1200 x 2200 mm.
     * - Thành phần NVL (tab Profile, mặc định): tìm "TDA" và chọn dòng
     *   cùng hệ khung với Định mức - HTK đã chọn ở trên.
     */
    productSearch: 'SQ-01-TDA-55-1.2',
    warehouse: 'Hóc Môn',
    totalWidth: '1200',
    totalHeight: '2200',
    componentSearch: 'TDA',
  };
}
