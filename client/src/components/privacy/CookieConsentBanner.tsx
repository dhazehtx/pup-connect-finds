import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cookie, Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('mypup-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const fullConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mypup-cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mypup-cookie-consent', JSON.stringify(consent));
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectNonEssential = () => {
    const minimalConsent = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mypup-cookie-consent', JSON.stringify(minimalConsent));
    setShowBanner(false);
    setShowSettings(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          {!showSettings ? (
            // Main banner
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    We use cookies to improve your experience
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    We use cookies to improve your experience, analyze traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies as described in our{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!border-blue-700"
                >
                  <Shield className="w-4 h-4 !text-white" />
                  Manage Preferences
                </Button>
                <Button
                  size="sm"
                  onClick={rejectNonEssential}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!border-blue-700"
                >
                  Reject Non-Essential
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!border-blue-700"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Settings panel
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-blue-600" />
                  Cookie Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Essential Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Functional Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Enable enhanced functionality and personalization.
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('functional', !preferences.functional)}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.functional ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Help us understand how you use our website to improve performance.
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('analytics', !preferences.analytics)}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Marketing Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Used to deliver personalized advertisements and content.
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('marketing', !preferences.marketing)}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  size="sm"
                  onClick={rejectNonEssential}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!border-blue-700"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={acceptSelected}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!border-blue-700"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsentBanner;