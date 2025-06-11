
import React from 'react';
import { Bell } from 'lucide-react';

const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-deep-navy mb-2">
        No notifications yet
      </h3>
      <p className="text-gray-600 max-w-sm">
        When you get likes, comments, and follows, they'll show up here.
      </p>
    </div>
  );
};

export default EmptyNotifications;
