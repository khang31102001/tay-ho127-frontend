import Link from "next/link";

import { resolveNavigationLinkProps } from "../utils/navigation-tree";
import type { NavigationItem } from "../types/navigation.types";

export type NavigationRendererVariant = "header" | "footer" | "mobile";

type NavigationRendererProps = {
  items: NavigationItem[];
  /** Không tự quyết định style theo variant — chỉ gắn data-attribute để CSS bên ngoài tự chọn nếu cần. */
  variant?: NavigationRendererVariant;
  className?: string;
  itemClassName?: string;
  /** Class cho <ul> lồng ở các cấp con (khác className của cấp gốc nếu cần thụt lề riêng). */
  nestedListClassName?: string;
  depth?: number;
};

/**
 * Renderer TÁI SỬ DỤNG cho mọi vị trí navigation của User Site (Header,
 * Footer, Mobile Navigation, và bất kỳ vị trí nào thêm sau này) — nhận
 * `items` (đã lọc isVisible + sort sẵn từ navigationApi.getByLocation/
 * getByCode, xem navigation.service.ts) và tự đệ quy render, không giới hạn
 * cứng số cấp. Component thuần hiển thị — không tự fetch, không biết
 * "header"/"footer" nghĩa là gì ngoài 1 chuỗi gắn vào data-attribute cho
 * CSS/test hook, style hoàn toàn do nơi gọi truyền vào qua className.
 */
export function NavigationRenderer({
  items,
  variant = "header",
  className,
  itemClassName,
  nestedListClassName,
  depth = 0,
}: NavigationRendererProps) {
  if (items.length === 0) return null;

  return (
    <ul className={depth === 0 ? className : nestedListClassName} data-navigation-variant={variant} data-depth={depth}>
      {items.map((item) => {
        const { href, isExternal, target, rel } = resolveNavigationLinkProps(item);
        const hasChildren = Boolean(item.children && item.children.length > 0);

        return (
          <li key={item.id}>
            {isExternal ? (
              <a href={href} target={target} rel={rel} className={itemClassName}>
                {item.label}
              </a>
            ) : (
              <Link href={href} target={target} rel={rel} className={itemClassName}>
                {item.label}
              </Link>
            )}

            {hasChildren && (
              <NavigationRenderer
                items={item.children!}
                variant={variant}
                itemClassName={itemClassName}
                nestedListClassName={nestedListClassName}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
