
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Heart, Share, Flag, Play, FileText, Stethoscope, Award, Truck, Camera } from 'lucide-react';
import SwipeableCard from '@/components/ui/swipeable-card';
import PaymentButton from '@/components/payments/PaymentButton';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { useToast } from '@/hooks/use-toast';

interface PetProfileProps {
  pet: {
    id: number;
    name: string;
    breed: string;
    age: string;
    gender: string;
    color: string;
    price: string;
    description: string;
    images: string[];
    videos?: string[];
    location: string;
    breeder: {
      name: string;
      verified: boolean;
      rating: number;
    };
    healthRecords: {
      vaccinated: boolean;
      microchipped: boolean;
      dewormed: boolean;
      healthCertificate: boolean;
      lastVetVisit: string;
    };
    pedigree?: {
      father: string;
      mother: string;
      registered: boolean;
    };
    traits: string[];
    shippingAvailable: boolean;
    localPickup: boolean;
    availableDate: string;
  };
}

const PetProfile = ({ pet }: PetProfileProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { isMobile } = useMobileOptimized();
  const { toast } = useToast();

  const price = parseFloat(pet.price.replace('$', '').replace(',', ''));

  const HealthBadge = ({ condition, label }: { condition: boolean; label: string }) => (
    <Badge 
      variant={condition ? "default" : "secondary"}
      className={`text-xs ${condition ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
    >
      {condition ? '✓' : '✗'} {label}
    </Badge>
  );

  const handleImageSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentImageIndex < pet.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'right' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: `${pet.name} ${isFavorited ? 'removed from' : 'added to'} your favorites`
    });
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Purchase Successful!",
      description: `Thank you for purchasing ${pet.name}. You'll be contacted by ${pet.breeder.name} soon.`,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Image Gallery with Swipe Support */}
      <div className="relative">
        <SwipeableCard
          onSwipeLeft={() => handleImageSwipe('left')}
          onSwipeRight={() => handleImageSwipe('right')}
          className="aspect-square relative overflow-hidden border-0 rounded-none"
        >
          <img
            src={pet.images[currentImageIndex]}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation Dots */}
          {pet.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {pet.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white/90"
              onClick={handleFavoriteToggle}
            >
              <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
            </Button>
            <Button size="sm" variant="outline" className="bg-white/90">
              <Share size={16} />
            </Button>
            <Button size="sm" variant="outline" className="bg-white/90">
              <Flag size={16} />
            </Button>
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white text-black text-lg font-bold px-3 py-1">
              {pet.price}
            </Badge>
          </div>
        </SwipeableCard>

        {/* Show All Images Button */}
        {pet.images.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllImages(true)}
            className="absolute bottom-4 right-4 bg-white/90"
          >
            <Camera size={14} className="mr-1" />
            View All ({pet.images.length})
          </Button>
        )}

        {/* Swipe indicators for mobile */}
        {isMobile && pet.images.length > 1 && (
          <div className="absolute top-1/2 left-4 right-4 flex justify-between pointer-events-none">
            <div className="text-white/50 text-xs">← Swipe</div>
            <div className="text-white/50 text-xs">Swipe →</div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h1>
          <div className="flex items-center gap-2 mb-3">
            <Badge>{pet.breed}</Badge>
            <Badge variant="outline">{pet.gender}</Badge>
            <Badge variant="outline">{pet.age}</Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {pet.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              Available {pet.availableDate}
            </div>
          </div>

          {/* Delivery Options */}
          <div className="flex gap-2 mb-4">
            {pet.localPickup && (
              <Badge variant="outline" className="text-xs">
                <MapPin size={10} className="mr-1" />
                Local Pickup
              </Badge>
            )}
            {pet.shippingAvailable && (
              <Badge variant="outline" className="text-xs">
                <Truck size={10} className="mr-1" />
                Shipping Available
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="breeder">Breeder</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {pet.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">{pet.description}</p>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Physical Traits</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Color: <span className="text-gray-600">{pet.color}</span></div>
                    <div>Breed: <span className="text-gray-600">{pet.breed}</span></div>
                    <div>Gender: <span className="text-gray-600">{pet.gender}</span></div>
                    <div>Age: <span className="text-gray-600">{pet.age}</span></div>
                  </div>
                </div>

                {pet.traits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Personality Traits</h4>
                    <div className="flex flex-wrap gap-1">
                      {pet.traits.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope size={20} />
                  Health Records
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <HealthBadge condition={pet.healthRecords.vaccinated} label="Vaccinated" />
                  <HealthBadge condition={pet.healthRecords.microchipped} label="Microchipped" />
                  <HealthBadge condition={pet.healthRecords.dewormed} label="Dewormed" />
                  <HealthBadge condition={pet.healthRecords.healthCertificate} label="Health Certificate" />
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Last Vet Visit:</span>
                  <span className="text-gray-600 ml-2">{pet.healthRecords.lastVetVisit}</span>
                </div>

                {pet.pedigree && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                      <Award size={14} />
                      Pedigree Information
                    </h4>
                    <div className="text-sm space-y-1">
                      <div>Father: <span className="text-gray-600">{pet.pedigree.father}</span></div>
                      <div>Mother: <span className="text-gray-600">{pet.pedigree.mother}</span></div>
                      {pet.pedigree.registered && (
                        <Badge variant="outline" className="text-xs mt-2">
                          <Award size={10} className="mr-1" />
                          AKC Registered
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breeder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Breeder Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{pet.breeder.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm text-gray-600">Rating: {pet.breeder.rating}/5</span>
                    </div>
                  </div>
                  {pet.breeder.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award size={10} className="mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full">Contact Breeder</Button>
                  <Button variant="outline" className="w-full">View Profile</Button>
                  <Button variant="outline" className="w-full">
                    <Calendar size={16} className="mr-2" />
                    Schedule Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {pet.images.map((image, index) => (
                <SwipeableCard
                  key={index}
                  onTap={() => setCurrentImageIndex(index)}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${pet.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwipeableCard>
              ))}
            </div>
            
            {pet.videos && pet.videos.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Play size={14} />
                  Videos
                </h4>
                <div className="space-y-2">
                  {pet.videos.map((video, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                      <Play size={24} className="text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">Video {index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Action Buttons with Payment */}
        <div className="sticky bottom-0 bg-white pt-4 border-t space-y-3">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Calendar size={16} className="mr-2" />
              Schedule Meet
            </Button>
            <Button variant="outline" className="flex-1">
              Contact Seller
            </Button>
          </div>
          
          <PaymentButton
            amount={price}
            description={`${pet.name} - ${pet.breed}`}
            onSuccess={handlePaymentSuccess}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
