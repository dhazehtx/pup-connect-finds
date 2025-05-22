
import React from 'react';
import { User, Bell, Shield, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

const Settings = () => {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', description: 'Update your personal details' },
        { icon: Shield, label: 'Privacy & Security', description: 'Manage your privacy settings' },
        { icon: Bell, label: 'Notifications', description: 'Configure notification preferences' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: MapPin, label: 'Location Settings', description: 'Manage location and distance preferences' },
        { icon: CreditCard, label: 'Payment Methods', description: 'Add or update payment information' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', description: 'Get help or contact support' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl p-6 border border-amber-100 mb-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">John Smith</h2>
            <p className="text-gray-600">Verified Breeder</p>
            <p className="text-sm text-gray-500 mt-1">Member since March 2023</p>
          </div>
          <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-xl border border-amber-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{group.title}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIndex}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="mt-6">
        <button className="w-full bg-white border border-red-200 text-red-600 py-3 px-4 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
