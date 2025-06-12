
import React, { useState } from 'react';
import { User, Settings, Star, MapPin, Phone, Mail, Globe, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SimpleProfileContent = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');

  // Demo data for guest users or fallback
  const demoProfile = {
    full_name: 'Golden Paws Kennel',
    username: 'goldenpaws',
    bio: 'Specializing in Golden Retrievers and Labradors for over 15 years. Committed to breeding healthy, well-socialized puppies.',
    location: 'San Francisco, CA',
    phone: '(555) 123-4567',
    website_url: 'https://goldenpaws.com',
    avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
    verified: true,
    rating: 4.9,
    total_reviews: 156,
    years_experience: 15,
    specializations: ['Golden Retrievers', 'Labradors', 'Puppy Training'],
    stats: {
      posts: 24,
      followers: 1245,
      following: 189
    }
  };

  const displayProfile = user && profile ? {
    full_name: profile.full_name || user.email?.split('@')[0] || 'User',
    username: profile.username || user.email?.split('@')[0] || 'user',
    bio: profile.bio || 'Welcome to MY PUP!',
    location: profile.location || '',
    phone: profile.phone || '',
    website_url: profile.website_url || '',
    avatar_url: profile.avatar_url || '',
    verified: profile.verified || false,
    rating: profile.rating || 0,
    total_reviews: profile.total_reviews || 0,
    years_experience: profile.years_experience || 0,
    specializations: profile.specializations || [],
    stats: {
      posts: 0,
      followers: 0,
      following: 0
    }
  } : demoProfile;

  const posts = [
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
  ];

  if (!user && !profile) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-medium">@{displayProfile.username}</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>

        {/* Profile Section */}
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.full_name} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg font-semibold">{displayProfile.full_name}</h2>
                {displayProfile.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Verified
                  </Badge>
                )}
              </div>
              
              {displayProfile.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{displayProfile.rating}</span>
                  <span className="text-sm text-gray-600">({displayProfile.total_reviews} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around py-4 border-y">
            <div className="text-center">
              <div className="font-semibold">{displayProfile.stats.posts}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{displayProfile.stats.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{displayProfile.stats.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>

          {/* Bio and Info */}
          <div className="py-4 space-y-3">
            <p className="text-sm">{displayProfile.bio}</p>
            
            {displayProfile.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{displayProfile.location}</span>
              </div>
            )}
            
            {displayProfile.website_url && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Globe className="w-4 h-4" />
                <a href={displayProfile.website_url} target="_blank" rel="noopener noreferrer">
                  {displayProfile.website_url}
                </a>
              </div>
            )}

            {displayProfile.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {displayProfile.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button className="flex-1" onClick={() => navigate('/auth')}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              Follow
            </Button>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post, index) => (
              <div key={index} className="aspect-square">
                <img 
                  src={post} 
                  alt={`Post ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-medium">@{displayProfile.username}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile/edit')}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={displayProfile.avatar_url} alt={displayProfile.full_name} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-lg font-semibold">{displayProfile.full_name}</h2>
              {displayProfile.verified && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Verified
                </Badge>
              )}
            </div>
            
            {displayProfile.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{displayProfile.rating}</span>
                <span className="text-sm text-gray-600">({displayProfile.total_reviews} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around py-4 border-y">
          <div className="text-center">
            <div className="font-semibold">{displayProfile.stats.posts}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{displayProfile.stats.followers}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{displayProfile.stats.following}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
        </div>

        {/* Bio and Info */}
        <div className="py-4 space-y-3">
          <p className="text-sm">{displayProfile.bio}</p>
          
          {displayProfile.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{displayProfile.location}</span>
            </div>
          )}
          
          {displayProfile.website_url && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Globe className="w-4 h-4" />
              <a href={displayProfile.website_url} target="_blank" rel="noopener noreferrer">
                {displayProfile.website_url}
              </a>
            </div>
          )}

          {displayProfile.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayProfile.specializations.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Button for own profile */}
        <div className="mb-6">
          <Button variant="outline" className="w-full" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </Button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post, index) => (
            <div key={index} className="aspect-square">
              <img 
                src={post} 
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleProfileContent;
