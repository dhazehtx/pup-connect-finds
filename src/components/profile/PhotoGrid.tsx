
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const PhotoGrid = ({ photos, onPhotoClick }: PhotoGridProps) => {
  if (photos.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-gray-400 rounded"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-gray-500">When you share photos, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="grid grid-cols-3 gap-1">
        {photos.map((photo) => (
          <Card 
            key={photo.id}
            className="aspect-square overflow-hidden cursor-pointer border-0 shadow-none hover:shadow-md transition-all duration-300 hover:scale-105"
            onClick={() => onPhotoClick?.(photo)}
          >
            <img
              src={photo.url}
              alt={photo.caption || 'Post photo'}
              className="w-full h-full object-cover rounded-lg"
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
