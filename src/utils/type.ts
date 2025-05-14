export interface Address {
  street: string;
  city: string;
  postCode: string;
  country: string;
}
export interface Item {
  name?: string;
  quantity: number;
  price: number;
  total: number;
}
export interface FormData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;
  clientName: string;
  clientEmail: string;
  description: string;
  paymentTerms: number;
  status: string;
  createdAt: string;
  senderAddress: Address;
  clientAddress: Address;
  items: Item[];
  total: string | number;
  paymentDue: Date | number | string;
}
