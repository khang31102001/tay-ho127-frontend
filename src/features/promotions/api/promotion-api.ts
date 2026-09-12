import { api } from "@/lib/http/api-client";
import { getApiMode } from "@/lib/http/api-mode";

import * as mockPromotionService from "../services/promotion.service";
import type { PromotionFormValue } from "../services/promotion.service";
import type {
  ManagedPromotion,
  PromotionValidateRequest,
  PromotionValidationResult,
} from "../types/promotion.types";

/**
 * TEMPORARY CONTRACT — endpoint REST đề xuất cho Backend ASP.NET Core tương
 * lai (khớp mục 9 của task gốc: GET/POST/PUT/DELETE /promotions + POST
 * /promotions/validate).
 */
const ENDPOINTS = {
  list: "/promotions",
  byId: (id: string) => `/promotions/${id}`,
  validate: "/promotions/validate",
};

/**
 * Public API duy nhất mà Component/Feature khác được gọi — không nơi gọi nào
 * biết đang chạy mock hay Backend thật (nhánh rẽ getApiMode() nằm gọn trong
 * file này, giống navigationApi). Khi NEXT_PUBLIC_API_MODE=real, mỗi method
 * tự chuyển sang gọi Global HTTP Client (api-client.ts) — không sửa nơi gọi.
 */
export const promotionApi = {
  async list(): Promise<ManagedPromotion[]> {
    if (getApiMode() === "real") {
      return api.get<ManagedPromotion[]>(ENDPOINTS.list);
    }
    return mockPromotionService.listPromotions();
  },

  async getById(id: string): Promise<ManagedPromotion | null> {
    if (getApiMode() === "real") {
      return api.get<ManagedPromotion | null>(ENDPOINTS.byId(id));
    }
    return mockPromotionService.getPromotionById(id);
  },

  async create(payload: PromotionFormValue): Promise<ManagedPromotion> {
    if (getApiMode() === "real") {
      return api.post<ManagedPromotion, PromotionFormValue>(ENDPOINTS.list, payload);
    }
    return mockPromotionService.createPromotion(payload);
  },

  async update(id: string, payload: PromotionFormValue): Promise<ManagedPromotion> {
    if (getApiMode() === "real") {
      return api.put<ManagedPromotion, PromotionFormValue>(ENDPOINTS.byId(id), payload);
    }
    return mockPromotionService.updatePromotion(id, payload);
  },

  async delete(id: string): Promise<void> {
    if (getApiMode() === "real") {
      return api.delete<void>(ENDPOINTS.byId(id));
    }
    return mockPromotionService.deletePromotion(id);
  },

  /** Business rule validate mã giảm giá — xem services/promotion.service.ts. Backend thật sẽ tính lại toàn bộ ở server, Frontend không tự suy luận. */
  async validate(request: PromotionValidateRequest): Promise<PromotionValidationResult> {
    if (getApiMode() === "real") {
      return api.post<PromotionValidationResult, PromotionValidateRequest>(ENDPOINTS.validate, request);
    }
    return mockPromotionService.validatePromotion(request);
  },
};
