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
    <nav className="w-full flex justify-center mt-6 mb-4" role="tablist">
      <div className="mx-auto w-full max-w-[680px] bg-white border border-gray-200 rounded-full p-1 flex items-center justify-center gap-2">
        {tabs.map(t => {
          const IconComponent = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`${isActive ? 
                'bg-blue-600 text-white border border-blue-600' : 
                'bg-white text-blue-600 border border-gray-200'
              } rounded-full px-4 py-2 font-semibold inline-flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-colors`}
              role="tab"
              aria-selected={isActive}
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