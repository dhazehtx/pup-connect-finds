
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NotificationTabs = ({ activeTab, onTabChange }: NotificationTabsProps) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'following', label: 'Following' },
    { id: 'comments', label: 'Comments' },
    { id: 'follows', label: 'Follows' }
  ];

  return (
    <div className="flex border-b bg-white">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 rounded-none border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-warm-brown text-warm-brown font-medium'
              : 'border-transparent text-gray-600 hover:text-deep-navy'
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default NotificationTabs;
