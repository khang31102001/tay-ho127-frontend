"use client";

import { CheckIcon } from "lucide-react";

/**
 * Danh sách mã ngôn ngữ website hỗ trợ.
 */
export type LanguageCode = "vi" | "en" | "ja";

/**
 * Cấu trúc dữ liệu của một ngôn ngữ.
 */
export interface LanguageOption {
  code: LanguageCode;

  // Tên hiển thị trong dropdown
  label: string;

  // Tên ngắn hiển thị trên Header
  shortLabel: string;
}

interface LanguageDropdownProps {
  isOpen: boolean;
  languages: readonly LanguageOption[];
  selectedLanguage: LanguageCode;

  onLanguageChange: (
    language: LanguageCode,
  ) => void;
}

/**
 * Component con:
 * Chỉ chịu trách nhiệm hiển thị danh sách ngôn ngữ.
 */
export function LanguageDropdown({
  isOpen,
  languages,
  selectedLanguage,
  onLanguageChange,
}: LanguageDropdownProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="menu"
      aria-label="Chọn ngôn ngữ"
      className="
        absolute right-0 top-[calc(100%+22px)] z-[100]
        w-[185px] rounded-[12px]
        bg-white px-5 py-4
        shadow-[0_12px_35px_rgba(0,0,0,0.18)]
      "
    >
      {languages.map((language) => {
        const isSelected =
          language.code === selectedLanguage;

        return (
          <button
            key={language.code}
            type="button"
            role="menuitemradio"
            aria-checked={isSelected}
            onClick={() =>
              onLanguageChange(language.code)
            }
            className={[
              "flex w-full items-center justify-between",
              "rounded-md px-1 py-2",
              "text-left text-[18px] leading-7",
              "transition-colors",

              isSelected
                ? "font-black text-[#303030]"
                : "font-bold text-[#b7b7b7] hover:bg-gray-50 hover:text-[#303030]",
            ].join(" ")}
          >
            <span>{language.label}</span>

            {isSelected && (
              <CheckIcon
                aria-hidden="true"
                className="h-4 w-4 text-brand-green"
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}