
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Scissors, 
  Heart, 
  GraduationCap, 
  MapPin, 
  Star, 
  Plus,
  Search,
  Filter,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ServiceCard from '@/components/services/ServiceCard';
import ServiceBookingDialog from '@/components/services/ServiceBookingDialog';
import CreateServiceDialog from '@/components/services/CreateServiceDialog';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: 'hourly' | 'fixed' | 'per_session';
  service_type: 'grooming' | 'sitting' | 'walking' | 'training' | 'boarding';
  location: string;
  user_id: string;
  provider_name: string;
  provider_avatar?: string;
  rating: number;
  review_count: number;
  experience_years: number;
  certifications: string[];
  images: string[];
  availability: Record<string, any>;
  featured_until?: string;
  created_at: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const serviceCategories = [
    { id: 'grooming', name: 'Grooming', icon: Scissors, color: 'blue' },
    { id: 'sitting', name: 'Dog Sitting', icon: Heart, color: 'pink' },
    { id: 'training', name: 'Training', icon: GraduationCap, color: 'green' },
    { id: 'walking', name: 'Dog Walking', icon: User, color: 'orange' },
    { id: 'boarding', name: 'Boarding', icon: MapPin, color: 'purple' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory, searchQuery]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles!services_user_id_fkey (
            full_name,
            avatar_url,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const servicesWithProvider = data?.map(service => ({
        ...service,
        provider_name: service.profiles?.full_name || 'Service Provider',
        provider_avatar: service.profiles?.avatar_url,
        rating: service.profiles?.rating || 4.5,
        review_count: service.profiles?.total_reviews || 0,
        images: service.images || ['/placeholder.svg'],
        certifications: service.certifications || [],
        availability: service.availability || {}
      })) || [];

      setServices(servicesWithProvider);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.service_type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query) ||
        service.provider_name.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleBookService = (serviceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a service",
        variant: "destructive"
      });
      return;
    }

    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      setShowBookingDialog(true);
    }
  };

  const handleViewDetails = (serviceId: string) => {
    // TODO: Implement service details view
    toast({
      title: "Coming Soon",
      description: "Service details view will be available soon",
    });
  };

  const handleBookingSuccess = () => {
    toast({
      title: "Booking Successful",
      description: "Your service booking has been confirmed",
    });
  };

  const handleServiceCreated = () => {
    fetchServices();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

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
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services, providers, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {user && (
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              List Your Service
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="mb-2"
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
                className="flex items-center gap-2 mb-2"
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all' 
                ? "Try adjusting your search filters" 
                : "Be the first to list a service!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={handleBookService}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

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
                onClick={() => user ? setShowCreateDialog(true) : toast({
                  title: "Sign In Required",
                  description: "Please sign in to start earning",
                  variant: "destructive"
                })}
                className="bg-purple-800 hover:bg-purple-900 text-white"
              >
                Start Earning Today
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ServiceBookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        service={selectedService}
        onBookingSuccess={handleBookingSuccess}
      />

      <CreateServiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onServiceCreated={handleServiceCreated}
      />
    </div>
  );
};

export default Services;
