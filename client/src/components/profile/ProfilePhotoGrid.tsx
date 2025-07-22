
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handleNextPhoto = () => {
    const nextIndex = (selectedIndex + 1) % photos.length;
    setSelectedIndex(nextIndex);
    setSelectedPhoto(photos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    const prevIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
    setSelectedIndex(prevIndex);
    setSelectedPhoto(photos[prevIndex]);
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
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200"
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
        <div className="flex items-center space-x-2 border rounded-lg p-1 bg-gray-50">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'scroll' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('scroll')}
            className={`transition-all duration-200 ${
              viewMode === 'scroll' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-1">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="aspect-square cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-105"
              onClick={() => handlePhotoClick(photo, index)}
            >
              <img
                src={photo.url}
                alt="Post"
                className="w-full h-full object-cover rounded-lg shadow-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Scroll View */}
      {viewMode === 'scroll' && (
        <div className="space-y-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => handlePhotoClick(photo, index)}
            >
              <img
                src={photo.url}
                alt="Post"
                className="w-full max-h-96 object-cover rounded-lg shadow-sm"
              />
              {photo.caption && (
                <p className="mt-2 text-gray-700 text-sm">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal with Navigation */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo */}
            <img
              src={selectedPhoto.url}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg mx-auto block"
            />

            {/* Caption */}
            {selectedPhoto.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
                <p>{selectedPhoto.caption}</p>
              </div>
            )}

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                {selectedIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoGrid;
