
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Star, 
  Search,
  Verified,
  Award,
  Calendar,
  MapPin
} from 'lucide-react';
import { useProfessionalNetwork } from '@/hooks/useProfessionalNetwork';
import { useToast } from '@/hooks/use-toast';

const ProfessionalNetworkDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    connections, 
    followers, 
    following, 
    pendingRequests,
    sendConnectionRequest,
    respondToConnectionRequest,
    followUser,
    unfollowUser 
  } = useProfessionalNetwork();
  const { toast } = useToast();

  const handleSendRequest = async (userId: string, type: 'professional' | 'mentorship' | 'collaboration') => {
    try {
      await sendConnectionRequest(userId, type);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{connections.length}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{followers.length}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{following.length}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Professional Network</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={connection.profile?.avatar_url} />
                        <AvatarFallback>{connection.profile?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{connection.profile?.full_name}</h4>
                          {connection.profile?.verified && (
                            <Verified className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {connection.profile?.user_type} • Connected since {new Date(connection.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {connection.connection_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discover Professional Breeders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Mock breeder recommendations */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face&v=${i}`} />
                        <AvatarFallback>B{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Professional Breeder {i}</h4>
                          <Verified className="h-4 w-4 text-blue-500" />
                          <Award className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Licensed Breeder • Golden Retrievers & Labs
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">San Francisco, CA</span>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">4.9 (156 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollowUser(`user${i}`)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(`user${i}`, 'professional')}
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.profile?.avatar_url} />
                        <AvatarFallback>{request.profile?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{request.profile?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Wants to connect as {request.connection_type}
                        </p>
                        {request.message && (
                          <p className="text-sm bg-muted p-2 rounded mt-2">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToConnectionRequest(request.id, 'declined')}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => respondToConnectionRequest(request.id, 'accepted')}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending connection requests
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>People You Follow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {following.map((follow) => (
                  <div key={follow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={follow.profile?.avatar_url} />
                        <AvatarFallback>{follow.profile?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{follow.profile?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {follow.profile?.user_type} • Followed since {new Date(follow.followed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unfollowUser(follow.following_id)}
                      >
                        Unfollow
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalNetworkDashboard;
