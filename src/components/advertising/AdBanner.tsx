
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
  advertiser_name: string;
  click_url: string;
  target_page: string;
}

interface AdBannerProps {
  targetPage: 'home' | 'explore' | 'marketplace';
  className?: string;
  format?: 'banner' | 'card' | 'sponsored';
}

const AdBanner = ({ targetPage, className = "", format = "banner" }: AdBannerProps) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, [targetPage]);

  const loadAd = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('target_page', targetPage)
        .eq('status', 'active')
        .gte('ends_at', new Date().toISOString())
        .lte('starts_at', new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAd(data);
    } catch (error) {
      console.error('Error loading ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async () => {
    if (!ad) return;
    
    try {
      await supabase.from('ad_impressions').insert({
        ad_id: ad.id,
        page_url: window.location.pathname,
        clicked: false,
        ip_address: null, // Will be handled by edge function if needed
        user_agent: navigator.userAgent
      });

      // Update total impressions
      await supabase
        .from('advertisements')
        .update({ total_impressions: supabase.sql`total_impressions + 1` })
        .eq('id', ad.id);
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleClick = async () => {
    if (!ad?.click_url) return;

    try {
      // Track click
      await supabase.from('ad_impressions').insert({
        ad_id: ad.id,
        page_url: window.location.pathname,
        clicked: true,
        ip_address: null,
        user_agent: navigator.userAgent
      });

      // Update total clicks
      await supabase
        .from('advertisements')
        .update({ total_clicks: supabase.sql`total_clicks + 1` })
        .eq('id', ad.id);

      window.open(ad.click_url, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  useEffect(() => {
    if (ad) {
      trackImpression();
    }
  }, [ad]);

  if (loading || !ad) return null;

  if (format === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-lg cursor-pointer ${className}`} onClick={handleClick}>
        <div className="relative">
          {ad.video_url ? (
            <video
              src={ad.video_url}
              autoPlay
              muted
              loop
              className="w-full h-32 object-cover"
            />
          ) : (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <Badge className="bg-orange-500 text-white border-0 mb-2">
              Sponsored
            </Badge>
            <h3 className="font-semibold text-lg">{ad.title}</h3>
            <p className="text-sm opacity-90">{ad.description}</p>
          </div>
          <ExternalLink className="absolute top-4 right-4 w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  if (format === 'card') {
    return (
      <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${className}`} onClick={handleClick}>
        <div className="relative">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0">
            Sponsored
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">by {ad.advertiser_name}</span>
            <ExternalLink className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </Card>
    );
  }

  // Sponsored listing format
  return (
    <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 cursor-pointer ${className}`} onClick={handleClick}>
      <div className="flex items-start space-x-4">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Badge className="bg-orange-500 text-white border-0 text-xs mb-1">
              Sponsored
            </Badge>
            <ExternalLink className="w-4 h-4 text-orange-600" />
          </div>
          <h4 className="font-medium text-gray-900">{ad.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
