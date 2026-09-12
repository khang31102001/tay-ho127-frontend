import { api } from "@/lib/http/api-client";
import { getApiMode } from "@/lib/http/api-mode";

import * as mockOrderOptionService from "../services/order-option.service";
import type { OrderOptionGroupUpsertInput } from "../services/order-option.service";
import type { ManagedOrderOptionGroup } from "../types/order-option.types";

/**
 * TEMPORARY CONTRACT — endpoint REST đề xuất cho Backend ASP.NET Core tương
 * lai. "General Order Options" là domain Order Configuration riêng (KHÁC
 * modifier-groups của Product), xem types/order-option.types.ts.
 */
const ENDPOINTS = {
  list: "/order-options",
  byId: (id: string) => `/order-options/${id}`,
};

/**
 * Public API duy nhất mà Component/Feature khác được gọi — không nơi gọi nào
 * biết đang chạy mock hay Backend thật, giống navigationApi/promotionApi.
 */
export const orderOptionApi = {
  async list(): Promise<ManagedOrderOptionGroup[]> {
    if (getApiMode() === "real") {
      return api.get<ManagedOrderOptionGroup[]>(ENDPOINTS.list);
    }
    return mockOrderOptionService.listGeneralOrderOptions();
  },

  async getById(id: string): Promise<ManagedOrderOptionGroup | null> {
    if (getApiMode() === "real") {
      return api.get<ManagedOrderOptionGroup | null>(ENDPOINTS.byId(id));
    }
    return mockOrderOptionService.getOrderOptionGroupById(id);
  },

  async create(payload: OrderOptionGroupUpsertInput): Promise<ManagedOrderOptionGroup> {
    if (getApiMode() === "real") {
      return api.post<ManagedOrderOptionGroup, OrderOptionGroupUpsertInput>(ENDPOINTS.list, payload);
    }
    return mockOrderOptionService.createOrderOptionGroup(payload);
  },

  async update(id: string, payload: OrderOptionGroupUpsertInput): Promise<ManagedOrderOptionGroup> {
    if (getApiMode() === "real") {
      return api.put<ManagedOrderOptionGroup, OrderOptionGroupUpsertInput>(ENDPOINTS.byId(id), payload);
    }
    return mockOrderOptionService.updateOrderOptionGroup(id, payload);
  },

  async delete(id: string): Promise<void> {
    if (getApiMode() === "real") {
      return api.delete<void>(ENDPOINTS.byId(id));
    }
    return mockOrderOptionService.deleteOrderOptionGroup(id);
  },
};
