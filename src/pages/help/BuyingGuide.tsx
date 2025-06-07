
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BuyingGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Before You Start Looking',
      icon: <Heart className="h-6 w-6" />,
      content: [
        'Research different breeds to find the right match for your lifestyle',
        'Consider your living space, activity level, and time availability',
        'Set a realistic budget including purchase price and ongoing costs',
        'Prepare your home with necessary supplies and puppy-proofing',
        'Find a local veterinarian and schedule a new puppy visit'
      ]
    },
    {
      title: 'Finding the Right Puppy',
      icon: <Shield className="h-6 w-6" />,
      content: [
        'Use our advanced search filters to narrow down your options',
        'Look for verified breeders with good reviews and ratings',
        'Read listings carefully and check all provided information',
        'Save your favorites and compare different options',
        'Ask questions through our messaging system'
      ]
    },
    {
      title: 'Contacting Breeders',
      icon: <Heart className="h-6 w-6" />,
      content: [
        'Send polite, specific messages about your interest',
        'Ask about health testing, vaccinations, and socialization',
        'Request to see health certificates and parent information',
        'Schedule a video call or in-person visit to meet the puppy',
        'Ask about the breeder\'s experience and breeding practices'
      ]
    },
    {
      title: 'Meeting Your Puppy',
      icon: <Shield className="h-6 w-6" />,
      content: [
        'Always meet the puppy in person before purchasing',
        'Observe the puppy\'s temperament and energy level',
        'Check for signs of good health and proper care',
        'Meet the mother and ask about the father if possible',
        'Take your time and don\'t feel pressured to decide immediately'
      ]
    },
    {
      title: 'Making the Purchase',
      icon: <Heart className="h-6 w-6" />,
      content: [
        'Use our secure escrow payment system for protection',
        'Get all agreements and health guarantees in writing',
        'Ensure all vaccinations and health records are provided',
        'Verify registration papers if purchasing a purebred',
        'Schedule your first vet visit within 48-72 hours'
      ]
    }
  ];

  const redFlags = [
    'Sellers who won\'t let you meet the puppy or see where it was raised',
    'Prices that seem too good to be true',
    'Requests for payment via wire transfer, gift cards, or cryptocurrency',
    'Multiple breeds available from the same seller at the same time',
    'Puppies under 8 weeks old being offered for sale',
    'No health certificates or vaccination records available',
    'Pressure to buy immediately without time to think',
    'Unwillingness to answer questions about breeding practices'
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/help-center')}
            className="text-cloud-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Help Center
          </Button>
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Buying a Puppy</h1>
          </div>
          <p className="text-xl opacity-90">Your complete guide to finding and purchasing the perfect companion</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy flex items-center">
                  <div className="text-royal-blue mr-3">{section.icon}</div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-royal-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-navy/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Red Flags to Watch Out For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {redFlags.map((flag, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <span className="text-red-700">{flag}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyingGuide;
