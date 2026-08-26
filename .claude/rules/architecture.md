# Architecture Rules

## Mục tiêu

Giữ kiến trúc project Next.js / React / TypeScript theo hướng:

- Rõ ràng.
- Dễ đọc.
- Dễ mở rộng.
- Dễ bảo trì.
- Responsibility rõ ràng.
- Hạn chế coupling.
- Tái sử dụng hợp lý.
- Không over-engineering.
- Không phụ thuộc quá nhiều thư viện bên ngoài.

Luôn ưu tiên kiến trúc hiện tại của repository trước khi đề xuất cấu trúc mới.

---

## 1. Đọc Codebase Trước Khi Thay Đổi

Trước khi tạo file, component, service, hook hoặc thay đổi kiến trúc:

1. Đọc file liên quan.
2. Đọc parent và consumer.
3. Tìm implementation tương tự.
4. Hiểu data flow hiện tại.
5. Hiểu responsibility hiện tại.
6. Xác định thay đổi nhỏ nhất cần thiết.

Không tự tạo kiến trúc mới khi chưa hiểu codebase.

---

## 2. Dependency Direction

Ưu tiên dependency theo hướng:

```text
Page / Feature
      ↓
Feature Component
      ↓
Shared Component
      ↓
UI Primitive