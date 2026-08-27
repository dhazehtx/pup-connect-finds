import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { authHeaders } from '@/lib/api';
import { format } from 'date-fns';
import { Package, Truck, Clock, CheckCircle, ExternalLink } from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: string;
  qty: number;
  unit_price: string;
  product: {
    id: string;
    name: string;
    image_url: string | null;
    description: string | null;
  };
}

interface Order {
  id: string;
  user_id: string;
  stripe_session_id: string | null;
  amount_total: string;
  status: string;
  is_subscription: boolean;
  shipping_address: string | null;
  tracking_number: string | null;
  carrier: string | null;
  is_shipped: boolean;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const OrderHistory: React.FC = () => {
  const { profile } = useAuth();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['/api/orders/user', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No user ID');
      
      // Must send the Supabase bearer token — the server authenticates via it (not
      // cookies); without it the owner is rejected as non-owner (403).
      const response = await fetch(`/api/orders/user/${profile.id}`, {
        headers: { ...(await authHeaders()) },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!profile?.id,
  });

  const getStatusBadge = (status: string, isShipped: boolean) => {
    if (isShipped) {
      return <Badge className="bg-green-100 text-green-800">Shipped</Badge>;
    }
    
    switch (status) {
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string, isShipped: boolean) => {
    if (isShipped) return <Truck className="w-5 h-5 text-green-600" />;
    
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrackingUrl = (carrier: string | null, trackingNumber: string | null) => {
    if (!carrier || !trackingNumber) return null;
    
    const trackingUrls: { [key: string]: string } = {
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };
    
    return trackingUrls[carrier.toUpperCase()] || null;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order History</h1>
        <p className="text-red-600">Failed to load order history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <Badge variant="outline" className="px-3 py-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              When you make your first purchase, it will appear here.
            </p>
            <Button>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(order.status, order.is_shipped)}
                    Order #{order.id.slice(-8)}
                  </CardTitle>
                  {getStatusBadge(order.status, order.is_shipped)}
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>
                    Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(order.amount_total).toFixed(2)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      {item.product.image_url ? (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        {item.product.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {item.product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">Qty: {item.qty}</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${parseFloat(item.unit_price).toFixed(2)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Information */}
                {(order.shipping_address || order.tracking_number) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping Information
                      </h4>
                      
                      {order.shipping_address && (
                        <div className="text-sm text-gray-600">
                          <strong>Address:</strong> {order.shipping_address}
                        </div>
                      )}
                      
                      {order.tracking_number && (
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-600">
                            <strong>Tracking:</strong> {order.tracking_number}
                            {order.carrier && ` (${order.carrier})`}
                          </div>
                          {order.carrier && getTrackingUrl(order.carrier, order.tracking_number) && (
                            (() => {
                              const trackingUrl = getTrackingUrl(order.carrier, order.tracking_number);
                              if (!trackingUrl) return null;
                              return (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(trackingUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Track Package
                            </Button>
                              );
                            })()
                          )}
                        </div>
                      )}
                      
                      {order.shipped_at && (
                        <div className="text-sm text-gray-600">
                          <strong>Shipped:</strong> {format(new Date(order.shipped_at), 'MMM dd, yyyy h:mm a')}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;