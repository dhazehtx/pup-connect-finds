
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, Play } from 'lucide-react';

interface MediaMessageProps {
  imageUrl?: string;
  videoUrl?: string;
  caption?: string;
  isOwn: boolean;
}

const MediaMessage = ({ imageUrl, videoUrl, caption, isOwn }: MediaMessageProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (imageUrl) {
    return (
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative cursor-pointer group rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Shared image"
                className="w-full h-auto rounded-lg transition-opacity duration-200"
                onLoad={() => setIsImageLoaded(true)}
                style={{ opacity: isImageLoaded ? 1 : 0.7 }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] p-0">
            <img
              src={imageUrl}
              alt="Shared image"
              className="w-full h-auto object-contain"
            />
          </DialogContent>
        </Dialog>
        {caption && (
          <p className={`text-sm mt-2 px-3 py-2 rounded-lg ${
            isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}>
            {caption}
          </p>
        )}
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div className="relative rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls
            className="w-full h-auto rounded-lg"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        {caption && (
          <p className={`text-sm mt-2 px-3 py-2 rounded-lg ${
            isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}>
            {caption}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default MediaMessage;
