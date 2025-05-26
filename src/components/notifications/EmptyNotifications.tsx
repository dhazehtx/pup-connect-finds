
import React from 'react';
import { Bell } from 'lucide-react';

const EmptyNotifications = () => {
  return (
    <div className="text-center py-12">
      <Bell size={48} className="text-soft-sky mx-auto mb-4" />
      <h3 className="text-lg font-medium text-deep-navy mb-2">You're all caught up!</h3>
      <p className="text-gray-600">No more notifications to show</p>
    </div>
  );
};

export default EmptyNotifications;
