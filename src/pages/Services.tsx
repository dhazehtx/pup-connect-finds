
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scissors, 
  Heart, 
  GraduationCap, 
  MapPin, 
  Star, 
  Calendar,
  Plus,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const serviceCategories = [
    { id: 'grooming', name: 'Grooming', icon: Scissors, color: 'blue' },
    { id: 'sitting', name: 'Dog Sitting', icon: Heart, color: 'pink' },
    { id: 'training', name: 'Training', icon: GraduationCap, color: 'green' },
    { id: 'walking', name: 'Dog Walking', icon: MapPin, color: 'orange' }
  ];

  const mockServices = [
    {
      id: '1',
      title: 'Professional Dog Grooming',
      provider: 'Sarah\'s Pet Spa',
      category: 'grooming',
      price: 65,
      rating: 4.9,
      reviews: 156,
      location: 'Downtown, Seattle',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
      verified: true
    },
    {
      id: '2',
      title: 'Dog Walking & Exercise',
      provider: 'Mike\'s Dog Adventures',
      category: 'walking',
      price: 25,
      rating: 4.8,
      reviews: 89,
      location: 'Capitol Hill, Seattle',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop',
      verified: true
    },
    {
      id: '3',
      title: 'Puppy Training Program',
      provider: 'Elite Dog Training',
      category: 'training',
      price: 120,
      rating: 5.0,
      reviews: 203,
      location: 'Bellevue, WA',
      image: 'https://images.unsplash.com/photo-1551717758-536e229a5736?w=300&h=200&fit=crop',
      verified: true
    }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? mockServices 
    : mockServices.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">Pet Services Marketplace</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Find trusted professionals for grooming, training, sitting, and more
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All Services
            </Button>
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {user && (
            <Button onClick={() => navigate('/services/create')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              List Your Service
            </Button>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const categoryInfo = serviceCategories.find(cat => cat.id === service.category);
            const Icon = categoryInfo?.icon || Search;
            
            return (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {service.verified && (
                      <Badge className="bg-green-500">Verified</Badge>
                    )}
                    <Badge className={`bg-${categoryInfo?.color}-500`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {categoryInfo?.name}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-2">{service.provider}</p>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-gray-600">({service.reviews})</span>
                    </div>
                    <div className="text-xl font-bold text-primary">
                      ${service.price}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA for Service Providers */}
        <Card className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Become a Service Provider</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals earning on our platform. 
              List your services and connect with pet owners in your area.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="bg-white text-purple-600 hover:bg-gray-100">
                Learn More
              </Button>
              <Button 
                onClick={() => user ? navigate('/services/create') : navigate('/auth')}
                className="bg-purple-800 hover:bg-purple-900 text-white"
              >
                Start Earning Today
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;
