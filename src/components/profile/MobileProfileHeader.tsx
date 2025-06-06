
import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';

interface MobileProfileHeaderProps {
  profile: any;
  onBack?: () => void;
  onEdit?: () => void;
  isOwnProfile?: boolean;
}

const MobileProfileHeader = ({ 
  profile, 
  onBack, 
  onEdit, 
  isOwnProfile = false 
}: MobileProfileHeaderProps) => {
  const { isMobile, safeAreaInsets } = useMobileOptimized();

  if (!isMobile) return null;

  return (
    <div 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border unified-theme"
      style={{ paddingTop: safeAreaInsets.top }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="unified-button">
              <ArrowLeft size={20} />
            </Button>
          )}
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate text-foreground">
              {profile?.full_name || profile?.username || 'Profile'}
            </h1>
            <div className="flex items-center gap-2">
              {profile?.verified && (
                <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                  Verified
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                @{profile?.username}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isOwnProfile && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="border-border text-foreground hover:bg-muted">
              Edit
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileHeader;
