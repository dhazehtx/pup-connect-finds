
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Truck, Phone, MessageCircle } from 'lucide-react';

interface DeliveryStatus {
  id: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  currentLocation: string;
  estimatedArrival: string;
  driverName: string;
  driverPhone: string;
  updates: {
    timestamp: string;
    message: string;
    location?: string;
  }[];
}

interface DeliveryTrackerProps {
  orderId: string;
  onClose?: () => void;
}

const DeliveryTracker = ({ orderId, onClose }: DeliveryTrackerProps) => {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock delivery data - replace with real API call
  useEffect(() => {
    const mockDelivery: DeliveryStatus = {
      id: orderId,
      status: 'in_transit',
      currentLocation: 'Highway 101, San Francisco, CA',
      estimatedArrival: '2:30 PM',
      driverName: 'Sarah Johnson',
      driverPhone: '(555) 123-4567',
      updates: [
        {
          timestamp: '10:00 AM',
          message: 'Puppy picked up from breeder',
          location: 'Golden Paws Kennel, San Jose, CA'
        },
        {
          timestamp: '11:30 AM',
          message: 'In transit - making great time!',
          location: 'Highway 101 North'
        },
        {
          timestamp: '1:15 PM',
          message: 'Rest stop for puppy comfort',
          location: 'Pet-friendly rest area'
        }
      ]
    };

    setTimeout(() => {
      setDeliveryStatus(mockDelivery);
      setLoading(false);
    }, 1000);
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pickup Scheduled';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading delivery information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!deliveryStatus) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No delivery information found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Tracking
            </CardTitle>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(deliveryStatus.status)}>
              {getStatusText(deliveryStatus.status)}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              ETA: {deliveryStatus.estimatedArrival}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Current Location:</span>
            <span>{deliveryStatus.currentLocation}</span>
          </div>
        </CardContent>
      </Card>

      {/* Driver Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{deliveryStatus.driverName}</p>
              <p className="text-sm text-gray-600">Professional Pet Transport</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveryStatus.updates.map((update, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b last:border-b-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{update.message}</p>
                    <span className="text-xs text-gray-500">{update.timestamp}</span>
                  </div>
                  {update.location && (
                    <p className="text-xs text-gray-600 mt-1">{update.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracker;
