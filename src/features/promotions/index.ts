export { PromotionsExplorer } from "./components/PromotionsExplorer";
export { PromotionEditor } from "./components/PromotionEditor";
export { PromotionStatusBadge } from "./components/PromotionStatusBadge";

export {
  listPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  resolvePromotionEffectiveStatus,
} from "./services/promotion.service";
export { validatePromotion } from "./services/site-promotion.service";
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
