
import React, { useState } from 'react';
import { Star, ChevronRight, Download, Bookmark, BookmarkCheck, Clock, User, Share2, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { EducationResource } from '../../hooks/useEducationSearch';
import { ShareDialog } from './ShareDialog';

interface ResourceCardProps {
  resource: EducationResource;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onDownload?: (resource: EducationResource) => void;
  isRead?: boolean;
  progress?: number;
  onMarkAsRead?: (id: number) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
  onDownload,
  isRead = false,
  progress = 0,
  onMarkAsRead
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleDownload = () => {
    if (onDownload && resource.downloadable) {
      onDownload(resource);
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(resource.id);
    }
  };

  const handleReadArticle = () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
    if (onMarkAsRead) {
      onMarkAsRead(resource.id);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative">
          <img
            src={resource.image}
            alt={resource.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getDifficultyColor(resource.difficulty)}>
              {resource.difficulty}
            </Badge>
            {resource.downloadable && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Download size={12} className="mr-1" />
                PDF
              </Badge>
            )}
            {isRead && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" />
                Read
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setShowShareDialog(true);
              }}
            >
              <Share2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(resource.id);
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck size={14} className="text-blue-600" />
              ) : (
                <Bookmark size={14} />
              )}
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{resource.description}</p>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
          
          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={resource.author.avatar} />
              <AvatarFallback>
                <User size={12} />
              </AvatarFallback>
            </Avatar>
            <div className="text-xs text-gray-500">
              <span className="font-medium">{resource.author.name}</span>
              <span className="block">{resource.author.credentials}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {resource.readTime}
              </span>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-500 fill-current" />
                <span>{resource.rating}</span>
                <span>({resource.reviews})</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 group"
              onClick={(e) => {
                e.stopPropagation();
                handleReadArticle();
              }}
            >
              Read Article
              <ExternalLink size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            {!isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
                className="px-3"
              >
                <CheckCircle size={16} />
              </Button>
            )}
            {resource.downloadable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="px-3"
              >
                <Download size={16} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        resource={resource}
      />
    </>
  );
};
