import { Briefcase, Gift, Store } from "lucide-react";

interface MarketplaceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: "services", label: "Pet Services", short: "Pet", icon: Briefcase },
  { key: "box", label: "Pup Box", short: "Pup", icon: Gift },
  { key: "store", label: "Store", short: "Store", icon: Store },
];

export default function MarketplaceTabs({ activeTab, onTabChange }: MarketplaceTabsProps) {
  return (
    <nav className="w-full flex justify-center mt-6 mb-4">
      <div
        role="tablist"
        aria-label="Marketplace sections"
        className="marketplace-tabs"
      >
        {tabs.map(t => {
          const IconComponent = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              data-testid={`tab-${t.key}`}
              onClick={() => onTabChange(t.key)}
              className={`marketplace-tab ${isActive ? 'marketplace-tab--active' : ''} inline-flex items-center gap-2`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}