"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { LanguageCode, LanguageOption } from "./LanguageDropdown";

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
export const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";

/**
 * Key lưu ngôn ngữ người dùng đã chọn.
 */
const LANGUAGE_STORAGE_KEY = "preferred-language";

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

  return languages.some((language) => language.code === value);
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
 * HOOK
 * ======================================================= */

type UseLanguageSwitcherParams = {
  pageLanguage: LanguageCode;
  languages: readonly LanguageOption[];
  onChange?: (language: LanguageCode) => void;
};

export function useLanguageSwitcher({
  pageLanguage,
  languages,
  onChange,
}: UseLanguageSwitcherParams) {
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
   * Ref dùng để phát hiện click bên ngoài component.
   */
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Ref giúp callback Google luôn đọc được
   * ngôn ngữ mới nhất.
   */
  const selectedLanguageRef = useRef<LanguageCode>(pageLanguage);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  /**
   * Lấy thông tin đầy đủ của ngôn ngữ hiện tại.
   */
  const currentLanguage =
    languages.find((language) => language.code === selectedLanguage) ??
    languages[0];

  /**
   * Khởi tạo Google Translate Widget.
   */
  const initializeGoogleTranslate = useCallback(() => {
    const TranslateElement = window.google?.translate?.TranslateElement;

    const container = document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID);

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
  }, [languages, pageLanguage]);

  /**
   * Gắn callback global trước khi script Google tải.
   */
  useEffect(() => {
    window.googleTranslateElementInit = initializeGoogleTranslate;

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
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isLanguageCode(savedLanguage, languages)) {
      setSelectedLanguage(savedLanguage);
    }
  }, [languages]);

  /**
   * Đóng dropdown khi click ra ngoài.
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
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

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /**
   * Gọi select ẩn của Google Translate
   * để thực hiện dịch toàn trang.
   */
  function applyGoogleLanguage(language: LanguageCode, attempt = 0) {
    const googleSelect = document.querySelector<HTMLSelectElement>(
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
          applyGoogleLanguage(language, attempt + 1);
        }, 100);

        return;
      }

      /**
       * Fallback: đặt cookie rồi reload nếu widget
       * không render được select.
       */
      setGoogleTranslateCookie(pageLanguage, language);

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
  function handleLanguageChange(language: LanguageCode) {
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

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

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
    setGoogleTranslateCookie(pageLanguage, language);

    applyGoogleLanguage(language);
  }

  function toggleOpen() {
    setIsOpen((current) => !current);
  }

  return {
    isOpen,
    toggleOpen,
    wrapperRef,
    selectedLanguage,
    currentLanguage,
    handleLanguageChange,
    initializeGoogleTranslate,
  };
}
