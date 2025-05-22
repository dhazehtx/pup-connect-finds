
import React from 'react';
import { Star, MapPin, Heart } from 'lucide-react';

const Home = () => {
  const featuredBreeders = [
    {
      id: 1,
      name: "Golden Paws Kennel",
      location: "San Francisco, CA",
      rating: 4.9,
      reviews: 127,
      specialties: ["Golden Retriever", "Labrador"],
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      verified: true
    },
    {
      id: 2,
      name: "Noble German Shepherds",
      location: "Austin, TX",
      rating: 4.8,
      reviews: 89,
      specialties: ["German Shepherd"],
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
      verified: true
    }
  ];

  const recentPuppies = [
    {
      id: 1,
      breed: "Golden Retriever",
      age: "8 weeks",
      price: "$2,500",
      image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
      breeder: "Golden Paws Kennel"
    },
    {
      id: 2,
      breed: "German Shepherd",
      age: "10 weeks",
      price: "$3,200",
      image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop",
      breeder: "Noble German Shepherds"
    },
    {
      id: 3,
      breed: "Labrador",
      age: "6 weeks",
      price: "$2,200",
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
      breeder: "Golden Paws Kennel"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Find Your Perfect Puppy</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with verified breeders on MY PUP and find the perfect furry companion for your family.
        </p>
      </div>

      {/* Featured Breeders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Featured Breeders</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featuredBreeders.map((breeder) => (
            <div key={breeder.id} className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={breeder.image} 
                alt={breeder.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {breeder.name}
                      {breeder.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} />
                      {breeder.location}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Heart size={18} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-current" />
                    <span className="text-sm font-medium">{breeder.rating}</span>
                    <span className="text-sm text-gray-500">({breeder.reviews})</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {breeder.specialties.map((breed) => (
                    <span key={breed} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                      {breed}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Puppies */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Available Puppies</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentPuppies.map((puppy) => (
            <div key={puppy.id} className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={puppy.image} 
                  alt={puppy.breed}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm">
                  <Heart size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-800">{puppy.breed}</h3>
                <p className="text-sm text-gray-600">{puppy.age} old</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-600">{puppy.price}</span>
                  <span className="text-xs text-gray-500">{puppy.breeder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
