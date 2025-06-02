
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MapPin, 
  Star, 
  MessageCircle, 
  Share2, 
  Filter,
  Sparkles,
  Camera,
  PenTool,
  HeadphonesIcon,
  Search,
  Plus,
  Brain,
  Wand2,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

const Home = () => {
  const { user, isGuest } = useAuth();
  const { listings, loading } = useDogListings();
  const [activeTab, setActiveTab] = useState('feed');

  if (loading) {
    return <LoadingSkeleton viewMode="grid" />;
  }

  const featuredListings = listings?.slice(0, 6) || [];

  const aiFeatures = [
    {
      title: "AI Assistant Suite",
      description: "Access all AI tools in one place",
      icon: Brain,
      color: "bg-purple-500",
      link: "/ai-assistant",
      badge: "All Tools"
    },
    {
      title: "Smart Pet Search",
      description: "Find pets using natural language",
      icon: Search,
      color: "bg-blue-500",
      link: "/ai-assistant?tab=search",
      badge: "AI Search"
    },
    {
      title: "Photo Analysis",
      description: "Upload photos for breed & health insights",
      icon: Camera,
      color: "bg-green-500",
      link: "/ai-assistant?tab=image",
      badge: "AI Vision"
    },
    {
      title: "Listing Generator",
      description: "Create compelling descriptions with AI",
      icon: PenTool,
      color: "bg-orange-500",
      link: "/ai-assistant?tab=listing",
      badge: "AI Writer"
    },
    {
      title: "Support Chat",
      description: "24/7 AI assistant for help",
      icon: HeadphonesIcon,
      color: "bg-teal-500",
      link: "/ai-assistant?tab=support",
      badge: "AI Support"
    },
    {
      title: "Create Listing",
      description: "Post your pet with AI assistance",
      icon: Plus,
      color: "bg-pink-500",
      link: "/post",
      badge: "New"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section with AI Features */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Perfect Pup with AI
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Discover, analyze, and connect with the power of artificial intelligence
            </p>
          </div>
          
          {/* AI Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.link}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${feature.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs opacity-80 mb-2">{feature.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/ai-assistant">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Sparkles className="w-5 h-5 mr-2" />
                Try All AI Tools
              </Button>
            </Link>
            <Link to="/ai-assistant?tab=image">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Eye className="w-5 h-5 mr-2" />
                Analyze Pet Photo
              </Button>
            </Link>
            <Link to="/post">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Wand2 className="w-5 h-5 mr-2" />
                Create AI Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="feed">Pet Feed</TabsTrigger>
            <TabsTrigger value="featured">Featured Pets</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Feed Content */}
            <div className="grid gap-6">
              {featuredListings.length > 0 ? (
                featuredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex">
                      {listing.image_url && (
                        <div className="w-32 h-32 flex-shrink-0">
                          <img 
                            src={listing.image_url} 
                            alt={listing.dog_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{listing.dog_name}</h3>
                          <Badge>{listing.breed}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{listing.age} months old</p>
                        <p className="text-2xl font-bold text-green-600 mb-3">${listing.price}</p>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Heart className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState 
                  onClearFilters={() => {}}
                  hasActiveFilters={false}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.length > 0 ? (
                featuredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {listing.image_url && (
                      <div className="aspect-video">
                        <img 
                          src={listing.image_url} 
                          alt={listing.dog_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{listing.dog_name}</h3>
                        <Badge>{listing.breed}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{listing.age} months old</p>
                      <p className="text-xl font-bold text-green-600 mb-3">${listing.price}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Heart className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    onClearFilters={() => {}}
                    hasActiveFilters={false}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
