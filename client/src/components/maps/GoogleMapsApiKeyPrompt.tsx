
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, ExternalLink, Key } from 'lucide-react';

const GoogleMapsApiKeyPrompt = () => {
  const [apiKey, setApiKey] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GOOGLE_MAPS_API_KEY', apiKey.trim());
      window.location.reload();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Google Maps Integration Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            To use real location services and interactive maps, you need a Google Maps API key.
            This replaces the mock map implementation with real functionality.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Enter your Google Maps API Key:
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="font-mono"
          />
          <Button 
            onClick={handleSaveApiKey} 
            disabled={!apiKey.trim()}
            className="w-full"
          >
            Save API Key & Reload
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full"
          >
            {showInstructions ? 'Hide' : 'Show'} Setup Instructions
          </Button>

          {showInstructions && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-3">
              <div>
                <h4 className="font-medium">1. Get Google Maps API Key:</h4>
                <a 
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              
              <div>
                <h4 className="font-medium">2. Enable Required APIs:</h4>
                <ul className="list-disc ml-4">
                  <li>Maps JavaScript API</li>
                  <li>Places API</li>
                  <li>Geocoding API</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">3. For Production:</h4>
                <p>Set <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> in your environment variables.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsApiKeyPrompt;
