export { PromotionsExplorer } from "./components/PromotionsExplorer";
export { PromotionEditor } from "./components/PromotionEditor";
export { PromotionStatusBadge } from "./components/PromotionStatusBadge";

// Service Admin (CRUD) gọi Backend; resolvePromotionEffectiveStatus là hàm thuần dùng để hiển thị.
// Checkout KHÔNG dùng barrel này: nó gọi thẳng services/promotion-validation.service.ts.
export {
  listPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "./services/promotion.service";
export { resolvePromotionEffectiveStatus } from "./services/promotion.service";
export type { PromotionFormValue } from "./services/promotion.service";

export {
  PROMOTION_TYPE_LABEL,
  PROMOTION_STATUS_LABEL,
} from "./types/promotion.types";
export type {
  ManagedPromotion,
  PromotionType,
  PromotionStatus,
  PromotionValidateRequest,
  PromotionValidateRequestItem,
  PromotionValidationResult,
} from "./types/promotion.types";
