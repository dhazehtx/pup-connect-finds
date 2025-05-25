
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NotificationTabs = ({ activeTab, onTabChange }: NotificationTabsProps) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'following', label: 'People you follow' },
    { id: 'comments', label: 'Comments' },
    { id: 'follows', label: 'Follows' }
  ];

  return (
    <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "outline"}
          size="sm"
          className={`flex-shrink-0 rounded-full text-xs px-4 py-2 ${
            activeTab === tab.id 
              ? 'bg-white text-black' 
              : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default NotificationTabs;
