---
name: screenshot-to-ui
description: >
  Phân tích screenshot, mockup hoặc hình ảnh thiết kế và triển khai/chỉnh sửa
  giao diện trong project Next.js, React, TypeScript và Tailwind CSS hiện tại.
  Sử dụng skill này khi người dùng gửi screenshot hoặc yêu cầu dựng UI theo
  thiết kế, chỉnh giao diện giống ảnh mẫu, sửa responsive, layout, spacing,
  typography, image, banner, card, section, carousel, header, footer,
  User UI hoặc Admin UI.
---

# Screenshot To UI

## Mục tiêu

Chuyển screenshot hoặc design reference thành giao diện thực tế trong codebase.

Kết quả phải đồng thời đảm bảo:

- Gần với thiết kế gốc.
- Responsive tốt.
- Code rõ ràng.
- Component có trách nhiệm rõ ràng.
- Tái sử dụng component hiện có khi phù hợp.
- Không phá kiến trúc project.
- Không thêm dependency không cần thiết.
- Không sửa kiểu chắp vá chỉ để giao diện nhìn đúng tạm thời.

---

# 1. Nguyên tắc quan trọng nhất

Khi nhận screenshot:

KHÔNG được nhìn ảnh rồi lập tức sửa CSS.

Phải thực hiện theo thứ tự:

1. Phân tích screenshot.
2. Tìm page/component tương ứng trong codebase.
3. Đọc component hiện tại.
4. Đọc parent/container của component.
5. Kiểm tra component dùng chung.
6. So sánh code hiện tại với thiết kế.
7. Xác định nguyên nhân khác biệt.
8. Đề xuất giải pháp.
9. Chỉnh code.
10. Kiểm tra responsive và regression.

Luôn ưu tiên sửa ROOT CAUSE thay vì patch giao diện.

---

# 2. Phân tích Screenshot

Trước khi code, phân tích các yếu tố:

## Layout

Xác định:

- Container.
- Max width.
- Section width.
- Section height.
- Grid hoặc Flex.
- Số column.
- Alignment.
- Content hierarchy.

## Spacing

Xác định:

- Padding.
- Margin.
- Gap.
- Khoảng cách giữa các section.
- Khoảng cách giữa heading và content.
- Khoảng cách giữa các card.

Không đoán pixel một cách máy móc.

Nếu screenshot không đủ thông tin, ưu tiên:

1. Design token hiện tại.
2. Pattern đã tồn tại trong project.
3. Giá trị responsive hợp lý.

---

# 3. Typography

Kiểm tra:

- Font family.
- Font size.
- Font weight.
- Line height.
- Letter spacing.
- Text alignment.
- Màu chữ.
- Hierarchy giữa heading/subheading/body.

Không tạo quá nhiều font-size tùy ý nếu project đã có typography convention.

---

# 4. Color & Visual Style

Phân tích:

- Background.
- Brand color.
- Text color.
- Border.
- Radius.
- Shadow.
- Overlay.
- Opacity.
- Gradient.

Trước khi thêm màu mới:

Kiểm tra project đã có:

- Tailwind token.
- CSS variable.
- Theme config.
- Brand color.

Nếu đã tồn tại thì phải tái sử dụng.

---

# 5. Đọc Code Hiện Tại Trước

Trước khi tạo component mới:

Tìm kiếm:

- Component tương tự.
- Shared component.
- UI primitive.
- Layout component.
- Existing utility.
- Existing animation.
- Existing Tailwind token.

Ưu tiên:

REUSE → EXTEND → CREATE NEW

Không:

CREATE NEW → phát hiện sau đó project đã có component tương tự.

---

# 6. Component Responsibility

Mỗi component nên có một trách nhiệm chính.

Ví dụ:

ProductCard

chịu trách nhiệm hiển thị Product.

Không nên đồng thời xử lý:

- API request.
- Authentication.
- Modal toàn trang.
- Routing logic phức tạp.
- Business calculation không liên quan.

Nếu component quá phức tạp, cân nhắc tách:

- Child component.
- Hook.
- Helper.
- Config.
- Service.

Nhưng KHÔNG chia file chỉ vì file dài.

Chỉ refactor khi có responsibility rõ ràng để tách.

---

# 7. Reusable UI

Ưu tiên sử dụng UI component nội bộ của project.

Ví dụ:

components/ui/

có thể chứa:

- Button
- Input
- Modal
- Badge
- Spinner
- Container
- Tabs
- Divider
- Form controls

Không tạo lại component nếu chức năng tương tự đã tồn tại.

---

# 8. User UI và Admin UI

User UI và Admin UI có thể dùng chung UI primitives.

Ví dụ:

Button
Input
Modal
Badge
Spinner

Nhưng không ép User UI và Admin UI phải dùng chung feature component nếu:

- UX khác nhau.
- Responsibility khác nhau.
- Business behavior khác nhau.

Tái sử dụng dựa trên RESPONSIBILITY.

Không tái sử dụng chỉ vì hai component nhìn giống nhau.

---

# 9. Responsive

Mọi UI phải được kiểm tra tối thiểu trên:

- Mobile.
- Tablet.
- Desktop.

Ưu tiên:

- flex.
- grid.
- max-width.
- min-width.
- aspect-ratio.
- responsive gap.
- responsive padding.
- responsive typography.

Hạn chế:

- width cố định.
- height cố định.
- absolute positioning quá mức.
- negative margin.
- breakpoint patch liên tục.

Không sửa desktop trước rồi vá mobile sau.

Thiết kế layout phải responsive ngay từ cấu trúc ban đầu.

---

# 10. Quy tắc Position

Trước khi sử dụng:

absolute

phải xác định:

- Nó cần absolute thật không?
- Parent nào phải relative?
- Có làm element thoát document flow không?
- Có gây lỗi responsive không?

Không thêm `relative` vào parent chỉ để thử.

Phải hiểu positioning context.

---

# 11. Overflow

Nếu UI bị:

- cắt nội dung.
- mất button.
- mất banner.
- carousel bị cắt.
- image bị crop sai.

Kiểm tra theo thứ tự:

1. Parent width/height.
2. overflow-hidden.
3. overflow-x.
4. overflow-y.
5. border-radius.
6. absolute element.
7. transform.
8. Swiper wrapper.
9. stacking context.

Không xóa `overflow-hidden` ngay lập tức nếu chưa hiểu tại sao nó tồn tại.

---

# 12. Z-Index

Không giải quyết lỗi bằng cách tăng:

z-10
z-20
z-50
z-[9999]

một cách ngẫu nhiên.

Trước tiên kiểm tra stacking context.

Đặc biệt kiểm tra parent có:

- transform.
- opacity.
- filter.
- isolation.
- positioned z-index.

Sau đó mới quyết định z-index phù hợp.

---

# 13. Image

Khi sử dụng Next.js Image:

Kiểm tra:

- Parent dimensions.
- `fill`.
- width/height.
- `object-cover`.
- `object-contain`.
- `sizes`.
- aspect ratio.
- overflow.

Nếu ảnh bị crop:

KHÔNG sửa Image trước.

Phải kiểm tra container của Image trước.

Chỉ dùng `priority` cho ảnh thực sự cần tải ưu tiên.

---

# 14. Swiper / Carousel

Nếu UI sử dụng Swiper hoặc carousel:

Trước khi viết custom logic, kiểm tra API native của library.

Đọc:

- slidesPerView.
- slidesPerGroup.
- centeredSlides.
- loop.
- autoplay.
- navigation.
- pagination.
- breakpoints.
- spaceBetween.

Nếu thư viện đã hỗ trợ hành vi mong muốn thì sử dụng API chính thức.

Không tự viết transform/state phức tạp để thay thế chức năng thư viện đã có.

---

# 15. Animation

Animation phải phục vụ trải nghiệm.

Không dùng animation để che lỗi layout.

Ưu tiên animation library project đang có.

Không cài thêm library nếu functionality hiện tại đã đủ.

Animation cần:

- nhẹ.
- rõ ràng.
- không gây giật layout.
- không ảnh hưởng interaction.
- responsive hợp lý.

---

# 16. Dependency

Không tự động cài thư viện mới.

Trước khi thêm dependency phải kiểm tra:

1. Project đã có giải pháp chưa?
2. Có thể xây đơn giản bằng stack hiện tại không?
3. Library có thực sự tiết kiệm maintenance không?
4. Có làm bundle nặng hơn đáng kể không?
5. Có gây coupling không?

Ưu tiên:

Internal UI System + Existing Libraries

trước khi thêm thư viện mới.

---

# 17. Debug Layout

Nếu UI không giống screenshot, debug theo thứ tự:

1. Parent container.
2. Width / max-width.
3. Height / min-height.
4. Flex/Grid.
5. Alignment.
6. Gap.
7. Padding.
8. Margin.
9. Position.
10. Overflow.
11. Z-index.
12. Breakpoint.
13. Child styles.

Không sửa child trước khi hiểu parent layout.

---

# 18. Quy trình Implementation

Sau khi phân tích:

## Bước 1

Xác định component cần chỉnh.

## Bước 2

Xác định root cause.

## Bước 3

Xác định component có thể reuse.

## Bước 4

Lập phương án thay đổi nhỏ nhất.

## Bước 5

Chỉnh code.

## Bước 6

Kiểm tra responsive.

## Bước 7

Kiểm tra interaction.

## Bước 8

Kiểm tra TypeScript/import.

## Bước 9

Run lint/build/typecheck nếu project hỗ trợ và việc chạy phù hợp.

## Bước 10

Review lại các file đã thay đổi.

---

# 19. Không được làm

Không được:

- Rewrite toàn bộ component nếu không cần.
- Tạo component duplicate.
- Cài library tùy tiện.
- Patch CSS ngẫu nhiên.
- Hard-code quá nhiều pixel.
- Sử dụng `!important` để chữa cháy.
- Tăng z-index liên tục để sửa lỗi.
- Dùng absolute positioning cho mọi thứ.
- Thay đổi business logic khi chỉ được yêu cầu sửa UI.
- Refactor unrelated code.
- Xóa functionality đang hoạt động.
- Tự thay đổi API contract.

---

# 20. Khi hoàn thành

Sau khi sửa code, phản hồi ngắn gọn theo format:

## Root Cause

Nguyên nhân chính của vấn đề.

## Solution

Giải pháp đã áp dụng.

## Files Changed

Các file chính đã chỉnh sửa.

## Result

Kết quả đạt được.

## Need Verify

Những nội dung cần người dùng kiểm tra trực tiếp trên browser nếu có.

Không giải thích dài dòng trừ khi người dùng yêu cầu.