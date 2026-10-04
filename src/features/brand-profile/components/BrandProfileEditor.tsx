"use client";

import { useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { StatusPopup } from "@/components/shared/StatusPopup";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

import { useBrandProfileEditor } from "../hooks/useBrandProfileEditor";
import { BrandBrandingForm } from "./BrandBrandingForm";
import { BrandGeneralForm } from "./BrandGeneralForm";
import { BrandSocialForm } from "./BrandSocialForm";

const TABS: TabItem[] = [
  { id: "general", label: "Chung" },
  { id: "social", label: "Mạng xã hội" },
  { id: "branding", label: "Nhận diện" },
];

/**
 * Thông tin thương hiệu là bản ghi duy nhất (singleton) — danh tính CHUNG của cả doanh nghiệp (tên, slogan, logo, pháp lý,
 * mạng xã hội). Địa chỉ/điện thoại/giờ mở cửa KHÔNG ở đây: chúng thuộc từng Chi nhánh (Tổ chức → Chi nhánh). Tabs chỉ ẩn/hiện
 * panel trong CÙNG 1 form, nút Lưu luôn lưu toàn bộ dữ liệu bất kể tab nào đang active.
 */
export function BrandProfileEditor() {
  const { form, isLoading, mediaOptions, updateField, addSocialLink, updateSocialLink, removeSocialLink, handleSave } =
    useBrandProfileEditor();
  const [activeTab, setActiveTab] = useState("general");
  const [savedPopupOpen, setSavedPopupOpen] = useState(false);

  return (
    <>
      <DataEditor
        title="Thông tin thương hiệu"
        backHref="/admin/organization/brands"
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
            </div>
          </div>
        )}
      </DataEditor>

      <StatusPopup
        open={savedPopupOpen}
        status="success"
        title="Đã lưu thông tin thương hiệu."
        onOpenChange={setSavedPopupOpen}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
      />
    </>
  );
}
