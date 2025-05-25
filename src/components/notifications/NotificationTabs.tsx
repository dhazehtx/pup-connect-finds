
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
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
