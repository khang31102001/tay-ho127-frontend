"use client";

import { useEffect, useState } from "react";

import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { slugify } from "@/lib/slugify";

type SlugInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Tên/tiêu đề dùng để tự sinh slug — chỉ áp dụng khi người dùng chưa tự sửa slug. */
  sourceValue: string;
  /**
   * Cho phép tự sinh slug theo sourceValue. Domain nên truyền `false` khi
   * đang sửa bản ghi có sẵn (isEditMode) — nếu không, slug đã lưu (vd. "/"
   * của Trang chủ) sẽ bị ghi đè ngay khi load xong dữ liệu, và đổi Tên sau
   * khi đã publish sẽ âm thầm đổi URL đang chạy. Mặc định `true` (phù hợp
   * luồng tạo mới).
   */
  enableAutoGenerate?: boolean;
  /** undefined = chưa kiểm tra, true = còn dùng được, false = đã bị trùng. */
  isAvailable?: boolean;
  label?: string;
};

/**
 * Input slug dùng chung cho Page/Article: tự sinh từ tiêu đề (bỏ dấu, nối gạch
 * ngang) cho tới khi người dùng tự sửa tay, sau đó không tự sinh lại nữa.
 */
export function SlugInput({
  value,
  onChange,
  sourceValue,
  enableAutoGenerate = true,
  isAvailable,
  label = "Đường dẫn (slug)",
}: SlugInputProps) {
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (!enableAutoGenerate || isManual) {
      return;
    }

    onChange(slugify(sourceValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceValue, isManual, enableAutoGenerate]);

  return (
    <label className={adminFieldLabelClassName}>
      {label}
      <input
        type="text"
        required
        value={value}
        onChange={(event) => {
          setIsManual(true);
          onChange(slugify(event.target.value));
        }}
        className={adminFieldInputClassName}
      />

      {isAvailable === false && (
        <span className="mt-1.5 block text-[12px] font-medium text-red-600">
          Đường dẫn này đã được dùng, vui lòng chọn đường dẫn khác.
        </span>
      )}
    </label>
  );
}
