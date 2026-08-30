"use client";

import { useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { StatusPopup } from "@/components/shared/StatusPopup";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

import { useBrandSettingsEditor } from "../hooks/useBrandSettingsEditor";
import { BrandAddressForm } from "./BrandAddressForm";
import { BrandBrandingForm } from "./BrandBrandingForm";
import { BrandBusinessHoursForm } from "./BrandBusinessHoursForm";
import { BrandContactForm } from "./BrandContactForm";
import { BrandGeneralForm } from "./BrandGeneralForm";
import { BrandSocialForm } from "./BrandSocialForm";

const TABS: TabItem[] = [
  { id: "general", label: "Chung" },
  { id: "contact", label: "Liên hệ" },
  { id: "address", label: "Địa chỉ" },
  { id: "social", label: "Mạng xã hội" },
  { id: "branding", label: "Nhận diện" },
  { id: "hours", label: "Giờ hoạt động" },
];

/**
 * Brand Settings là bản ghi duy nhất (singleton) — không có backHref về một
 * danh sách thật, trỏ về Dashboard. Tabs chỉ ẩn/hiện panel trong CÙNG 1 form,
 * nút Lưu (do DataEditor cung cấp) luôn lưu toàn bộ dữ liệu bất kể tab nào
 * đang active.
 */
export function BrandSettingsEditor() {
  const { form, isLoading, mediaOptions, updateField, addSocialLink, updateSocialLink, removeSocialLink, handleSave } =
    useBrandSettingsEditor();
  const [activeTab, setActiveTab] = useState("general");
  const [savedPopupOpen, setSavedPopupOpen] = useState(false);

  return (
    <>
      <DataEditor
        title="Cài đặt thương hiệu"
        backHref="/admin"
        onSave={handleSave}
        onSaved={() => setSavedPopupOpen(true)}
        isLoading={isLoading || !form}
        saveLabel="Lưu thay đổi"
      >
        {form && (
          <div>
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            <div className="pt-5">
              {activeTab === "general" && <BrandGeneralForm form={form} updateField={updateField} />}
              {activeTab === "contact" && <BrandContactForm form={form} updateField={updateField} />}
              {activeTab === "address" && <BrandAddressForm form={form} updateField={updateField} />}
              {activeTab === "social" && (
                <BrandSocialForm
                  socialLinks={form.socialLinks}
                  onAdd={addSocialLink}
                  onUpdate={updateSocialLink}
                  onRemove={removeSocialLink}
                />
              )}
              {activeTab === "branding" && (
                <BrandBrandingForm form={form} mediaOptions={mediaOptions} updateField={updateField} />
              )}
              {activeTab === "hours" && <BrandBusinessHoursForm form={form} updateField={updateField} />}
            </div>
          </div>
        )}
      </DataEditor>

      <StatusPopup
        open={savedPopupOpen}
        status="success"
        title="Đã lưu cài đặt thương hiệu."
        onOpenChange={setSavedPopupOpen}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
      />
    </>
  );
}
