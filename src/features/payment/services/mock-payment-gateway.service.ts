import type { PaymentStatus } from "../types/payment.types";

/**
 * MOCK PAYMENT GATEWAY — mô phỏng cổng thanh toán thật (VNPay/MoMo/Apple Pay/
 * Google Pay...), tách hoàn toàn khỏi business flow (payment-session.service.ts)
 * và UI. Khi có gateway thật, chỉ cần thay nội dung các hàm dưới đây bằng
 * lệnh gọi API thật — payment-session.service.ts và UI không cần sửa.
 */

/** Gateway chỉ tự sinh 4 trạng thái này — "processing" là trạng thái nghiệp vụ (đang chạy createOrder()), không thuộc gateway. */
export type GatewayPaymentStatus = Extract<PaymentStatus, "pending" | "success" | "failed" | "cancelled">;

export type MockGatewaySession = {
  gatewayReference: string;
  amount: number;
  status: GatewayPaymentStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "tayho-mock-payment-gateway";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): MockGatewaySession[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as MockGatewaySession[]) : [];
}

function writeStore(sessions: MockGatewaySession[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

async function updateGatewaySession(
  gatewayReference: string,
  status: GatewayPaymentStatus,
): Promise<MockGatewaySession> {
  const existing = readStore();
  const session = existing.find((item) => item.gatewayReference === gatewayReference);
  if (!session) {
    throw new Error(`Không tìm thấy phiên thanh toán gateway: ${gatewayReference}`);
  }

  const updated: MockGatewaySession = { ...session, status, updatedAt: new Date().toISOString() };
  writeStore(existing.map((item) => (item.gatewayReference === gatewayReference ? updated : item)));
  return updated;
}

export type CreatePaymentSessionGatewayInput = {
  gatewayReference: string;
  amount: number;
};

/** Khởi tạo phiên thanh toán phía gateway — trạng thái ban đầu luôn "pending". Cùng gatewayReference trả lại session đã tạo (idempotent). */
export async function createPaymentSession(input: CreatePaymentSessionGatewayInput): Promise<MockGatewaySession> {
  await delay();
  const existing = readStore();

  const alreadyCreated = existing.find((item) => item.gatewayReference === input.gatewayReference);
  if (alreadyCreated) {
    return alreadyCreated;
  }

  const now = new Date().toISOString();
  const session: MockGatewaySession = {
    gatewayReference: input.gatewayReference,
    amount: input.amount,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...existing, session]);
  return session;
}

/** Tương đương GET /payment-gateway/sessions/{ref} — kiểm tra trạng thái giao dịch phía gateway (dùng để đồng bộ/polling). */
export async function checkPaymentStatus(gatewayReference: string): Promise<MockGatewaySession> {
  await delay();
  const session = readStore().find((item) => item.gatewayReference === gatewayReference);
  if (!session) {
    throw new Error(`Không tìm thấy phiên thanh toán gateway: ${gatewayReference}`);
  }
  return session;
}

/** Giả lập thanh toán thành công (mock — chưa có gateway thật xác nhận qua webhook). */
export async function confirmMockPayment(gatewayReference: string): Promise<MockGatewaySession> {
  await delay();
  return updateGatewaySession(gatewayReference, "success");
}

/** Giả lập thanh toán thất bại. */
export async function failMockPayment(gatewayReference: string): Promise<MockGatewaySession> {
  await delay();
  return updateGatewaySession(gatewayReference, "failed");
}

/** Cho thử lại sau khi thất bại — quay về "pending". */
export async function retryMockPayment(gatewayReference: string): Promise<MockGatewaySession> {
  await delay();
  return updateGatewaySession(gatewayReference, "pending");
}

/** Khách chủ động huỷ giao dịch (thoát khỏi Payment Page trước khi hoàn tất). */
export async function cancelPayment(gatewayReference: string): Promise<MockGatewaySession> {
  await delay();
  return updateGatewaySession(gatewayReference, "cancelled");
}
