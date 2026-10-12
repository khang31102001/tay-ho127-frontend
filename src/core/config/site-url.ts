import { site } from "../../data/site";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? site.following.web;
  return configured.replace(/\/$/, "");
}
