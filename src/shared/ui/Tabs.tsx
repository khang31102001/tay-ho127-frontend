export type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
};

/**
 * UI primitive thuần — chỉ render thanh điều hướng tab (role="tablist"),
 * không biết nội dung panel. Domain tự quyết định hiển thị panel nào theo
 * activeTab (xem BrandSettingsEditor).
 */
export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 border-b border-brand-line">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-t-lg px-4 py-2.5 text-[13px] font-bold transition ${
              isActive
                ? "border-x border-t border-brand-line bg-white text-brand-greenDark"
                : "text-brand-muted hover:text-brand-greenDark"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
