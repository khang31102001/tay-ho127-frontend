"use client";

import Script from "next/script";
import {
  ChevronDownIcon,
  LanguagesIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LanguageDropdown,
  type LanguageCode,
  type LanguageOption,
} from "./LanguageDropdown";

/* =========================================================
 * KHAI BÁO TYPE CHO GOOGLE TRANSLATE
 * ======================================================= */

interface GoogleTranslateOptions {
  /**
   * Ngôn ngữ gốc của website.
   */
  pageLanguage: string;

  /**
   * Danh sách ngôn ngữ cho phép,
   * phân cách bằng dấu phẩy.
   */
  includedLanguages: string;

  autoDisplay: boolean;
}

type GoogleTranslateConstructor = new (
  options: GoogleTranslateOptions,
  elementId: string,
) => void;

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateConstructor;
      };
    };

    /**
     * Callback được Google Translate gọi
     * sau khi script tải xong.
     */
    googleTranslateElementInit?: () => void;
  }
}

/* =========================================================
 * CẤU HÌNH
 * ======================================================= */

/**
 * ID của phần tử Google Translate ẩn trên trang.
 *
 * Website chỉ nên có một LanguageSwitcher sử dụng ID này.
 */
const GOOGLE_TRANSLATE_ELEMENT_ID =
  "google_translate_element";

/**
 * Key lưu ngôn ngữ người dùng đã chọn.
 */
const LANGUAGE_STORAGE_KEY = "preferred-language";

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
 * HÀM HỖ TRỢ
 * ======================================================= */

/**
 * Kiểm tra một chuỗi có phải mã ngôn ngữ hợp lệ không.
 */
function isLanguageCode(
  value: string | null,
  languages: readonly LanguageOption[],
): value is LanguageCode {
  if (!value) {
    return false;
  }

  return languages.some(
    (language) => language.code === value,
  );
}

/**
 * Xóa cookie Google Translate.
 *
 * Được sử dụng khi người dùng chọn lại
 * ngôn ngữ gốc là Tiếng Việt.
 */
function clearGoogleTranslateCookie() {
  const expiredCookie =
    "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";

  document.cookie = expiredCookie;

  /**
   * Một số trường hợp cookie được tạo theo domain.
   * Xóa thêm cookie tại domain hiện tại.
   */
  if (window.location.hostname.includes(".")) {
    document.cookie = `${expiredCookie};domain=${window.location.hostname}`;
  }
}

/**
 * Đặt cookie dịch của Google.
 *
 * Ví dụ:
 * /vi/en = dịch từ Tiếng Việt sang Tiếng Anh.
 */
function setGoogleTranslateCookie(
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
) {
  const cookieValue = `/${sourceLanguage}/${targetLanguage}`;

  document.cookie = `googtrans=${cookieValue};path=/;SameSite=Lax`;
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
  /**
   * Trạng thái dropdown.
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Ngôn ngữ hiện tại.
   */
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>(pageLanguage);

  /**
   * Kiểm tra script Google Translate đã sẵn sàng chưa.
   */
  const [isGoogleReady, setIsGoogleReady] =
    useState(false);

  /**
   * Ref dùng để phát hiện click bên ngoài component.
   */
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Ref giúp callback Google luôn đọc được
   * ngôn ngữ mới nhất.
   */
  const selectedLanguageRef =
    useRef<LanguageCode>(pageLanguage);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  /**
   * Lấy thông tin đầy đủ của ngôn ngữ hiện tại.
   */
  const currentLanguage =
    languages.find(
      (language) =>
        language.code === selectedLanguage,
    ) ?? languages[0];

  /**
   * Khởi tạo Google Translate Widget.
   */
  const initializeGoogleTranslate =
    useCallback(() => {
      const TranslateElement =
        window.google?.translate?.TranslateElement;

      const container = document.getElementById(
        GOOGLE_TRANSLATE_ELEMENT_ID,
      );

      /**
       * Chưa tải xong script hoặc không tìm thấy container.
       */
      if (!TranslateElement || !container) {
        return;
      }

      /**
       * Không khởi tạo lại nếu Google đã thêm widget.
       */
      if (!container.hasChildNodes()) {
        new TranslateElement(
          {
            pageLanguage,
            includedLanguages: languages
              .map((language) => language.code)
              .join(","),
            autoDisplay: false,
          },
          GOOGLE_TRANSLATE_ELEMENT_ID,
        );
      }

      setIsGoogleReady(true);
    }, [languages, pageLanguage]);

  /**
   * Gắn callback global trước khi script Google tải.
   */
  useEffect(() => {
    window.googleTranslateElementInit =
      initializeGoogleTranslate;

    /**
     * Trường hợp chuyển route và script đã tồn tại,
     * thử khởi tạo lại ngay.
     */
    initializeGoogleTranslate();

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, [initializeGoogleTranslate]);

  /**
   * Khôi phục lựa chọn ngôn ngữ từ localStorage.
   */
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(
      LANGUAGE_STORAGE_KEY,
    );

    if (isLanguageCode(savedLanguage, languages)) {
      setSelectedLanguage(savedLanguage);
    }
  }, [languages]);

  /**
   * Đóng dropdown khi click ra ngoài.
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      const target = event.target as Node;

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /**
   * Đóng dropdown khi nhấn phím Escape.
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /**
   * Gọi select ẩn của Google Translate
   * để thực hiện dịch toàn trang.
   */
  function applyGoogleLanguage(
    language: LanguageCode,
    attempt = 0,
  ) {
    const googleSelect =
      document.querySelector<HTMLSelectElement>(
        ".goog-te-combo",
      );

    /**
     * Google có thể cần một khoảng thời gian
     * để render select.
     *
     * Thử lại tối đa 20 lần, mỗi lần cách nhau 100ms.
     */
    if (!googleSelect) {
      if (attempt < 20) {
        window.setTimeout(() => {
          applyGoogleLanguage(
            language,
            attempt + 1,
          );
        }, 100);

        return;
      }

      /**
       * Fallback: đặt cookie rồi reload nếu widget
       * không render được select.
       */
      setGoogleTranslateCookie(
        pageLanguage,
        language,
      );

      window.location.reload();

      return;
    }

    /**
     * Cập nhật select của Google Translate.
     */
    googleSelect.value = language;

    googleSelect.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  }

  /**
   * Xử lý khi người dùng chọn ngôn ngữ.
   */
  function handleLanguageChange(
    language: LanguageCode,
  ) {
    /**
     * Không xử lý lại nếu chọn đúng ngôn ngữ hiện tại.
     */
    if (language === selectedLanguage) {
      setIsOpen(false);
      return;
    }

    setSelectedLanguage(language);
    selectedLanguageRef.current = language;
    setIsOpen(false);

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      language,
    );

    onChange?.(language);

    /**
     * Khi chọn lại ngôn ngữ gốc:
     * xóa cookie dịch và reload trang.
     */
    if (language === pageLanguage) {
      clearGoogleTranslateCookie();
      window.location.reload();
      return;
    }

    /**
     * Lưu cookie trước để Google giữ ngôn ngữ
     * khi người dùng chuyển sang route khác.
     */
    setGoogleTranslateCookie(
      pageLanguage,
      language,
    );

    applyGoogleLanguage(language);
  }

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
          onClick={() =>
            setIsOpen((current) => !current)
          }
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