export type Order = {
  id: string;
  code: string;
  customerId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
};
