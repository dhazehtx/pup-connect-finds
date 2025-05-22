
import React, { useState } from 'react';
import { MapPin, Filter, Star, Navigation } from 'lucide-react';

const Explore = () => {
  const [selectedBreed, setSelectedBreed] = useState('');
  const [radius, setRadius] = useState(50);

  const breeds = [
    'Golden Retriever', 'German Shepherd', 'Labrador', 'French Bulldog', 
    'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Siberian Husky', 'Dachshund'
  ];

  const nearbyBreeders = [
    {
      id: 1,
      name: "Sunset Retrievers",
      distance: "2.3 miles",
      breed: "Golden Retriever",
      rating: 4.9,
      price: "$2,800",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop",
      available: 3
    },
    {
      id: 2,
      name: "Metro German Shepherds",
      distance: "5.7 miles",
      breed: "German Shepherd",
      rating: 4.7,
      price: "$3,500",
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=200&fit=crop",
      available: 2
    },
    {
      id: 3,
      name: "Happy Tails Labradors",
      distance: "8.1 miles",
      breed: "Labrador",
      rating: 4.8,
      price: "$2,400",
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop",
      available: 5
    },
    {
      id: 4,
      name: "Elite French Bulldogs",
      distance: "12.4 miles",
      breed: "French Bulldog",
      rating: 4.6,
      price: "$4,200",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop",
      available: 1
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Location Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={20} className="text-amber-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Explore Nearby</h1>
            <p className="text-sm text-gray-600">San Francisco, CA</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors">
          Change Location
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-amber-100 space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-800">Filters</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
            <select 
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Breeds</option>
              {breeds.map((breed) => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance: {radius} miles
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl h-64 flex items-center justify-center border border-amber-200">
        <div className="text-center space-y-2">
          <MapPin size={48} className="text-amber-600 mx-auto" />
          <p className="text-gray-600 font-medium">Interactive Map Coming Soon</p>
          <p className="text-sm text-gray-500">View breeders on an interactive map</p>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Nearby Breeders</h2>
          <span className="text-sm text-gray-600">{nearbyBreeders.length} results</span>
        </div>
        
        <div className="grid gap-4">
          {nearbyBreeders.map((breeder) => (
            <div key={breeder.id} className="bg-white rounded-xl p-4 border border-amber-100 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <img 
                  src={breeder.image} 
                  alt={breeder.breed}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{breeder.name}</h3>
                      <p className="text-sm text-amber-600 font-medium">{breeder.breed}</p>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{breeder.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {breeder.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-current" />
                      {breeder.rating}
                    </div>
                    <span>{breeder.available} available</span>
                  </div>
                  
                  <button className="w-full bg-amber-500 text-white py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
