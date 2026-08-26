````markdown
# Code Quality Rules

## Mục tiêu

Mọi code trong project phải ưu tiên:

- Dễ đọc.
- Dễ hiểu.
- Dễ maintain.
- Type-safe.
- Responsibility rõ ràng.
- Consistent.
- Predictable.
- Không over-engineering.
- Không tạo abstraction không cần thiết.

Code tốt không phải code ngắn nhất.

Code tốt là code người khác có thể đọc, hiểu và tiếp tục phát triển.

---

# 1. Đọc Code Hiện Tại Trước

Trước khi tạo implementation mới:

1. Đọc file liên quan.
2. Đọc consumer.
3. Tìm implementation tương tự.
4. Kiểm tra naming convention.
5. Kiểm tra folder convention.
6. Kiểm tra utility/hook/service hiện tại.

Không tạo pattern mới nếu project đã có pattern phù hợp.

---

# 2. Thay Đổi Nhỏ Nhất Có Thể

Khi sửa code:

Ưu tiên thay đổi nhỏ nhất giải quyết đúng vấn đề.

Không tự động:

- Rewrite toàn bộ component.
- Refactor unrelated code.
- Rename nhiều file.
- Restructure folder.
- Đổi library.
- Thay architecture.

nếu task hiện tại không yêu cầu.

---

# 3. TypeScript

Ưu tiên TypeScript type rõ ràng.

Không sử dụng:

```ts
any
````

nếu có thể xác định type.

Không chữa TypeScript error bằng:

```ts
as any
@ts-ignore
@ts-nocheck
```

trừ khi có lý do kỹ thuật rõ ràng.

Nếu phải sử dụng workaround, phải hiểu nguyên nhân.

---

# 4. Type Naming

Tên type/interface phải thể hiện đúng responsibility.

Ví dụ tốt:

```ts
Product
ProductCardProps
LoginRequest
LoginResponse
ProductQuery
PaginationResponse
```

Không tốt:

```ts
Data
Info
ObjectType
ResponseData
Type1
TempType
```

---

# 5. Naming

Tên biến, function, component và file phải thể hiện intent.

Ví dụ tốt:

```text
ProductCard
ProductList
getProducts
createOrder
calculateOrderTotal
useProductSearch
isLoading
hasError
```

Không tốt:

```text
data1
temp
stuff
abc
doThing
handleStuff
ComponentNew
FinalComponent
NewFile
Utils2
```

Không dùng tên chung chung nếu có thể đặt tên rõ nghĩa hơn.

---

# 6. Boolean Naming

Boolean nên bắt đầu bằng các dạng phù hợp:

```text
is
has
can
should
```

Ví dụ:

```ts
isLoading
isOpen
hasError
canSubmit
shouldRender
```

Tránh:

```ts
loadingValue
openStatus
errorCheck
```

nếu boolean intent có thể thể hiện rõ hơn.

---

# 7. Function Responsibility

Một function nên thực hiện một responsibility chính.

Nếu một function đồng thời:

* Validate.
* Transform.
* Call API.
* Update state.
* Navigate.
* Show notification.

thì xem xét có đang chứa quá nhiều responsibility không.

Không tách function chỉ vì function dài.

Tách khi responsibility thực sự độc lập.

---

# 8. Component Responsibility

Một React component nên có mục đích rõ ràng.

Ví dụ:

```text
ProductCard
→ render một Product.

ProductGrid
→ render collection Product.

ProductFilter
→ xử lý UI filter.
```

Không để một component trở thành nơi chứa mọi thứ của feature.

---

# 9. Không Chia File Chỉ Vì Dài

Không sử dụng rule:

```text
File > X dòng
→ bắt buộc tách.
```

Line count chỉ là tín hiệu.

Tách file khi có:

* Responsibility độc lập.
* State độc lập.
* Logic có thể reuse.
* Semantic boundary rõ.
* Component khó hiểu vì nhiều concern.

Không tạo nhiều file nhỏ vô nghĩa.

---

# 10. Duplication

Không loại bỏ duplication bằng mọi giá.

Chỉ tạo abstraction khi:

* Semantic responsibility giống nhau.
* Behavior giống nhau.
* Có nhiều consumer thực tế.
* Future changes nên đi cùng nhau.

Một chút duplication có thể tốt hơn một abstraction sai.

Nguyên tắc:

```text
Correct Abstraction
> Forced Reuse
```

---

# 11. Không Generic Quá Sớm

Không tạo generic abstraction khi mới có một use case.

Ví dụ không nên tạo sớm:

```text
BaseComponent<T>
GenericService<T>
GenericRepository<T>
UniversalForm<T>
UniversalTable<T>
```

nếu requirement hiện tại chưa chứng minh abstraction đó cần thiết.

Ưu tiên concrete implementation rõ ràng trước.

---

# 12. Simplicity

Ưu tiên giải pháp đơn giản nhất đáp ứng được:

* Requirement.
* Maintainability.
* Reusability cần thiết.
* Testability.
* Scalability hợp lý.

Không tạo architecture phức tạp chỉ để code trông chuyên nghiệp.

---

# 13. React State

State phải nằm gần nơi sở hữu nhất.

Không đưa state lên:

* Context.
* Global Store.
* Parent cao hơn.

nếu chưa thật sự cần.

Trước khi tạo state, kiểm tra:

* Có thể derive từ props không?
* Có thể calculate trong render không?
* Có duplicate state không?
* State có thực sự cần tồn tại không?

---

# 14. Derived State

Không lưu state nếu value có thể tính từ data hiện tại.

Ví dụ không tốt:

```tsx
const [items, setItems] = useState<Item[]>([]);
const [totalItems, setTotalItems] = useState(0);
```

nếu có thể:

```tsx
const totalItems = items.length;
```

Tránh synchronize nhiều state không cần thiết.

---

# 15. useEffect

Không dùng `useEffect` như công cụ xử lý mọi vấn đề.

Trước khi thêm `useEffect`, hỏi:

1. Đây có thật sự là side effect không?
2. Có thể calculate trong render không?
3. Có thể xử lý trong event handler không?
4. Có thể giải quyết ở data fetching layer không?

Không tạo effect chỉ để synchronize derived state.

---

# 16. useMemo / useCallback / React.memo

Không tự động thêm:

```text
useMemo
useCallback
React.memo
```

cho mọi component.

Chỉ sử dụng khi:

* Có performance reason rõ.
* Reference stability thực sự quan trọng.
* Dependency yêu cầu stable reference.
* Có evidence về unnecessary re-render.

Không premature optimization.

---

# 17. Event Handler

Tên event handler phải rõ hành động.

Tốt:

```text
handleSubmit
handleClose
handleProductSelect
handleAddToCart
```

Không tốt:

```text
handleData
handleStuff
doAction
execute
```

Nếu handler quá phức tạp, xem xét tách logic.

---

# 18. Early Return

Ưu tiên early return khi giúp giảm nesting.

Ví dụ:

```tsx
if (isLoading) {
  return <Loading />;
}

if (error) {
  return <ErrorState />;
}

return <Content />;
```

thường dễ đọc hơn nhiều lớp `if/else`.

Không áp dụng máy móc nếu làm flow khó hiểu hơn.

---

# 19. Conditional Rendering

Tránh JSX condition quá phức tạp.

Không nên:

```tsx
conditionA
  ? conditionB
    ? conditionC
      ? ...
      : ...
    : ...
  : ...
```

Nếu condition có business meaning, đặt tên rõ.

Ví dụ:

```ts
const canCheckout = ...
```

rồi dùng:

```tsx
{canCheckout && <CheckoutButton />}
```

---

# 20. Business Logic

Không chôn business logic phức tạp trong JSX.

Ví dụ không tốt:

```tsx
{price * quantity * taxRate - discount > 1000000 ? ... : ...}
```

Nếu logic có meaning rõ, tách thành function.

Ví dụ:

```ts
calculateOrderTotal()
```

---

# 21. Magic Values

Nếu một giá trị:

* Có business meaning.
* Có design meaning.
* Được dùng nhiều nơi.

thì cân nhắc đặt tên hoặc dùng token.

Ví dụ:

```ts
const MAX_LOGIN_ATTEMPTS = 5;
```

Không tạo constant cho mọi literal nhỏ nếu không đem lại readability.

---

# 22. String Literal

Nếu cùng một domain value xuất hiện nhiều nơi và có nguy cơ sai chính tả:

Cân nhắc type/constant phù hợp.

Ví dụ:

```ts
type OrderStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";
```

Không hard-code string rải rác nếu chúng đại diện cho domain state quan trọng.

---

# 23. Import

Giữ import sạch và có tổ chức.

Sau khi chỉnh code:

* Xóa unused import.
* Không duplicate import.
* Không giữ dependency không còn dùng.
* Tránh circular dependency.

Theo alias/import convention hiện tại của project.

---

# 24. Dead Code

Không giữ code đã chắc chắn không còn dùng:

* Component cũ.
* Function cũ.
* Hook cũ.
* Type cũ.
* Import cũ.
* Duplicate implementation.

Không comment-out hàng trăm dòng code để "để đó sau này".

Version control đã lưu lịch sử.

---

# 25. Comments

Comment phải giải thích:

```text
WHY
```

không phải mô tả lại:

```text
WHAT
```

Ví dụ tốt:

```ts
// Keep the config reference stable because Swiper reinitializes
// when the configuration object identity changes.
```

Không tốt:

```ts
// Set loading to true.
setLoading(true);
```

Không thêm comment thừa làm code rối hơn.

---

# 26. TODO

Không để TODO mơ hồ như:

```text
TODO: fix later
TODO: improve
TODO: refactor
```

Nếu cần TODO, phải nói rõ:

* Cần làm gì.
* Tại sao chưa làm.
* Điều kiện nào cần xử lý.

Không tạo TODO để né hoàn thành task hiện tại.

---

# 27. Error Handling

Không swallow error.

Không:

```ts
try {
  ...
} catch {
}
```

nếu error cần được xử lý.

Error phải được:

* Handle.
* Normalize.
* Report.
* Propagate.

ở boundary phù hợp.

---

# 28. Async Code

Async function phải xử lý rõ:

* Loading nếu cần.
* Error.
* Success.
* Cleanup nếu có.
* Duplicate request nếu có.

Không tạo Promise chain phức tạp khi `async/await` dễ đọc hơn.

---

# 29. Null / Undefined

Không dùng non-null assertion:

```ts
value!
```

một cách tùy tiện.

Phải hiểu tại sao value chắc chắn tồn tại.

Ưu tiên handle nullable state rõ ràng.

---

# 30. Optional Chaining

Sử dụng optional chaining khi dữ liệu thực sự optional.

Không dùng:

```ts
a?.b?.c?.d?.e
```

để che một data model không rõ ràng.

Nếu structure đáng lẽ bắt buộc tồn tại, type phải phản ánh điều đó.

---

# 31. Props

Props phải vừa đủ.

Không truyền nguyên object lớn nếu component chỉ cần:

```text
name
price
image
```

trừ khi passing whole domain object giúp responsibility rõ hơn.

Đánh giá theo context thực tế.

---

# 32. Boolean Props

Tránh component có quá nhiều boolean:

```tsx
<Card
  isLarge
  isAdmin
  isDark
  hasBorder
  showImage
  showButton
/>
```

Đây có thể là dấu hiệu component xử lý quá nhiều variant/responsibility.

Khi phù hợp, sử dụng:

```tsx
<Card variant="admin" />
```

hoặc composition.

---

# 33. UI và Business Logic

UI primitive không được biết business rule.

Ví dụ:

```text
Button
```

không nên biết:

```text
User Role
Product Status
Order Permission
API Endpoint
```

Business feature quyết định khi nào Button xuất hiện hoặc disabled.

Button chỉ xử lý UI behavior của Button.

---

# 34. API Logic

Không đặt HTTP transport logic trong UI primitive.

Không để:

```text
Button
Input
Modal
Badge
```

tự gọi backend.

API responsibility phải nằm ở service/feature boundary phù hợp.

---

# 35. Folder Naming

Tên folder phải:

* Ngắn.
* Rõ responsibility.
* Consistent.
* Không viết tắt khó hiểu.

Không dùng:

```text
new
temp
final
final2
old
backup
test2
```

cho source code production.

---

# 36. File Naming

Theo convention hiện tại của project.

Tên file phải giúp hiểu được nội dung.

Ví dụ:

```text
ProductCard.tsx
product.service.ts
useProductSearch.ts
product.types.ts
```

Không tạo:

```text
newFile.ts
helper2.ts
component-final.tsx
test-new.tsx
```

---

# 37. Dependency

Trước khi thêm package:

1. Kiểm tra package.json.
2. Kiểm tra project đã có giải pháp tương tự chưa.
3. Kiểm tra built-in API.
4. Kiểm tra maintenance cost.
5. Kiểm tra bundle impact.

Không thêm dependency cho functionality nhỏ nếu code nội bộ đơn giản hơn.

---

# 38. Security

Không commit hoặc hard-code:

* Password.
* API Secret.
* Private Token.
* Database credentials.
* Sensitive keys.

Không log sensitive information.

Environment variable phải được sử dụng đúng client/server boundary.

---

# 39. Accessibility

Không làm mất accessibility trong quá trình refactor.

Đối với UI interaction, giữ:

* Semantic HTML.
* Keyboard access.
* Focus behavior.
* Label.
* Disabled behavior.
* aria attributes khi cần.

---

# 40. Performance

Không tối ưu performance dựa trên cảm giác.

Trước khi optimize:

* Xác định bottleneck.
* Xác định render cost.
* Xác định network/data issue.
* Xác định bundle issue.

Không sacrifice readability cho optimization không có evidence.

---

# 41. Public API

Khi sửa shared component, hook hoặc service:

Phải kiểm tra consumer.

Không thay đổi tùy tiện:

* Props.
* Return type.
* Function signature.
* Variant.
* Event callback.

Nếu bắt buộc thay đổi:

Cập nhật tất cả consumer liên quan.

---

# 42. Refactor và Feature phải phân biệt

Nếu task là refactor:

Mặc định giữ nguyên behavior.

Không tự thêm:

* Feature mới.
* Animation mới.
* API mới.
* UI redesign.
* Dependency mới.

Nếu behavior thay đổi thì đó là feature change.

---

# 43. Scope Control

Chỉ sửa những file cần thiết cho task.

Nếu phát hiện vấn đề khác:

Có thể báo lại.

Không tự mở rộng scope nếu không cần để hoàn thành yêu cầu.

---

# 44. Root Cause

Khi sửa bug:

Ưu tiên tìm root cause.

Không chữa bằng workaround nếu có thể sửa đúng boundary.

Ví dụ:

Không:

```text
Increase z-index until it works.
```

Mà phải hiểu:

```text
Which stacking context causes the issue?
```

---

# 45. Preserve Behavior

Khi refactor hoặc cleanup, mặc định phải giữ:

* UI behavior.
* Business behavior.
* API behavior.
* Routing.
* Responsive.
* Accessibility.
* Existing interaction.

Không thay đổi behavior âm thầm.

---

# 46. Verification

Sau khi thay đổi code, khi phù hợp phải:

1. Re-read file đã sửa.
2. Kiểm tra imports.
3. Kiểm tra TypeScript.
4. Kiểm tra lint.
5. Kiểm tra build.
6. Kiểm tra affected consumers.
7. Kiểm tra regression.

Không coi task hoàn thành chỉ vì code "nhìn có vẻ đúng".

---

# 47. Không Được Làm

Không:

* Dùng `any` để chữa type error.
* Dùng `@ts-ignore` tùy tiện.
* Rewrite file không cần thiết.
* Refactor unrelated code.
* Tạo abstraction quá sớm.
* Chia file vô nghĩa.
* Thêm dependency không cần.
* Giữ dead code.
* Comment code hiển nhiên.
* Over-optimize.
* Thay đổi behavior ngoài yêu cầu.
* Tạo architecture phức tạp hơn problem.

---

# 48. Nguyên Tắc Cuối

Luôn ưu tiên:

```text
Readable
> Clever

Explicit
> Hidden Magic

Simple
> Over-engineered

Correct
> Short

Clear Responsibility
> Maximum Reuse

Correct Abstraction
> Premature Abstraction

Small Correct Change
> Large Rewrite

Maintainability
> Minimum Line Count
```

```
```
