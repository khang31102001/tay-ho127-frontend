import { Trash2 } from "lucide-react";

import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import { SOCIAL_PLATFORM_OPTIONS } from "../types/social-link.types";
import type { SocialLink, SocialPlatform } from "../types/social-link.types";

type BrandSocialFormProps = {
  socialLinks: SocialLink[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Omit<SocialLink, "id">>) => void;
  onRemove: (id: string) => void;
};

export function BrandSocialForm({ socialLinks, onAdd, onUpdate, onRemove }: BrandSocialFormProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className={adminFieldLabelClassName}>Liên kết mạng xã hội</span>
        <button
          type="button"
          onClick={onAdd}
          className="text-[13px] font-bold text-brand-greenDark hover:underline"
        >
          + Thêm liên kết
        </button>
      </div>

      {socialLinks.length === 0 ? (
        <p className="mt-2 text-[13px] text-brand-muted">Chưa có liên kết mạng xã hội nào.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {socialLinks.map((link) => (
            <div
              key={link.id}
              className="grid grid-cols-1 items-end gap-3 rounded-lg border border-brand-line p-3 sm:grid-cols-[160px_1fr_auto_auto]"
            >
              <div>
                <span className="text-[12px] font-bold text-brand-muted">Nền tảng</span>
                <select
                  value={link.platform}
                  onChange={(event) => onUpdate(link.id, { platform: event.target.value as SocialPlatform })}
                  className={adminFieldInputClassName}
                >
                  {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[12px] font-bold text-brand-muted">URL</span>
                <input
                  type="url"
                  value={link.url}
                  onChange={(event) => onUpdate(link.id, { url: event.target.value })}
                  placeholder="https://..."
                  className={adminFieldInputClassName}
                />
              </div>

              <label className="flex h-10 items-center gap-2 text-[13px] font-bold text-brand-greenDark">
                <input
                  type="checkbox"
                  checked={link.isActive}
                  onChange={(event) => onUpdate(link.id, { isActive: event.target.checked })}
                  className="size-4 accent-brand-green"
                />
                Hiển thị
              </label>

              <button
                type="button"
                aria-label="Xóa liên kết"
                onClick={() => onRemove(link.id)}
                className="flex h-10 items-center justify-center rounded-lg px-3 text-brand-muted transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
