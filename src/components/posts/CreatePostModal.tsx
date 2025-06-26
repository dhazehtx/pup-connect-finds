
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Image, Video } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postType: 'photo' | 'video' | 'text';
}

const CreatePostModal = ({ isOpen, onClose, postType }: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = postType === 'photo' 
        ? ['image/jpeg', 'image/png', 'image/webp']
        : ['video/mp4', 'video/webm', 'video/mov'];
      
      if (!validTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
        toast({
          title: "Invalid file type",
          description: `Please select a ${postType === 'photo' ? 'photo' : 'video'} file`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: "Please select a file under 50MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!caption.trim() && !selectedFile && postType !== 'text') {
      toast({
        title: "Content required",
        description: "Please add content to your post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate post creation
    setTimeout(() => {
      toast({
        title: "Post created! ✨",
        description: "Your post has been shared successfully",
      });
      setLoading(false);
      onClose();
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl('');
    }, 2000);
  };

  const getModalTitle = () => {
    switch (postType) {
      case 'photo': return 'Upload Photo';
      case 'video': return 'Post Video';
      default: return 'Write Update';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>{getModalTitle()}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.email}</p>
                <p className="text-sm text-gray-500">Share an update</p>
              </div>
            </div>

            {/* Caption Input */}
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind? Share something about your pup..."
              rows={4}
              className="resize-none border-2"
              style={{ borderColor: '#CBD5E1' }}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500">{caption.length}/2000 characters</p>

            {/* File Upload for Photo/Video */}
            {postType !== 'text' && (
              <div className="space-y-3">
                {!selectedFile ? (
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:bg-blue-50"
                         style={{ borderColor: '#CBD5E1' }}>
                      {postType === 'photo' ? (
                        <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      ) : (
                        <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      )}
                      <p className="text-gray-600 font-medium">
                        Click to select a {postType}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Max file size: 50MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept={postType === 'photo' ? 'image/*' : 'video/*'}
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    {postType === 'photo' ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={previewUrl} 
                        className="w-full max-h-64 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading || (!caption.trim() && !selectedFile)}
              className="w-full text-white font-semibold transition-all duration-200"
              style={{ backgroundColor: '#2363FF' }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1E52D0';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2363FF';
              }}
            >
              {loading ? 'Publishing...' : 'Share Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostModal;
