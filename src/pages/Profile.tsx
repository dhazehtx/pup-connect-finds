
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Star, MapPin, Calendar, Phone, Mail, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { useDogListings } from '@/hooks/useDogListings';

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user, profile } = useAuth();
  const { reviews, fetchReviews, getAverageRating } = useReviews();
  const { fetchUserListings } = useDogListings();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!targetUserId) return;

      try {
        setLoading(true);
        
        // Load profile data
        if (isOwnProfile) {
          setProfileData(profile);
        } else {
          // Fetch other user's profile
          // This would require a public profile endpoint
        }

        // Load reviews and listings
        await fetchReviews(targetUserId);
        const listings = await fetchUserListings(targetUserId);
        setUserListings(listings);
        
        // Get average rating
        const rating = await getAverageRating(targetUserId);
        setAverageRating(rating);
        
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [targetUserId, isOwnProfile, profile]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData && !isOwnProfile) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        <div className="p-4 flex items-center justify-between bg-white border-b">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <div></div>
        </div>
        <div className="p-4 text-center">
          <p className="text-gray-600">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Profile</h1>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile/edit')}>
            <Edit size={16} />
          </Button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profileData?.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {profileData?.full_name?.[0] || profileData?.username?.[0] || 'U'}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">
                    {profileData?.full_name || profileData?.username || 'Anonymous User'}
                  </h2>
                  {profileData?.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  {averageRating.count > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{averageRating.average}</span>
                      <span>({averageRating.count} reviews)</span>
                    </div>
                  )}
                  {profileData?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>

                {profileData?.bio && (
                  <p className="text-gray-700">{profileData.bio}</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t">
              {profileData?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{profileData.email}</span>
                </div>
              )}
              {profileData?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData?.website_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={16} className="text-gray-400" />
                  <a 
                    href={profileData.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  Joined {new Date(profileData?.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">
              Listings ({userListings.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="about">
              About
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings" className="space-y-4">
            {userListings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">No listings yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    {listing.image_url && (
                      <div className="aspect-video w-full bg-gray-100">
                        <img
                          src={listing.image_url}
                          alt={listing.dog_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{listing.dog_name}</h3>
                      <p className="text-gray-600">{listing.breed}</p>
                      <p className="font-bold text-green-600 mt-2">
                        ${listing.price}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">No reviews yet.</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && (
                      <h4 className="font-semibold mb-1">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User Type</h4>
                  <Badge variant="outline" className="capitalize">
                    {profileData?.user_type || 'buyer'}
                  </Badge>
                </div>
                
                {profileData?.years_experience > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-gray-700">
                      {profileData.years_experience} years of experience
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Member Since</h4>
                  <p className="text-gray-700">
                    {new Date(profileData?.created_at || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
