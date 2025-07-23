import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, HelpCircle, ChevronDown, MessageCircle, Phone, Mail, BookOpen } from 'lucide-react';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'To create an account, click the "Sign Up" button in the top right corner, enter your email address, create a password, and verify your email address through the confirmation link we send you.'
        },
        {
          question: 'How do I search for puppies?',
          answer: 'Use our search filters on the Explore page to find puppies by breed, location, price range, and age. You can also use our AI-powered search to find puppies that match your specific preferences.'
        },
        {
          question: 'How do I contact a breeder?',
          answer: 'Click the "Contact Breeder" button on any listing to start a conversation. You can send messages directly through our platform to ask questions about the puppy.'
        }
      ]
    },
    {
      category: 'Safety & Trust',
      questions: [
        {
          question: 'How does MY PUP verify breeders?',
          answer: 'We have a comprehensive verification process that includes background checks, facility inspections, and review of breeding practices. Verified breeders display a blue checkmark badge.'
        },
        {
          question: 'What should I look for in a reputable breeder?',
          answer: 'Look for breeders who provide health certificates, allow facility visits, have positive reviews, and are transparent about their breeding practices. Our Trust & Safety guide has more detailed information.'
        },
        {
          question: 'How do I report suspicious activity?',
          answer: 'Use the "Report" button on any listing or profile, or contact our Trust & Safety team directly. We investigate all reports and take appropriate action to maintain platform safety.'
        }
      ]
    },
    {
      category: 'Payments & Transactions',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, and bank transfers through our secure payment system powered by Stripe. All payments are encrypted and protected.'
        },
        {
          question: 'How does the escrow service work?',
          answer: 'Our escrow service holds your payment securely until you receive your puppy and confirm satisfaction. The breeder receives payment only after successful delivery and your approval.'
        },
        {
          question: 'What is your refund policy?',
          answer: 'Refund policies vary by breeder and are clearly stated on each listing. Our escrow service provides additional protection for qualifying transactions. Contact support for specific cases.'
        }
      ]
    },
    {
      category: 'Account Management',
      questions: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to your profile page and click "Edit Profile" to update your information, profile picture, and preferences. Changes are saved automatically.'
        },
        {
          question: 'How do I change my password?',
          answer: 'Go to Profile > Settings > Security to change your password. You\'ll need to enter your current password and create a new one.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'Contact our support team to request account deletion. We\'ll permanently remove your data within 30 days, though some information may be retained for legal compliance.'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      action: 'Start Chat',
      available: 'Available 9 AM - 6 PM PST'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Send Email',
      available: 'Response within 24 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      action: 'Call Now',
      available: 'Mon-Fri 9 AM - 6 PM PST'
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-blue-100 mb-8">
            Find answers to your questions and get the support you need
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
                <p className="text-gray-600">Quick answers to common questions</p>
              </div>

              {filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <Collapsible key={faqIndex}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="font-medium">{faq.question}</span>
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 py-3 text-gray-600 bg-white border-l-4 border-blue-200">
                          {faq.answer}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Support</h2>
                <p className="text-gray-600">Choose the best way to reach our support team</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {contactOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <Card key={index} className="text-center hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <IconComponent className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                        <p className="text-gray-600 mb-4">{option.description}</p>
                        <p className="text-sm text-gray-500 mb-4">{option.available}</p>
                        <Button className="w-full">{option.action}</Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Your Name" />
                    <Input placeholder="Your Email" type="email" />
                  </div>
                  <Input placeholder="Subject" />
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Describe your issue or question..."
                  />
                  <Button className="w-full">Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpCenter;