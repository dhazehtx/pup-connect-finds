import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

interface LegalCheckboxesProps {
  type: 'signup' | 'booking' | 'purchase';
  onValidChange: (isValid: boolean) => void;
  className?: string;
}

export function LegalCheckboxes({ type, onValidChange, className = '' }: LegalCheckboxesProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [bookingAcknowledged, setBookingAcknowledged] = useState(false);

  const updateValidity = (terms: boolean, privacy: boolean, booking?: boolean) => {
    if (type === 'booking') {
      onValidChange(terms && privacy && (booking ?? false));
    } else {
      onValidChange(terms && privacy);
    }
  };

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
    updateValidity(checked, privacyAccepted, bookingAcknowledged);
  };

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacyAccepted(checked);
    updateValidity(termsAccepted, checked, bookingAcknowledged);
  };

  const handleBookingChange = (checked: boolean) => {
    setBookingAcknowledged(checked);
    updateValidity(termsAccepted, privacyAccepted, checked);
  };

  const getContent = () => {
    switch (type) {
      case 'signup':
        return {
          title: 'Legal Agreement',
          items: [
            {
              id: 'terms',
              checked: termsAccepted,
              onChange: handleTermsChange,
              label: (
                <>
                  I agree to the{' '}
                  <Link 
                    to="/legal/terms" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                </>
              ),
            },
            {
              id: 'privacy',
              checked: privacyAccepted,
              onChange: handlePrivacyChange,
              label: (
                <>
                  I acknowledge the{' '}
                  <Link 
                    to="/legal/privacy" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </>
              ),
            },
          ],
        };

      case 'booking':
        return {
          title: 'Booking Agreement',
          items: [
            {
              id: 'terms',
              checked: termsAccepted,
              onChange: handleTermsChange,
              label: (
                <>
                  I agree to the{' '}
                  <Link 
                    to="/legal/terms" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                </>
              ),
            },
            {
              id: 'privacy',
              checked: privacyAccepted,
              onChange: handlePrivacyChange,
              label: (
                <>
                  I acknowledge the{' '}
                  <Link 
                    to="/legal/privacy" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </>
              ),
            },
            {
              id: 'booking',
              checked: bookingAcknowledged,
              onChange: handleBookingChange,
              label: (
                <>
                  I understand I am booking a verified provider and agree to platform policies
                </>
              ),
            },
          ],
        };

      case 'purchase':
        return {
          title: 'Purchase Agreement',
          items: [
            {
              id: 'terms',
              checked: termsAccepted,
              onChange: handleTermsChange,
              label: (
                <>
                  I agree to the{' '}
                  <Link 
                    to="/legal/terms" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                </>
              ),
            },
            {
              id: 'privacy',
              checked: privacyAccepted,
              onChange: handlePrivacyChange,
              label: (
                <>
                  I acknowledge the{' '}
                  <Link 
                    to="/legal/privacy" 
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </>
              ),
            },
          ],
        };

      default:
        return { title: '', items: [] };
    }
  };

  const content = getContent();

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-medium text-sm">{content.title}</h4>
      <div className="space-y-3">
        {content.items.map((item) => (
          <div key={item.id} className="flex items-start space-x-2">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={item.onChange}
              className="mt-0.5"
            />
            <label 
              htmlFor={item.id} 
              className="text-sm leading-relaxed cursor-pointer"
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
      
      {type === 'booking' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Service Protection:</strong> All bookings are protected by our platform policies. 
            Report any issues within 24 hours of service completion.
          </p>
        </div>
      )}
    </div>
  );
}