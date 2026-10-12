export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "shopee", label: "Shopee" },
  { value: "zalo", label: "Zalo" },
  { value: "youtube", label: "YouTube" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORM_OPTIONS)[number]["value"];

export const SOCIAL_PLATFORM_LABEL: Record<SocialPlatform, string> = Object.fromEntries(
  SOCIAL_PLATFORM_OPTIONS.map((option) => [option.value, option.label]),
) as Record<SocialPlatform, string>;

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  displayOrder: number;
  isActive: boolean;
};
