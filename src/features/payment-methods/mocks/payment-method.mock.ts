import type { ManagedPaymentMethod } from "../types/payment-method.types";

/**
 * MOCK CONTRACT: khớp 2 phương thức đang xuất hiện trong SEED_ORDERS/SEED_PAYMENTS
 * (cod/bank_transfer), thêm 1 phương thức online (VNPay) đang tắt để minh
 * họa luồng Enable/Disable + Type "online" chưa cần Gateway thật.
 */
export const SEED_PAYMENT_METHODS: ManagedPaymentMethod[] = [
  {
    id: "pm-1",
    code: "cod",
    name: "Tiền mặt khi nhận hàng",
    description: "Khách thanh toán trực tiếp cho nhân viên giao hàng.",
    iconMediaId: null,
    type: "offline",
    instructions: "Vui lòng chuẩn bị đúng số tiền để thuận tiện khi giao hàng.",
    displayOrder: 1,
    isActive: true,
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pm-2",
    code: "bank_transfer",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản trước, đơn được xác nhận sau khi nhận được tiền.",
    iconMediaId: null,
    type: "offline",
    instructions: "Nội dung chuyển khoản: Mã đơn hàng + Số điện thoại.",
    bankName: "Vietcombank",
    bankAccountNumber: "0123456789",
    bankAccountHolder: "CONG TY TNHH BANH CUON TAY HO 127",
    bankBranch: "Chi nhánh Quận 1, TP. Hồ Chí Minh",
    displayOrder: 2,
    isActive: true,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pm-3",
    code: "vnpay",
    name: "VNPay",
    description: "Thanh toán qua cổng VNPay (thẻ ATM/Visa/Mastercard/QR).",
    iconMediaId: null,
    type: "online",
    gateway: "vnpay",
    displayOrder: 3,
    isActive: false,
    isDefault: false,
    minOrderAmount: 20_000,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
