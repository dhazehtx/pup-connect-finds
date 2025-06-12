
import React, { useState } from 'react';
import { Search, BookOpen, MessageCircle, Phone, Mail, HelpCircle, Users, Shield, CreditCard, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Learn the basics of using MY PUP',
      articles: 5,
      color: 'bg-blue-500'
    },
    {
      id: 'buying-selling',
      title: 'Buying & Selling',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Complete transactions safely',
      articles: 8,
      color: 'bg-green-500'
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: <Settings className="w-6 h-6" />,
      description: 'Manage your profile and preferences',
      articles: 6,
      color: 'bg-purple-500'
    },
    {
      id: 'safety-trust',
      title: 'Safety & Trust',
      icon: <Shield className="w-6 h-6" />,
      description: 'Stay safe on our platform',
      articles: 4,
      color: 'bg-red-500'
    },
    {
      id: 'community',
      title: 'Community Guidelines',
      icon: <Users className="w-6 h-6" />,
      description: 'How to be a good community member',
      articles: 3,
      color: 'bg-yellow-500'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <HelpCircle className="w-6 h-6" />,
      description: 'Fix common issues',
      articles: 7,
      color: 'bg-gray-500'
    }
  ];

  const popularArticles = [
    'How to create your first listing',
    'Verifying your breeder credentials',
    'Safe payment methods',
    'How to contact sellers',
    'Understanding our verification process',
    'Reporting suspicious activity'
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90 mb-8">How can we help you today?</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-lg bg-white text-black"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.id} className="border-royal-blue hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-black">
                    <div className={`${category.color} text-white p-2 rounded-lg`}>
                      {category.icon}
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black/70 mb-2">{category.description}</p>
                  <p className="text-sm text-royal-blue font-medium">{category.articles} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="border-royal-blue hover:bg-royal-blue/5 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <p className="text-black font-medium">{article}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-black mb-4">Still Need Help?</h3>
            <p className="text-black/70 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-royal-blue text-white hover:bg-royal-blue/90"
              >
                <Mail className="mr-2" size={16} />
                Email Support
              </Button>
              <Button 
                variant="outline"
                className="border-royal-blue text-black hover:bg-royal-blue/20"
              >
                <MessageCircle className="mr-2" size={16} />
                Live Chat
              </Button>
              <Button 
                variant="outline"
                className="border-royal-blue text-black hover:bg-royal-blue/20"
              >
                <Phone className="mr-2" size={16} />
                Call Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter;
