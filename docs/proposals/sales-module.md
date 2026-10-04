# Proposal: nhóm SALES (Đơn hàng, Khách hàng, Thanh toán) — BE + tích hợp FE

Trạng thái: **ĐÃ TRIỂN KHAI** (bước 0–5, một đợt). Phần dưới "Kết quả triển khai" là thực tế đã làm; các mục 1–7 giữ nguyên làm lịch sử đề xuất.

## Kết quả triển khai

**Quyết định đã áp dụng** (từ phần trả lời mục 5): một module Backend `Sales` gộp Đơn hàng + Thanh toán + cấu hình; QR/ví do **nhân viên xác nhận thủ công** (phiên thanh toán, chưa tích hợp cổng); tra cứu đơn của khách vãng lai bằng **mã đơn + SĐT**; mã đơn cấu hình được ở bảng `order_settings` (tiền tố / phần ngày / độ dài số, số thứ tự cấp bằng bộ đếm nguyên tử trong DB); hủy đơn hoàn lượt dùng mã, thanh toán đã thu thì để nhân viên hoàn tay (có cổng `IOrderNotifier` và state machine sẵn để gắn hoàn tiền tự động/thông báo sau); đơn tự đến lấy đi tắt `ready → completed`; phiên thanh toán 15 phút (cấu hình được), hết hạn không xóa giỏ; không kiểm tra tồn kho; đăng nhập khách bằng email + mật khẩu qua Backend (Google để sau); quyền do SuperAdmin tự gán cho role.

**Backend** (`backend`, nhánh `feat/sales-module`): module `Sales` (schema `sales`) — DeliveryMethods, PaymentMethods, OrderOptions, OrderSettings, Orders (+items/modifiers/lịch sử), Payments (+nhật ký bất biến), PaymentSessions; Catalog thêm `ICatalogPricingQueryService` + `IPromotionRedemptionService` (tăng/giảm `usage_count` nguyên tử); Customer thêm `ICustomerLookupService`; adapter ở Host. Migration `sales.InitialCreate`, `SalesSeeder` (trong `seed`, chỉ bật COD), `SalesDemoSeeder` (trong `seed-demo`). Kiểm chứng: 332 unit + 44 architecture + 76 integration test đều pass trên Postgres 16 thật (gồm 5 test luồng Sales đầu-cuối).

**Frontend** (`fontend`, nhánh `feat/sales-module`): 3 mục Cấu hình + Cấu hình đơn hàng (mới) + Đơn hàng + Thanh toán (kèm bảng "phiên chờ xác nhận") + Mã giảm giá (nối Backend vì đơn phụ thuộc) đều gọi Backend qua BFF; Site: giỏ hàng/Checkout/theo dõi đơn/lịch sử đơn/trang thanh toán QR; đăng nhập–đăng ký–phiên khách thật (cookie HttpOnly, `app/api/customer/*`). Đã xóa các mock đơn hàng/thanh toán/cổng giả/khách Site. Còn mock: `forgot-password`.

**Cần lưu ý khi triển khai**
- Chạy `migrator all` (migrate + seed). Phương thức chuyển khoản/ví được seed ở trạng thái **tắt** (số tài khoản mẫu là giả) — vào Cấu hình → Phương thức thanh toán, nhập tài khoản thật rồi bật.
- Đơn/phiên cũ trong `localStorage` (`tayho-admin-orders`...) không còn hiển thị; giỏ hàng cũ được tự làm sạch lựa chọn lỗi thời.
- Đăng ký khách giờ **bắt buộc email** và mật khẩu ≥ 8 ký tự (đúng ràng buộc của Backend).
- Smoke test FE→BE (mọi bước phải đúng mã HTTP): `docs/proposals/sales-smoke-test.ps1` (cần Backend + FE đang chạy trên DB test/dev).

---

Phạm vi quét: sidebar nhóm SALES + toàn bộ thứ Checkout/Đơn hàng/Thanh toán phụ thuộc vào (giỏ hàng, phương thức giao/thanh toán, tùy chọn đơn hàng, mã giảm giá, đăng nhập khách).

## 1. Hiện trạng (đã kiểm tra trong code)

| Mục | Route Admin | Backend | Dữ liệu hiện tại |
|---|---|---|---|
| Khách hàng | `/admin/sales/customers` (+ địa chỉ) | **Đã có** module `Customer` (CRUD admin, địa chỉ, tự phục vụ `/customers/me`, đăng nhập khách `/customer/auth` gồm Google) | Admin: Backend. **Site** (đăng nhập/đăng ký/lịch sử): vẫn mock |
| Đơn hàng | `/admin/sales/orders` | **Chưa có** | mock `localStorage` (`tayho-admin-orders`) |
| Thanh toán | `/admin/sales/payments` | **Chưa có** | mock `localStorage` (+ phiên thanh toán + cổng giả `tayho-mock-payment-gateway`) |
| *(tiền đề)* Phương thức giao hàng | `/admin/settings/delivery-methods` | **Chưa có** | mock |
| *(tiền đề)* Phương thức thanh toán | `/admin/settings/payment-methods` | **Chưa có** | mock |
| *(tiền đề)* Tùy chọn chung đơn hàng (nước mắm, rau…) | `/admin/settings/order-options` | **Chưa có** | mock |

Schema SQL của nhóm đã có sẵn: `orders`, `order_items`, `order_item_modifiers`, `order_status_histories`, `payments`, `payment_transactions`, `payment_sessions`, `delivery_methods`, `payment_methods`, `order_option_groups`, `order_option_values` (+ các enum trạng thái).

Site đang chạy luồng: giỏ hàng (localStorage) → Checkout → (COD: tạo đơn ngay | QR/Ví: tạo "phiên thanh toán" rồi tạo đơn khi khách bấm xác nhận) → trang theo dõi `/don-hang/{mã}` + lịch sử `/tai-khoan/don-hang`.

## 2. Phát hiện quan trọng (phải xử lý khi chuyển sang Backend)

1. **Backend phải tự tính tiền, không tin Frontend.** `createOrder` hiện chỉ tính lại giá món/modifier/phí giao từ Catalog, nhưng vẫn **tin `discount`, `shippingDiscount`, `promotionId` do trình duyệt gửi**. Ở Backend, giảm giá phải được tính lại bằng đúng logic mã giảm giá đã có (`PromotionValidationService`) tại thời điểm tạo đơn.
2. **Khách tự bấm "đã thanh toán" không dùng được ở Backend.** Mock QR/Ví đánh dấu đơn `paid` ngay khi khách bấm xác nhận. Với tiền thật, trạng thái "đã thanh toán" chỉ được đặt bởi **cổng thanh toán (webhook)** hoặc **nhân viên xác nhận** — xem câu hỏi 2.
3. **Tra cứu đơn công khai bằng mã đơn làm lộ dữ liệu cá nhân** (tên, SĐT, địa chỉ). Backend cần xác thực người xem (mã đơn + SĐT, hoặc đăng nhập) — xem câu hỏi 3.
4. **Ranh giới module.** Kiến trúc cấm module tham chiếu module khác. Đơn hàng cần dữ liệu của Catalog (giá món, modifier), mã giảm giá (nằm trong Catalog) và Customer ⇒ phải đi qua **port ở module Sales + adapter ở Host** (đúng mẫu `IUserPermissionsProvider`), không gọi trực tiếp.
5. **Race condition cần chặn ở DB:** trùng `idempotency_key` (double-click), trùng `order_code`, vượt `usage_limit` mã giảm giá khi nhiều đơn cùng lúc (tăng `usage_count` phải nguyên tử).
6. **Phương thức giao/thanh toán và tùy chọn đơn hàng nằm ở nhóm "Cấu hình" nhưng là tiền đề của Đơn hàng** (đơn tra lại phí giao/điều kiện thanh toán/phụ phí từ chúng). Phải làm trước Đơn hàng.
7. **Đăng nhập khách trên Site vẫn là mock** (`app/api/auth/*`, tài khoản demo cố định), trong khi Backend đã có đăng nhập khách (JWT). Lịch sử đơn của khách cần danh tính thật.
8. **Nhiều khái niệm đang trộn**: `PaymentMethod` ở Checkout (CASH/QR/DIGITAL_WALLET) khác `PaymentMethodGroup` ở Admin (cod/card/bank_transfer/e_wallet) và `payment_channel` trong SQL — cần một quy ước ánh xạ duy nhất ở Backend.

## 3. Thiết kế đề xuất

### 3.1 Một module Backend `Sales`
Gộp **Orders + Payments + DeliveryMethods + PaymentMethods + OrderOptions** vào một module `Sales` (schema `sales`), cùng một `SalesDbContext`:
- Đơn, thanh toán và 3 cấu hình trên dùng chung giao dịch/transaction DB ⇒ không cần port giữa chúng.
- Chỉ còn **3 port ra ngoài**: Catalog (giá + khuyến mãi) và Customer (xác thực/liên kết khách).
- Sidebar vẫn giữ nguyên (Cấu hình/Sales chỉ là cách nhóm menu).
- `Customer` giữ nguyên là module riêng (đã có).

### 3.2 Thực thể
- **DeliveryMethod**: `code` (duy nhất), tên, mô tả, loại `delivery|pickup`, `baseFee`, `freeShippingThreshold?`, thời gian ước tính, `pickupAddress?` (chỉ pickup), thứ tự, bật/tắt, `isDefault` (chỉ một mặc định).
- **PaymentMethod**: `code`, tên, nhóm `cod|card|bank_transfer|e_wallet`, `gateway?`, hướng dẫn, thông tin tài khoản ngân hàng nhúng, `iconMediaId?` (chuỗi mờ), min/max đơn hàng, thứ tự, bật/tắt, `isDefault`.
- **OrderOptionGroup (+Value)**: nhóm tùy chọn chung cho cả đơn (đơn/nhiều lựa chọn, bắt buộc?), giá cộng thêm **một lần cho cả đơn** (không nhân số lượng) — giữ đúng hành vi hiện tại.
- **Order**: mã đơn duy nhất, `idempotencyKey` (duy nhất), `customerId?` (id mờ, không FK; khách vãng lai được phép), **snapshot** tên/SĐT/email/địa chỉ/phương thức giao + thanh toán (code + nhãn)/`isPickup`, tiền (`subtotal`, `discount`, `discountCode`, `promotionId`, `shippingDiscount`, `deliveryFee`, `totalAmount`), `orderStatus`, `paymentStatus`, `wantsUtensils`, ghi chú, mốc hoàn thành/hủy.
- **OrderItem** (+ **OrderItemModifier**): snapshot tên/ảnh/đơn giá/modifier tại thời điểm đặt, không FK sang Catalog.
- **OrderStatusHistory**: mỗi lần đổi trạng thái đơn (từ, đến, thời điểm, người đổi, ghi chú).
- **Payment**: 1 giao dịch của 1 đơn (số tiền, trạng thái, gateway, mã tham chiếu cổng, mốc paid/failed) + **PaymentTransaction** (nhật ký bất biến: created/charge/refund/cancel/retry).
- **PaymentSession**: "giữ chỗ" đơn cho QR/Ví (snapshot giỏ + tiền, mã tham chiếu duy nhất, hết hạn `expiresAt`, liên kết `orderId` sau khi thành công).

### 3.3 Quy tắc tiền (tính ở Backend, làm tròn VND)
```
subtotal      = Σ (đơn giá món (Catalog) + Σ phụ thu modifier) × số lượng  +  Σ phụ thu tùy chọn đơn hàng
deliveryFee   = 0 nếu subtotal ≥ freeShippingThreshold, ngược lại baseFee   (pickup: baseFee của method pickup)
discount, shippingDiscount = kết quả tính lại từ mã giảm giá (không nhận từ client)
totalAmount   = subtotal − discount + deliveryFee − shippingDiscount
```
Kiểm tra: món đang bán (`isActive`), thực đơn/modifier thuộc món, phương thức giao/thanh toán đang bật, đơn nằm trong min/max của phương thức thanh toán.

### 3.4 Máy trạng thái (giữ đúng bản FE đang dùng, kiểm tra lại ở Backend)
- **Đơn**: `pending → confirmed → preparing → ready → delivering → completed`; hủy được từ mọi trạng thái trước `completed`; `completed`/`cancelled` là cuối. Mỗi lần đổi ghi `order_status_histories`.
- **Thanh toán**: `pending → paid|failed|cancelled`, `paid → refunded`, `failed → pending|cancelled`. Mỗi lần đổi ghi `payment_transactions` và đồng bộ `orders.payment_status`.
- **Phiên thanh toán**: `pending → processing → success|failed|cancelled`, hết hạn thì coi như `cancelled`.

### 3.5 Luồng
- **COD / thanh toán khi nhận**: `POST /orders` → tạo Order (`pending`) + Payment (`pending`) trong **một transaction**, tăng lượt dùng mã nguyên tử; trả mã đơn.
- **QR / Ví**: `POST /payment-sessions` (chưa tạo đơn) → khách thanh toán → xác nhận (theo câu hỏi 2) → **một transaction**: tạo Order + Payment `paid` + đóng phiên. Phiên hết hạn thì không tạo đơn.
- Tạo đơn **idempotent** theo `idempotencyKey` (lần gọi lại trả đúng đơn cũ).

### 3.6 Port Sales ↔ module khác (adapter ở Host)
| Port (định nghĩa trong Sales) | Cung cấp bởi | Việc |
|---|---|---|
| `ICatalogPricingProvider` | Catalog (thêm một query service gọn: giá + modifier của danh sách món, chỉ món đang bán) | Tra giá thật lúc đặt đơn |
| `IPromotionPricing` | Catalog (đã có `PromotionValidationService`; **thêm** `Redeem` nguyên tử có kiểm tra `usage_limit`) | Tính lại giảm giá + ghi nhận lượt dùng |
| `ICustomerDirectory` | Customer | Xác nhận `customerId` hợp lệ khi có token khách (khách vãng lai vẫn đặt được) |

### 3.7 API
- **Công khai (khách vãng lai):** `GET /sales/public/delivery-methods`, `/payment-methods`, `/order-options` (chỉ đang bật; **không lộ** cấu hình nội bộ); `POST /orders`; `POST /payment-sessions`; `GET /payment-sessions/{id}`; tra cứu đơn theo mã (có xác thực người xem — câu hỏi 3). Có rate limit.
- **Khách đã đăng nhập:** `GET /customers/me/orders` (lịch sử), chi tiết đơn của mình.
- **Admin (có quyền):** CRUD `delivery-methods`, `payment-methods`, `order-options`; `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/status`; `GET /payments`, `GET /payments/{id}`, `POST /payments/{id}/transition`.
- **Quyền mới:** `delivery-methods.*`, `payment-methods.*`, `order-option-groups.*`, `orders.view|update-status|cancel`, `payments.view|manage` (+ gắn cho các mục menu hiện đang không có quyền).

## 4. Kế hoạch từng bước (mỗi bước một cặp PR Backend + Frontend, merge tuần tự, test CRUD trên Render như các nhóm trước)

| Bước | Nội dung | Kết quả kiểm chứng |
|---|---|---|
| **0** | Chuẩn bị ở **Catalog**: query service giá + modifier theo danh sách món; `Redeem` mã giảm giá nguyên tử (kiểm tra giới hạn, tăng `usage_count`); test đồng thời | Test đơn vị + test song song |
| **1** | Module **Sales** (khung) + **cấu hình**: DeliveryMethods, PaymentMethods, OrderOptions — CRUD admin, API công khai cho Checkout, seed từ mock; FE 3 mục "Cấu hình" + Cart/Checkout đọc từ API công khai | CRUD + công khai + Checkout hiện đúng phương thức |
| **2** | **Đơn hàng (luồng COD)**: tạo đơn phía server (tính tiền + giảm giá + idempotency), admin xem/lọc/đổi trạng thái + lịch sử, tra cứu đơn có xác thực; FE Checkout COD, trang theo dõi, admin Đơn hàng | Tạo đơn thật → admin xử lý → khách theo dõi |
| **3** | **Thanh toán**: Payment + nhật ký + admin Thanh toán; **phiên thanh toán QR/Ví** theo cách xác nhận bạn chọn (câu hỏi 2); hết hạn phiên | Luồng QR/Ví đầu-cuối |
| **4** | **Khách hàng trên Site → Backend**: đăng nhập/đăng ký/Google qua `/customer/auth` (cookie HttpOnly qua BFF như Admin), lịch sử đơn thật, địa chỉ đã lưu; bỏ mock `app/api/auth/*` và `site-customer-bridge` | Đăng nhập thật + lịch sử đơn |
| **5** | Dọn dẹp + seed demo + rà soát bảo mật (rate limit, PII, quyền) + tài liệu | Checklist bảo mật + dữ liệu mẫu 4+ dòng/bảng |

Mỗi bước có: unit test + integration test (CI), migration riêng, gắn quyền menu, báo cáo CHANGE REPORT. Sau mỗi PR Backend: migrate + seed + test API trên Render.

## 5. Cần bạn quyết định (mình không tự suy diễn)

1. **Gộp một module `Sales`** (đề xuất) hay tách (`Ordering`, `Payments`, `Settings`)? --> tao cần tác để dễ quản lý và kiểm sát mở rộng nghiệp vụ sau này
2. **Xác nhận thanh toán QR / Ví** — quan trọng nhất:
   - (a) **Nhân viên xác nhận thủ công** trong Admin (đối chiếu sao kê) — không cần tích hợp, làm ngay được *(đề xuất cho giai đoạn đầu)*;
   - (b) **Tích hợp cổng thanh toán thật** (VNPay / MoMo / ZaloPay / PayOS / SePay… — cho mình biết cổng nào, kèm tài liệu/sandbox) qua webhook.
   Apple Pay / Google Pay chỉ có ý nghĩa khi có cổng hỗ trợ; nếu chọn (a), hai phương thức này chỉ là cấu hình hiển thị, chưa thu tiền thật.
   -> tao chọn a trước
3. **Tra cứu đơn công khai:** yêu cầu **mã đơn + SĐT đặt hàng** (đề xuất) --> chọn cách này, 
4. **Mã đơn:** mock sinh `TH127-yymmdd-00128` (tiền tố, ngày, **số thứ tự trong ngày** reset mỗi ngày; dữ liệu seed cũ dạng `DH00001`) --> tạo một bảng setting mã đơn, để phục vụ setting chung cho đơn hàng, và các nghiệp vụ liên quan đơn hàng tạo một setting riêng. Mã tuần tự thì dễ đoán ⇒ gắn với câu 3. Đề xuất: **giữ đúng định dạng này** (đã có cấu hình), cấp số bằng bộ đếm theo ngày trong DB (không trùng khi đặt đồng thời), và bắt buộc xác thực SĐT khi tra cứu. Hay bạn muốn thêm phần ngẫu nhiên không đoán được?
5. **Hủy đơn:** có hoàn lại **lượt dùng mã giảm giá** khi đơn bị hủy không (đề xuất: có)? Đơn đã `paid` bị hủy thì tự chuyển thanh toán sang `refunded` hay để nhân viên xử lý thủ công (đề xuất: thủ công)? --> theo đề xuất trước sau nhưng hay sử lý nghiệp vụ hướng này mở để sau này tao có tích hợp thanh toán tự động có thể tự hoàn tiền
6. **Đơn tự đến lấy (pickup):** có cho đi tắt `ready → completed` (bỏ bước "Đang giao") không (đề xuất: có)? --> theo đề xuất
7. **Phiên thanh toán QR/Ví hết hạn sau bao lâu** (đề xuất 15 phút)? Hết hạn có giữ giỏ hàng của khách không (đề xuất: giữ, FE không xóa giỏ)? --> theo đề xuất
8. **Tồn kho:** schema chưa có tồn kho ⇒ đề xuất **không** kiểm tra tồn kho (chỉ kiểm tra món đang bán). Đồng ý? --> ko cần kiểm tra tồn kho bỏ bước này, sau này tích hợp kho sau
9. **Đăng nhập khách trên Site (bước 4):** làm trong đợt này (đề xuất) hay tách thành đề xuất riêng? Nếu làm: Google Sign-In cần `GoogleAuth:ClientId` cấu hình trên Render. --> tích hợp đang nhập cho user identify bth tích hợp googleAuth sau
10. **Thông báo** (email/SMS khi có đơn, khi đổi trạng thái): **ngoài phạm vi** đợt này (cần nhà cung cấp). Đồng ý? --> có thông báo chổ này sử lý mở để sau tích hợp nah2 cung cấp vào
11. **Quyền mặc định:** ngoài SuperAdmin, role nào được xem/xử lý đơn và thanh toán (ví dụ nhân viên chỉ xem + đổi trạng thái, chỉ quản lý được hoàn tiền/hủy)? --> cái này để supper admin tự tạo quyền
12. **Thứ tự bước 0–5** ở mục 4 có phù hợp không (đề xuất làm Cấu hình trước Đơn hàng vì Đơn hàng phụ thuộc)?  --> theo tao làm bảng cấu hình riêng chung phục vụ cho nghiệp vụ đơn hàng

## 6. Ngoài phạm vi (đợt này)
Vận chuyển/giao hàng thực tế (tài xế, định vị), phí theo quận/huyện, tồn kho, hoàn tiền tự động qua cổng, thông báo email/SMS, báo cáo doanh thu, SEO/Nội dung (nhóm khác).

## 7. Rủi ro đã nhận diện
- **Tiền thật**: sai ở đây thiệt hại trực tiếp ⇒ tính tiền chỉ ở Backend, test kỹ làm tròn/giảm giá/giới hạn mã, transaction cho "tạo đơn + thanh toán + lượt dùng mã".
- **PII** (tên, SĐT, địa chỉ): giới hạn quyền xem, không trả ra API công khai ngoài người sở hữu đơn, rate limit tra cứu để chống dò mã đơn.
- **Đổi lớn ở Checkout**: Frontend hiện tự tạo đơn bằng mock; chuyển sang Backend là thay đổi hành vi nhạy cảm ⇒ giữ nguyên UI, chỉ đổi service, kiểm tra từng trường hợp (COD, QR, lỗi mạng, bấm đúp, hết hạn phiên).
- **Dữ liệu mock cũ** (đơn trong `localStorage` của trình duyệt, id `order-…`) sẽ không còn hiển thị sau khi chuyển.
- **Cổng thanh toán** (nếu chọn 2b): phụ thuộc bên thứ ba, cần khóa bí mật cấu hình trên Render (không commit), xác thực chữ ký webhook, xử lý callback lặp.
