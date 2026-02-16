import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Heart, 
  Share, 
  Calendar,
  Crown,
  Shield,
  Settings,
  UserPlus,
  UserMinus,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import GroupPostCard from '@/components/community/GroupPostCard';
import CreateGroupPostModal from '@/components/community/CreateGroupPostModal';
import { formatDistanceToNow } from 'date-fns';

const BREED_EMOJIS: Record<string, string> = {
  'golden-retriever': '🐕',
  'labrador': '🦮',
  'german-shepherd': '🐺',
  'bulldog': '🐶',
  'beagle': '🐕‍🦺',
  'poodle': '🐩',
  'mixed-breed': '🌈',
  'other': '🐕'
};

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Get group details
  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ['group-detail', groupId],
    queryFn: async () => {
      const response = await apiRequest(`/api/community/${groupId}`);
      return response;
    },
    enabled: !!groupId,
  });

  // Get group posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['group-posts', groupId],
    queryFn: async () => {
      const response = await apiRequest(`/api/groups/${groupId}/posts`);
      return response;
    },
    enabled: !!groupId && activeTab === 'posts',
  });

  // Join group mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/community/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', groupId] });
      toast({
        title: "Joined group successfully!",
        description: "You can now participate in discussions.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to join group",
        variant: "destructive",
      });
    },
  });

  // Leave group mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/community/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', groupId] });
      toast({
        title: "Left group successfully",
        description: "You are no longer a member of this group.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to leave group",
        variant: "destructive",
      });
    },
  });

  const handleJoinLeave = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join groups.",
        variant: "destructive",
      });
      return;
    }

    if (groupData?.userMembership) {
      leaveMutation.mutate();
    } else {
      joinMutation.mutate();
    }
  };

  const getBreedEmoji = (breedTag: string) => {
    return BREED_EMOJIS[breedTag] || BREED_EMOJIS.other;
  };

  const formatBreedName = (breedTag: string) => {
    return breedTag?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-blue-600" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading group...</span>
      </div>
    );
  }

  if (!groupData?.group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
          <p className="text-gray-600 mb-4">The group you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => window.location.href = '/community'}>
            Back to Community
          </Button>
        </Card>
      </div>
    );
  }

  const { group, userMembership } = groupData;
  const isMember = !!userMembership;
  const isAdmin = userMembership?.role === 'admin';
  const isModerator = userMembership?.role === 'moderator';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Group Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cover Image */}
          {group.cover_image && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 overflow-hidden">
              <img 
                src={group.cover_image} 
                alt={group.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Group Avatar */}
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={group.cover_image} />
                  <AvatarFallback className="text-2xl">
                    {group.breed_tag ? getBreedEmoji(group.breed_tag) : '🐕'}
                  </AvatarFallback>
                </Avatar>
                {group.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-2">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                  {isMember && getRoleIcon(userMembership.role)}
                  {group.privacy === 'private' && (
                    <Badge variant="secondary">Private Group</Badge>
                  )}
                  {group.is_verified && (
                    <Badge className="bg-blue-500">Verified</Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-4 max-w-2xl">{group.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{group.post_count} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
                  </div>
                  {group.breed_tag && (
                    <Badge variant="outline">
                      {getBreedEmoji(group.breed_tag)} {formatBreedName(group.breed_tag)}
                    </Badge>
                  )}
                </div>

                {/* Creator Info */}
                {group.creator_name && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 rounded-lg w-fit">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.creator_avatar} />
                      <AvatarFallback className="text-sm">
                        {group.creator_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Created by {group.creator_name}
                      </p>
                      <p className="text-xs text-gray-500">@{group.creator_username}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isMember ? (
                <>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                  
                  {(isAdmin || isModerator) && (
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleJoinLeave}
                    disabled={leaveMutation.isPending}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    {leaveMutation.isPending ? 'Leaving...' : 'Leave Group'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleJoinLeave}
                  disabled={joinMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {joinMutation.isPending ? 'Joining...' : 'Join Group'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-fit grid-cols-3 mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {!isMember && group.privacy === 'private' ? (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <Users className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Private Group</h3>
                    <p className="text-gray-600 mt-1">
                      You need to be a member to view posts in this private group.
                    </p>
                  </div>
                  <Button onClick={handleJoinLeave} disabled={joinMutation.isPending}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Request to Join
                  </Button>
                </div>
              </Card>
            ) : postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading posts...</span>
              </div>
            ) : postsData?.posts && postsData.posts.length > 0 ? (
              <div className="space-y-6">
                {postsData.posts.map((post: any) => (
                  <GroupPostCard
                    key={post.id}
                    post={post}
                    isMember={isMember}
                    groupId={groupId!}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                    <p className="text-gray-600 mt-1">
                      Be the first to start a conversation in this group!
                    </p>
                  </div>
                  {isMember && (
                    <Button onClick={() => setShowCreatePost(true)}>
                      Create First Post
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{group.description}</p>
                </div>
                
                {group.rules && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Group Rules</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{group.rules}</p>
                    </div>
                  </div>
                )}

                {group.tags && group.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Users className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Members List</h3>
                  <p className="text-gray-600 mt-1">
                    Member management features coming soon!
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Post Modal */}
      <CreateGroupPostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        groupId={groupId!}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
          setShowCreatePost(false);
        }}
      />
    </div>
  );
};

export default GroupDetailPage;