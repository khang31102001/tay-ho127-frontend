````markdown
# CLAUDE.md

## 1. Project Overview

Đây là project Frontend Web Application được xây dựng chủ yếu bằng:

- Next.js
- React
- TypeScript
- Tailwind CSS

Project bao gồm hai nhóm giao diện chính:

- User Site.
- Admin Site.

Mục tiêu của codebase:

- Kiến trúc rõ ràng.
- Dễ đọc.
- Dễ mở rộng.
- Dễ maintain.
- Responsive tốt.
- UI đồng bộ.
- Màu sắc đồng bộ theo brand
- Style phân chia rã ràng -> tập trung theo mục đích nghiệp vụ, để thay thế dễ dàng đồng bộ
- Có thể tái sử dụng component.
- Hạn chế phụ thuộc quá nhiều UI library bên ngoài.
- Chuẩn bị sẵn architecture để kết nối Backend API.
- Có thể sử dụng Mock API trong giai đoạn Backend chưa hoàn thiện.

---

# 2. Working Principle

Trước khi sửa hoặc tạo code:

1. Đọc requirement.
2. Inspect code hiện tại.
3. Tìm component/hook/service tương tự.
4. Hiểu parent và consumer.
5. Xác định responsibility.
6. Xác định root cause nếu đang sửa lỗi.
7. Chọn giải pháp đơn giản nhất nhưng đúng architecture.
8. Implement.
9. Verify.
10. Kiểm tra regression.

Không code dựa trên giả định khi có thể đọc codebase để xác nhận.

---

# 3. Existing Code First

Luôn ưu tiên:

```text
REUSE
  ↓
EXTEND
  ↓
COMPOSE
  ↓
CREATE NEW
````

Trước khi tạo:

* Component.
* Hook.
* Service.
* Helper.
* Type.
* Utility.

phải tìm xem project đã có implementation tương tự chưa.

Không tạo duplicate implementation không cần thiết.

---

# 4. Architecture Principles

Mỗi module/component phải có responsibility rõ ràng.

Ưu tiên dependency:

```text
Page / Feature
      ↓
Feature Component
      ↓
Shared Component
      ↓
UI Primitive
```

Đối với dữ liệu:

```text
UI
 ↓
Feature Logic
 ↓
Service
 ↓
API Client
 ↓
Backend
```

Không áp dụng kiến trúc phức tạp hơn requirement thực tế.

---

# 5. UI Architecture

UI được chia theo responsibility.

## UI Primitive

Các component cơ bản như:

* Button.
* Input.
* Checkbox.
* Modal.
* Badge.
* Spinner.
* Skeleton.

Không chứa business logic.

## Feature Component

Các component thuộc nghiệp vụ như:

* ProductCard.
* CartItem.
* LoginForm.
* OrderSummary.
* ProductManagementTable.

Feature Component không mặc định được đưa vào shared UI.

---

# 6. User UI & Admin UI

User Site và Admin Site được phép dùng chung:

* UI primitives.
* Design tokens.
* Utilities.
* Types phù hợp.
* API infrastructure.

Không ép User UI và Admin UI dùng chung Feature Component nếu:

* UX khác nhau.
* Action khác nhau.
* Business responsibility khác nhau.

Nguyên tắc:

```text
Reuse Responsibility
không phải
Reuse Appearance
```

---

# 7. Internal UI System

Ưu tiên xây dựng và tái sử dụng UI component nội bộ.

Trước khi thêm UI library mới:

1. Kiểm tra project đã có solution chưa.
2. Kiểm tra React/Tailwind hiện tại có giải quyết được không.
3. Xác định library có thực sự giảm maintenance không.
4. Xác định impact tới bundle và architecture.

Không thêm dependency chỉ để giải quyết một component đơn giản.

---

# 8. Screenshot / Design Implementation

Khi người dùng cung cấp screenshot hoặc design:

Không code ngay.

Phải:

1. Phân tích screenshot.
2. Xác định layout.
3. Xác định spacing.
4. Xác định typography.
5. Xác định color/style.
6. Xác định image behavior.
7. Xác định responsive behavior.
8. Tìm implementation hiện tại.
9. So sánh Current UI với Target UI.
10. Xác định delta.
11. Sau đó mới implement.

Không patch CSS ngẫu nhiên chỉ để giao diện giống screenshot tại một viewport.

---

# 9. Responsive

Mọi UI phải cân nhắc:

* Mobile.
* Tablet.
* Desktop.

Ưu tiên:

* Flexbox.
* Grid.
* max-width.
* min-width.
* aspect-ratio.
* responsive spacing.
* responsive typography.

Không thiết kế desktop rồi vá mobile sau.

---

# 10. API Architecture

UI không nên phụ thuộc trực tiếp vào HTTP implementation.

Ưu tiên:

```text
UI
 ↓
Feature Logic
 ↓
Service
 ↓
API Client
 ↓
Backend
```

Trong giai đoạn Backend chưa hoàn thiện:

Được phép sử dụng Mock API.

Nhưng Mock API phải được thiết kế để sau này:

```text
Mock API
   ↓
Real Backend
```

mà hạn chế sửa lại UI.

Không hard-code mock data sâu trong JSX nếu data đó đại diện cho Backend.

---

# 11. API Contract

Không tự bịa Backend API Contract và coi đó là API thật.

Nếu Backend chưa có:

Phải xác định rõ:

```text
MOCK CONTRACT
```

hoặc:

```text
TEMPORARY CONTRACT
```

Khi Backend thật được cung cấp, ưu tiên thay đổi tại:

* API Client.
* Service.
* DTO.
* Mapper.

thay vì sửa nhiều UI Component.

---

# 12. Next.js

Tôn trọng architecture Next.js hiện tại của repository.

Ưu tiên Server Component khi không cần client behavior.

Chỉ sử dụng:

```tsx
"use client";
```

khi thực sự cần:

* State.
* Effect.
* Event interaction.
* Browser API.
* Client-only library.

Không biến toàn bộ page thành Client Component chỉ vì một child cần interaction.

---

# 13. TypeScript

Ưu tiên type-safe.

Không sử dụng:

```ts
any
```

nếu có thể xác định type.

Không chữa TypeScript error bằng:

```text
as any
@ts-ignore
@ts-nocheck
```

một cách tùy tiện.

Tên type phải phản ánh đúng responsibility.

---

# 14. Refactoring

Refactor không đồng nghĩa với rewrite.

Không refactor chỉ vì:

* File dài.
* Component nhiều dòng.
* Muốn áp Design Pattern.
* Muốn chia nhiều folder hơn.

Chỉ refactor khi có vấn đề thực tế về:

* Responsibility.
* Coupling.
* Duplication.
* Maintainability.
* Readability.
* State complexity.
* Data flow.

Không chia component thành nhiều file nhỏ nếu không có semantic boundary rõ.

---

# 15. Design Patterns

Không áp dụng Design Pattern máy móc.

Pattern chỉ được dùng khi giải quyết một vấn đề cụ thể.

Ưu tiên:

```text
Simple Composition
Clear Responsibility
Explicit Data Flow
```

trước abstraction phức tạp.

Không biến Frontend thành Enterprise Backend Architecture không cần thiết.

---

# 16. Bug Fixing

Khi sửa lỗi:

Ưu tiên:

```text
OBSERVE
 ↓
TRACE
 ↓
ROOT CAUSE
 ↓
FIX
 ↓
VERIFY
```

Không:

```text
THẤY LỖI
 ↓
PATCH CSS
 ↓
TẠM CHẠY
```

Không tự động:

* tăng z-index;
* thêm absolute;
* thêm overflow-hidden;
* thêm negative margin;
* thêm fixed dimensions;

nếu chưa hiểu nguyên nhân.

---

# 17. Scope Control

Chỉ thay đổi code cần thiết cho requirement hiện tại.

Không tự động:

* Rewrite feature khác.
* Restructure toàn repository.
* Rename hàng loạt.
* Thay UI library.
* Thay API architecture.
* Refactor unrelated code.

Nếu phát hiện vấn đề khác:

Có thể báo lại nhưng không tự mở rộng scope nếu không cần thiết.

---

# 18. Preserve Existing Behavior

Khi refactor hoặc chỉnh kiến trúc, mặc định phải giữ:

* Business behavior.
* UI behavior.
* Responsive behavior.
* API behavior.
* Routing.
* Accessibility.
* Existing interactions.

Nếu behavior thay đổi thì phải là thay đổi có chủ đích.

---

# 19. Verification

Sau khi thay đổi code, khi phù hợp phải kiểm tra:

* Imports.
* TypeScript.
* Lint.
* Build.
* Responsive.
* Interaction.
* Affected consumers.
* Regression.

Không coi task hoàn thành chỉ vì code nhìn có vẻ đúng.

---

# 20. Project Rules

Các rule chi tiết nằm tại:

```text
.claude/rules/
├── architecture.md
├── frontend-ui.md
├── api-integration.md
└── code-quality.md
```

Phải tuân thủ các rule phù hợp với phạm vi task.

Không duplicate toàn bộ nội dung rules vào file này.

---

# 21. Project Skills

Các workflow chuyên biệt nằm tại:

```text
.claude/skills/
├── screenshot-to-ui/
├── build-ui-component/
├── integrate-api/
├── debug-ui/
└── refactor-code/
```

Sử dụng skill phù hợp khi task tương ứng.

### screenshot-to-ui

Dùng khi:

* Có screenshot.
* Có design reference.
* Cần dựng/chỉnh UI theo thiết kế.

### build-ui-component

Dùng khi:

* Tạo reusable UI component.
* Chuẩn hóa internal UI system.

### integrate-api

Dùng khi:

* Mock API.
* Connect Backend.
* Request/Response.
* Service/API Client.

### debug-ui

Dùng khi:

* UI lỗi.
* Responsive lỗi.
* Swiper lỗi.
* Overflow.
* Position.
* Z-index.
* Interaction.

### refactor-code

Dùng khi:

* Code khó maintain.
* Responsibility bị trộn.
* Component cần refactor.
* Coupling/Duplication cao.

---

# 22. Communication

Khi thực hiện task:

Không cần giải thích lý thuyết dài dòng.

Ưu tiên báo:

## Root Cause / Analysis

Vấn đề chính là gì.

## Solution

Giải pháp được chọn.

## Files Changed

Các file đã thay đổi.

## Result

Kết quả đạt được.

## Verify

Điểm cần kiểm tra thêm nếu có.

---

# 23. Final Principles

Luôn ưu tiên:

```text
Understand Before Change

Existing Code Before New Code

Root Cause Before Patch

Reuse Before Duplicate

Responsive Before Fixed Layout

Type Safety Before any

Simple Before Over-engineered

Clear Responsibility Before Maximum Reuse

Small Correct Change Before Large Rewrite

Maintainability Before Minimum Line Count
```

```
```
