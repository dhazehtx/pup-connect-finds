
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Settings, Grid, Heart, Plus, Shield, Award, Star, Calendar, Phone, Mail, Camera, Video, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');

  const profile = {
    id: userId,
    name: "Golden Paws Kennel",
    username: "@goldenpaws",
    location: "San Francisco, CA",
    bio: "Specializing in Golden Retrievers and Labradors for over 15 years. All our puppies are health tested and come with health guarantees.",
    avatar: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face",
    followers: 1248,
    following: 342,
    posts: 47,
    verified: true,
    isBreeder: true,
    verificationBadges: ['ID Verified', 'Licensed Breeder', 'Vet Reviewed'],
    rating: 4.9,
    totalReviews: 156,
    yearsExperience: 15,
    specializations: ['Golden Retrievers', 'Labradors', 'Puppy Training'],
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'contact@goldenpaws.com',
      website: 'www.goldenpaws.com'
    },
    certifications: [
      'AKC Registered Breeder',
      'USDA Licensed',
      'Veterinary Health Certificate'
    ]
  };

  const highlights = [
    {
      id: 'new',
      title: 'New',
      cover: '',
      isNew: true
    },
    {
      id: 1,
      title: 'Puppies',
      cover: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      title: 'Training',
      cover: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      title: 'Health',
      cover: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      title: 'Reviews',
      cover: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop'
    }
  ];

  const posts = [
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
  ];

  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Amazing experience! Our Golden Retriever puppy is healthy, well-socialized, and came with all health records. Highly recommend!"
    },
    {
      id: 2,
      author: "Mike D.",
      rating: 5,
      date: "1 month ago",
      text: "Professional breeder with excellent facilities. The puppy training they provide is exceptional."
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <div className="p-4 bg-background">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-background">
          <h1 className="text-xl font-medium text-foreground">{profile.username}</h1>
          <Settings size={24} className="text-muted-foreground" />
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4 bg-background">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <CheckCircle size={16} className="text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex gap-6 text-center">
              <div>
                <div className="font-semibold text-foreground">{profile.posts}</div>
                <div className="text-muted-foreground text-sm">Posts</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{profile.followers.toLocaleString()}</div>
                <div className="text-muted-foreground text-sm">Followers</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{profile.following}</div>
                <div className="text-muted-foreground text-sm">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold text-sm text-foreground">{profile.name}</h2>
            {profile.isBreeder && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                <Award size={10} className="mr-1" />
                Verified Breeder
              </Badge>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-primary fill-primary" />
              <span className="text-sm font-medium text-foreground">{profile.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({profile.totalReviews} reviews)</span>
          </div>

          <p className="text-sm text-muted-foreground mb-2">{profile.bio}</p>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin size={12} />
            {profile.location}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Calendar size={12} />
            {profile.yearsExperience} years experience
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.verificationBadges.map((badge, index) => (
              <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground bg-muted/30">
                <Shield size={10} className="mr-1" />
                {badge}
              </Badge>
            ))}
          </div>

          {/* Specializations */}
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1 text-foreground">Specializes in:</h4>
            <div className="flex flex-wrap gap-1">
              {profile.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-soft-sky text-deep-navy">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Phone size={16} className="mr-2" />
            Contact
          </Button>
          <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-muted">
            <Heart size={16} className="mr-2" />
            Follow
          </Button>
        </div>

        {/* Highlights Section */}
        <div className="mb-6 bg-background">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="flex flex-col items-center space-y-1 min-w-0">
                <div className="relative w-16 h-16">
                  {highlight.isNew ? (
                    <div className="w-16 h-16 rounded-full border-2 border-border border-dashed flex items-center justify-center bg-muted/50">
                      <Plus size={24} className="text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-border overflow-hidden">
                      <img
                        src={highlight.cover}
                        alt={highlight.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground text-center w-16 truncate">
                  {highlight.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t border-border">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="posts" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Grid size={16} />
              <span className="text-xs font-medium">POSTS</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Star size={16} />
              <span className="text-xs font-medium">REVIEWS</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Heart size={16} />
              <span className="text-xs font-medium">SAVED</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            <div className="grid grid-cols-3 gap-1 p-1">
              {posts.map((post, index) => (
                <div key={index} className="aspect-square relative group">
                  <img
                    src={post}
                    alt="Post"
                    className="w-full h-full object-cover rounded-sm"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-sm" />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-0">
            <div className="space-y-4 p-4">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-card-foreground">{review.author}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={12} className="text-primary fill-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            <div className="p-4 text-center text-muted-foreground">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p>No saved posts yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
