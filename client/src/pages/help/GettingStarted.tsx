
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GettingStarted = () => {
  const navigate = useNavigate();

  const articles = [
    {
      title: 'Creating Your MY PUP Account',
      content: 'Learn how to sign up and set up your profile on MY PUP.',
      steps: [
        'Click "Sign Up" in the top navigation',
        'Enter your email and create a secure password',
        'Verify your email address',
        'Complete your profile information',
        'Upload a profile photo (optional but recommended)'
      ]
    },
    {
      title: 'Navigating the Platform',
      content: 'Get familiar with the main features and layout of MY PUP.',
      steps: [
        'Use the search bar to find specific breeds or locations',
        'Browse listings using filters for age, price, and location',
        'Save your favorite listings with the heart icon',
        'Access your messages through the navigation menu',
        'Update your profile and settings anytime'
      ]
    },
    {
      title: 'Setting Up Your Profile',
      content: 'Make a great first impression with a complete profile.',
      steps: [
        'Add a clear profile photo',
        'Write a brief bio about yourself',
        'Specify your location and preferences',
        'Add contact information for easy communication',
        'Set your notification preferences'
      ]
    },
    {
      title: 'Understanding Verification',
      content: 'Learn about our verification system and its benefits.',
      steps: [
        'Understand the difference between verified and unverified users',
        'Learn what documents are needed for verification',
        'Discover the benefits of being verified',
        'Know how the verification process works',
        'Understand verification badges and what they mean'
      ]
    }
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
            <Book className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Getting Started</h1>
          </div>
          <p className="text-xl opacity-90">Everything you need to know to begin your MY PUP journey</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {articles.map((article, index) => (
            <Card key={index} className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy">{article.title}</CardTitle>
                <p className="text-deep-navy/70">{article.content}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {article.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-deep-navy/70">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
