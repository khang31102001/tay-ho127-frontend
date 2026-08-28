````markdown
---
paths:
  - "src/services/**/*"
  - "src/lib/**/*"
  - "src/api/**/*"
  - "src/features/**/*"
  - "src/app/api/**/*"
  - "src/**/*.service.ts"
  - "src/**/*.api.ts"
---

# API Integration Rules

## Mục tiêu

Mọi API integration trong project phải đảm bảo:

- Type-safe.
- Dễ đọc.
- Dễ maintain.
- Dễ mock.
- Dễ chuyển sang backend thật.
- UI không phụ thuộc trực tiếp vào HTTP implementation.
- Request/response có cấu trúc rõ ràng.
- Error handling nhất quán.
- Không over-engineering.

Mục tiêu quan trọng:

```text
Mock API
   ↓
Real Backend API
````

không làm UI phải viết lại toàn bộ.

---

## 1. Đọc kiến trúc API hiện tại trước

Trước khi tạo hoặc chỉnh API:

1. Kiểm tra project đang dùng `fetch`, Axios hay library khác.
2. Kiểm tra đã có API Client chưa.
3. Kiểm tra đã có Service Layer chưa.
4. Kiểm tra cách project quản lý environment.
5. Kiểm tra authentication hiện tại.
6. Kiểm tra response format hiện tại.
7. Kiểm tra TypeScript types/DTO.
8. Kiểm tra mock API hiện tại.
9. Kiểm tra Server Component / Client Component.
10. Kiểm tra convention đặt tên file.

Không tạo thêm một kiến trúc API song song khi project đã có architecture phù hợp.

---

## 2. API Boundary

Ưu tiên data flow:

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

Không bắt buộc mọi request phải có đầy đủ tất cả layer.

Chỉ tạo layer khi nó mang lại responsibility rõ ràng.

Không tạo abstraction chỉ để project trông phức tạp hơn.

---

## 3. UI không được phụ thuộc trực tiếp vào HTTP

Không để nhiều UI component tự thực hiện:

```ts
fetch(...)
```

hoặc:

```ts
axios.get(...)
```

nếu API đó thuộc một domain/service rõ ràng.

Ví dụ ưu tiên:

```ts
productService.getProducts();
```

thay vì:

```ts
fetch("/api/products");
```

xuất hiện ở nhiều component khác nhau.

---

## 4. API Client

Nếu project đã có API Client:

PHẢI reuse.

API Client có thể chịu trách nhiệm:

* Base URL.
* Common headers.
* Content-Type.
* Authentication header.
* Request configuration.
* Common response parsing.
* Common error normalization.
* Timeout nếu cần.

Không duplicate các concern này trong từng service.

---

## 5. Service Layer

Service phải thể hiện business/domain intent.

Ví dụ tốt:

```ts
productService.getProducts();
productService.getProductById(id);
authService.login(payload);
authService.register(payload);
orderService.createOrder(payload);
```

Không tốt:

```ts
callApi();
sendData();
requestData();
fetchSomething();
postSomething();
```

Tên service method phải nói rõ hành động nghiệp vụ.

---

## 6. Không tạo Generic Service quá sớm

Không mặc định tạo:

```text
BaseService<T>
GenericRepository<T>
ApiManager<T>
RequestManager<T>
```

nếu project chưa có nhiều use case thực sự cần abstraction đó.

Ưu tiên:

```text
authService
productService
orderService
```

rõ ràng và dễ hiểu.

---

## 7. Contract First

Trước khi implement API phải xác định:

* HTTP Method.
* Endpoint.
* Path Params.
* Query Params.
* Request Body.
* Response Body.
* Error Response.
* Authentication.
* Pagination nếu có.
* Filter nếu có.
* Sort nếu có.

Không code API khi contract chưa được hiểu.

---

## 8. Backend chưa có

Nếu backend chưa hoàn thiện:

Được phép tạo Mock Contract.

Nhưng phải xác định rõ đây là:

```text
MOCK CONTRACT
```

hoặc:

```text
TEMPORARY CONTRACT
```

Không trình bày mock contract như thể backend đã xác nhận.

---

## 9. TypeScript

Không sử dụng `any` nếu có thể xác định type.

Ưu tiên type rõ ràng cho:

* Request.
* Response.
* Query params.
* DTO.
* Domain model.
* Error khi cần.

Ví dụ:

```ts
export interface LoginRequest {
  phone: string;
  password: string;
}
```

```ts
export interface LoginResponse {
  user: User;
  accessToken?: string;
}
```

---

## 10. DTO và Frontend Model

Khi backend response khác model frontend, có thể sử dụng:

```text
Backend DTO
     ↓
Mapper / Normalizer
     ↓
Frontend Model
     ↓
UI
```

Ví dụ backend:

```ts
interface ProductDto {
  product_id: number;
  product_name: string;
  sale_price: number;
}
```

Frontend:

```ts
interface Product {
  id: number;
  name: string;
  price: number;
}
```

Không tạo mapper nếu DTO đã phù hợp hoàn toàn với frontend.

---

## 11. Mock API

Mock data dùng để mô phỏng backend không nên nằm trực tiếp trong JSX.

Không ưu tiên:

```tsx
const products = [
  ...
];
```

bên trong UI component nếu dữ liệu này đại diện cho backend.

Ưu tiên đặt mock tại boundary rõ ràng như:

```text
mocks/
services/
fixtures/
```

hoặc theo cấu trúc hiện tại của project.

---

## 12. Mock và Real API phải dễ thay thế

UI nên gọi cùng một API/service interface.

Ví dụ:

```ts
productService.getProducts();
```

UI không cần biết phía sau đang lấy từ:

```text
Mock Data
```

hay:

```text
ASP.NET Backend
```

Khi backend thật sẵn sàng, ưu tiên thay đổi:

```text
Service
API Client
Adapter / Mapper
```

thay vì sửa từng UI component.

---

## 13. Không cần Dependency Injection phức tạp

Không tạo DI Container chỉ để switch Mock và Real API.

Ưu tiên giải pháp đơn giản.

Ví dụ có thể dùng:

```text
Environment Config
       ↓
Service Implementation
```

hoặc pattern phù hợp với project hiện tại.

---

## 14. Environment Variables

Không hard-code backend URL trong component.

Ưu tiên environment variable.

Ví dụ:

```text
NEXT_PUBLIC_API_URL
```

chỉ khi URL đó thực sự cần sử dụng phía client.

Không đặt secret vào biến `NEXT_PUBLIC_*`.

---

## 15. Không expose Secret

Không để client bundle chứa:

* API Secret.
* Database Password.
* Private Token.
* Server Credential.
* Internal Secret Key.

Không commit secret vào source code.

---

## 16. Server-side Fetching

Ưu tiên server-side fetching khi:

* Data phục vụ initial rendering.
* SEO quan trọng.
* Không cần browser interaction.
* Data có thể được lấy an toàn trên server.

Không biến request thành client-side chỉ vì quen sử dụng `useEffect`.

---

## 17. Client-side Fetching

Client-side fetching phù hợp khi:

* Search realtime.
* User filter.
* Pagination interactive.
* Infinite scroll.
* Polling.
* User action kích hoạt request.
* Data phụ thuộc client state.

Không sử dụng client fetching như mặc định cho mọi API.

---

## 18. Không tự cài Data Fetching Library

Không tự động cài:

```text
Axios
TanStack Query
SWR
```

nếu project chưa có và use case chưa cần.

Trước khi thêm library phải kiểm tra:

1. Native `fetch` có đủ không?
2. Project đã có library tương tự chưa?
3. Có caching complexity không?
4. Có server state complexity không?
5. Library có giảm maintenance đáng kể không?

Nếu project đã dùng library thì theo convention hiện có.

---

## 19. Loading State

API-driven UI phải xử lý loading khi phù hợp.

Có thể sử dụng:

* Spinner.
* Skeleton.
* Loading text.
* Disabled button.

Không để user submit nhiều request giống nhau khi request đang chạy.

---

## 20. Empty State

Phân biệt:

```text
Success + No Data
```

với:

```text
Request Error
```

Ví dụ:

```text
Không có sản phẩm.
```

là Empty State.

Không phải Error State.

---

## 21. Error State

Không để request fail rồi UI trắng hoàn toàn.

Phải xử lý error phù hợp với UX.

Khi cần có thể phân biệt:

* Validation Error.
* Unauthorized.
* Forbidden.
* Not Found.
* Network Error.
* Server Error.
* Business Error.

Không xây error framework quá phức tạp nếu application chưa cần.

---

## 22. Không hiển thị Raw Technical Error

Không hiển thị trực tiếp cho user:

* Stack trace.
* Database error.
* Internal server detail.
* Sensitive technical information.

User-facing message phải phù hợp với ngữ cảnh.

---

## 23. Authentication

Trước khi chỉnh authentication phải đọc architecture hiện tại.

Kiểm tra:

* Login flow.
* Session.
* Cookie.
* Access token.
* Refresh token.
* Route protection.
* Server authentication.
* Client authentication.

Không tạo cơ chế auth thứ hai song song nếu project đã có một cơ chế chuẩn.

---

## 24. Token Storage

Không mặc định lưu token vào:

```text
localStorage
```

Phải xem backend/frontend architecture thực tế.

Nếu hệ thống dùng:

* HttpOnly Cookie.
* Secure Cookie.
* Server Session.

thì phải tôn trọng architecture đó.

Không thay đổi security architecture chỉ để implement nhanh.

---

## 25. Form + API

Ưu tiên separation:

```text
Form UI
   ↓
Validation
   ↓
Submit Logic
   ↓
Service
   ↓
API
```

UI primitive như:

```text
Input
Button
Checkbox
```

không được biết backend endpoint.

---

## 26. Request States

Khi phù hợp, request có thể có:

```text
idle
loading
success
error
```

Không duplicate request state nếu library hiện tại đã quản lý nó.

---

## 27. Mutation

Đối với:

* Create.
* Update.
* Delete.
* Login.
* Register.
* Forgot Password.

phải cân nhắc:

* Disable submit khi loading.
* Prevent duplicate request.
* Success feedback.
* Error feedback.
* Refresh/invalidate data nếu cần.

Không thêm optimistic update nếu use case không cần.

---

## 28. Pagination

Nếu API có pagination:

Phải theo contract backend.

Ví dụ:

```ts
interface PaginationResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
```

chỉ khi backend thực sự sử dụng format đó.

Không tự ép backend vào pagination structure do frontend tự nghĩ ra.

---

## 29. Filter và Sort

Không build query string thủ công ở nhiều nơi.

Ưu tiên typed query object.

Ví dụ:

```ts
interface ProductQuery {
  search?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}
```

Việc serialize query nên nằm ở boundary phù hợp.

---

## 30. Response Wrapper

Nếu backend trả:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

không để mọi component tự xử lý:

```ts
response.data.data
```

nếu có thể normalize response tại API client hoặc service.

---

## 31. Data Ownership

Không để nhiều child component gọi cùng một endpoint nếu không cần.

Phải xác định component/feature nào sở hữu data.

Nhưng không đưa data vào global state chỉ để tránh một request đơn giản.

Chọn scope nhỏ nhất hợp lý.

---

## 32. Caching

Không tạo caching strategy phức tạp nếu project chưa cần.

Nếu Next.js hoặc data library hiện tại đã có caching mechanism:

Phải hiểu cơ chế hiện tại trước khi override.

Không disable cache toàn project chỉ để sửa một request.

---

## 33. API Naming

Tên file và function phải rõ responsibility.

Ví dụ:

```text
auth.service.ts
product.service.ts
order.service.ts
api-client.ts
```

Function:

```text
login()
register()
getProducts()
createOrder()
```

Không sử dụng:

```text
api1()
send()
doRequest()
getData2()
```

---

## 34. Folder Structure

Phải theo structure hiện tại của repository.

Nếu project chưa có convention rõ, có thể tham khảo:

```text
src/
├── services/
│   ├── api-client.ts
│   ├── auth.service.ts
│   └── product.service.ts
│
├── types/
├── mocks/
└── features/
```

Không tự restructure toàn project chỉ vì thêm một API.

---

## 35. Không Over-Engineering

Không tự động áp dụng:

* Repository Pattern.
* Unit of Work.
* CQRS.
* Event Bus.
* Generic Repository.
* Dependency Injection Container.
* Generic Mapper framework.

Chỉ thêm abstraction khi có vấn đề thực tế cần giải quyết.

Ưu tiên:

```text
Simple
+ Clear
+ Replaceable
+ Maintainable
```

---

## 36. API Debugging

Nếu API không hoạt động, kiểm tra theo thứ tự:

```text
Endpoint
   ↓
HTTP Method
   ↓
Base URL
   ↓
Params / Query
   ↓
Request Body
   ↓
Headers
   ↓
Authentication
   ↓
HTTP Status
   ↓
Response Shape
   ↓
Normalization
   ↓
UI Consumption
```

Không sửa UI trước khi biết response thực tế.

---

## 37. Backend Contract thay đổi

Khi backend thay đổi contract:

Không patch từng UI component.

Tìm boundary phù hợp:

```text
DTO
Mapper
Service
API Client
```

và sửa tại đó nếu hợp lý.

---

## 38. Mock API phải dễ xóa

Mock code phải được tổ chức để khi backend thật sẵn sàng:

* Dễ tìm.
* Dễ thay.
* Không nằm rải rác.
* Không làm UI phụ thuộc trực tiếp.

Không để mock implementation trở thành permanent technical debt.

---

## 39. Verification

Sau khi integrate API phải kiểm tra:

* Request đúng contract.
* Response type đúng.
* Không có `any` không cần thiết.
* Loading hoạt động.
* Empty state hoạt động.
* Error state hoạt động.
* Authentication đúng.
* Không expose secret.
* Không hard-code URL.
* Không duplicate request logic.
* UI không phụ thuộc transport implementation.
* Mock có thể thay real API dễ dàng.

Nếu phù hợp:

* Run lint.
* Run typecheck.
* Run build.

---

## 40. Không được làm

Không:

* Fetch API rải rác trong UI.
* Hard-code backend URL.
* Hard-code secret.
* Tự bịa backend contract.
* Dùng `any` để bỏ qua type.
* Cài library không cần thiết.
* Duplicate authentication logic.
* Trộn API transport vào UI primitive.
* Hard-code mock data sâu trong JSX.
* Rewrite UI chỉ vì backend implementation thay đổi.
* Tạo architecture enterprise quá mức cho frontend.

---

## 41. Nguyên tắc cuối

Luôn ưu tiên:

```text
Contract First
> Guessing

Typed Data
> any

Service Boundary
> Scattered Requests

Replaceable Mock
> Hard-coded Mock

Simple Architecture
> Enterprise Over-engineering

UI Independence
> Backend Coupling
```

```
```
