
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { MobileResponsive, ResponsiveGrid, MobileOptimizedCard } from '@/components/ui/mobile-responsive';
import SwipeableCard from '@/components/ui/swipeable-card';
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  WifiOff, 
  Camera, 
  Mic, 
  MapPin, 
  Share2,
  Bell,
  Vibrate,
  Sun,
  Moon
} from 'lucide-react';

const MobileDemo = () => {
  const {
    isRecording,
    isVideoOn,
    isDarkMode,
    isSoundOn,
    batteryLevel,
    isOnline,
    location,
    getCurrentLocation,
    toggleVideo,
    toggleRecording,
    triggerVibration,
    shareContent,
    requestNotificationPermission,
    setIsDarkMode,
    setIsSoundOn
  } = useMobileFeatures();

  const { isMobile, windowSize } = useMobileOptimized();

  return (
    <MobileResponsive className="container mx-auto py-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Mobile Features Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Battery className="w-4 h-4" />
                  <span className="text-sm font-medium">{batteryLevel}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Battery</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <p className="text-xs text-muted-foreground">Connection</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-sm font-medium">{windowSize.width}x{windowSize.height}</span>
                </div>
                <p className="text-xs text-muted-foreground">Screen Size</p>
              </div>
              
              <div className="text-center">
                <Badge variant={isMobile ? "default" : "secondary"}>
                  {isMobile ? 'Mobile' : 'Desktop'}
                </Badge>
              </div>
            </div>

            <ResponsiveGrid cols={{ mobile: 2, tablet: 3, desktop: 4 }}>
              <Button
                onClick={toggleVideo}
                variant={isVideoOn ? "default" : "outline"}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isVideoOn ? 'Stop Camera' : 'Start Camera'}
              </Button>

              <Button
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "outline"}
                className="w-full"
              >
                <Mic className="w-4 h-4 mr-2" />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>

              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Location
              </Button>

              <Button
                onClick={shareContent}
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>

              <Button
                onClick={triggerVibration}
                variant="outline"
                className="w-full"
              >
                <Vibrate className="w-4 h-4 mr-2" />
                Vibrate
              </Button>

              <Button
                onClick={() => setIsDarkMode(!isDarkMode)}
                variant={isDarkMode ? "default" : "outline"}
                className="w-full"
              >
                {isDarkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                {isDarkMode ? 'Dark' : 'Light'}
              </Button>

              <Button
                onClick={() => setIsSoundOn(!isSoundOn)}
                variant={isSoundOn ? "default" : "outline"}
                className="w-full"
              >
                🔊
                {isSoundOn ? 'Mute' : 'Unmute'}
              </Button>
            </ResponsiveGrid>

            {location && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Current Location:</p>
                <p className="text-xs text-muted-foreground">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Swipeable Cards Demo</h3>
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <SwipeableCard
                key={item}
                onSwipeLeft={() => console.log(`Swiped left on card ${item}`)}
                onSwipeRight={() => console.log(`Swiped right on card ${item}`)}
                onTap={() => console.log(`Tapped card ${item}`)}
              >
                <MobileOptimizedCard>
                  <h4 className="font-medium">Swipeable Card {item}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isMobile ? 'Swipe left or right to interact' : 'Click to interact'}
                  </p>
                </MobileOptimizedCard>
              </SwipeableCard>
            ))}
          </div>
        </div>
      </div>
    </MobileResponsive>
  );
};

export default MobileDemo;
