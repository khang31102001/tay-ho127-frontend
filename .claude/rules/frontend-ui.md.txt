---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.css"
  - "src/**/*.scss"
  - "src/app/**/*"
  - "src/components/**/*"
---

# Frontend UI Rules

## Mục tiêu

Mọi UI trong project phải đảm bảo:

- Sát design.
- Responsive tốt.
- Code dễ đọc.
- Dễ maintain.
- Component có responsibility rõ.
- Tái sử dụng hợp lý.
- Accessible.
- Không patch CSS ngẫu nhiên.
- Không thêm dependency UI nếu chưa thật sự cần.

---

## 1. Đọc UI hiện tại trước khi tạo mới

Trước khi tạo hoặc chỉnh một component UI:

1. Đọc component hiện tại.
2. Đọc parent/container.
3. Tìm component tương tự.
4. Tìm UI primitive hiện có.
5. Kiểm tra design token.
6. Kiểm tra Tailwind config.
7. Kiểm tra responsive hiện tại.

Ưu tiên:

```text
REUSE
  ↓
EXTEND
  ↓
COMPOSE
  ↓
CREATE NEW