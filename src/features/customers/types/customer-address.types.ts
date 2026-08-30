export type ManagedCustomerAddress = {
  id: string;
  customerId: string;
  receiverName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district?: string;
  province?: string;
  note?: string;
  isDefault: boolean;
};
