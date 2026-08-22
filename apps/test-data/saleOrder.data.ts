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
      inventorySearch: 'SQ-01-XF',
      drawingCode: 'D1',
      glass: '08-CL-KD-VIFG/CL',

    },
  };
}