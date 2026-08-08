export interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

export function createGuideCustomer(): CustomerData {
  const timestamp = Date.now();

  return {
    name: `Khách hàng tự động ${timestamp}`,
    email: `customer${timestamp}@test.com`,
    phone: '0901234567',
  };
}