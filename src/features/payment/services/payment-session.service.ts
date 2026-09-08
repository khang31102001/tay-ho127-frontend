import { createOrder, type ManagedOrder } from "@/features/orders";
import { createPayment, getPaymentByOrderId, transitionPayment } from "@/features/payments";
import type { CartItem } from "@/features/cart";

import {
  cancelPayment as cancelGatewayPayment,
  checkPaymentStatus,
  confirmMockPayment,
  createPaymentSession as createGatewayPaymentSession,
  failMockPayment,
  retryMockPayment,
} from "./mock-payment-gateway.service";
import type { DigitalWalletProvider, PaymentMethod, PaymentSession } from "../types/payment.types";

const STORAGE_KEY = "tayho-payment-sessions";
const MOCK_DELAY_MS = 300;
/** Mock TTL giữ chỗ — quá hạn mà chưa thanh toán thì tự "cancelled". */
const SESSION_TTL_MS = 15 * 60 * 1000;
/**
 * "processing" chỉ nên tồn tại trong vài giây (thời gian chạy createOrder() +
 * createPayment() + transitionPayment() ở confirmPaymentSession()) — nếu bị
 * gián đoạn giữa chừng (đóng tab, mất mạng, crash trình duyệt) thì catch block
 * trong confirmPaymentSession() không chạy được, session sẽ kẹt mãi ở
 * "processing" mà không nơi nào tự sửa. Quá ngưỡng này khi đọc lại thì tự coi
 * là "failed" để khách còn đường thử lại, không bị treo vĩnh viễn.
 */
const PROCESSING_STALE_MS = 30 * 1000;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): PaymentSession[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PaymentSession[]) : [];
}

function writeStore(sessions: PaymentSession[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/** Mã tham chiếu tạm, KHÁC OrderCode thật (xem generateOrderCode ở features/orders) — chỉ cần đủ ngắn gọn để làm nội dung chuyển khoản/khoá gateway, không cần state machine theo ngày như Order. */
function generateReferenceCode(): string {
  return `PAY${Date.now().toString(36).toUpperCase()}`;
}

async function updateSession(id: string, patch: Partial<PaymentSession>): Promise<PaymentSession> {
  const existing = readStore();
  const session = existing.find((item) => item.id === id);
  if (!session) {
    throw new Error(`Không tìm thấy phiên thanh toán: ${id}`);
  }

  const updated: PaymentSession = { ...session, ...patch, updatedAt: new Date().toISOString() };
  writeStore(existing.map((item) => (item.id === id ? updated : item)));
  return updated;
}

export type CreatePaymentSessionInput = {
  customerId: string | null;
  customerName: string;
  phone: string;
  email?: string;
  items: CartItem[];
  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  isPickup: boolean;
  deliveryAddressSnapshot: string;
  wantsUtensils: boolean;
  note?: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  discountCode?: string;
  promotionId?: string;
  totalAmount: number;
  paymentMethod: Extract<PaymentMethod, "QR" | "DIGITAL_WALLET">;
  digitalWalletProvider?: DigitalWalletProvider;
  paymentMethodCode: string;
  paymentMethodLabel: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  idempotencyKey?: string;
};

/**
 * Tạo Payment Session cho QR/DIGITAL_WALLET — "giữ chỗ", KHÔNG tạo Order
 * thật (xem confirmPaymentSession). Khởi tạo song song 1 gateway session
 * (mock-payment-gateway.service.ts) để mô phỏng trạng thái phía cổng thanh
 * toán, tách biệt hoàn toàn khỏi business snapshot lưu ở đây — thay gateway
 * thật sau này chỉ cần sửa file đó. Cùng idempotencyKey (double click "Tiếp
 * tục thanh toán") trả lại session đang chờ đã tạo trước đó thay vì tạo mới.
 */
export async function createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
  await delay();
  const existing = readStore();

  if (input.idempotencyKey) {
    const alreadyCreated = existing.find(
      (session) => session.idempotencyKey === input.idempotencyKey && session.status === "pending",
    );
    if (alreadyCreated) {
      return alreadyCreated;
    }
  }

  const now = new Date().toISOString();
  const referenceCode = generateReferenceCode();

  await createGatewayPaymentSession({ gatewayReference: referenceCode, amount: input.totalAmount });

  const session: PaymentSession = {
    id: `pay-${Date.now()}`,
    referenceCode,
    status: "pending",
    paymentMethod: input.paymentMethod,
    digitalWalletProvider: input.digitalWalletProvider,
    paymentMethodCode: input.paymentMethodCode,
    paymentMethodLabel: input.paymentMethodLabel,
    customerId: input.customerId,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    items: input.items,
    deliveryMethodCode: input.deliveryMethodCode,
    deliveryMethodLabel: input.deliveryMethodLabel,
    isPickup: input.isPickup,
    deliveryAddressSnapshot: input.deliveryAddressSnapshot,
    wantsUtensils: input.wantsUtensils,
    note: input.note,
    subtotal: input.subtotal,
    shippingFee: input.shippingFee,
    discount: input.discount,
    discountCode: input.discountCode,
    promotionId: input.promotionId,
    totalAmount: input.totalAmount,
    bankName: input.bankName,
    bankAccountNumber: input.bankAccountNumber,
    bankAccountHolder: input.bankAccountHolder,
    idempotencyKey: input.idempotencyKey,
    orderId: null,
    orderCode: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  writeStore([...existing, session]);
  return session;
}

/**
 * Đọc lại session — tự "cancelled" nếu quá TTL mà vẫn "pending"; tự "failed"
 * nếu kẹt "processing" quá lâu (gián đoạn giữa chừng). Khi còn "pending" cũng
 * tự đối chiếu với gateway (checkPaymentStatus) để đồng bộ "failed"/
 * "cancelled" nếu gateway đã báo — đây là chỗ sau này thay bằng polling/
 * webhook thật; "success" KHÔNG được đồng bộ ở đây vì phải đi qua
 * confirmPaymentSession() mới được tạo Order.
 */
export async function getPaymentSessionById(id: string): Promise<PaymentSession | undefined> {
  await delay();
  const session = readStore().find((item) => item.id === id);
  if (!session) {
    return undefined;
  }

  if (session.status === "pending") {
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      return updateSession(id, { status: "cancelled" });
    }

    const gatewaySession = await checkPaymentStatus(session.referenceCode).catch(() => undefined);
    if (gatewaySession && (gatewaySession.status === "failed" || gatewaySession.status === "cancelled")) {
      return updateSession(id, { status: gatewaySession.status });
    }
  }

  if (session.status === "processing" && Date.now() - new Date(session.updatedAt).getTime() > PROCESSING_STALE_MS) {
    return updateSession(id, { status: "failed" });
  }

  return session;
}

/**
 * Khách xác nhận đã thanh toán — nơi DUY NHẤT tạo Order/Payment thật cho
 * luồng QR/DIGITAL_WALLET, đúng yêu cầu "không tạo Order khi online payment
 * chưa success". Gọi mock gateway trước (confirmMockPayment), chỉ khi gateway
 * báo thành công mới createOrder()/createPayment() — tái sử dụng nguyên vẹn
 * createOrder()/createPayment() của features/orders và features/payments,
 * createOrder() vẫn tự tra cứu lại giá/tồn kho thật, không tin subtotal/
 * totalAmount đã snapshot ở session.
 */
export async function confirmPaymentSession(
  id: string,
): Promise<{ session: PaymentSession; order: ManagedOrder }> {
  const session = await getPaymentSessionById(id);
  if (!session) {
    throw new Error(`Không tìm thấy phiên thanh toán: ${id}`);
  }
  if (session.status !== "pending") {
    throw new Error("Phiên thanh toán không còn hiệu lực để xác nhận.");
  }

  await updateSession(id, { status: "processing" });

  try {
    await confirmMockPayment(session.referenceCode);

    const order = await createOrder({
      customerId: session.customerId,
      customerName: session.customerName,
      phone: session.phone,
      email: session.email,
      deliveryAddressSnapshot: session.deliveryAddressSnapshot,
      paymentMethodCode: session.paymentMethodCode,
      deliveryMethodCode: session.deliveryMethodCode,
      items: session.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        note: item.specialInstructions,
        modifiers: item.modifiers?.map((modifier) => ({
          groupId: modifier.groupId,
          optionId: modifier.optionId,
        })),
      })),
      wantsUtensils: session.wantsUtensils,
      note: session.note,
      discount: session.discount,
      discountCode: session.discountCode,
      promotionId: session.promotionId,
      idempotencyKey: session.idempotencyKey,
    });

    // Retry-safe: nếu lần xác nhận trước đã tạo Payment rồi mới bị gián đoạn
    // (đóng tab, mất mạng...), tái sử dụng lại thay vì tạo thêm bản ghi trùng.
    const payment = (await getPaymentByOrderId(order.id)) ?? (await createPayment({
      orderId: order.id,
      orderCode: order.orderCode,
      paymentMethodCode: order.paymentMethodCode,
      paymentMethodLabel: order.paymentMethodLabel,
      amount: order.totalAmount,
    }));

    if (payment.status !== "paid") {
      await transitionPayment(payment.id, "paid", "Khách hàng", "Khách hàng xác nhận đã thanh toán (mock gateway).");
    }

    const finalSession = await updateSession(id, {
      status: "success",
      orderId: order.id,
      orderCode: order.orderCode,
    });

    return { session: finalSession, order };
  } catch (error) {
    await failMockPayment(session.referenceCode).catch(() => undefined);
    await updateSession(id, { status: "failed" });
    throw error;
  }
}

/** Khách tự báo "gặp sự cố" (không có gateway thật để tự phát hiện thất bại) — Order vẫn CHƯA từng được tạo ở nhánh này. */
export async function reportPaymentFailure(id: string): Promise<PaymentSession> {
  await delay();
  const session = readStore().find((item) => item.id === id);
  if (!session) {
    throw new Error(`Không tìm thấy phiên thanh toán: ${id}`);
  }
  await failMockPayment(session.referenceCode).catch(() => undefined);
  return updateSession(id, { status: "failed" });
}

/** Cho thử lại sau khi failed — quay về "pending" để khách bấm xác nhận lại. */
export async function retryPaymentSession(id: string): Promise<PaymentSession> {
  await delay();
  const session = readStore().find((item) => item.id === id);
  if (!session) {
    throw new Error(`Không tìm thấy phiên thanh toán: ${id}`);
  }
  if (session.status !== "failed") {
    throw new Error(`Không thể thử lại phiên thanh toán ở trạng thái "${session.status}".`);
  }
  await retryMockPayment(session.referenceCode).catch(() => undefined);
  return updateSession(id, { status: "pending" });
}

/** Khách chủ động huỷ (bấm "Hủy và quay lại giỏ hàng") — bỏ qua nếu đã thanh toán thành công. */
export async function cancelPaymentSession(id: string): Promise<PaymentSession | undefined> {
  await delay();
  const session = readStore().find((item) => item.id === id);
  if (!session || session.status === "success") {
    return session;
  }
  await cancelGatewayPayment(session.referenceCode).catch(() => undefined);
  return updateSession(id, { status: "cancelled" });
}
