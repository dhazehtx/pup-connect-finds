
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { DeviceStatus } from './DeviceStatus';
import { MediaControls } from './MediaControls';
import { QuickActions } from './QuickActions';
import { MobileSettings } from './MobileSettings';
import { MobileFeaturesInfo } from './MobileFeaturesInfo';
import { LocationDisplay } from './LocationDisplay';

const EnhancedMobileFeatures = () => {
  const isMobile = useIsMobile();
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
      <DeviceStatus
        batteryLevel={batteryLevel}
        isOnline={isOnline}
        location={location}
      />

      <MediaControls
        isVideoOn={isVideoOn}
        isRecording={isRecording}
        onToggleVideo={toggleVideo}
        onToggleRecording={toggleRecording}
      />

      <QuickActions
        onGetLocation={getCurrentLocation}
        onShare={shareContent}
        onVibrate={triggerVibration}
        onRequestNotifications={requestNotificationPermission}
      />

      <MobileSettings
        isDarkMode={isDarkMode}
        isSoundOn={isSoundOn}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onToggleSound={() => setIsSoundOn(!isSoundOn)}
      />

      <MobileFeaturesInfo />

      <LocationDisplay location={location} />
    </div>
  );
};

export default EnhancedMobileFeatures;
