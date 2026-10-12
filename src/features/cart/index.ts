export { CartProvider, useCart } from "./context/cart-context";
export { FlyToCartProvider, useFlyToCart } from "./context/fly-to-cart-context";
export { MiniCartProvider, useMiniCart } from "./context/mini-cart-context";
export type {
  CartContextType,
  CartItem,
  CartProduct,
  CartItemModifierSelection,
  UtensilsPreference,
} from "./types/cart.types";

export { CartTrigger } from "./components/CartTrigger";
export { MiniCart } from "./components/MiniCart";
export { CartPageSection } from "./components/CartPageSection";
export { ModifierGroupSelector } from "./components/ModifierGroupSelector";

export {
  buildCartItemId,
  calculateCartCount,
  calculateCartItemTotal,
  calculateCartItemUnitPrice,
  calculateCartTotalPrice,
} from "./services/cart.service";
export { markCartReviewed, consumeCartReviewedFlag } from "./services/cart-review.service";
