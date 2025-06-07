
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const CustomerReviews = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "San Francisco, CA",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c8c4?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      title: "Found our perfect Golden Retriever!",
      review: "MY PUP made finding our family's new best friend so easy. The verification system gave us confidence in choosing a breeder, and Luna is everything we hoped for and more. The whole process was transparent and professional.",
      breed: "Golden Retriever",
      verified: true
    },
    {
      name: "Mike Chen",
      location: "Austin, TX",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      title: "Excellent breeder network",
      review: "As a first-time dog owner, I was nervous about finding a reputable breeder. MY PUP's verification badges and review system helped me connect with an amazing breeder. Max is healthy, well-socialized, and perfect for our family.",
      breed: "Labrador",
      verified: true
    },
    {
      name: "Emily Rodriguez",
      location: "Miami, FL",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      title: "Trustworthy platform",
      review: "I was skeptical about finding a puppy online, but MY PUP's safety features and escrow payment system made me feel secure. The messaging system allowed me to ask all my questions before meeting Bella. She's been with us for 6 months now and is the joy of our lives!",
      breed: "French Bulldog",
      verified: true
    },
    {
      name: "David Park",
      location: "Seattle, WA",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      title: "Outstanding support team",
      review: "When I had questions during the adoption process, MY PUP's customer support was incredibly helpful. They walked me through everything and even helped coordinate the pickup. Charlie is now a beloved member of our family.",
      breed: "German Shepherd",
      verified: true
    },
    {
      name: "Lisa Thompson",
      location: "Denver, CO",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      title: "Great for families",
      review: "MY PUP helped us find the perfect family dog. The detailed profiles and health information gave us confidence in our choice. Ruby has been amazing with our kids and fits perfectly into our lifestyle.",
      breed: "Golden Doodle",
      verified: true
    },
    {
      name: "James Wilson",
      location: "Phoenix, AZ",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      title: "Professional experience",
      review: "The entire process from browsing to bringing home our puppy was smooth and professional. The breeder was thoroughly vetted, and the health guarantees gave us peace of mind. Highly recommend MY PUP!",
      breed: "Australian Shepherd",
      verified: true
    }
  ];

  const stats = [
    { label: "Happy Families", value: "50,000+" },
    { label: "Verified Breeders", value: "2,500+" },
    { label: "Successful Adoptions", value: "75,000+" },
    { label: "Average Rating", value: "4.9/5" }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          What Our Customers Say
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Real stories from families who found their perfect puppy through MY PUP
        </p>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border-border h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {renderStars(testimonial.rating)}
                </div>
                <Badge variant="outline" className="text-xs">{testimonial.breed}</Badge>
              </div>
              
              <h5 className="font-medium text-foreground">{testimonial.title}</h5>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {testimonial.review}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Join Thousands of Happy Families
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Ready to find your perfect puppy companion? Browse our verified breeders 
              and discover why families trust MY PUP to help them find their new best friend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
                Browse Puppies
              </button>
              <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted font-medium">
                Learn More
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerReviews;
