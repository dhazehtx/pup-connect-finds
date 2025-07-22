
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useMobileFeatures = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
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
        
        setTimeout(() => {
          new Notification('Welcome to My Pup!', {
            body: 'You\'ll receive updates about new dogs and messages here.',
            icon: '/favicon.ico'
          });
        }, 2000);
      }
    }
  };

  return {
    // State
    isRecording,
    isVideoOn,
    isDarkMode,
    isSoundOn,
    batteryLevel,
    isOnline,
    location,
    
    // Actions
    getCurrentLocation,
    toggleVideo,
    toggleRecording,
    triggerVibration,
    shareContent,
    requestNotificationPermission,
    setIsDarkMode,
    setIsSoundOn
  };
};
