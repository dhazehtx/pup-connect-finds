import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Users, Filter, Grid, List, Dog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CreateGroupModal from '@/components/community/CreateGroupModal';
import GroupCard from '@/components/community/GroupCard';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Breed-specific emojis mapping
const BREED_EMOJIS: Record<string, string> = {
  'golden-retriever': '🐕',
  'labrador': '🦮',
  'german-shepherd': '🐺',
  'bulldog': '🐶',
  'beagle': '🐕‍🦺',
  'poodle': '🐩',
  'rottweiler': '🦴',
  'yorkshire-terrier': '🎀',
  'boxer': '🥊',
  'dachshund': '🌭',
  'siberian-husky': '❄️',
  'great-dane': '🏗️',
  'chihuahua': '🌮',
  'shih-tzu': '👑',
  'boston-terrier': '🎩',
  'pomeranian': '🧸',
  'australian-shepherd': '🇦🇺',
  'cocker-spaniel': '🎵',
  'border-collie': '🏔️',
  'french-bulldog': '🇫🇷',
  'mastiff': '🏰',
  'belgian-malinois': '🇧🇪',
  'mixed-breed': '🌈',
  'other': '🐕'
};

const POPULAR_BREEDS = [
  'golden-retriever',
  'labrador', 
  'german-shepherd',
  'bulldog',
  'beagle',
  'poodle',
  'mixed-breed'
];

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'discover' | 'joined'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('members'); // members, newest, activity, posts
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all community groups for discovery
  const { data: discoverData, isLoading: discoverLoading } = useQuery({
    queryKey: ['community-groups', searchQuery, selectedBreed, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedBreed) params.append('breed_tag', selectedBreed);
      params.append('sort', sortBy);
      params.append('limit', '20');

      const response = await apiRequest('GET', `/api/community?${params.toString()}`);
      return response.json();
    },
    enabled: activeTab === 'discover',
  });

  // Fetch user's joined groups
  const { data: joinedGroups, isLoading: joinedLoading } = useQuery({
    queryKey: ['user-joined-groups'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/community/user/joined');
      return response.json();
    },
    enabled: activeTab === 'joined' && !!user,
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return apiRequest('POST', `/api/community/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-joined-groups'] });
      toast({
        title: "Joined group successfully!",
        description: "You can now participate in group discussions.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const handleJoinGroup = (groupId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join groups.",
        variant: "destructive",
      });
      return;
    }
    joinGroupMutation.mutate(groupId);
  };

  const handleCreateGroup = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create groups.",
        variant: "destructive",
      });
      return;
    }
    setShowCreateModal(true);
  };

  const getBreedEmoji = (breedTag: string) => {
    return BREED_EMOJIS[breedTag] || BREED_EMOJIS.other;
  };

  const isLoading = activeTab === 'discover' ? discoverLoading : joinedLoading;
  const groups = activeTab === 'discover' ? discoverData?.groups : joinedGroups?.groups;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Community Groups
              </h1>
              <p className="text-gray-600 mt-1">
                Join breed-specific communities and connect with fellow dog lovers
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Create Group Button */}
              <Button onClick={handleCreateGroup} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'discover' | 'joined')} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="discover" className="px-6">
                Discover Groups
              </TabsTrigger>
              <TabsTrigger value="joined" className="px-6">
                My Groups {user && joinedGroups?.groups?.length > 0 && `(${joinedGroups.groups.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Stats */}
            {activeTab === 'discover' && discoverData && (
              <Badge variant="secondary" className="text-sm">
                {discoverData.total} group{discoverData.total !== 1 ? 's' : ''} found
              </Badge>
            )}
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search groups by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Breed Filter */}
                  <div className="w-full md:w-48">
                    <select
                      value={selectedBreed}
                      onChange={(e) => setSelectedBreed(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Breeds</option>
                      {POPULAR_BREEDS.map(breed => (
                        <option key={breed} value={breed}>
                          {getBreedEmoji(breed)} {breed.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="w-full md:w-32">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="members">Most Members</option>
                      <option value="newest">Newest</option>
                      <option value="activity">Most Active</option>
                      <option value="posts">Most Posts</option>
                    </select>
                  </div>
                </div>

                {/* Popular Breed Tags */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Popular Breeds:</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_BREEDS.map(breed => (
                      <Button
                        key={breed}
                        variant={selectedBreed === breed ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedBreed(selectedBreed === breed ? '' : breed)}
                        className="text-xs"
                      >
                        {getBreedEmoji(breed)} {breed.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Groups Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading groups...</span>
              </div>
            ) : groups && groups.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {groups.map((group: any) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    variant={viewMode}
                    onJoin={handleJoinGroup}
                    isJoining={joinGroupMutation.isPending}
                    getBreedEmoji={getBreedEmoji}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <Dog className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
                    <p className="text-gray-600 mt-1">
                      Try adjusting your search terms or create the first group for your breed!
                    </p>
                  </div>
                  <Button onClick={handleCreateGroup} className="mt-4">
                    Create New Group
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Joined Groups Tab */}
          <TabsContent value="joined" className="space-y-6">
            {!user ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <Users className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Sign in to view your groups</h3>
                    <p className="text-gray-600 mt-1">
                      Join groups to connect with fellow dog lovers and share experiences.
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = '/auth'}>
                    Sign In
                  </Button>
                </div>
              </Card>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading your groups...</span>
              </div>
            ) : groups && groups.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {groups.map((group: any) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    variant={viewMode}
                    isJoined={true}
                    userRole={group.role}
                    getBreedEmoji={getBreedEmoji}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <Users className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No groups joined yet</h3>
                    <p className="text-gray-600 mt-1">
                      Discover and join groups to connect with fellow dog lovers!
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('discover')}>
                    Discover Groups
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['community-groups'] });
          queryClient.invalidateQueries({ queryKey: ['user-joined-groups'] });
          setShowCreateModal(false);
        }}
        getBreedEmoji={getBreedEmoji}
        popularBreeds={POPULAR_BREEDS}
      />
    </div>
  );
};

export default CommunityPage;