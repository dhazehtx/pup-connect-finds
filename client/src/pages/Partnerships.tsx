
import React, { useState } from 'react';
import { MapPin, Heart, Stethoscope, GraduationCap, Home, Scissors, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Partnerships = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');

  const partnerTypes = [
    {
      id: 'rescues',
      title: 'Animal Rescues & Shelters',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-100 text-red-600',
      description: 'Partner with local rescues to help dogs find loving homes',
      benefits: ['Increased adoption rates', 'Verified health records', 'Background checks', 'Post-adoption support']
    },
    {
      id: 'vets',
      title: 'Veterinary Clinics',
      icon: <Stethoscope className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
      description: 'Connect with trusted veterinarians for health verification',
      benefits: ['Health certifications', 'Vaccination records', 'Breeder recommendations', 'Emergency care network']
    },
    {
      id: 'training',
      title: 'Dog Training Facilities',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      description: 'Partner with professional trainers for puppy preparation',
      benefits: ['Puppy classes', 'Behavioral assessments', 'Training resources', 'Owner education']
    },
    {
      id: 'boarding',
      title: 'Pet Care Services',
      icon: <Home className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      description: 'Connect with boarding, daycare, and grooming services',
      benefits: ['Temporary care', 'Grooming services', 'Socialization', 'Health monitoring']
    }
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'california', name: 'California' },
    { id: 'texas', name: 'Texas' },
    { id: 'florida', name: 'Florida' },
    { id: 'newyork', name: 'New York' },
    { id: 'chicago', name: 'Chicago' }
  ];

  const featuredPartners = [
    {
      name: 'Golden State Animal Rescue',
      type: 'Rescue',
      location: 'San Francisco, CA',
      rating: 4.9,
      verified: true,
      specialties: ['Golden Retrievers', 'Large Breeds']
    },
    {
      name: 'Austin Veterinary Center',
      type: 'Veterinary',
      location: 'Austin, TX',
      rating: 4.8,
      verified: true,
      specialties: ['Health Checks', 'Vaccinations']
    },
    {
      name: 'Puppy Training Academy',
      type: 'Training',
      location: 'Miami, FL',
      rating: 4.7,
      verified: true,
      specialties: ['Basic Training', 'Socialization']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Network</h1>
        <p className="text-gray-600">Building a trusted community of pet care professionals</p>
      </div>

      {/* Geographic Focus */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Geographic Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            We're expanding our trusted partner network across key metropolitan areas to ensure quality local support.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {locations.map((location) => (
              <Button
                key={location.id}
                variant={selectedLocation === location.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLocation(location.id)}
              >
                {location.name}
              </Button>
            ))}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              🎯 <strong>Starting Local:</strong> We focus on specific metropolitan areas to build strong partnerships 
              and ensure quality service before expanding to new regions.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="types" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="types">Partner Types</TabsTrigger>
          <TabsTrigger value="featured">Featured Partners</TabsTrigger>
          <TabsTrigger value="apply">Become a Partner</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${type.color}`}>
                      {type.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {type.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPartners.map((partner, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {partner.name}
                        {partner.verified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{partner.location}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{partner.rating}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-3">{partner.type}</Badge>
                  <div className="space-y-1">
                    {partner.specialties.map((specialty, idx) => (
                      <span key={idx} className="inline-block text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Become a Trusted Partner</CardTitle>
              <p className="text-gray-600">Join our network of verified pet care professionals</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input placeholder="Your business name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Partner Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Select type...</option>
                    <option>Animal Rescue/Shelter</option>
                    <option>Veterinary Clinic</option>
                    <option>Training Facility</option>
                    <option>Pet Care Service</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="City, State" />
              </div>
              <div>
                <label className="text-sm font-medium">Tell us about your services</label>
                <textarea 
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Describe your organization and how you'd like to help..."
                />
              </div>
              <Button className="w-full">Submit Partnership Application</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Partnerships;
