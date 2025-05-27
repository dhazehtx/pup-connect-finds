
import React, { useState } from 'react';
import { ArrowLeft, Camera, Image, MapPin, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface UploadedPhoto {
  id: string;
  url: string;
  file: File;
}

const Post = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: UploadedPhoto = {
            id: Math.random().toString(36).substr(2, 9),
            url: e.target?.result as string,
            file: file
          };
          setUploadedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    setIsUploading(false);
    event.target.value = '';
  };

  const removePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleShare = () => {
    if (uploadedPhotos.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please add at least one photo to your post.",
        variant: "destructive",
      });
      return;
    }

    if (!caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please add a caption to your post.",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally upload to backend
    toast({
      title: "Post shared!",
      description: "Your post has been shared successfully.",
    });
    
    navigate(-1);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 flex items-center justify-between bg-white">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">New Post</h1>
        <Button 
          onClick={handleShare}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          disabled={isUploading}
        >
          Share
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Photo Upload Section */}
        <div className="space-y-4">
          {uploadedPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {uploadedPhotos.length < 10 && (
                <label className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Plus size={24} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Add Photo</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <div className="text-center">
                <Camera size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">Add Photos</p>
                <p className="text-xs text-gray-400">Upload up to 10 photos</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium mb-2">Caption</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your post..."
            className="min-h-[100px] resize-none border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {caption.length}/500
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <MapPin size={20} className="text-gray-400" />
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="border-0 p-0 focus-visible:ring-0 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            <Input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add tags (e.g., #puppy)"
              className="border-0 p-0 focus-visible:ring-0 focus:ring-0 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button onClick={addTag} size="sm" variant="outline">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Camera and Gallery Options */}
        <div className="grid grid-cols-2 gap-3">
          <label className="p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <Camera size={20} />
            <span>Camera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <label className="p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <Image size={20} />
            <span>Gallery</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Post;
