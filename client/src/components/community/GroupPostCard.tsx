import React from 'react';
import { Heart, MessageSquare, Share, MoreHorizontal, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import ShareModal from '@/components/share/ShareModal';

interface GroupPostCardProps {
  post: any;
  isMember: boolean;
  groupId: string;
}

const GroupPostCard: React.FC<GroupPostCardProps> = ({
  post,
  isMember,
  groupId
}) => {
  const handleLike = () => {
    // Like functionality will be implemented
    console.log('Like post', post.id);
  };

  const handleComment = () => {
    // Comment functionality will be implemented
    console.log('Comment on post', post.id);
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'announcement':
        return 'bg-purple-100 text-purple-800';
      case 'photo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'announcement':
        return 'Announcement';
      case 'photo':
        return 'Photo';
      case 'discussion':
        return 'Discussion';
      default:
        return type;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback>
                {post.author_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{post.author_name}</p>
                <p className="text-sm text-gray-500">@{post.author_username}</p>
                {post.is_pinned && (
                  <Pin className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
                <Badge className={`text-xs ${getPostTypeColor(post.post_type)}`}>
                  {getPostTypeLabel(post.post_type)}
                </Badge>
                {post.is_cross_posted && (
                  <Badge variant="outline" className="text-xs">
                    Cross-posted
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Title */}
        {post.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {post.title}
          </h3>
        )}

        {/* Post Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {post.images.slice(0, 4).map((image: string, index: number) => (
              <div 
                key={index}
                className="relative rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                />
                {post.images.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">
                      +{post.images.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span>{post.likes_count} likes</span>
            <span>{post.comments_count} comments</span>
            <span>{post.views_count} views</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isMember}
              className={`${post.isLikedByUser ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-gray-700'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${post.isLikedByUser ? 'fill-current' : ''}`} />
              Like ({post.likes_count})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              disabled={!isMember}
              className="text-gray-600 hover:text-gray-700"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Comment ({post.comments_count})
            </Button>

            <ShareModal
              postId={post.id}
              postTitle={post.title || 'Group Post'}
              postContent={post.content}
              postImage={post.images?.[0]}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-700"
                >
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              }
            />
          </div>

          {!isMember && (
            <p className="text-xs text-gray-500">
              Join the group to interact with posts
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupPostCard;