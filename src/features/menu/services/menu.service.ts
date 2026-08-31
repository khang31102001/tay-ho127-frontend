/**
 * Import thẳng vào services/types của từng feature Catalog thay vì qua
 * index.ts (barrel) — index.ts của các feature Admin còn re-export cả
 * component "use client" (Explorer/Editor). Vì đây là code chạy trong
 * Server Component của Site (trang chủ, /thuc-don), import qua barrel sẽ
 * kéo theo toàn bộ UI Admin (DataExplorer/DataEditor + các Editor/Explorer)
 * vào bundle JS công khai — đã đo được ~18kB gzip dư ra trên cả 2 trang.
 * Đi thẳng vào service/type tránh hoàn toàn việc này mà không đổi API.
 */
import { listMenus } from "@/features/menus/services/menu.service";
import type { ManagedMenu } from "@/features/menus/types/menu.types";
import { listMenuProducts } from "@/features/menu-products/services/menu-product.service";
import type { ManagedMenuProduct } from "@/features/menu-products/types/menu-product.types";
import { listProducts } from "@/features/products/services/product.service";
import type { ManagedProduct } from "@/features/products/types/product.types";
import { listCategories } from "@/features/categories/services/category.service";
import type { ManagedCategory } from "@/features/categories/types/category.types";
import { listMedia } from "@/features/media/services/media.service";
import type { ManagedMedia } from "@/features/media/types/media.types";
import { listModifierGroupsByIds } from "@/features/modifier-groups/services/modifier-group.service";
import { normalizeText } from "@/lib/normalize-text";

import type {
  Category,
  Menu,
  MenuGroup,
  MenuResponse,
  Product,
  ProductDetail,
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
const SITE_CROSS_SELL_MENU_ID = "menu-goi-y-them";
const DEFAULT_PRODUCT_IMAGE = "/images/banh-cuon-dish.jpg";
const RELATED_PRODUCTS_LIMIT = 4;

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
      slug: managedProduct.id,
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

/**
 * Danh sách gợi ý "Có thể bạn muốn dùng thêm" cho Cart Page — đọc từ Menu
 * menu-goi-y-them (Admin quản lý qua Catalog → Thực đơn / Liên kết Menu-SP,
 * y hệt cách menu-mon-yeu-thich chi phối carousel trang chủ). KHÔNG hard-code
 * danh sách sản phẩm trong UI.
 */
export async function fetchCrossSellProducts(): Promise<UiProduct[]> {
  const { menus, menuProducts, productById, categoryById, mediaById } = await loadCatalogSnapshot();

  const crossSellMenu = menus.find((menu) => menu.id === SITE_CROSS_SELL_MENU_ID);

  const linkedRows = menuProducts
    .filter((row) => row.menuId === (crossSellMenu?.id ?? SITE_CROSS_SELL_MENU_ID) && row.isAvailable)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const items: UiProduct[] = [];

  linkedRows.forEach((row) => {
    const managedProduct = productById.get(row.productId);
    if (!managedProduct || managedProduct.status !== "active") {
      return;
    }

    const category = resolveParentCategory(managedProduct.categoryId, categoryById);

    items.push({
      id: items.length + 1,
      slug: managedProduct.id,
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

export interface ProductDetailData {
  product: ProductDetail;
  relatedProducts: UiProduct[];
}

/**
 * Chi tiết 1 sản phẩm cho trang `/thuc-don/[slug]` + danh sách sản phẩm liên
 * quan (cùng danh mục cha, cùng nằm trong menu chính của site). `slug` hiện
 * là `ManagedProduct.id` (xem `Product.slug` trong `fetchMenu`) — trả về
 * null nếu sản phẩm không tồn tại, ngừng bán, hoặc không thuộc thực đơn site.
 */
export async function getProductDetail(slug: string): Promise<ProductDetailData | null> {
  const { menuProducts, productById, categoryById, mediaById } = await loadCatalogSnapshot();

  const managedProduct = productById.get(slug);

  if (!managedProduct || managedProduct.status !== "active") {
    return null;
  }

  const siteMenuRows = menuProducts
    .filter((row) => row.menuId === SITE_MAIN_MENU_ID && row.isAvailable)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const currentRow = siteMenuRows.find((row) => row.productId === managedProduct.id);

  if (!currentRow) {
    return null;
  }

  const category = resolveParentCategory(managedProduct.categoryId, categoryById);
  const categoryBucket = resolveMenuCategoryBucket(category?.name ?? "");
  const modifierGroups = await listModifierGroupsByIds(managedProduct.modifierGroupIds);

  const product: ProductDetail = {
    id: managedProduct.id,
    slug: managedProduct.id,
    name: managedProduct.name,
    category: categoryBucket,
    price: currentRow.priceOverride ?? managedProduct.price,
    oldPrice: managedProduct.oldPrice,
    badge: managedProduct.badge,
    rating: managedProduct.rating ?? 0,
    ratingCount: managedProduct.ratingCount ?? 0,
    image: resolveProductImage(managedProduct, mediaById),
    description: managedProduct.description,
    modifierGroups,
  };

  const relatedProducts: UiProduct[] = [];

  for (const row of siteMenuRows) {
    if (relatedProducts.length >= RELATED_PRODUCTS_LIMIT) {
      break;
    }

    if (row.productId === managedProduct.id) {
      continue;
    }

    const candidate = productById.get(row.productId);
    if (!candidate) {
      continue;
    }

    const candidateCategory = resolveParentCategory(candidate.categoryId, categoryById);
    if ((candidateCategory?.id ?? "unknown-category") !== (category?.id ?? "unknown-category")) {
      continue;
    }

    relatedProducts.push({
      id: relatedProducts.length + 1,
      slug: candidate.id,
      name: candidate.name,
      category: categoryBucket,
      price: row.priceOverride ?? candidate.price,
      oldPrice: candidate.oldPrice,
      badge: candidate.badge,
      rating: candidate.rating ?? 0,
      ratingCount: candidate.ratingCount ?? 0,
      image: resolveProductImage(candidate, mediaById),
    });
  }

  return { product, relatedProducts };
}
