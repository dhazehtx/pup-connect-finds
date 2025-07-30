import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('mypup-cookie-consent');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('mypup-cookie-consent', JSON.stringify({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('mypup-cookie-consent', JSON.stringify({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleCustomSettings = () => {
    setShowSettings(true);
  };

  const handleSaveSettings = (settings: any) => {
    localStorage.setItem('mypup-cookie-consent', JSON.stringify({
      ...settings,
      essential: true, // Essential cookies are always required
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Cookie Consent
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies. You can manage your preferences 
                    or learn more in our{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={handleAcceptAll}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Accept All
                    </Button>
                    <Button 
                      onClick={handleAcceptEssential}
                      variant="outline"
                      size="sm"
                    >
                      Essential Only
                    </Button>
                    <Button 
                      onClick={handleCustomSettings}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Customize
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBanner(false)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <CookieSettingsModal 
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

interface CookieSettingsModalProps {
  onSave: (settings: any) => void;
  onClose: () => void;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ onSave, onClose }) => {
  const [settings, setSettings] = useState({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  const handleToggle = (key: string) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const cookieTypes = [
    {
      key: 'essential',
      title: 'Essential Cookies',
      description: 'Required for basic functionality like authentication and security.',
      required: true
    },
    {
      key: 'functional',
      title: 'Functional Cookies',
      description: 'Remember your preferences and settings for a better experience.',
      required: false
    },
    {
      key: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how you use our site to improve performance.',
      required: false
    },
    {
      key: 'marketing',
      title: 'Marketing Cookies',
      description: 'Provide personalized content and relevant recommendations.',
      required: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cookie Settings</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4 mb-6">
            {cookieTypes.map((type) => (
              <div key={type.key} className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{type.title}</h4>
                    {type.required && (
                      <span className="text-xs text-gray-500">(Required)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {type.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[type.key as keyof typeof settings]}
                    onChange={() => handleToggle(type.key)}
                    disabled={type.required}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onSave(settings)}
              className="flex-1"
            >
              Save Settings
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsentBanner;