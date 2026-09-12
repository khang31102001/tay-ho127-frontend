export { PromotionsExplorer } from "./components/PromotionsExplorer";
export { PromotionEditor } from "./components/PromotionEditor";
export { PromotionStatusBadge } from "./components/PromotionStatusBadge";

export { promotionApi } from "./api/promotion-api";

// resolvePromotionEffectiveStatus là hàm thuần (không gọi network) dùng để
// hiển thị — không thuộc HTTP boundary nên không đi qua promotionApi, khác
// list/getById/create/update/delete/validate (xem api/promotion-api.ts).
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
