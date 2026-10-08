export type PaymentMethod = {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
};

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  method: string;
};
