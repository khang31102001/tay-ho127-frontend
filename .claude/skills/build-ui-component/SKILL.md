````markdown
---
name: build-ui-component
description: >
  Xây dựng, chuẩn hóa và cải tiến reusable UI components trong project
  Next.js, React, TypeScript và Tailwind CSS hiện tại. Sử dụng skill này khi
  người dùng yêu cầu tạo Button, Input, Modal, Card, Form, Table, Navigation,
  Tabs, Dropdown, Pagination, Search, layout component, component cho User UI,
  Admin UI hoặc xây dựng internal UI design system có khả năng tái sử dụng,
  mở rộng và hạn chế phụ thuộc vào thư viện UI bên ngoài.
---

# Build UI Component

## Mục tiêu

Xây dựng UI Component theo hướng:

- Reusable.
- Maintainable.
- Dễ đọc.
- Dễ mở rộng.
- Type-safe.
- Responsive.
- Accessible.
- Đồng bộ thiết kế.
- Ít dependency không cần thiết.
- Phù hợp kiến trúc hiện tại của project.

Không tạo component chỉ để giảm số dòng code.

Không over-engineering.

---

# 1. Nguyên tắc quan trọng nhất

Trước khi tạo component mới:

PHẢI kiểm tra codebase hiện tại.

Thực hiện theo thứ tự:

1. Hiểu yêu cầu UI.
2. Tìm component tương tự trong project.
3. Kiểm tra shared UI hiện tại.
4. Kiểm tra design tokens.
5. Kiểm tra naming convention.
6. Kiểm tra cách component đang được tổ chức.
7. Xác định responsibility.
8. Quyết định REUSE / EXTEND / CREATE.
9. Thiết kế API của component.
10. Implement.
11. Kiểm tra responsive và accessibility.
12. Kiểm tra khả năng tái sử dụng.

Không tạo component duplicate nếu project đã có component phù hợp.

---

# 2. Phân loại Component

Trước khi tạo component phải xác định nó thuộc nhóm nào.

## UI Primitive

Là component cơ bản, ít phụ thuộc business.

Ví dụ:

- Button.
- Input.
- Textarea.
- Checkbox.
- Radio.
- Badge.
- Divider.
- Spinner.
- Skeleton.
- IconButton.

Đây là nhóm ưu tiên đặt trong shared UI.

Ví dụ:

```text
components/
└── ui/
    ├── button/
    ├── input/
    ├── badge/
    └── spinner/
````

---

## Composite UI Component

Là component kết hợp nhiều primitive.

Ví dụ:

* SearchBar.
* FormField.
* Modal.
* Dropdown.
* Pagination.
* Tabs.
* DatePicker wrapper.
* FilterBar.
* DataTable Toolbar.

Có thể dùng chung nếu responsibility thực sự giống nhau.

---

## Feature Component

Là component gắn với một nghiệp vụ cụ thể.

Ví dụ:

* ProductCard.
* ShoppingCartItem.
* OrderSummary.
* UserProfileCard.
* AdminOrderRow.
* ProductManagementTable.

Không tự động đưa Feature Component vào `components/ui`.

Feature Component nên nằm gần feature/domain phù hợp.

---

# 3. Nguyên tắc Responsibility

Mỗi component nên có một trách nhiệm chính.

Ví dụ tốt:

```text
Button
→ hiển thị và xử lý hành vi của button.

ProductCard
→ hiển thị thông tin Product.

SearchInput
→ nhận từ khóa tìm kiếm.

ProductList
→ hiển thị danh sách Product.
```

Không nên để một component đồng thời:

* gọi API;
* xử lý authentication;
* chứa business calculation;
* quản lý modal toàn trang;
* xử lý routing phức tạp;
* chứa nhiều feature không liên quan;
* render quá nhiều section độc lập.

Nếu responsibility bị trộn, cân nhắc tách.

---

# 4. Reuse trước khi Create

Trước khi tạo component mới, tìm kiếm:

* component cùng chức năng;
* component gần giống;
* shared primitive;
* utility;
* hook;
* style token.

Ưu tiên:

```text
REUSE
  ↓
EXTEND
  ↓
COMPOSE
  ↓
CREATE NEW
```

Không tạo component mới chỉ vì:

* khác màu;
* khác padding;
* khác icon;
* khác một trạng thái nhỏ.

Nếu semantic responsibility giống nhau, cân nhắc variant.

---

# 5. Không ép Reuse

Không phải component giống UI là phải dùng chung.

Ví dụ:

```text
ProductCard User
ProductCard Admin
```

Có thể nhìn giống nhau nhưng:

* interaction khác;
* data khác;
* business logic khác;
* action khác;
* UX khác.

Nếu responsibility khác nhau thì có thể tách.

Nguyên tắc:

```text
Reuse Responsibility
không phải
Reuse Appearance
```

---

# 6. Thiết kế Props

Props phải:

* rõ ràng;
* dễ hiểu;
* type-safe;
* ít;
* đúng responsibility.

Ví dụ tốt:

```tsx
<Button variant="primary" size="md">
  Đặt hàng
</Button>
```

Tránh kiểu:

```tsx
<Button
  isRed
  isBig
  isRounded
  isAdmin
  hasIcon
  showBorder
  useLargeText
/>
```

Quá nhiều boolean làm component khó hiểu và khó mở rộng.

---

# 7. Variant

Chỉ tạo variant khi các component có cùng responsibility nhưng khác presentation.

Ví dụ:

```text
Button

variant:
- primary
- secondary
- outline
- ghost
- destructive

size:
- sm
- md
- lg
```

Không tạo variant cho mọi khác biệt nhỏ.

Nếu một UI chỉ xuất hiện đúng một lần và khác hoàn toàn về responsibility,
không cần nhét nó vào variant.

---

# 8. Composition

Ưu tiên composition khi component cần linh hoạt.

Ví dụ:

```tsx
<Card>
  <CardHeader />
  <CardContent />
  <CardFooter />
</Card>
```

chỉ khi pattern này thực sự cần sử dụng nhiều nơi.

Không tạo compound component phức tạp cho một component đơn giản.

Giải pháp đơn giản hơn luôn được ưu tiên nếu đáp ứng được yêu cầu.

---

# 9. Internal UI System

Ưu tiên xây UI primitives nội bộ có thể dùng lại.

Ví dụ cấu trúc tham khảo:

```text
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Spinner.tsx
│   └── Tabs.tsx
│
├── common/
│
├── user/
│
└── admin/
```

Không bắt buộc thay đổi project hiện tại theo cấu trúc này.

Trước tiên phải đọc cấu trúc đang có.

Chỉ áp dụng nếu phù hợp.

---

# 10. User UI và Admin UI

User UI và Admin UI nên chia sẻ các primitive khi có thể.

Ví dụ:

```text
Button
Input
Checkbox
Modal
Spinner
Badge
FormField
```

Nhưng feature UI có thể độc lập:

```text
user/
└── ProductCard

admin/
└── ProductManagementCard
```

Không ép dùng chung component nếu làm component trở nên phức tạp.

---

# 11. Styling

Ưu tiên theo thứ tự:

1. Design token hiện tại.
2. Tailwind configuration.
3. CSS variables.
4. Shared utilities.
5. Tailwind utilities.
6. Arbitrary value khi thực sự cần.

Không hard-code màu nếu project đã có:

```text
brand-red
brand-green
brand-cream
text-primary
background
border
```

hoặc các token tương đương.

---

# 12. Không lạm dụng Arbitrary Values

Hạn chế:

```text
w-[437px]
mt-[17px]
left-[23px]
text-[19px]
z-[999]
```

nếu có thể sử dụng hệ thống spacing hoặc token hiện tại.

Arbitrary value được phép khi:

* design yêu cầu chính xác;
* không có token tương đương;
* giá trị đó có lý do rõ ràng.

Không dùng arbitrary value chỉ để vá screenshot.

---

# 13. Responsive Component

Component phải hoạt động tốt ở:

* Mobile.
* Tablet.
* Desktop.

Kiểm tra:

* width.
* min-width.
* max-width.
* wrapping.
* overflow.
* text truncation.
* image.
* button touch target.
* spacing.
* typography.

Ưu tiên layout tự nhiên.

Ví dụ:

```text
flex
grid
gap
min-width
max-width
aspect-ratio
```

trước khi sử dụng fixed dimension.

---

# 14. Accessibility

Đối với interactive component, kiểm tra:

* Semantic HTML.
* Keyboard interaction.
* Focus state.
* Label.
* Disabled state.
* aria attribute khi cần.
* Button type.
* Form accessibility.
* Color contrast.

Không sử dụng `<div>` thay cho `<button>` nếu element thực chất là button.

Không tự xây lại hành vi native HTML nếu không cần.

---

# 15. Next.js Server / Client Component

Ưu tiên Server Component nếu component chỉ render UI.

Chỉ sử dụng:

```tsx
"use client";
```

khi component cần:

* useState.
* useEffect.
* browser API.
* event interaction.
* client-only library.

Không biến component tree thành Client Component chỉ vì một child nhỏ cần interaction.

Giữ client boundary nhỏ nhất hợp lý.

---

# 16. State

State phải nằm gần nơi sở hữu nó nhất.

Không đưa state lên global nếu không cần.

Trước khi tạo state, kiểm tra:

* Có thể derive từ props không?
* Có thể calculate trong render không?
* Có phải duplicate state không?
* Có thực sự cần state không?

Tránh synchronize nhiều state bằng `useEffect` nếu không cần.

---

# 17. Event Handling

Tên event phải rõ responsibility.

Ưu tiên:

```text
onSubmit
onClose
onSelect
onChange
onAddToCart
```

Tránh:

```text
handleStuff
doAction
handleData
execute
```

Nếu event chứa business logic phức tạp, cân nhắc tách khỏi UI component.

---

# 18. Loading / Empty / Error

Component liên quan dữ liệu nên cân nhắc các state:

```text
Loading
Empty
Error
Success
```

Chỉ implement những state phù hợp với responsibility.

Không tạo API behavior trực tiếp trong primitive component.

---

# 19. Dependency Policy

Mục tiêu của project là hạn chế phụ thuộc quá nhiều UI library.

Trước khi thêm dependency mới phải kiểm tra:

1. Project đã có dependency tương tự chưa?
2. Có thể làm bằng React/Tailwind hiện tại không?
3. Component có đủ phức tạp để cần library không?
4. Library có giúp accessibility đáng kể không?
5. Library có đang maintained không?
6. Bundle size có hợp lý không?
7. Có tạo vendor lock-in không?

Không cài library chỉ vì code nhanh hơn vài phút.

---

# 20. Khi nào nên dùng Library

Có thể cân nhắc library với functionality thực sự phức tạp như:

* Advanced Data Grid.
* Rich Text Editor.
* Chart.
* Complex Date Picker.
* Advanced accessibility primitive.
* Carousel phức tạp.
* Drag & Drop phức tạp.

Nhưng phải kiểm tra project hiện có library tương đương chưa.

---

# 21. Naming Convention

Tên component phải nói rõ responsibility.

Tốt:

```text
ProductCard
SearchInput
OrderSummary
AdminSidebar
ProductTable
```

Không tốt:

```text
Component1
CommonBox
NewComponent
CardNew
TestCard
ComponentFinal
```

Tên file và component phải đồng nhất với convention hiện tại của project.

---

# 22. File Organization

Không tạo folder quá sâu nếu không cần.

Tránh:

```text
components/
└── ui/
    └── button/
        └── components/
            └── base/
                └── Button.tsx
```

nếu chỉ có một component.

Ưu tiên cấu trúc đơn giản.

Ví dụ:

```text
components/ui/Button.tsx
```

hoặc theo convention hiện tại của repository.

---

# 23. Không chia Component quá nhỏ

Không tách kiểu:

```text
ProductCard.tsx
ProductCardTitle.tsx
ProductCardPrice.tsx
ProductCardImage.tsx
ProductCardButton.tsx
```

nếu các phần này không có responsibility riêng và không được reuse.

Một component dài hơn nhưng dễ hiểu tốt hơn nhiều file nhỏ vô nghĩa.

---

# 24. Khi nào nên Extract

Nên extract khi:

* Responsibility độc lập.
* Component được reuse.
* Logic phức tạp.
* State riêng.
* UI có semantic rõ ràng.
* Code chính trở nên khó hiểu.
* Thay đổi độc lập với parent.

Không extract chỉ vì:

```text
"File vượt 100 dòng."
```

Line count không phải tiêu chí duy nhất.

---

# 25. Form Component

Đối với form:

Tách rõ:

```text
UI
Validation
State
Submit
API
```

khi complexity yêu cầu.

Không để UI primitive biết backend endpoint.

Ví dụ:

```text
Input
```

không nên biết API.

```text
LoginForm
```

có thể quản lý form interaction.

```text
authService
```

quản lý API.

---

# 26. Table

Đối với Admin Table:

Ưu tiên tách responsibility:

```text
Table UI
Pagination
Filter
Sort
Data
Action
```

nhưng không tạo abstraction generic quá sớm.

Nếu project mới chỉ có một table đơn giản, không cần xây một Data Grid framework.

---

# 27. Modal

Modal reusable nên xử lý:

* Open/Close.
* Overlay.
* Focus.
* Escape.
* Layout.
* Accessibility.

Business content nên được truyền vào bằng composition hoặc props phù hợp.

Không hard-code business feature vào base Modal.

---

# 28. Verification

Trước khi hoàn thành component:

Kiểm tra:

* Responsibility rõ chưa?
* Có component duplicate không?
* Props dễ hiểu chưa?
* Có quá nhiều boolean không?
* Responsive ổn không?
* Accessible chưa?
* TypeScript chuẩn chưa?
* Có dependency mới không cần thiết không?
* Có reuse đúng component hiện hữu không?
* Có phá UI khác không?
* Có hard-code giá trị không cần thiết không?

Nếu project hỗ trợ:

* run lint.
* run typecheck.
* run build.

khi phù hợp.

---

# 29. Không được làm

Không:

* Tạo component mới mà chưa search codebase.
* Tạo abstraction generic quá sớm.
* Tạo một UI framework riêng không cần thiết.
* Cài library cho component đơn giản.
* Ép Admin UI và User UI dùng chung feature component.
* Chia file chỉ vì file dài.
* Tạo quá nhiều props boolean.
* Hard-code business logic trong UI primitive.
* Rewrite component đang hoạt động nếu không cần.
* Refactor unrelated code.
* Thay đổi API contract khi chỉ được yêu cầu tạo UI.

---

# 30. Workflow cuối cùng

Luôn thực hiện:

```text
UNDERSTAND REQUIREMENT
        ↓
SEARCH EXISTING COMPONENTS
        ↓
IDENTIFY RESPONSIBILITY
        ↓
CLASSIFY COMPONENT
        ↓
REUSE / EXTEND / CREATE
        ↓
DESIGN MINIMAL API
        ↓
IMPLEMENT
        ↓
RESPONSIVE
        ↓
ACCESSIBILITY
        ↓
VERIFY
```

---

# 31. Khi hoàn thành

Phản hồi ngắn gọn:

## Component

Component đã tạo hoặc chỉnh sửa.

## Responsibility

Component chịu trách nhiệm gì.

## Reuse

Đã reuse những component nào.

## API

Các props/variant chính.

## Location

Component được đặt ở đâu và tại sao.

## Verify

Nội dung cần kiểm tra thêm nếu có.

Không viết tutorial dài nếu người dùng không yêu cầu.

```
```
