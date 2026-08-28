import { listMenus, type ManagedMenu } from "@/features/menus";
import { listMenuProducts, type ManagedMenuProduct } from "@/features/menu-products";
import { listProducts, type ManagedProduct } from "@/features/products";
import { listCategories, type ManagedCategory } from "@/features/categories";
import { listMedia, type ManagedMedia } from "@/features/media";
import { normalizeText } from "@/lib/normalize-text";

import type {
  Category,
  Menu,
  MenuGroup,
  MenuResponse,
  Product,
  SubCategory,
  UiProduct,
} from "../types/menu.types";

/**
 * MOCK CONTRACT: 2 Menu thật chi phối Customer Site, xem seed tại
 * features/menus/mocks/menu.mock.ts. Khi có backend thật, chỉ cần thay nội
 * dung các hàm dưới đây bằng lời gọi API thật — component/page gọi
 * fetchMenu()/fetchFeaturedMenu() không cần đổi.
 */
const SITE_MAIN_MENU_ID = "menu-thuc-don-chinh";
const SITE_FAVORITES_MENU_ID = "menu-mon-yeu-thich";
const DEFAULT_PRODUCT_IMAGE = "/images/banh-cuon-dish.jpg";

interface CatalogSnapshot {
  menus: ManagedMenu[];
  menuProducts: ManagedMenuProduct[];
  productById: Map<string, ManagedProduct>;
  categoryById: Map<string, ManagedCategory>;
  mediaById: Map<string, ManagedMedia>;
}

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const [menus, menuProducts, products, categories, media] = await Promise.all([
    listMenus(),
    listMenuProducts(),
    listProducts(),
    listCategories(),
    listMedia(),
  ]);

  return {
    menus,
    menuProducts,
    productById: new Map(products.map((product) => [product.id, product])),
    categoryById: new Map(categories.map((category) => [category.id, category])),
    mediaById: new Map(media.map((item) => [item.id, item])),
  };
}

function resolveProductImage(
  product: ManagedProduct,
  mediaById: Map<string, ManagedMedia>,
): string {
  const media = product.mediaIds[0] ? mediaById.get(product.mediaIds[0]) : undefined;
  return media?.url ?? DEFAULT_PRODUCT_IMAGE;
}

/**
 * Quy về 1 trong 3 nút lọc trên site. PHẢI đồng bộ với thuật toán trong
 * `features/menu/hooks/useMenuGrid.ts` (không đổi ở đây nếu không đổi cả 2 nơi).
 */
function resolveMenuCategoryBucket(categoryName: string): UiProduct["category"] {
  const normalized = normalizeText(categoryName);

  if (normalized.includes("chay")) {
    return "Món chay";
  }

  if (normalized.includes("an kem") || normalized.includes("them")) {
    return "Ăn kèm";
  }

  return "Món mặn";
}

/** Đi ngược categoryId (subCategory lá) lên category (giữa) để lấy tên dùng cho bộ lọc/badge. */
function resolveParentCategory(
  categoryId: string | undefined,
  categoryById: Map<string, ManagedCategory>,
): ManagedCategory | undefined {
  const leaf = categoryId ? categoryById.get(categoryId) : undefined;
  if (!leaf?.parentId) {
    return leaf;
  }

  return categoryById.get(leaf.parentId) ?? leaf;
}

/**
 * Dựng lại cây `groups → categories → subCategories → products` từ Catalog
 * (Menu → MenuProduct → Product → Category), giữ đúng shape MenuResponse cũ
 * để MenuGrid/useMenuGrid/ProductCard không cần đổi.
 */
type MutableSubCategory = Omit<SubCategory, "products"> & { products: Product[] };
type MutableCategory = Omit<Category, "subCategories"> & { subCategories: MutableSubCategory[] };
type MutableGroup = Omit<MenuGroup, "categories"> & { categories: MutableCategory[] };

export async function fetchMenu(): Promise<MenuResponse> {
  const { menus, menuProducts, productById, categoryById, mediaById } = await loadCatalogSnapshot();

  const siteMenu = menus.find((menu) => menu.id === SITE_MAIN_MENU_ID);

  const linkedRows = menuProducts
    .filter((row) => row.menuId === SITE_MAIN_MENU_ID && row.isAvailable)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const groupNodes = new Map<string, MutableGroup>();

  linkedRows.forEach((row) => {
    const managedProduct = productById.get(row.productId);
    if (!managedProduct) {
      return;
    }

    const subCategory = categoryById.get(managedProduct.categoryId);
    const category = resolveParentCategory(managedProduct.categoryId, categoryById);
    const group = category?.parentId ? categoryById.get(category.parentId) : undefined;

    const groupKey = group?.id ?? "unknown-group";
    let groupNode = groupNodes.get(groupKey);
    if (!groupNode) {
      groupNode = { name: group?.name, sortOrder: group?.sortOrder, categories: [] };
      groupNodes.set(groupKey, groupNode);
    }

    const categoryKey = category?.id ?? "unknown-category";
    let categoryNode = groupNode.categories.find((node) => node.id === categoryKey);
    if (!categoryNode) {
      categoryNode = {
        id: categoryKey,
        name: category?.name,
        sortOrder: category?.sortOrder,
        subCategories: [],
      };
      groupNode.categories.push(categoryNode);
    }

    const subCategoryKey = subCategory?.id ?? "unknown-subcategory";
    let subCategoryNode = categoryNode.subCategories.find((node) => node.id === subCategoryKey);
    if (!subCategoryNode) {
      subCategoryNode = {
        id: subCategoryKey,
        name: subCategory?.name,
        sortOrder: subCategory?.sortOrder,
        products: [],
      };
      categoryNode.subCategories.push(subCategoryNode);
    }

    subCategoryNode.products.push({
      id: managedProduct.id,
      slug: managedProduct.id,
      name: { vi: managedProduct.name },
      productType: managedProduct.badge,
      price: { amount: row.priceOverride ?? managedProduct.price },
      imageUrl: resolveProductImage(managedProduct, mediaById),
      isActive: managedProduct.status === "active",
    });
  });

  const menu: Menu = {
    id: siteMenu?.id ?? SITE_MAIN_MENU_ID,
    name: siteMenu?.name ?? "Thực đơn",
    groups: Array.from(groupNodes.values()),
    isActive: siteMenu?.status === "active",
  };

  return {
    success: true,
    statusCode: 200,
    message: "Lấy thực đơn thành công",
    data: { menu },
  };
}

/** Danh sách phẳng cho carousel "Món yêu thích" ở trang chủ. */
export async function fetchFeaturedMenu(): Promise<UiProduct[]> {
  const { menus, menuProducts, productById, categoryById, mediaById } = await loadCatalogSnapshot();

  const favoritesMenu = menus.find((menu) => menu.id === SITE_FAVORITES_MENU_ID);

  const linkedRows = menuProducts
    .filter((row) => row.menuId === (favoritesMenu?.id ?? SITE_FAVORITES_MENU_ID) && row.isAvailable)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const items: UiProduct[] = [];

  linkedRows.forEach((row) => {
    const managedProduct = productById.get(row.productId);
    if (!managedProduct) {
      return;
    }

    const category = resolveParentCategory(managedProduct.categoryId, categoryById);

    items.push({
      id: items.length + 1,
      name: managedProduct.name,
      category: resolveMenuCategoryBucket(category?.name ?? ""),
      price: row.priceOverride ?? managedProduct.price,
      oldPrice: managedProduct.oldPrice,
      badge: managedProduct.badge,
      rating: managedProduct.rating ?? 0,
      ratingCount: managedProduct.ratingCount ?? 0,
      image: resolveProductImage(managedProduct, mediaById),
    });
  });

  return items;
}
