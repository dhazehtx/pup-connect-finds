
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Video, Edit3 } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

interface CreatePostDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostDropdown = ({ isOpen, onClose }: CreatePostDropdownProps) => {
  const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState<'photo' | 'video' | 'text'>('text');

  if (!isOpen) return null;

  const handleOptionClick = (type: 'photo' | 'video' | 'text') => {
    setPostType(type);
    setShowModal(true);
    onClose();
  };

  return (
    <>
      <div className="absolute top-12 right-0 z-50">
        <Card className="w-48 shadow-lg border-2" style={{ borderColor: '#CBD5E1' }}>
          <CardContent className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-blue-50"
                onClick={() => handleOptionClick('photo')}
              >
                <Camera className="w-4 h-4 mr-3 text-blue-600" />
                Upload Photo
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-blue-50"
                onClick={() => handleOptionClick('video')}
              >
                <Video className="w-4 h-4 mr-3 text-blue-600" />
                Post Video
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left hover:bg-blue-50"
                onClick={() => handleOptionClick('text')}
              >
                <Edit3 className="w-4 h-4 mr-3 text-blue-600" />
                Write Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        postType={postType}
      />
    </>
  );
};

export default CreatePostDropdown;
