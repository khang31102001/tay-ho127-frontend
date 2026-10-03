import type { ManagedSeoSettings, SeoSettingsFormValue } from "../types/seo-settings.types";

/**
 * SeoSettingsResponse của Backend (cả Admin GET/PUT /seo/settings lẫn công khai
 * GET /seo/public/settings). Backend không có id riêng — đây là singleton.
 */
export type SeoSettingsDto = {
  defaultTitleTemplate: string;
  defaultDescription: string;
  defaultOgImageMediaId: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  defaultRobotsIndex: boolean;
  defaultRobotsFollow: boolean;
  robotsDisallowPaths: string[];
  updatedAt: string;
};

const SEO_SETTINGS_ID = "seo-settings";

export function toManagedSeoSettings(dto: SeoSettingsDto): ManagedSeoSettings {
  return { id: SEO_SETTINGS_ID, ...dto };
}

/** Body của PUT /seo/settings — chỉ các field Admin được sửa. */
export function toSeoSettingsRequest(input: SeoSettingsFormValue) {
  return {
    defaultTitleTemplate: input.defaultTitleTemplate,
    defaultDescription: input.defaultDescription,
    defaultOgImageMediaId: input.defaultOgImageMediaId,
    twitterSite: input.twitterSite,
    twitterCreator: input.twitterCreator,
    defaultRobotsIndex: input.defaultRobotsIndex,
    defaultRobotsFollow: input.defaultRobotsFollow,
    robotsDisallowPaths: input.robotsDisallowPaths,
  };
}
