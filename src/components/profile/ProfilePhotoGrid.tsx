
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface ProfilePhotoGridProps {
  isOwnProfile: boolean;
  photos: Photo[];
}

const ProfilePhotoGrid = ({ isOwnProfile, photos }: ProfilePhotoGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'scroll'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Grid3X3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Yet</h3>
        <p className="text-gray-500">
          {isOwnProfile ? 'Share your first photo!' : 'No photos shared yet.'}
        </p>
        {isOwnProfile && (
          <Button 
            className="mt-4 transition-all duration-200"
            style={{ backgroundColor: '#2363FF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1E52D0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2363FF';
            }}
          >
            Add Photos
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Photos ({photos.length})</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'text-white' : ''}
            style={{
              backgroundColor: viewMode === 'grid' ? '#2363FF' : 'transparent',
              borderColor: '#2363FF',
              color: viewMode === 'grid' ? 'white' : '#2363FF'
            }}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'scroll' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('scroll')}
            className={viewMode === 'scroll' ? 'text-white' : ''}
            style={{
              backgroundColor: viewMode === 'scroll' ? '#2363FF' : 'transparent',
              borderColor: '#2363FF',
              color: viewMode === 'scroll' ? 'white' : '#2363FF'
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handlePhotoClick(photo)}
            >
              <img
                src={photo.url}
                alt="Post"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Scroll View */}
      {viewMode === 'scroll' && (
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-64 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.url}
                  alt="Post"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              ×
            </button>
            <img
              src={selectedPhoto.url}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {selectedPhoto.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
                <p>{selectedPhoto.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoGrid;
