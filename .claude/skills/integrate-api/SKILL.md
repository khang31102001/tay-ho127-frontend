````markdown
---
name: integrate-api
description: >
  Thiết kế, mock, kết nối, chuẩn hóa hoặc debug API integration trong project
  Next.js, React và TypeScript hiện tại. Sử dụng skill này khi người dùng yêu
  cầu kết nối backend, tạo mock API, chuẩn hóa request/response, service layer,
  API client, DTO/type, authentication request, pagination, error handling,
  loading state, hoặc muốn UI có thể chuyển từ mock data sang backend thật
  mà không phải sửa lại toàn bộ component.
---

# Integrate API

## Mục tiêu

Xây dựng kiến trúc API theo hướng:

- Dễ hiểu.
- Dễ thay backend.
- Type-safe.
- UI không phụ thuộc trực tiếp vào HTTP implementation.
- Mock API và Real API có thể thay thế dễ dàng.
- Error handling rõ ràng.
- Không over-engineering.
- Phù hợp kiến trúc hiện tại của project.

Mục tiêu quan trọng:

```text
MOCK API
   ↓
REAL API
````

không được làm UI phải viết lại toàn bộ.

---

# 1. Nguyên tắc quan trọng nhất

KHÔNG viết `fetch()` hoặc request trực tiếp lung tung trong UI component.

Trước khi code phải kiểm tra:

1. Project hiện đang gọi API bằng gì.
2. Đã có API client chưa.
3. Đã có service layer chưa.
4. Đã có auth handling chưa.
5. Đã có DTO/type chưa.
6. Đã dùng TanStack Query, SWR, Axios hay fetch native chưa.
7. Project dùng Server Component hay Client Component cho data fetching.
8. Có mock API hiện tại không.

Ưu tiên sử dụng convention đang có nếu hợp lý.

---

# 2. Kiến trúc mong muốn

Ưu tiên tư duy:

```text
UI
 ↓
Feature Logic / Hook / Server Logic
 ↓
Service
 ↓
API Client
 ↓
Backend
```

Không bắt buộc phải tạo đủ tất cả layer.

Chỉ tạo layer khi nó thực sự mang lại giá trị.

---

# 3. API Client

Nếu project đã có API client thì phải reuse.

API client có thể chịu trách nhiệm:

* Base URL.
* Header.
* Authentication token.
* Content-Type.
* Serialization.
* Parse response.
* Common error handling.
* Timeout.
* Request config.

Không lặp lại những logic này trong từng service.

Ví dụ về responsibility:

```text
apiClient
→ chịu trách nhiệm giao tiếp HTTP.

productService
→ chịu trách nhiệm nghiệp vụ Product API.

ProductCard
→ chỉ chịu trách nhiệm UI.
```

---

# 4. Service Layer

Service nên đại diện cho domain operation.

Ví dụ tốt:

```ts
productService.getProducts()
productService.getProductById()
authService.login()
authService.register()
orderService.createOrder()
```

Tránh để UI gọi kiểu:

```ts
fetch("/api/products")
```

ở nhiều nơi khác nhau.

Service phải che bớt chi tiết HTTP không cần thiết khỏi UI.

---

# 5. Không tạo Generic Service vô nghĩa

Không tạo kiểu:

```ts
BaseService<T>
GenericRepository<T>
ApiManager<T>
RequestHandler<T>
```

chỉ vì muốn code trông "enterprise".

Chỉ tạo abstraction generic khi có nhiều use case thực sự giống nhau.

Ưu tiên code rõ ràng hơn code quá generic.

---

# 6. API Contract

Trước khi implement endpoint phải xác định:

* URL.
* HTTP Method.
* Path params.
* Query params.
* Request body.
* Response body.
* Error response.
* Authentication.
* Pagination.
* Sorting.
* Filtering.

Nếu backend chưa tồn tại:

KHÔNG tự bịa contract như thể đã xác nhận.

Phải đánh dấu rõ:

```text
MOCK CONTRACT
```

hoặc:

```text
TEMPORARY CONTRACT
```

---

# 7. TypeScript Types

Không sử dụng `any` nếu có thể xác định type.

Phân biệt khi cần:

```text
API DTO
   ↓
Mapper / Normalization
   ↓
Frontend Model
   ↓
UI
```

Ví dụ:

Backend trả:

```ts
type ProductDto = {
  product_id: number;
  product_name: string;
  sale_price: number;
};
```

Frontend có thể normalize thành:

```ts
type Product = {
  id: number;
  name: string;
  price: number;
};
```

Nhưng không tạo mapper nếu backend contract đã phù hợp hoàn toàn với frontend.

---

# 8. Mock API

Khi backend chưa sẵn sàng:

Mock API phải được thiết kế để sau này thay bằng Real API dễ dàng.

Không để mock data nằm trực tiếp trong JSX.

Không:

```tsx
const products = [
  ...
];
```

bên trong page nếu data đó đang mô phỏng backend.

Ưu tiên:

```text
mock/
services/
fixtures/
```

hoặc structure phù hợp với project hiện tại.

---

# 9. Mock Service

Mock và Real Service nên có interface sử dụng tương tự.

Ví dụ tư duy:

```ts
productService.getProducts()
```

UI không cần biết phía sau đang là:

```text
MockProductService
```

hay:

```text
RealProductService
```

Không nhất thiết phải dùng Dependency Injection Container.

Giải pháp đơn giản được ưu tiên.

---

# 10. Mock Data

Mock data phải đủ thực tế để test UI.

Nên có khi phù hợp:

* Normal data.
* Empty data.
* Long text.
* Missing optional image.
* Pagination.
* Error.
* Loading simulation.

Không tạo mock quá phức tạp nếu feature không cần.

---

# 11. Environment Variables

Base URL hoặc environment-specific config phải dùng environment variable.

Ví dụ:

```text
NEXT_PUBLIC_API_URL
```

chỉ khi giá trị thực sự cần expose client-side.

Không expose secret bằng `NEXT_PUBLIC_*`.

Không hard-code production URL trong component.

---

# 12. Server vs Client Fetching

Trước khi chọn cách fetch data phải xem feature thực tế.

## Ưu tiên Server-side khi:

* Data dùng để render page ban đầu.
* SEO quan trọng.
* Không cần browser-only behavior.
* Không cần client interaction để request.

## Client-side khi:

* Search realtime.
* Filter interaction.
* Infinite scroll.
* Polling.
* User action thay đổi data.
* Feature cần local interactive state.

Không biến Client Component thành mặc định.

---

# 13. Không tự thêm Data Fetching Library

Không tự cài:

* TanStack Query.
* SWR.
* Axios.

nếu project chưa có và use case chưa cần.

Trước tiên kiểm tra:

1. Native fetch có đủ không?
2. Project đã có library chưa?
3. Có caching/state complexity thực sự không?
4. Library có đem lại lợi ích rõ ràng không?

Nếu project đã dùng TanStack Query hoặc SWR, ưu tiên theo pattern hiện tại.

---

# 14. Loading State

UI liên quan API phải xử lý loading khi cần.

Có thể sử dụng:

* Skeleton.
* Spinner.
* Disabled state.
* Loading text.

Không để user click submit nhiều lần khi request đang chạy.

---

# 15. Empty State

Phân biệt:

```text
Request thành công nhưng không có dữ liệu
```

với:

```text
Request lỗi
```

Empty state phải có UX hợp lý.

Ví dụ:

```text
"Chưa có sản phẩm."
```

không phải:

```text
"Đã xảy ra lỗi."
```

---

# 16. Error Handling

Phân loại khi cần:

* Network error.
* Validation error.
* Unauthorized.
* Forbidden.
* Not Found.
* Server Error.
* Business Error.

Không cần xây hệ thống error enterprise nếu application nhỏ.

Nhưng không được swallow error im lặng.

---

# 17. Error Message cho User

Không hiển thị raw backend message trực tiếp nếu:

* chứa thông tin kỹ thuật;
* stack trace;
* database detail;
* security-sensitive information.

UI nên hiển thị message phù hợp với user.

Technical error có thể log theo cơ chế project.

---

# 18. Authentication

Nếu feature có authentication:

Trước khi code phải inspect auth hiện tại.

Kiểm tra:

* Login flow.
* Session.
* Cookie.
* Token.
* Refresh token.
* Route protection.
* Server auth.
* Client auth.

Không tạo một cơ chế token thứ hai song song.

---

# 19. Token Storage

Không mặc định lưu access token vào `localStorage`.

Phải xem architecture backend/frontend hiện tại.

Nếu hệ thống sử dụng secure cookie hoặc session thì phải tôn trọng pattern đó.

Không thay đổi auth architecture chỉ vì muốn request nhanh hơn.

---

# 20. Form + API

Form nên phân tách responsibility:

```text
Form UI
 ↓
Validation
 ↓
Submit Handler
 ↓
Service
 ↓
API
```

Không để Input component biết endpoint.

Ví dụ:

```text
Input
→ UI Primitive

LoginForm
→ Form interaction

authService
→ API
```

---

# 21. Request State

Khi phù hợp, request có thể có:

```text
idle
loading
success
error
```

Không duplicate state nếu fetching library hiện tại đã quản lý nó.

---

# 22. Mutation

Đối với:

* Create.
* Update.
* Delete.
* Login.
* Register.

Phải cân nhắc:

* Disable submit.
* Duplicate request.
* Optimistic update nếu cần.
* Refresh/invalidate data.
* Error message.
* Success feedback.

Không dùng optimistic update nếu complexity không đáng.

---

# 23. Pagination

Nếu API có pagination phải xác định contract.

Ví dụ:

```text
page
pageSize
total
items
```

hoặc contract backend thật.

Không tự giả định pagination format nếu backend đã có format khác.

UI pagination không nên phụ thuộc trực tiếp vào raw response nếu normalization cần thiết.

---

# 24. Filter & Sort

Filter/sort params nên được quản lý rõ ràng.

Ví dụ:

```ts
type ProductQuery = {
  search?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
};
```

Không tạo URL query bằng string nối thủ công khắp codebase.

---

# 25. Request Duplication

Nếu nhiều component cùng cần một data source:

Xác định data ownership.

Không để nhiều child component gọi cùng một endpoint độc lập nếu không cần.

Nhưng cũng không đưa tất cả data vào global state một cách máy móc.

Chọn scope nhỏ nhất hợp lý.

---

# 26. API Naming

Service method phải dùng business intent.

Tốt:

```text
getProducts
getProductById
createOrder
login
forgotPassword
```

Không tốt:

```text
callApi1
sendData
requestData
postRequest
fetchSomething
```

---

# 27. Folder Structure

Phải tôn trọng structure hiện tại của repository.

Nếu project chưa có convention rõ, có thể cân nhắc:

```text
src/
├── services/
│   ├── api-client.ts
│   ├── auth.service.ts
│   └── product.service.ts
│
├── types/
│
├── mocks/
│
└── features/
```

Đây chỉ là tham khảo.

KHÔNG tự restructure toàn bộ codebase nếu user chỉ yêu cầu thêm một endpoint.

---

# 28. Response Normalization

Nếu backend có response wrapper kiểu:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

thì nên xử lý wrapper ở nơi phù hợp.

Không để mọi component phải viết:

```ts
response.data.data
```

nếu có thể normalize cleanly.

---

# 29. Backend Independence

Mục tiêu:

Nếu backend đổi từ mock sang ASP.NET API thật:

UI không phải rewrite.

Tốt:

```text
ProductPage
    ↓
productService.getProducts()
```

Sau này chỉ thay implementation phía service/API client.

Không tốt:

```text
ProductPage
→ hard-code mock

ProductCard
→ tự fetch

SearchBar
→ gọi endpoint riêng

Filter
→ tự build URL
```

---

# 30. Request/Response Contract phải rõ

Khi tạo mock API mới, cần định nghĩa rõ:

```text
Endpoint
Method
Request
Response
Error
```

Ví dụ:

```text
POST /auth/login

Request:
{
  phone: string;
  password: string;
}

Response:
{
  user: User;
  accessToken?: string;
}

Possible Errors:
400 Validation
401 Invalid Credentials
```

Nếu đây chỉ là mock contract, phải nói rõ.

---

# 31. Không Over-engineering

Không tự động thêm:

* Repository Pattern.
* Unit of Work.
* Dependency Injection Container.
* CQRS.
* Event Bus.
* Generic DTO mapper.
* Generic API Repository.

Frontend không cần áp backend enterprise architecture một cách máy móc.

Chọn kiến trúc đơn giản nhất đáp ứng:

```text
Separation
+ Testability
+ Maintainability
+ Replaceability
```

---

# 32. API Debugging

Nếu API lỗi, debug theo thứ tự:

1. Endpoint.
2. HTTP method.
3. Environment URL.
4. Request params.
5. Request body.
6. Header.
7. Authentication.
8. CORS nếu liên quan.
9. Response status.
10. Response shape.
11. Parsing/normalization.
12. UI consumption.

Không sửa UI trước khi biết API response thực tế.

---

# 33. Khi Backend Contract thay đổi

Không patch từng component.

Tìm boundary:

```text
DTO
Mapper
Service
API Client
```

và sửa tại nơi responsibility phù hợp.

---

# 34. Implementation Workflow

Luôn làm theo:

```text
UNDERSTAND FEATURE
        ↓
INSPECT EXISTING API ARCHITECTURE
        ↓
DEFINE CONTRACT
        ↓
DEFINE TYPES
        ↓
SERVICE / CLIENT
        ↓
MOCK OR REAL IMPLEMENTATION
        ↓
CONNECT FEATURE
        ↓
CONNECT UI
        ↓
LOADING / EMPTY / ERROR
        ↓
VERIFY
```

---

# 35. Verification

Trước khi hoàn thành:

Kiểm tra:

* Không hard-code API URL.
* Không expose secret.
* Request type đúng.
* Response type đúng.
* Error được xử lý.
* Loading state hợp lý.
* Empty state hợp lý.
* Không duplicate API logic.
* UI không phụ thuộc trực tiếp transport.
* Mock có thể thay real API dễ dàng.
* TypeScript không lỗi.
* Không thêm dependency không cần thiết.

Nếu phù hợp:

* run lint.
* run typecheck.
* run build.

---

# 36. Không được làm

Không:

* Fetch trực tiếp lung tung trong component.
* Hard-code backend URL.
* Hard-code mock data trong JSX nếu nó đại diện backend data.
* Tự bịa API contract và nói đó là backend thật.
* Cài Axios/TanStack Query/SWR mà chưa cần.
* Tạo architecture quá phức tạp.
* Expose secret.
* Duplicate auth logic.
* Sửa toàn bộ project khi chỉ cần integrate một feature.
* Viết `any` khắp API.
* Trộn API transport với UI primitive.

---

# 37. Khi hoàn thành

Phản hồi ngắn gọn:

## Contract

Endpoint/request/response đã sử dụng.

## Architecture

API logic được đặt ở đâu.

## UI Connection

UI đang lấy dữ liệu bằng cách nào.

## Mock / Real

Hiện đang dùng mock hay backend thật.

## Future Backend Switch

Khi kết nối backend thật cần thay đổi phần nào.

## Files Changed

Các file chính được tạo/chỉnh sửa.

Không viết tutorial dài nếu người dùng không yêu cầu.

```
```
