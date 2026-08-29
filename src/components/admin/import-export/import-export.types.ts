/**
 * Contract dùng chung cho Import/Export ở mọi màn Admin (Product, và sau này
 * Category/Customer/User/Brand/Menu...). Không biết gì về domain cụ thể —
 * domain tự cấu hình cột, parse, validate và cách lưu dữ liệu.
 */
export type ImportColumn<T> = {
  /** Tên field sẽ gán vào object kết quả (Partial<T>). */
  key: string;
  /** Tên cột hiển thị trong file CSV và bảng preview. */
  header: string;
  required?: boolean;
  /** Chuyển giá trị thô (string) trong ô CSV thành giá trị đã typed. */
  parse?: (rawValue: string, rawRow: Record<string, string>) => unknown;
  /** Trả về thông báo lỗi nếu giá trị không hợp lệ, hoặc null nếu hợp lệ. */
  validate?: (value: unknown, rawRow: Record<string, string>) => string | null;
};

export type ImportRowResult<T> = {
  rowIndex: number;
  raw: Record<string, string>;
  parsed: Partial<T>;
  errors: string[];
  status: "valid" | "invalid";
};

export type ImportOutcome<T> = {
  successCount: number;
  failures: { row: Partial<T>; message: string }[];
};

export type ImportConfig<T> = {
  columns: ImportColumn<T>[];
  /** Chỉ nhận các dòng đã pass validate (status "valid"); domain tự lưu dữ liệu. */
  onImport: (validRows: Partial<T>[]) => Promise<ImportOutcome<T>>;
};

export type ExportColumn<T> = {
  key: string;
  header: string;
  /** Mặc định lấy row[key] rồi String() — truyền format khi cần custom (giá, ngày...). */
  format?: (row: T) => string;
};
