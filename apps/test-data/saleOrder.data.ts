export interface GuideSalesOrder {
  customer: string;
  warehouse: string;
  quotationEmployee: string;
  salesEmployee: string;
  designerEmployee: string;

  /**
   * Dòng HTK được tạo trong bảng Các dòng.
   */
  lineItem: {
    inventorySearch: string;
    drawingCode: string;
    glass: string;
  };
}

export function createGuideSalesOrder(): GuideSalesOrder {
  return {
    /*
     * Theo video:
     * - Khách hàng: chọn dòng đầu tiên.
     * - Kho hàng: Hóc Môn.
     * - Các nhân viên: chọn dòng đầu tiên nếu không truyền tên cụ thể.
     */
    customer: 'Anh Kỳ',
    warehouse: 'Hóc Môn',
    quotationEmployee: '',
    salesEmployee: '',
    designerEmployee: '',

    /*
     * Theo video tạo Đơn bán hàng:
     * tìm một HTK dòng cửa, nhập Mã bản vẽ,
     * chọn kính và xem Các lựa chọn thuộc tính.
     */
    lineItem: {
      /*
       * Chỉ để "XF-55" (không giới hạn dòng SH/SQ cụ thể) vì nhiều biến thể
       * hệ 55 hiện thiếu giá phụ kiện (vd. SH-01/SH-02/SQ-01/SQ-02-XF-55-1.4
       * đều báo "chưa có giá") — để rộng hơn cho searchAndSelectInventory tự
       * thử các biến thể khác còn giá (đã kiểm chứng: SQ-03-XF-55-1.4 có giá).
       */
      inventorySearch: 'XF-55',
      drawingCode: 'D1',
      glass: '08-CL-KD-VIFG/CL',

    },
  };
}