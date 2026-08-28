````markdown
---
name: debug-ui
description: >
  Phân tích, tìm root cause và sửa các lỗi giao diện/frontend trong project
  Next.js, React, TypeScript và Tailwind CSS hiện tại. Sử dụng skill này khi
  người dùng gặp lỗi layout, responsive, overflow, clipping, positioning,
  z-index, image, carousel, Swiper, animation, modal, dropdown, navigation,
  interaction, rendering hoặc UI hiển thị không đúng và cần tìm nguyên nhân
  thực sự thay vì patch CSS tạm thời.
---

# Debug UI

## Mục tiêu

Tìm đúng nguyên nhân của lỗi UI và sửa bằng thay đổi nhỏ nhất nhưng đúng kiến trúc.

Ưu tiên:

- Root cause.
- Code rõ ràng.
- Không patch tạm.
- Không phá responsive.
- Không phá component khác.
- Không thay đổi business logic nếu không liên quan.
- Không tạo thêm complexity không cần thiết.

---

# 1. Nguyên tắc quan trọng nhất

KHÔNG nhìn lỗi rồi sửa CSS ngay.

Phải debug theo quy trình:

```text
OBSERVE
   ↓
REPRODUCE
   ↓
TRACE
   ↓
ISOLATE
   ↓
ROOT CAUSE
   ↓
FIX
   ↓
VERIFY
````

Không làm kiểu:

```text
THẤY LỖI
   ↓
THÊM CSS
   ↓
THÊM z-index
   ↓
THÊM absolute
   ↓
THÊM overflow-hidden
   ↓
TẠM THẤY ĐÚNG → DỪNG
```

---

# 2. Hiểu lỗi trước khi sửa

Trước tiên phải xác định:

* UI mong muốn là gì?
* UI hiện tại đang bị gì?
* Lỗi xuất hiện ở component nào?
* Lỗi xảy ra trên viewport nào?
* Lỗi luôn xảy ra hay chỉ trong điều kiện nhất định?
* Có screenshot/design reference không?
* Có interaction nào liên quan không?
* Có library bên ngoài liên quan không?

Nếu người dùng cung cấp screenshot:

Phải đối chiếu screenshot với UI/code hiện tại.

---

# 3. Tìm Component chịu trách nhiệm

Không giả định component đang nhìn thấy chính là nguyên nhân.

Phải kiểm tra:

1. Component bị lỗi.
2. Parent component.
3. Layout wrapper.
4. Container.
5. Shared component.
6. Global style.
7. Responsive rules.
8. Library configuration.

Nhiều lỗi UI thực tế xuất phát từ parent.

---

# 4. Debug Layout theo đúng thứ tự

Khi gặp lỗi layout, kiểm tra theo thứ tự:

## Bước 1 — Parent Dimensions

Kiểm tra:

* width.
* max-width.
* min-width.
* height.
* min-height.
* max-height.

Đặc biệt chú ý các giá trị fixed.

---

## Bước 2 — Layout Model

Kiểm tra:

* block.
* flex.
* grid.
* inline-flex.
* absolute layout.

Xác định layout model có phù hợp với yêu cầu không.

---

## Bước 3 — Alignment

Kiểm tra:

* justify-content.
* align-items.
* place-items.
* text-align.

---

## Bước 4 — Spacing

Kiểm tra:

* gap.
* padding.
* margin.
* space-*.

Không thêm margin để vá lỗi nếu vấn đề thực tế nằm ở container.

---

## Bước 5 — Positioning

Kiểm tra:

* static.
* relative.
* absolute.
* fixed.
* sticky.

Nếu element dùng `absolute`, phải xác định parent positioning context.

Không thêm `relative` vào parent chỉ vì thấy absolute bị lệch.

---

## Bước 6 — Overflow

Kiểm tra:

* overflow-hidden.
* overflow-auto.
* overflow-x.
* overflow-y.
* overflow-clip.

Nếu element bị cắt:

Không xóa `overflow-hidden` ngay.

Phải hiểu tại sao property đó tồn tại.

---

## Bước 7 — Stacking Context

Kiểm tra:

* z-index.
* transform.
* opacity.
* filter.
* isolation.
* positioned ancestor.

Không tăng z-index liên tục khi chưa hiểu stacking context.

---

## Bước 8 — Responsive

Kiểm tra:

* mobile.
* tablet.
* desktop.

Tìm breakpoint đầu tiên mà UI bắt đầu sai.

Không patch từng breakpoint nếu root layout có thể được sửa.

---

## Bước 9 — Child Styling

Chỉ sau khi hiểu parent mới sửa child.

---

# 5. Không Patch CSS ngẫu nhiên

Không tự động sử dụng:

```text
relative
absolute
overflow-hidden
z-50
z-[9999]
!important
negative margin
fixed width
fixed height
```

Mỗi thay đổi phải có lý do kỹ thuật rõ ràng.

Nếu cần sử dụng thì phải hiểu tác động đến:

* document flow.
* responsive.
* stacking context.
* container.
* component khác.

---

# 6. Debug Width

Nếu component quá rộng hoặc quá hẹp, kiểm tra:

1. Parent width.
2. `w-full`.
3. `max-w-*`.
4. `min-w-*`.
5. flex grow/shrink.
6. grid columns.
7. padding.
8. viewport constraints.

Không hard-code width mới ngay lập tức.

---

# 7. Debug Height

Nếu component quá thấp, quá cao hoặc bị cắt:

Kiểm tra:

* fixed height.
* min-height.
* max-height.
* content height.
* parent overflow.
* absolute children.
* image fill.
* flex stretch.

Ưu tiên:

```text
min-height
content-driven height
aspect-ratio
```

khi phù hợp.

Hạn chế fixed height nếu nội dung có thể thay đổi.

---

# 8. Debug Flex

Nếu Flexbox hoạt động sai:

Kiểm tra:

* flex-direction.
* flex-wrap.
* flex-grow.
* flex-shrink.
* flex-basis.
* min-width.
* gap.
* justify.
* align.

Đặc biệt chú ý:

```text
min-w-0
shrink-0
flex-1
```

vì đây thường là nguyên nhân của overflow hoặc text không co đúng.

---

# 9. Debug Grid

Nếu Grid sai:

Kiểm tra:

* grid-template-columns.
* column count.
* auto-fit/auto-fill nếu có.
* minmax.
* gap.
* child span.
* responsive columns.

Không sửa child width nếu grid parent mới là nguyên nhân.

---

# 10. Debug Overflow

Nếu nội dung bị cắt hoặc tràn:

Kiểm tra:

```text
Parent dimensions
      ↓
Overflow
      ↓
Border radius
      ↓
Absolute child
      ↓
Transform
      ↓
Library wrapper
```

Đặc biệt với:

* Carousel.
* Card.
* Banner.
* Modal.
* Image.
* Tooltip.
* Dropdown.

---

# 11. Debug Z-Index

Nếu element bị nằm dưới element khác:

Không chỉ tăng:

```text
z-10
z-20
z-50
z-[9999]
```

Phải kiểm tra stacking context.

Ancestor có thể tạo stacking context khi dùng:

* transform.
* opacity.
* filter.
* isolation.
* position + z-index.

Z-index lớn trong một stacking context thấp vẫn có thể không nổi lên trên element khác.

---

# 12. Debug Image

Nếu image:

* bị crop.
* bị méo.
* quá nhỏ.
* quá lớn.
* không full.
* bị bay khỏi layout.

Kiểm tra theo thứ tự:

1. Parent dimensions.
2. Parent position.
3. `fill`.
4. width/height.
5. `object-cover`.
6. `object-contain`.
7. `aspect-ratio`.
8. overflow.
9. responsive size.
10. `sizes`.

Không sửa Image component trước khi hiểu container.

---

# 13. Next.js Image

Nếu sử dụng `Image` với `fill`:

Parent thường phải có positioning context phù hợp.

Ví dụ:

```tsx
<div className="relative h-[300px]">
  <Image
    fill
    src="..."
    alt="..."
    className="object-cover"
  />
</div>
```

Nhưng không mặc định thêm `relative`.

Phải xác định component cần layout này thật sự.

---

# 14. Debug Swiper / Carousel

Nếu carousel lỗi:

Phải đọc implementation hiện tại và version library.

Kiểm tra:

* slidesPerView.
* slidesPerGroup.
* centeredSlides.
* loop.
* autoplay.
* navigation.
* pagination.
* spaceBetween.
* breakpoints.
* allowTouchMove.
* wrapper width.
* slide width.
* overflow.
* CSS của Swiper.

Không tự viết custom transform trước khi kiểm tra API native của Swiper.

---

# 15. Swiper Navigation

Nếu nút Previous/Next không hiển thị:

Kiểm tra:

1. Navigation module đã được import chưa.
2. Navigation config đã bật chưa.
3. CSS navigation có được import không.
4. Button có bị overflow cắt không.
5. z-index có bị stacking context không.
6. Parent có fixed width/height không.
7. Custom button selector có đúng không.

Không chỉ tăng z-index.

---

# 16. Swiper bị cắt Card / Banner

Nếu phần bên trong slide bị cắt:

Kiểm tra:

* Swiper container overflow.
* Slide overflow.
* ProductCard overflow.
* Border radius.
* Absolute child.
* Fixed height.
* Transform.
* Scale animation.

Phải xác định element nào thực sự đang clipping.

---

# 17. Debug Animation

Nếu animation gây:

* giật.
* layout shift.
* element biến mất.
* overlap.
* interaction sai.

Kiểm tra:

* transform.
* opacity.
* initial state.
* exit state.
* duration.
* parent overflow.
* position.
* layout animation.

Không dùng animation để che lỗi layout.

---

# 18. Framer Motion / Motion

Nếu project dùng animation library:

Kiểm tra:

* initial.
* animate.
* exit.
* transition.
* viewport.
* whileInView.
* layout.
* AnimatePresence.

Không tạo state animation thủ công nếu library đã hỗ trợ.

---

# 19. Debug Responsive

Nếu desktop đúng nhưng mobile sai:

Không patch mobile ngay.

Kiểm tra:

1. Base style.
2. Breakpoint override.
3. Fixed width.
4. Fixed height.
5. padding.
6. grid/flex.
7. text size.
8. image.
9. overflow.

Tailwind base class áp dụng mobile-first.

Phải hiểu thứ tự override.

---

# 20. Debug Tailwind Breakpoint

Ví dụ:

```text
h-[500px]
sm:h-[400px]
md:h-[300px]
```

Phải hiểu:

* Base áp dụng mobile.
* `sm:` áp dụng từ sm trở lên.
* `md:` áp dụng từ md trở lên.

Không suy nghĩ theo kiểu:

```text
sm = mobile
md = tablet
lg = desktop
```

một cách máy móc.

Breakpoint là min-width.

---

# 21. Debug Modal

Nếu modal lỗi:

Kiểm tra:

* open state.
* overlay.
* z-index.
* stacking context.
* fixed positioning.
* scroll lock.
* Escape.
* outside click.
* focus.
* portal nếu có.

Không tăng z-index trước khi hiểu modal đang render ở đâu.

---

# 22. Debug Dropdown

Nếu dropdown bị cắt:

Kiểm tra:

* parent overflow.
* position.
* stacking context.
* portal.
* container boundary.

Nếu dropdown phải vượt khỏi container, có thể cần portal hoặc thay đổi positioning architecture.

Không tự xóa overflow của toàn layout nếu làm ảnh hưởng UI khác.

---

# 23. Debug Header / Sticky

Nếu sticky header không hoạt động:

Kiểm tra ancestor có:

* overflow-hidden.
* overflow-auto.
* transform.

Sticky phụ thuộc scroll container.

Không đổi sang fixed ngay nếu chưa hiểu nguyên nhân.

---

# 24. Debug Interaction

Nếu click/interaction sai:

Tách vấn đề thành:

```text
Rendering
State
Event
Effect
Library behavior
```

Kiểm tra:

* event handler.
* stale state.
* duplicated handler.
* event bubbling.
* stopPropagation.
* disabled state.
* async state.

Không rewrite toàn component trước khi isolate được lỗi.

---

# 25. Debug React State

Kiểm tra:

* duplicate state.
* derived state.
* stale closure.
* asynchronous update.
* incorrect dependency.
* unnecessary state synchronization.

Không thêm `useEffect` để chữa mọi vấn đề.

---

# 26. Debug useEffect

Nếu lỗi liên quan effect:

Kiểm tra:

* dependency array.
* cleanup.
* infinite loop.
* stale data.
* Strict Mode behavior.
* client-only logic.

Trước khi thêm effect mới, hỏi:

```text
Có thực sự cần useEffect không?
```

---

# 27. Debug Hydration

Nếu Next.js báo hydration mismatch:

Kiểm tra:

* browser-only API.
* Date/time.
* random values.
* localStorage.
* window.
* document.
* client/server rendering difference.
* invalid HTML nesting.

Không chỉ thêm `"use client"` vào toàn bộ page.

---

# 28. Server / Client Boundary

Kiểm tra:

* Component có cần `"use client"` thật không?
* State/effect nằm ở đâu?
* Có thể isolate interactive child không?
* Có đang import client-only library vào Server Component không?

Giữ client boundary nhỏ nhất hợp lý.

---

# 29. Debug API ảnh hưởng UI

Nếu UI không hiển thị đúng do data:

Kiểm tra:

* loading.
* undefined.
* null.
* empty.
* response shape.
* mapping.
* conditional render.

Không sửa CSS nếu nguyên nhân là data chưa đúng.

---

# 30. Debug Browser Console

Khi phù hợp, kiểm tra:

* runtime error.
* warning.
* hydration warning.
* key warning.
* network error.
* failed import.

Không bỏ qua warning liên quan trực tiếp đến lỗi.

---

# 31. Debug Build / TypeScript

Sau khi sửa:

Nếu phù hợp, chạy:

* lint.
* typecheck.
* build.

Không xem UI đúng là đủ nếu TypeScript đang lỗi.

---

# 32. Không Rewrite ngay

Khi component lỗi:

Ưu tiên:

```text
UNDERSTAND
   ↓
SMALL FIX
```

trước:

```text
DELETE COMPONENT
   ↓
WRITE AGAIN
```

Chỉ rewrite khi implementation hiện tại thật sự không còn phù hợp.

---

# 33. Thay đổi nhỏ nhất

Ưu tiên fix nhỏ nhất có thể giải quyết root cause.

Không chỉnh:

* unrelated component.
* unrelated CSS.
* unrelated architecture.
* API contract.

nếu task chỉ là debug UI.

---

# 34. Không che lỗi bằng CSS

Không dùng:

```text
display: none
visibility: hidden
opacity: 0
overflow: hidden
```

chỉ để che element lỗi nếu element đó đáng lẽ phải hiển thị.

---

# 35. Debug theo Hypothesis

Nếu lỗi phức tạp:

Tạo giả thuyết.

Ví dụ:

```text
Hypothesis 1:
Parent overflow đang cắt navigation.

Hypothesis 2:
Navigation nằm trong stacking context thấp.

Hypothesis 3:
Swiper navigation CSS chưa import.
```

Kiểm tra từng hypothesis.

Không sửa cả ba cùng lúc.

---

# 36. Root Cause phải rõ

Sau khi tìm ra lỗi phải biết:

```text
Tại sao lỗi xảy ra?
```

Không chỉ biết:

```text
Sửa class này thì hết.
```

Ví dụ tốt:

```text
Banner bị cắt vì ProductCard đang dùng overflow-hidden để bo ảnh,
trong khi banner absolute vượt ra khỏi card boundary.
```

Không tốt:

```text
Đã đổi overflow.
```

---

# 37. Verification

Sau khi sửa phải kiểm tra:

* Lỗi gốc đã hết.
* Desktop.
* Tablet.
* Mobile.
* Component bên cạnh.
* Parent layout.
* Interaction.
* Animation.
* Overflow.
* TypeScript.
* Import.

Nếu fix liên quan shared component:

Kiểm tra các nơi đang sử dụng shared component đó.

---

# 38. Regression

Luôn cân nhắc:

```text
Fix component A
→ có làm component B sai không?
```

Đặc biệt khi sửa:

* shared UI.
* layout.
* global CSS.
* Tailwind config.
* common hook.
* carousel component.

---

# 39. Không được làm

Không:

* Patch CSS ngẫu nhiên.
* Thêm z-index vô hạn.
* Thêm `!important` để chữa cháy.
* Dùng absolute khắp nơi.
* Xóa overflow mà chưa hiểu.
* Rewrite component ngay.
* Cài thêm library chỉ để sửa bug.
* Thay đổi business logic không liên quan.
* Refactor cả project khi chỉ debug một component.
* Hard-code viewport duy nhất.
* Sửa screenshot đúng nhưng phá responsive.

---

# 40. Workflow cuối cùng

Luôn thực hiện:

```text
UNDERSTAND EXPECTED BEHAVIOR
        ↓
LOCATE COMPONENT
        ↓
INSPECT PARENT
        ↓
REPRODUCE ISSUE
        ↓
TRACE LAYOUT / STATE / LIBRARY
        ↓
FORM HYPOTHESIS
        ↓
IDENTIFY ROOT CAUSE
        ↓
APPLY SMALLEST CORRECT FIX
        ↓
VERIFY RESPONSIVE
        ↓
CHECK REGRESSION
```

---

# 41. Khi hoàn thành

Phản hồi ngắn gọn:

## Root Cause

Nguyên nhân thực sự của lỗi.

## Fix

Đã sửa như thế nào.

## Why This Fix

Tại sao cách sửa này đúng hơn patch tạm thời.

## Files Changed

Các file đã thay đổi.

## Verify

Những điểm cần kiểm tra lại trên browser nếu có.

Không viết tutorial dài nếu người dùng không yêu cầu.

```
```
