
import React, { useState } from 'react';
import { Facebook, Instagram, Link, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SocialMediaConnections = () => {
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isConnectedFacebook, setIsConnectedFacebook] = useState(false);
  const [isConnectedInstagram, setIsConnectedInstagram] = useState(false);
  const { toast } = useToast();

  const handleConnectFacebook = () => {
    if (!facebookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Facebook profile URL",
        variant: "destructive",
      });
      return;
    }

    // Validate Facebook URL format
    const facebookPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+/;
    if (!facebookPattern.test(facebookUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Facebook profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsConnectedFacebook(true);
    toast({
      title: "Success",
      description: "Facebook profile connected successfully!",
    });
  };

  const handleConnectInstagram = () => {
    if (!instagramUrl) {
      toast({
        title: "Error",
        description: "Please enter your Instagram profile URL",
        variant: "destructive",
      });
      return;
    }

    // Validate Instagram URL format
    const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+/;
    if (!instagramPattern.test(instagramUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Instagram profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsConnectedInstagram(true);
    toast({
      title: "Success",
      description: "Instagram profile connected successfully!",
    });
  };

  const handleDisconnectFacebook = () => {
    setIsConnectedFacebook(false);
    setFacebookUrl('');
    toast({
      title: "Disconnected",
      description: "Facebook profile disconnected",
    });
  };

  const handleDisconnectInstagram = () => {
    setIsConnectedInstagram(false);
    setInstagramUrl('');
    toast({
      title: "Disconnected",
      description: "Instagram profile disconnected",
    });
  };

  return (
    <div className="bg-cloud-white rounded-xl border border-soft-sky overflow-hidden">
      <div className="px-6 py-4 border-b border-soft-sky">
        <h3 className="font-semibold text-deep-navy">Social Media Connections</h3>
        <p className="text-sm text-deep-navy/70 mt-1">Link your social media profiles to your pup account</p>
      </div>
      
      <div className="px-6 py-6 space-y-6">
        {/* Facebook Connection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Facebook size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <Label className="text-deep-navy font-medium">Facebook Profile</Label>
              <p className="text-sm text-deep-navy/70">Connect your Facebook profile</p>
            </div>
            {isConnectedFacebook && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Link size={16} />
                Connected
              </div>
            )}
          </div>
          
          {!isConnectedFacebook ? (
            <div className="space-y-3">
              <Input
                type="url"
                placeholder="https://facebook.com/your-profile"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="bg-cloud-white border-soft-sky"
              />
              <Button 
                onClick={handleConnectFacebook}
                className="bg-royal-blue text-cloud-white hover:bg-deep-navy"
                size="sm"
              >
                Connect Facebook
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  Connected: {facebookUrl}
                </p>
              </div>
              <Button 
                onClick={handleDisconnectFacebook}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <Unlink size={16} className="mr-2" />
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {/* Instagram Connection */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Instagram size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <Label className="text-deep-navy font-medium">Instagram Profile</Label>
              <p className="text-sm text-deep-navy/70">Connect your Instagram profile</p>
            </div>
            {isConnectedInstagram && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Link size={16} />
                Connected
              </div>
            )}
          </div>
          
          {!isConnectedInstagram ? (
            <div className="space-y-3">
              <Input
                type="url"
                placeholder="https://instagram.com/your-username"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="bg-cloud-white border-soft-sky"
              />
              <Button 
                onClick={handleConnectInstagram}
                className="bg-royal-blue text-cloud-white hover:bg-deep-navy"
                size="sm"
              >
                Connect Instagram
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  Connected: {instagramUrl}
                </p>
              </div>
              <Button 
                onClick={handleDisconnectInstagram}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <Unlink size={16} className="mr-2" />
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaConnections;
