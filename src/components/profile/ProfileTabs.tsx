
import React from 'react';
import { Grid, BookOpen, User } from 'lucide-react';
import PhotoGrid from './PhotoGrid';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  posts: string[];
  isOwnProfile: boolean;
}

const ProfileTabs = ({ activeTab, setActiveTab, posts, isOwnProfile }: ProfileTabsProps) => {
  const tabs = [
    { id: 'photos', label: 'Photos', icon: Grid },
    { id: 'reviews', label: 'Reviews', icon: BookOpen },
    { id: 'listings', label: 'Listings', icon: User }
  ];

  const photoData: Photo[] = posts.map((url, index) => ({
    id: `photo-${index}`,
    url,
    caption: `Photo ${index + 1}`
  }));

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-t border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-5 h-5 mr-1" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'photos' && (
          <PhotoGrid photos={photoData} />
        )}
        
        {activeTab === 'reviews' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">Reviews from customers will appear here.</p>
          </div>
        )}
        
        {activeTab === 'listings' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
            <p className="text-gray-500">Active listings will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
