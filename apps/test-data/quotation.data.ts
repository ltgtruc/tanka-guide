export interface GuideQuotation {
  customer: string;
  site: string;
  quotationEmployee: string;
  salesEmployee: string;
  designerEmployee: string;

  /**
   * Danh sách HTK sẽ tạo trong bảng Các dòng.
   */
  lineItem: {
    inventorySearch: string;
    drawingCode: string;
    glass: string;
  };
}

export function createGuideQuotation(): GuideQuotation {
  return {
    /*
     * Giữ nguyên dữ liệu bước 5 đang chạy ổn.
     */
    customer: '',
    site: 'Hóc Môn',
    quotationEmployee: '',
    salesEmployee: '',
    designerEmployee: '',

    /*
     * Video đang tạo 2 dòng.
     *
     * Chuỗi rỗng nghĩa là chọn dòng đầu tiên
     * trong danh sách HTK.
     */
    lineItem: {
      // SQ-01-TDA-55-1.2 ở chi nhánh Hóc Môn thiếu giá tay nắm CZH33-D-L
      // ("Chưa có giá"); SQ-03-XF-55-1.4 đã kiểm chứng có đủ giá.
      inventorySearch: 'SQ-03-XF-55',
      drawingCode: 'D1',
      glass:
        '08-CL-KD-VIFG/CL',    },
  };
}