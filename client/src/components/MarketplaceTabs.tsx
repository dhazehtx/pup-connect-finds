import { Briefcase, Gift, Store } from "lucide-react";

interface MarketplaceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: "services", label: "Pet Services", icon: Briefcase },
  { key: "pupbox", label: "Pup Box", icon: Gift },
  { key: "store", label: "Store", icon: Store },
];

export default function MarketplaceTabs({ activeTab, onTabChange }: MarketplaceTabsProps) {
  return (
    <nav className="w-full flex justify-center mt-6">
      <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm border border-gray-200">
        {tabs.map(t => {
          const IconComponent = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`marketplace-tab-pill ${isActive ? "is-active" : ""}`}
              data-testid={`tab-${t.key}`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}