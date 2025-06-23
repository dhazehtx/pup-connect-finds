
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreateServiceDialog from './CreateServiceDialog';

interface ServiceProvider {
  id: string;
  business_name: string;
  service_types: string[];
  description: string;
  location: string;
  pricing: any;
  rating: number;
  total_bookings: number;
  verified: boolean;
  user_id: string;
}

const ServicesMarketplace = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showCreateService, setShowCreateService] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Services');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceFilters = [
    'All Services',
    'Grooming', 
    'Dog Sitting',
    'Training',
    'Dog Walking',
    'Boarding'
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All Services' || provider.service_types.includes(activeFilter.toLowerCase().replace(' ', ''));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Pet Services Marketplace</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Find trusted professionals for grooming, training, sitting, and more
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search services, providers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4 text-lg border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Service Filter Tags - Updated to Royal Blue */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {serviceFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-6 py-2 transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredProviders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-8">Be the first to list a service!</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-blue-200">
                <CardContent className="p-6">
                  <div className="h-4 bg-blue-100 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-blue-100 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-blue-100 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Become a Service Provider Banner */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 overflow-hidden">
            <CardContent className="py-12 px-8 text-center text-white relative">
              <h2 className="text-3xl font-bold mb-4">Become a Service Provider</h2>
              <Button 
                onClick={() => setShowCreateService(true)}
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                Get Started
              </Button>
              
              {/* Mobile Device Mockup */}
              <div className="absolute right-8 bottom-4 hidden lg:block">
                <div className="w-16 h-20 bg-white/20 rounded-lg border border-white/30"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Service Dialog */}
      <CreateServiceDialog
        isOpen={showCreateService}
        onOpenChange={setShowCreateService}
        onServiceCreated={loadProviders}
      />
    </div>
  );
};

export default ServicesMarketplace;
