
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ServiceWorkerManager = () => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNewVersionAvailable(true);
                  toast({
                    title: "Update Available",
                    description: "A new version of the app is ready to install",
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [toast]);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setNewVersionAvailable(false);
      window.location.reload();
    }
  };

  if (!newVersionAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Update Available</p>
              <p className="text-sm text-muted-foreground">
                A new version is ready
              </p>
            </div>
            <Button onClick={handleUpdate} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceWorkerManager;
