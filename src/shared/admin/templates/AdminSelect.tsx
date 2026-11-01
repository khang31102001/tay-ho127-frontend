"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

/**
 * Dropdown dùng chung cho Admin — thay `<select>` native vì popup native do trình duyệt/hệ điều hành tự vẽ
 * (bị lệch, hẹp hơn ô, mất chữ khi zoom/scale màn hình) và không theo giao diện Admin.
 *
 * Dùng như `<select>`: truyền `<option value disabled>` làm children, `onChange` nhận `event.target.value` (chuỗi).
 * `className` áp lên ô bấm (giữ nguyên `adminFieldInputClassName`, `SELECT_CLASS`, ...).
 * Danh sách render qua portal ra `body` (không bị cắt bởi overflow của bảng/dialog), tự lật lên trên khi thiếu chỗ.
 */

type AdminSelectOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};

type AdminSelectChangeEvent = {
  target: { value: string };
  currentTarget: { value: string };
};

type AdminSelectProps = {
  value?: string | number | null;
  onChange?: (event: AdminSelectChangeEvent) => void;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
};

const LIST_MAX_HEIGHT = 280;
const LIST_GAP = 4;

type OptionElementProps = { value?: string | number; disabled?: boolean; children?: ReactNode };

/** Đọc các `<option>` con (kể cả nằm trong Fragment/mảng từ `.map`) thành danh sách lựa chọn. */
function collectOptions(children: ReactNode, result: AdminSelectOption[] = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<OptionElementProps>;
    if (element.type === Fragment) {
      collectOptions(element.props.children, result);
      return;
    }
    if (element.type === "option") {
      const label = element.props.children;
      result.push({
        value: String(element.props.value ?? (typeof label === "string" ? label : "")),
        label,
        disabled: Boolean(element.props.disabled),
      });
    }
  });
  return result;
}

export function AdminSelect({
  value,
  onChange,
  children,
  className = "",
  disabled,
  required,
  name,
  id,
  "aria-label": ariaLabel,
}: AdminSelectProps) {
  const options = collectOptions(children);
  const currentValue = value === null || value === undefined ? "" : String(value);
  const selectedIndex = options.findIndex((option) => option.value === currentValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listStyle, setListStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // Không có class width (vd. bộ lọc trên toolbar) thì ô rộng bằng nhãn dài nhất — giống `<select>` native.
  const isAutoWidth = !/(^|\s)w-/.test(className);
  const isFullWidth = /(^|\s)w-full(\s|$)/.test(className);
  const hasBackground = /(^|\s)bg-/.test(className);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - LIST_GAP;
    const spaceAbove = rect.top - LIST_GAP;
    const openUpward = spaceBelow < Math.min(LIST_MAX_HEIGHT, 160) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(LIST_MAX_HEIGHT, (openUpward ? spaceAbove : spaceBelow) - 8));
    setListStyle({
      position: "fixed",
      left: rect.left,
      minWidth: rect.width,
      maxWidth: Math.max(rect.width, window.innerWidth - rect.left - 8),
      maxHeight,
      ...(openUpward ? { bottom: window.innerHeight - rect.top + LIST_GAP } : { top: rect.bottom + LIST_GAP }),
    });
  }, []);

  const open = useCallback(() => {
    if (disabled || options.length === 0) return;
    updatePosition();
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled));
    setIsOpen(true);
  }, [disabled, options, selectedIndex, updatePosition]);

  const close = useCallback((refocus = true) => {
    setIsOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const select = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== currentValue) {
      const target = { value: option.value };
      onChange?.({ target, currentTarget: target });
    }
    close();
  };

  // Giữ danh sách bám theo ô khi cuộn/đổi kích thước; bấm ra ngoài thì đóng.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      close(false);
    };
    const handleScroll = (event: Event) => {
      if (listRef.current?.contains(event.target as Node)) return;
      updatePosition();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, close, updatePosition]);

  // Cuộn tới mục đang được chọn bằng bàn phím.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const moveActive = (step: number) => {
    if (options.length === 0) return;
    let index = activeIndex;
    for (let i = 0; i < options.length; i++) {
      index = (index + step + options.length) % options.length;
      if (!options[index].disabled) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(options.findIndex((option) => !option.disabled));
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1 - [...options].reverse().findIndex((option) => !option.disabled));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <span className={`relative ${isFullWidth ? "block w-full" : "inline-block align-middle"}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`${hasBackground ? "" : "bg-admin-surface"} flex items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {isAutoWidth ? (
          // Xếp chồng mọi nhãn (ẩn) để ô rộng bằng nhãn dài nhất, không nhảy kích thước khi đổi lựa chọn.
          <span className="grid flex-1">
            {options.map((option, index) => (
              <span
                key={index}
                aria-hidden={option !== selectedOption}
                className={`whitespace-nowrap [grid-area:1/1] ${option === selectedOption ? "" : "invisible"}`}
              >
                {option.label}
              </span>
            ))}
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate">{selectedOption?.label}</span>
        )}
        <ChevronDown
          aria-hidden
          className={`size-4 shrink-0 text-admin-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Giữ validation `required` của form native và `name` khi submit bằng FormData. */}
      {(required || name) && (
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          required={required}
          disabled={disabled}
          value={currentValue}
          onChange={() => undefined}
          onFocus={() => triggerRef.current?.focus()}
          className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0"
        />
      )}

      {isOpen &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={listStyle}
            // Portal vẫn nổi bọt sự kiện React lên cây cha (vd. hàng bảng có onClick) — chặn lại.
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.preventDefault()}
            className="z-[10000] overflow-y-auto rounded-admin border border-admin-border bg-admin-surface py-1 text-admin-base text-admin-text shadow-admin-dropdown"
          >
            {options.map((option, index) => {
              const isSelected = option === selectedOption;
              const isActive = index === activeIndex;
              return (
                <li
                  key={index}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => select(index)}
                  className={`flex min-h-9 cursor-pointer items-center gap-2 px-3 py-2 leading-5 ${
                    option.disabled ? "cursor-not-allowed text-admin-muted" : isActive ? "bg-admin-primaryLight" : ""
                  } ${isSelected ? "font-semibold text-admin-primary" : ""}`}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">{option.label}</span>
                  {isSelected && <Check aria-hidden className="size-4 shrink-0" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </span>
  );
}
