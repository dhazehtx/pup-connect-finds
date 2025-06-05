
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff, MessageCircleOff } from 'lucide-react';

interface PostPrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    showLikes: boolean;
    allowComments: boolean;
  };
  onSettingsChange: (settings: { showLikes: boolean; allowComments: boolean }) => void;
}

const PostPrivacySettings = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}: PostPrivacySettingsProps) => {
  const updateSetting = (key: 'showLikes' | 'allowComments', value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings size={20} />
            Post Privacy
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {settings.showLikes ? (
                  <Eye size={16} className="text-green-500" />
                ) : (
                  <EyeOff size={16} className="text-gray-400" />
                )}
                <Label htmlFor="showLikes" className="font-medium">
                  Show Likes
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Allow others to see who liked this post
              </p>
            </div>
            <Switch
              id="showLikes"
              checked={settings.showLikes}
              onCheckedChange={(checked) => updateSetting('showLikes', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {settings.allowComments ? (
                  <Eye size={16} className="text-green-500" />
                ) : (
                  <MessageCircleOff size={16} className="text-gray-400" />
                )}
                <Label htmlFor="allowComments" className="font-medium">
                  Allow Comments
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Allow others to comment on this post
              </p>
            </div>
            <Switch
              id="allowComments"
              checked={settings.allowComments}
              onCheckedChange={(checked) => updateSetting('allowComments', checked)}
            />
          </div>

          {!settings.allowComments && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700">
                Comments are disabled for this post. Existing comments will still be visible but no new comments can be added.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPrivacySettings;
