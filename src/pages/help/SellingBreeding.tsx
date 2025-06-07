
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Camera, FileText, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellingBreeding = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Getting Started as a Breeder',
      icon: <Users className="h-6 w-6" />,
      content: [
        'Research local and state regulations for dog breeding',
        'Obtain necessary licenses and permits',
        'Join professional breeding organizations',
        'Consider getting USDA licensing if required',
        'Set up proper facilities and equipment'
      ]
    },
    {
      title: 'Creating Quality Listings',
      icon: <Camera className="h-6 w-6" />,
      content: [
        'Take high-quality photos in good lighting',
        'Include photos of both parents if possible',
        'Write detailed, honest descriptions',
        'List all health testing and certifications',
        'Provide accurate information about temperament'
      ]
    },
    {
      title: 'Health and Documentation',
      icon: <FileText className="h-6 w-6" />,
      content: [
        'Maintain complete health records for all dogs',
        'Provide vaccination schedules and health certificates',
        'Include genetic testing results when available',
        'Offer health guarantees and contracts',
        'Keep detailed breeding records'
      ]
    },
    {
      title: 'Building Your Reputation',
      icon: <Award className="h-6 w-6" />,
      content: [
        'Get verified through our breeder verification program',
        'Encourage satisfied customers to leave reviews',
        'Maintain professional communication with buyers',
        'Be transparent about your breeding practices',
        'Provide ongoing support to puppy families'
      ]
    },
    {
      title: 'Pricing and Sales',
      icon: <Users className="h-6 w-6" />,
      content: [
        'Research market prices for your breed and area',
        'Consider factors like bloodlines, health testing, and training',
        'Use our secure escrow payment system',
        'Provide clear sales contracts and guarantees',
        'Be prepared to screen potential buyers'
      ]
    }
  ];

  const bestPractices = [
    'Always prioritize the health and welfare of your dogs',
    'Be honest about any health issues or genetic concerns',
    'Socialize puppies from an early age',
    'Keep detailed records of all breeding activities',
    'Screen potential buyers to ensure good homes',
    'Provide lifetime support and advice to puppy families',
    'Continue education about breeding best practices',
    'Maintain clean, safe facilities for your dogs'
  ];

  const requirements = [
    'Dogs must be at least 8 weeks old before sale',
    'Provide complete vaccination records',
    'Include health certificates from licensed veterinarians',
    'Maintain accurate breeding records',
    'Follow all local and state regulations',
    'Provide honest descriptions in all listings',
    'Use secure payment methods only',
    'Respond to buyer inquiries promptly and professionally'
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
            <Users className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Selling & Breeding</h1>
          </div>
          <p className="text-xl opacity-90">Guidelines and best practices for responsible breeding and selling</p>
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

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Award className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-green-700">{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Platform Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-blue-700">{requirement}</span>
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

export default SellingBreeding;
