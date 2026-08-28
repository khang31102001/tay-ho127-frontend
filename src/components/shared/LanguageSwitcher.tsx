"use client";

import Script from "next/script";
import {
  ChevronDownIcon,
  LanguagesIcon,
} from "lucide-react";

import {
  LanguageDropdown,
  type LanguageCode,
  type LanguageOption,
} from "./LanguageDropdown";
import {
  GOOGLE_TRANSLATE_ELEMENT_ID,
  useLanguageSwitcher,
} from "./useLanguageSwitcher";

/**
 * Danh sách ngôn ngữ mặc định.
 */
export const DEFAULT_LANGUAGES: readonly LanguageOption[] = [
  {
    code: "vi",
    label: "Tiếng Việt",
    shortLabel: "Vi",
  },
  {
    code: "en",
    label: "English",
    shortLabel: "En",
  },
  {
    code: "ja",
    label: "日本語",
    shortLabel: "日本語",
  },
];

interface LanguageSwitcherProps {
  /**
   * Ngôn ngữ gốc của website.
   * Website hiện tại dùng Tiếng Việt.
   */
  pageLanguage?: LanguageCode;

  /**
   * Có thể truyền danh sách ngôn ngữ khác từ Header.
   */
  languages?: readonly LanguageOption[];

  /**
   * Class tùy chỉnh khi đặt vào Header.
   */
  className?: string;

  /**
   * Callback tùy chọn để component Header biết
   * người dùng vừa thay đổi ngôn ngữ.
   */
  onChange?: (language: LanguageCode) => void;
}

/* =========================================================
 * COMPONENT CHÍNH
 * ======================================================= */

export function LanguageSwitcher({
  pageLanguage = "vi",
  languages = DEFAULT_LANGUAGES,
  className = "",
  onChange,
}: LanguageSwitcherProps) {
  const {
    isOpen,
    toggleOpen,
    wrapperRef,
    selectedLanguage,
    currentLanguage,
    handleLanguageChange,
    initializeGoogleTranslate,
  } = useLanguageSwitcher({ pageLanguage, languages, onChange });

  return (
    <>
      {/* Script Google Translate */}
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => {
          initializeGoogleTranslate();
        }}
      />

      <div
        ref={wrapperRef}
        className={`relative ${className}`}
      >
        {/* ===============================================
         * NÚT HIỂN THỊ TRÊN HEADER
         * ============================================= */}
        <button
          type="button"
          aria-label="Thay đổi ngôn ngữ"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={toggleOpen}
          className="
            flex items-center gap-2
            whitespace-nowrap
            text-[15px] font-bold
            transition hover:text-brand-green
          "
        >
          <LanguagesIcon
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            strokeWidth={2}
          />

          <span>
            {currentLanguage?.shortLabel ?? "Vi"}
          </span>

          <ChevronDownIcon
            aria-hidden="true"
            className={[
              "h-4 w-4 transition-transform duration-200",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            strokeWidth={2.5}
          />
        </button>

        {/* ===============================================
         * DROPDOWN COMPONENT CON
         * ============================================= */}
        <LanguageDropdown
          isOpen={isOpen}
          languages={languages}
          selectedLanguage={selectedLanguage}
          onLanguageChange={
            handleLanguageChange
          }
        />
      </div>

      {/* ===============================================
       * GOOGLE TRANSLATE WIDGET ẨN
       *
       * Không dùng hidden/display:none vì Google cần
       * render select .goog-te-combo để xử lý sự kiện.
       * ============================================= */}
      <div
        id={GOOGLE_TRANSLATE_ELEMENT_ID}
        aria-hidden="true"
        className="
          pointer-events-none fixed
          -left-[9999px] top-0
          h-px w-px overflow-hidden opacity-0
        "
      />

      {/* ===============================================
       * CSS XỬ LÝ GIAO DIỆN GOOGLE TRANSLATE MẶC ĐỊNH
       * ============================================= */}
      <style jsx global>{`
  /* 1. Ép body luôn dính đỉnh trang, loại bỏ khoảng trắng do Google chèn vào */
  body {
    top: 0 !important;
    position: static !important;
  }

  /* 2. Ẩn tất cả iframe Google Translate Top Banner (Cả bản cũ & bản mới) */
  .goog-te-banner-frame,
  iframe.goog-te-banner-frame,
  iframe.skiptranslate,
  .goog-te-banner {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
  }

  /* 3. Ẩn các phần tử tự động phát sinh của Google ở đầu trang */
  #goog-gt-tt,
  .goog-te-balloon-frame,
  .goog-te-spinner-pos {
    display: none !important;
  }

  /* 4. Mất hiệu ứng highlight màu vàng/xanh khi rê chuột vào chữ đã dịch */
  .goog-text-highlight {
    background-color: transparent !important;
    box-shadow: none !important;
  }
`}</style>
    </>
  );
}
