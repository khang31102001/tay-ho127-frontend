# TASK COMPLETION & CHANGE REPORT

Sau MỌI task có chỉnh sửa source code, bắt buộc kết thúc bằng một CHANGE REPORT.

Không kết thúc task chỉ bằng câu "Done", "Completed" hoặc tương tự.

CHANGE REPORT phải cho phép developer kiểm tra nhanh:
- Đã làm gì.
- File nào được tạo.
- File nào được sửa.
- File nào bị xóa.
- Logic nào thay đổi.
- Logic nào được refactor/tối ưu.
- Có thay đổi UI hay không.
- Có thay đổi API contract hay không.
- Có thay đổi business logic hay không.
- Có breaking change hay không.
- Test/build/lint đã chạy.
- Những vấn đề còn tồn tại.

Nếu không có thay đổi ở một mục, ghi rõ "Không".

Format bắt buộc:

## CHANGE REPORT

### 1. Summary
- ...

### 2. Files Changed
- [MODIFIED] `src/...`
- [ADDED] `src/...`
- [DELETED] `src/...`
- [RENAMED] `old/...` → `new/...`

### 3. Logic Changes
- ...

### 4. Refactoring / Optimization
- ...

### 5. Behavior Impact
- UI: Không thay đổi / Có thay đổi: ...
- Business Logic: Không thay đổi / Có thay đổi: ...
- API Contract: Không thay đổi / Có thay đổi: ...
- Database: Không thay đổi / Có thay đổi: ...
- Breaking Change: Không / Có: ...

### 6. Verification
- Build: PASS / FAIL / NOT RUN
- Lint: PASS / FAIL / NOT RUN
- Tests: PASS / FAIL / NOT RUN
- Type Check: PASS / FAIL / NOT RUN

### 7. Remaining Issues
- Không / ...

### 8. Recommended Next Step
- ...