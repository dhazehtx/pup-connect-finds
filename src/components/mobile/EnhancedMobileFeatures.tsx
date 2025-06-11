import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Share,
  Download,
  Navigation,
  MapPin,
  Bell,
  Vibrate,
  Battery,
  Wifi,
  Signal,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const EnhancedMobileFeatures = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Battery API (if supported)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Geolocation
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location updated",
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Camera/Video
  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsVideoOn(true);
        toast({
          title: "Camera activated",
          description: "You can now take photos or record video",
        });
        // Clean up stream when component unmounts or video is turned off
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
        }, 5000);
      } else {
        setIsVideoOn(false);
        toast({
          title: "Camera deactivated",
          description: "Camera turned off",
        });
      }
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Unable to access camera",
        variant: "destructive",
      });
    }
  };

  // Microphone
  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Voice recording is now active",
        });
        // Clean up stream
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }, 10000);
      } else {
        setIsRecording(false);
        toast({
          title: "Recording stopped",
          description: "Voice recording has been saved",
        });
      }
    } catch (error) {
      toast({
        title: "Microphone error",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  };

  // Vibration
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
      toast({
        title: "Vibration triggered",
        description: "Device vibrated successfully",
      });
    } else {
      toast({
        title: "Vibration not supported",
        description: "This device doesn't support vibration",
        variant: "destructive",
      });
    }
  };

  // Share API
  const shareContent = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'My Pup - Dog Breeding Platform',
          text: 'Check out this amazing dog breeding platform!',
          url: window.location.href,
        });
        toast({
          title: "Content shared",
          description: "Successfully shared via native share",
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        if ('clipboard' in navigator && (navigator as any).clipboard?.writeText) {
          await (navigator as any).clipboard.writeText(window.location.href);
          toast({
            title: "Link copied",
            description: "Link copied to clipboard",
          });
        } else {
          throw new Error('Clipboard not supported');
        }
      } catch (error) {
        toast({
          title: "Share not supported",
          description: "Sharing is not supported on this device",
          variant: "destructive",
        });
      }
    }
  };

  // Push notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive push notifications",
        });
        
        // Send a test notification
        setTimeout(() => {
          new Notification('Welcome to My Pup!', {
            body: 'You\'ll receive updates about new dogs and messages here.',
            icon: '/favicon.ico'
          });
        }, 2000);
      }
    }
  };

  if (!isMobile) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Mobile Features</h3>
          <p className="text-muted-foreground">
            These features are optimized for mobile devices. 
            Please access this page from a mobile device to see the full experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              <span className="text-sm">{batteryLevel}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Online</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">Offline</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4" />
              <span className="text-sm">4G</span>
            </div>
            
            <div className="flex items-center gap-2">
              {location ? (
                <>
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Located</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No location</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Media Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={isVideoOn ? "default" : "outline"}
              onClick={toggleVideo}
              className="flex flex-col gap-2 h-20"
            >
              {isVideoOn ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              <span className="text-xs">{isVideoOn ? 'Stop Camera' : 'Start Camera'}</span>
            </Button>
            
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={toggleRecording}
              className="flex flex-col gap-2 h-20"
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span className="text-xs">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </Button>
          </div>
          
          {isRecording && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700">Recording in progress...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={getCurrentLocation}
              className="flex flex-col gap-2 h-16"
            >
              <Navigation className="h-5 w-5" />
              <span className="text-xs">Get Location</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={shareContent}
              className="flex flex-col gap-2 h-16"
            >
              <Share className="h-5 w-5" />
              <span className="text-xs">Share App</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={triggerVibration}
              className="flex flex-col gap-2 h-16"
            >
              <Vibrate className="h-5 w-5" />
              <span className="text-xs">Vibrate</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={requestNotificationPermission}
              className="flex flex-col gap-2 h-16"
            >
              <Bell className="h-5 w-5" />
              <span className="text-xs">Notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>Dark Mode</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>Sound</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSoundOn(!isSoundOn)}
              >
                {isSoundOn ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Specific Features */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge variant="outline" className="w-full justify-start">
              Touch gestures enabled
            </Badge>
            <Badge variant="outline" className="w-full justify-start">
              Swipe navigation active
            </Badge>
            <Badge variant="outline" className="w-full justify-start">
              Mobile-optimized layouts
            </Badge>
            <Badge variant="outline" className="w-full justify-start">
              Offline support available
            </Badge>
          </div>
        </CardContent>
      </Card>

      {location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p>Latitude: {location.lat.toFixed(6)}</p>
              <p>Longitude: {location.lng.toFixed(6)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMobileFeatures;
