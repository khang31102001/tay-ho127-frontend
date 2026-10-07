"use client";

import { useState } from "react";
import { GripVertical, Search, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format-currency";

import { useMenuProductsPicker } from "../hooks/useMenuProductsPicker";

type MenuProductsPickerProps = {
  menuId: string;
};

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-brand-line pl-9 pr-4 text-[14px] outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
      />
    </div>
  );
}

/**
 * Chọn sản phẩm cho 1 thực đơn (layout 2 cột) — có vùng lưu/hủy riêng, độc lập
 * với form thông tin thực đơn phía trên. Thứ tự bên phải = thứ tự hiển thị (sortOrder).
 */
export function MenuProductsPicker({ menuId }: MenuProductsPickerProps) {
  const {
    isLoading,
    loadError,
    availableProducts,
    selectedProducts,
    selectedIdSet,
    selectedCount,
    availableQuery,
    setAvailableQuery,
    selectedQuery,
    setSelectedQuery,
    changeCount,
    isSaving,
    saveError,
    toggleProduct,
    removeProduct,
    updateEntry,
    moveProduct,
    discardChanges,
    save,
  } = useMenuProductsPicker(menuId);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [armedIndex, setArmedIndex] = useState<number | null>(null);

  const isDirty = changeCount > 0;
  // Kéo-thả chỉ đúng nghĩa khi đang thấy toàn bộ danh sách (không lọc).
  const canReorder = selectedQuery === "";

  if (isLoading) {
    return (
      <div className="mt-6 rounded-lg border border-brand-line bg-white p-6 text-center text-brand-muted">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-[14px] font-medium text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-lg border border-brand-line bg-white p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cột trái: tất cả sản phẩm */}
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-[15px] font-black text-brand-greenDark">Tất cả sản phẩm</h2>
          <SearchBox value={availableQuery} onChange={setAvailableQuery} placeholder="Tìm sản phẩm..." />

          <ul className="max-h-[420px] divide-y divide-brand-line overflow-y-auto rounded-lg border border-brand-line">
            {availableProducts.length === 0 && (
              <li className="p-4 text-center text-[13px] text-brand-muted">Không tìm thấy sản phẩm.</li>
            )}

            {availableProducts.map((product) => {
              const isSelected = selectedIdSet.has(product.id);

              return (
                <li key={product.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-brand-cream/60",
                      isSelected && "bg-brand-cream/70 opacity-70",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(product.id)}
                      className="size-4 shrink-0 accent-brand-green"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-brand-ink">{product.name}</span>
                      <span className="block truncate text-[12px] text-brand-muted">{product.categoryName}</span>
                    </span>

                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green">
                        Đã chọn
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cột phải: sản phẩm đã chọn */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-black text-brand-greenDark">
              Sản phẩm trong thực đơn ({selectedCount})
            </h2>
            <span className="rounded-full bg-brand-green px-2.5 py-0.5 text-[12px] font-bold text-white">
              {selectedCount} sản phẩm
            </span>
          </div>

          <SearchBox value={selectedQuery} onChange={setSelectedQuery} placeholder="Tìm trong sản phẩm đã chọn..." />

          <ul className="max-h-[420px] space-y-2 overflow-y-auto rounded-lg border border-brand-line p-2">
            {selectedProducts.length === 0 && (
              <li className="p-4 text-center text-[13px] text-brand-muted">
                {selectedCount === 0 ? "Chưa chọn sản phẩm nào." : "Không có sản phẩm khớp tìm kiếm."}
              </li>
            )}

            {selectedProducts.map(({ entry, index, product }) => {
              const id = entry.productId;

              return (
                <li
                  key={id}
                  draggable={canReorder && armedIndex === index}
                  onDragStart={() => setDraggingIndex(index)}
                  onDragOver={(event) => {
                    if (draggingIndex === null) return;
                    event.preventDefault();
                    setDropIndex(index);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggingIndex !== null) moveProduct(draggingIndex, index);
                    setDraggingIndex(null);
                    setDropIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggingIndex(null);
                    setDropIndex(null);
                    setArmedIndex(null);
                  }}
                  className={cn(
                    "rounded-lg border border-brand-line bg-white px-2 py-2",
                    draggingIndex === index && "opacity-40",
                    dropIndex === index && draggingIndex !== index && "border-brand-green ring-1 ring-brand-green",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {canReorder && (
                      // Chỉ tay nắm mới bật kéo-thả để chọn/gõ trong ô giá không bị kéo nhầm cả dòng.
                      <span
                        onMouseDown={() => setArmedIndex(index)}
                        onMouseUp={() => setArmedIndex(null)}
                        className="shrink-0 cursor-grab"
                        aria-hidden="true"
                      >
                        <GripVertical className="size-4 text-brand-muted" />
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-brand-ink">
                        {product?.name ?? "Sản phẩm không còn tồn tại"}
                      </span>
                      <span className="block truncate text-[12px] text-brand-muted">
                        {product ? `${product.slug} · ${product.categoryName}` : id}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => removeProduct(id)}
                      aria-label={`Xóa ${product?.name ?? "sản phẩm"} khỏi thực đơn`}
                      className="shrink-0 rounded-full p-1.5 text-brand-muted transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-6">
                    <label className="flex items-center gap-2 text-[12px] font-bold text-brand-greenDark">
                      Giá riêng
                      <input
                        type="number"
                        min={0}
                        value={entry.priceOverride ?? ""}
                        onChange={(event) =>
                          updateEntry(id, {
                            priceOverride: event.target.value === "" ? undefined : Number(event.target.value),
                          })
                        }
                        placeholder={product ? `Gốc: ${formatCurrency(product.price)}` : "Giá gốc"}
                        className="h-8 w-36 rounded-lg border border-brand-line px-2 text-[13px] font-normal outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </label>

                    <label className="flex items-center gap-2 text-[12px] font-bold text-brand-greenDark">
                      <input
                        type="checkbox"
                        checked={entry.isAvailable}
                        onChange={(event) => updateEntry(id, { isAvailable: event.target.checked })}
                        className="size-4 accent-brand-green"
                      />
                      Còn hàng
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>

          {!canReorder && selectedCount > 0 && (
            <p className="text-[12px] text-brand-muted">Xóa ô tìm kiếm để kéo thả sắp xếp thứ tự món.</p>
          )}
        </div>
      </div>

      {/* Summary + action (sticky ở đáy khi cuộn trang) */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-t border-brand-line bg-white px-6 py-4">
        <div>
          <p className="text-[14px] font-bold text-brand-ink">{selectedCount} sản phẩm đã được chọn</p>
          {isDirty && <p className="text-[12px] font-bold text-amber-600">{changeCount} thay đổi chưa lưu</p>}
          {saveError && <p className="text-[12px] font-bold text-red-600">{saveError}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={discardChanges}
            disabled={!isDirty || isSaving}
            className="rounded-lg border border-brand-line px-5 py-2.5 text-[14px] font-bold text-brand-ink transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            Huỷ thay đổi
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!isDirty || isSaving}
            className="rounded-lg bg-brand-red px-6 py-2.5 text-[14px] font-black text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Đang lưu..." : "Lưu thực đơn"}
          </button>
        </div>
      </div>
    </section>
  );
}
