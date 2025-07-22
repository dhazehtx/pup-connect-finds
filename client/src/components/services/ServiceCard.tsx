
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  Scissors,
  Heart,
  GraduationCap,
  User
} from 'lucide-react';

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

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
  onViewDetails: (serviceId: string) => void;
}

const ServiceCard = ({ service, onBook, onViewDetails }: ServiceCardProps) => {
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'grooming': return Scissors;
      case 'sitting': return Heart;
      case 'walking': return User;
      case 'training': return GraduationCap;
      default: return Heart;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'grooming': return 'bg-blue-500';
      case 'sitting': return 'bg-pink-500';
      case 'walking': return 'bg-green-500';
      case 'training': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const ServiceIcon = getServiceIcon(service.service_type);
  const serviceColor = getServiceColor(service.service_type);

  const formatPrice = () => {
    const basePrice = `$${service.price}`;
    switch (service.price_type) {
      case 'hourly': return `${basePrice}/hr`;
      case 'per_session': return `${basePrice}/session`;
      default: return basePrice;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      {service.featured_until && new Date(service.featured_until) > new Date() && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-yellow-500 text-white">Featured</Badge>
        </div>
      )}
      
      <div className="relative">
        <img 
          src={service.images[0] || '/placeholder.svg'} 
          alt={service.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={`${serviceColor} text-white`}>
            <ServiceIcon className="w-3 h-3 mr-1" />
            {service.service_type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">{service.title}</h3>
          <div className="text-xl font-bold text-primary">
            {formatPrice()}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={service.provider_avatar || '/placeholder.svg'} 
            alt={service.provider_name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-700">{service.provider_name}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{service.experience_years}y exp</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          {service.location}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{service.rating}</span>
            <span className="text-gray-600">({service.review_count})</span>
          </div>
          {service.certifications.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Certified
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onBook(service.id)} className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Book Now
          </Button>
          <Button variant="outline" onClick={() => onViewDetails(service.id)}>
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
