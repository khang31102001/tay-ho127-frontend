````markdown
---
name: refactor-code
description: >
  Phân tích và refactor code trong project Next.js, React, TypeScript và
  Tailwind CSS hiện tại theo hướng rõ responsibility, dễ đọc, dễ mở rộng,
  giảm duplication và coupling nhưng vẫn giữ nguyên behavior. Sử dụng skill
  này khi người dùng yêu cầu clean code, tách component, tách hook, tách
  service, chuẩn hóa folder, giảm file quá phức tạp, cải thiện architecture,
  loại bỏ duplicated logic hoặc làm code dễ maintain hơn.
---

# Refactor Code

## Mục tiêu

Refactor code theo hướng:

- Rõ responsibility.
- Dễ đọc.
- Dễ maintain.
- Dễ mở rộng.
- Giảm coupling.
- Giảm duplication hợp lý.
- Không over-engineering.
- Không phá behavior hiện tại.
- Không chia file vô nghĩa.
- Không áp dụng design pattern máy móc.

Refactor KHÔNG đồng nghĩa với rewrite.

---

# 1. Nguyên tắc quan trọng nhất

Không được refactor chỉ vì:

- File dài.
- Component nhiều dòng.
- Muốn code nhìn "clean" hơn.
- Muốn áp dụng design pattern.
- Muốn tạo nhiều folder hơn.
- Muốn làm kiến trúc trông enterprise.

Chỉ refactor khi có vấn đề thực sự về:

- Responsibility.
- Coupling.
- Duplication.
- Readability.
- Maintainability.
- State complexity.
- Data flow.
- Reusability.
- Testing.
- Naming.

---

# 2. Trước khi Refactor

PHẢI đọc code hiện tại trước.

Kiểm tra:

1. Target file.
2. Imports.
3. Component đang sử dụng nó.
4. Child component.
5. Hook liên quan.
6. Service liên quan.
7. Type liên quan.
8. API liên quan.
9. Business behavior hiện tại.

Không refactor khi chưa hiểu behavior.

---

# 3. Xác định vấn đề trước

Trước khi chỉnh code, phải trả lời:

```text
Vấn đề thực sự của code hiện tại là gì?
````

Ví dụ:

* Component xử lý quá nhiều responsibility.
* API logic nằm trong UI.
* State bị duplicate.
* useEffect quá nhiều.
* Logic bị copy nhiều nơi.
* Naming khó hiểu.
* Component khó reuse.
* Props quá nhiều.
* Feature phụ thuộc trực tiếp vào implementation khác.
* Folder structure không phản ánh responsibility.

Không refactor dựa trên cảm giác.

---

# 4. Phân loại Responsibility

Khi đọc một file, phân loại code thành:

```text
Presentation
Interaction
State
Business Logic
Data Fetching
Transformation
Configuration
Utility
Types
```

Nếu nhiều responsibility không liên quan nằm trong cùng một file,
đó là dấu hiệu cần xem xét tách.

---

# 5. Component Responsibility

Một component nên có một mục đích chính.

Ví dụ:

```text
ProductCard
→ Hiển thị Product.

ProductList
→ Hiển thị danh sách Product.

ProductFilter
→ Điều khiển bộ lọc Product.

ProductPage
→ Compose feature.
```

Không để một component đồng thời:

* Gọi API.
* Transform dữ liệu phức tạp.
* Quản lý modal.
* Quản lý carousel.
* Quản lý form.
* Quản lý authentication.
* Render nhiều section không liên quan.

---

# 6. Không tách chỉ vì File dài

Không dùng rule:

```text
File > 200 dòng
→ phải tách.
```

Một file 300 dòng nhưng có một responsibility rõ ràng
có thể tốt hơn 8 file nhỏ khó theo dõi.

Line count chỉ là tín hiệu.

Không phải quyết định cuối cùng.

---

# 7. Khi nào nên tách Child Component

Có thể extract child component khi:

* Có semantic riêng.
* Có responsibility riêng.
* Có state riêng.
* Có interaction riêng.
* Có thể reuse.
* Parent trở nên khó đọc.
* Phần UI có thể thay đổi độc lập.

Ví dụ:

```text
ProductPage
├── ProductFilter
├── ProductGrid
└── ProductPagination
```

hợp lý nếu mỗi phần có responsibility rõ.

---

# 8. Không chia Component quá nhỏ

Tránh kiểu:

```text
ProductCard.tsx
ProductCardTitle.tsx
ProductCardImage.tsx
ProductCardPrice.tsx
ProductCardButton.tsx
```

nếu tất cả chỉ dùng một lần và không có responsibility độc lập.

Không biến một component đơn giản thành một cây file phức tạp.

---

# 9. Khi nào nên tách Hook

Tạo custom hook khi:

* Logic state đủ phức tạp.
* Logic interaction được reuse.
* Logic state độc lập với presentation.
* Component trở nên khó đọc vì state/effect.

Ví dụ:

```text
useProductSearch
usePagination
useAuthForm
```

Không tạo hook chỉ để chứa 2 dòng `useState`.

---

# 10. Khi nào nên tách Service

Tách service khi code liên quan:

* API request.
* Backend contract.
* Data transport.
* Authentication request.
* Domain operation.

Ví dụ:

```text
authService
productService
orderService
```

UI component không nên chứa transport logic nếu có thể tránh.

---

# 11. Khi nào nên tách Helper

Helper nên dùng cho logic:

* Pure function.
* Mapping.
* Calculation.
* Formatting.
* Transformation.

Ví dụ:

```text
formatCurrency()
mapProductDto()
calculateCartTotal()
```

Không đưa business logic quan trọng vào file `utils.ts` chung chung nếu nó thuộc một domain cụ thể.

---

# 12. Khi nào nên tách Config

Static configuration có thể tách khi:

* Dữ liệu lớn.
* Dùng nhiều nơi.
* Không cần nằm trong component.

Ví dụ:

```text
navigationItems
socialLinks
carouselConfig
formOptions
```

Không tách constant đơn giản chỉ để giảm số dòng.

---

# 13. Naming

Tên phải thể hiện responsibility.

Tốt:

```text
ProductCard
ProductGrid
useProductFilter
productService
mapProductResponse
```

Không tốt:

```text
Helper
Manager
Common
Utils2
ComponentNew
FinalComponent
NewFile
HandlerData
```

Tên phải giúp người đọc hiểu file dùng để làm gì.

---

# 14. Props

Nếu component có quá nhiều props:

Kiểm tra xem component có đang xử lý quá nhiều responsibility không.

Đặc biệt chú ý quá nhiều boolean:

```tsx
<Component
  isAdmin
  isLarge
  isCompact
  isRed
  showAction
  showImage
  enableHover
/>
```

Có thể là dấu hiệu abstraction chưa đúng.

Không phải mọi trường hợp đều cần refactor.

---

# 15. Composition

Ưu tiên composition khi nhiều component cần kết hợp linh hoạt.

Ví dụ:

```tsx
<Card>
  <CardHeader />
  <CardContent />
  <CardFooter />
</Card>
```

chỉ khi pattern thực sự xuất hiện nhiều lần.

Không xây compound component framework nếu project chưa cần.

---

# 16. Duplication

Không phải duplication nào cũng cần loại bỏ.

Nếu hai đoạn code giống nhau nhưng:

* Responsibility khác.
* Có khả năng phát triển khác nhau.
* Business meaning khác.

thì giữ riêng có thể tốt hơn abstraction sai.

Nguyên tắc:

```text
Wrong abstraction
có thể tệ hơn
một ít duplication.
```

---

# 17. Khi nào nên Reuse

Nên tạo shared abstraction khi:

* Responsibility giống nhau.
* Behavior giống nhau.
* Có nhiều consumer thực sự.
* Thay đổi tương lai nên tác động chung.

Không share chỉ vì giao diện nhìn giống nhau.

---

# 18. State

State nên đặt gần nơi sở hữu nhất.

Kiểm tra:

* State có thực sự cần không?
* Có thể derive từ props không?
* Có duplicate state không?
* Có thể calculate trong render không?
* Có đang sync nhiều state bằng effect không?

Không đưa state lên global chỉ vì muốn chia sẻ dễ hơn.

---

# 19. Derived State

Không lưu state nếu có thể tính từ state khác.

Ví dụ không tốt:

```tsx
const [items, setItems] = useState([]);
const [totalItems, setTotalItems] = useState(0);
```

nếu:

```tsx
const totalItems = items.length;
```

đã đủ.

Tránh state synchronization không cần thiết.

---

# 20. useEffect

Không dùng `useEffect` như công cụ mặc định.

Trước mỗi effect, kiểm tra:

```text
Có thể tính trong render không?
Có thể xử lý trong event handler không?
Có phải data fetching concern không?
Có thật sự là side effect không?
```

Không thêm effect mới để chữa một effect khác.

---

# 21. Client Component

Không lan `"use client"` lên toàn bộ tree.

Nếu chỉ một phần nhỏ cần:

* State.
* Event.
* Browser API.
* Client library.

thì ưu tiên isolate phần đó khi hợp lý.

Không refactor toàn page thành Client Component nếu không cần.

---

# 22. API Coupling

Nếu UI chứa:

```text
fetch
URL
headers
token
response parsing
```

thì cân nhắc tách responsibility.

Ưu tiên:

```text
UI
 ↓
Feature Logic
 ↓
Service
 ↓
API Client
```

khi complexity phù hợp.

Không áp dụng nhiều layer cho request cực kỳ đơn giản nếu không mang lại giá trị.

---

# 23. Business Logic

Business logic không nên bị chôn sâu trong JSX.

Ví dụ:

```tsx
{price * quantity * taxRate - discount > 1000000 ? ...}
```

Nếu logic phức tạp hoặc có meaning rõ:

Tách thành function có tên phù hợp.

Ví dụ:

```text
calculateOrderTotal()
```

---

# 24. Folder Structure

Không restructure toàn project trong một task refactor nhỏ.

Chỉ thay đổi folder khi:

* Responsibility hiện tại không rõ.
* File bị đặt sai domain.
* Việc tìm kiếm file khó khăn.
* Feature ngày càng lớn.
* Structure hiện tại gây coupling.

Nếu structure hiện tại vẫn hoạt động tốt,
không đổi chỉ vì preference cá nhân.

---

# 25. Feature Organization

Nếu project phát triển lớn:

Có thể xem xét tổ chức theo feature:

```text
features/
├── auth/
├── products/
├── cart/
└── orders/
```

Mỗi feature có thể chứa:

```text
components
hooks
services
types
```

NHƯNG:

Không bắt buộc áp dụng feature architecture nếu project hiện tại chưa cần.

---

# 26. Shared Folder

Không biến:

```text
shared/
common/
utils/
```

thành nơi chứa mọi thứ.

File shared chỉ nên chứa thứ thực sự được dùng chung.

Nếu logic thuộc Product thì giữ gần Product.

Nếu logic thuộc Auth thì giữ gần Auth.

---

# 27. Design Patterns

Không áp dụng design pattern chỉ vì muốn "code chuẩn".

Trước khi dùng pattern phải trả lời:

```text
Pattern này đang giải quyết vấn đề cụ thể nào?
```

Có thể cân nhắc:

* Adapter.
* Strategy.
* Factory.
* Composition.
* Provider.

chỉ khi use case thật sự phù hợp.

Không áp dụng:

* Repository.
* Unit of Work.
* CQRS.
* Event Bus.
* DI Container.

vào frontend đơn giản chỉ để giống enterprise backend.

---

# 28. SOLID

Có thể dùng SOLID như guideline.

Nhưng không áp dụng máy móc.

Đặc biệt ưu tiên:

```text
Single Responsibility
Dependency Direction
Clear Interfaces
Composition
```

Không tạo abstraction chỉ để "đúng SOLID".

---

# 29. Over-engineering

Luôn tránh:

* Nhiều layer không cần thiết.
* Generic quá mức.
* Wrapper của wrapper.
* Abstract Base Component.
* Factory cho component đơn giản.
* Interface chỉ có một implementation mà không có nhu cầu thay thế.
* File structure quá sâu.

Giải pháp tốt nhất là giải pháp đơn giản nhất vẫn dễ maintain.

---

# 30. Refactor từng bước

Nếu refactor lớn:

Không sửa mọi thứ cùng lúc.

Thực hiện:

```text
1 responsibility
      ↓
verify
      ↓
next responsibility
```

Điều này giúp dễ kiểm soát regression.

---

# 31. Preserve Behavior

Refactor mặc định phải giữ:

* UI behavior.
* Business behavior.
* API contract.
* Routing.
* Responsive.
* Accessibility.
* Interaction.

Nếu cần thay đổi behavior:

Phải xác định đó là feature change, không còn chỉ là refactor.

---

# 32. Không trộn Feature với Refactor

Nếu user yêu cầu:

```text
Refactor component
```

không tự thêm:

* feature mới.
* animation mới.
* API mới.
* layout mới.
* dependency mới.

Tách refactor khỏi feature development nếu có thể.

---

# 33. Refactor Shared Component

Nếu sửa shared component:

Phải tìm tất cả nơi sử dụng.

Kiểm tra regression.

Không thay đổi public API của shared component mà chưa kiểm tra consumer.

---

# 34. Public API

Nếu component đang được reuse nhiều nơi:

Ưu tiên giữ:

* Prop names.
* Variant names.
* Events.
* Expected behavior.

Nếu bắt buộc phải thay:

Phải cập nhật toàn bộ consumer liên quan.

---

# 35. Remove Dead Code

Sau khi refactor:

Kiểm tra:

* Import thừa.
* Component cũ.
* Helper cũ.
* Type không dùng.
* Duplicate implementation.
* Dead state.
* Comment lỗi thời.

Không để hai implementation song song nếu implementation cũ không còn dùng.

---

# 36. Comment

Không thêm comment giải thích code hiển nhiên.

Comment chỉ nên giải thích:

* Why.
* Constraint.
* Edge case.
* Technical reason.

Không comment:

```text
// Set loading to true
setLoading(true)
```

---

# 37. TypeScript

Refactor phải cải thiện hoặc giữ type safety.

Không giải quyết type error bằng:

```text
any
as any
@ts-ignore
```

trừ trường hợp đặc biệt có lý do rõ ràng.

Ưu tiên type rõ responsibility.

---

# 38. Performance

Không tối ưu performance khi chưa có vấn đề.

Không tự động thêm:

```text
useMemo
useCallback
React.memo
```

vào mọi component.

Chỉ dùng khi:

* Có render cost rõ.
* Dependency stability quan trọng.
* Library yêu cầu stable reference.
* Có evidence về performance.

Không tối ưu sớm.

---

# 39. Error Handling

Nếu refactor logic async:

Không làm mất:

* Loading.
* Error.
* Success.
* Retry behavior.

Không swallow error trong quá trình tách function.

---

# 40. Refactoring Workflow

Luôn thực hiện theo thứ tự:

```text
READ CURRENT IMPLEMENTATION
        ↓
UNDERSTAND BEHAVIOR
        ↓
IDENTIFY REAL PROBLEMS
        ↓
IDENTIFY RESPONSIBILITIES
        ↓
PLAN SMALLEST REFACTOR
        ↓
REFACTOR ONE BOUNDARY
        ↓
UPDATE IMPORTS / CONSUMERS
        ↓
REMOVE DEAD CODE
        ↓
VERIFY BEHAVIOR
        ↓
CHECK REGRESSION
```

---

# 41. Verification

Sau khi refactor:

Kiểm tra:

* Responsibility rõ hơn chưa?
* Code dễ đọc hơn chưa?
* Complexity có thực sự giảm không?
* Có tạo quá nhiều file không?
* Có duplicate implementation không?
* Import đúng không?
* Behavior giữ nguyên không?
* Responsive giữ nguyên không?
* API behavior giữ nguyên không?
* TypeScript có lỗi không?

Nếu phù hợp:

* run lint.
* run typecheck.
* run build.
* run test.

---

# 42. Không được làm

Không:

* Rewrite toàn bộ feature không có lý do.
* Chia file chỉ vì file dài.
* Tạo abstraction generic quá sớm.
* Áp design pattern máy móc.
* Tạo nhiều layer vô nghĩa.
* Rename toàn project trong một task nhỏ.
* Refactor unrelated code.
* Thêm library khi không cần.
* Thay đổi behavior mà không nói rõ.
* Tạo `utils.ts` chứa mọi thứ.
* Biến project frontend thành enterprise architecture quá mức.

---

# 43. Khi hoàn thành

Phản hồi ngắn gọn:

## Problems Found

Các vấn đề cấu trúc chính.

## Refactor

Đã tách hoặc cải thiện responsibility nào.

## Files Changed

Các file tạo mới/chỉnh sửa/xóa.

## Architecture

Data flow hoặc responsibility mới nếu có.

## Result

Tại sao code sau refactor dễ maintain hơn.

## Verify

Những điểm cần kiểm tra thêm nếu có.

Không giải thích dài dòng nếu người dùng không yêu cầu.

```
```
