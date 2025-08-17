import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, Gift, Store } from 'lucide-react';

const tabs = [
  { label: "Pet Services", to: "/marketplace", icon: Briefcase },
  { label: "Pup Box", to: "/marketplace/pupbox", icon: Gift },
  { label: "Store", to: "/marketplace/store", icon: Store },
];

export default function MarketplaceTabs() {
  return (
    <nav className="w-full flex justify-center mt-6">
      <div className="tab-group">
        {tabs.map(t => (
          <NavLink 
            key={t.to} 
            to={t.to}
            className={({isActive}) => `tab-pill ${isActive ? "is-active" : ""}`}
            data-testid={`tab-${t.label.toLowerCase().replace(' ', '-')}`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}