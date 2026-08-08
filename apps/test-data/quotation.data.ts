export interface GuideQuotation {
  customer: string;
  warehouse: string;
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
    warehouse: 'Hóc Môn',
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
      inventorySearch: 'SQ-01-TDA',
      drawingCode: 'D1',
      glass:
        '08-CL-KD-VIFG/CL',    },
  };
}