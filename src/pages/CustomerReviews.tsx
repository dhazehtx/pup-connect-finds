
import React from 'react';
import Layout from '@/components/Layout';
import { Star, Heart, Quote } from 'lucide-react';

const CustomerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Los Angeles, CA",
      rating: 5,
      review: "Found our perfect Golden Retriever puppy through MY PUP. The breeder was verified and professional, and our Luna is healthy and happy!",
      puppyName: "Luna",
      breed: "Golden Retriever",
      image: "/placeholder-dog.jpg"
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      location: "Austin, TX",
      rating: 5,
      review: "Excellent experience! The platform made it easy to find a reputable breeder. Our German Shepherd Max is amazing and came with all health certifications.",
      puppyName: "Max",
      breed: "German Shepherd",
      image: "/placeholder-dog.jpg"
    },
    {
      id: 3,
      name: "Emily Chen",
      location: "Seattle, WA",
      rating: 5,
      review: "Love this platform! Found our adorable Poodle Bella from a verified breeder. The entire process was smooth and transparent.",
      puppyName: "Bella",
      breed: "Poodle",
      image: "/placeholder-dog.jpg"
    }
  ];

  const stats = [
    { label: "Happy Families", value: "15,000+" },
    { label: "Verified Breeders", value: "2,500+" },
    { label: "Successful Adoptions", value: "12,000+" },
    { label: "Average Rating", value: "4.9/5" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Heart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read what families are saying about their experience finding their perfect puppy companion through MY PUP.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                </div>
                
                <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-50" />
                
                <p className="text-gray-700 mb-4 italic">"{review.review}"</p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="text-sm text-gray-600">{review.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{review.puppyName}</p>
                      <p className="text-xs text-gray-500">{review.breed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Thousands of Happy Families</h2>
            <p className="text-gray-600 mb-6">Start your journey to finding the perfect puppy companion today.</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Browse Puppies
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerReviews;
