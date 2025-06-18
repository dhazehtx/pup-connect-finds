
import React from 'react';
import { Card } from '@/components/ui/card';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  breed?: string;
  age?: string;
  tags?: string[];
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onPhotoLongPress?: (photo: Photo) => void;
  isOwnProfile?: boolean;
}

const PhotoGrid = ({ photos, onPhotoClick, onPhotoLongPress, isOwnProfile }: PhotoGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-gray-400 rounded-lg"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-gray-500">When you share photos, they'll appear here.</p>
      </div>
    );
  }

  const handleLongPress = (photo: Photo) => {
    if (isOwnProfile && onPhotoLongPress) {
      onPhotoLongPress(photo);
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <Card 
            key={photo.id}
            className="aspect-square overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 rounded-xl"
            onClick={() => onPhotoClick?.(photo)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleLongPress(photo);
            }}
            onTouchStart={(e) => {
              const timer = setTimeout(() => handleLongPress(photo), 500);
              const cleanup = () => clearTimeout(timer);
              e.currentTarget.addEventListener('touchend', cleanup, { once: true });
              e.currentTarget.addEventListener('touchmove', cleanup, { once: true });
            }}
          >
            <img
              src={photo.url}
              alt={photo.caption || 'Post photo'}
              className="w-full h-full object-cover"
            />
            {photo.breed && (
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {photo.breed}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
