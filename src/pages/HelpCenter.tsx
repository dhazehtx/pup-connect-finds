
import React from 'react';
import { Book, MessageCircle, Shield, Users, Search, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const navigate = useNavigate();

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using MY PUP',
      icon: <Book className="w-8 h-8" />,
      color: 'bg-royal-blue/10 border-royal-blue',
      articles: [
        'How to create an account',
        'Setting up your profile',
        'Finding your first puppy',
        'Understanding our verification process'
      ],
      action: () => navigate('/help/getting-started')
    },
    {
      id: 'buying-guide',
      title: 'Buying Guide',
      description: 'Everything you need to know about buying a puppy',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-royal-blue/10 border-royal-blue',
      articles: [
        'How to choose the right breed',
        'Questions to ask breeders',
        'Health certificates and documentation',
        'Safe payment methods'
      ],
      action: () => navigate('/help/buying-guide')
    },
    {
      id: 'safety-trust',
      title: 'Safety & Trust',
      description: 'Stay safe while using our platform',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-royal-blue/10 border-royal-blue',
      articles: [
        'Recognizing trusted breeders',
        'Avoiding scams and fraud',
        'Reporting suspicious activity',
        'Our safety guidelines'
      ],
      action: () => navigate('/help/safety-trust')
    },
    {
      id: 'selling-breeding',
      title: 'Selling & Breeding',
      description: 'Resources for breeders and sellers',
      icon: <MessageCircle className="w-8 h-8" />,
      color: 'bg-royal-blue/10 border-royal-blue',
      articles: [
        'Creating effective listings',
        'Breeder verification process',
        'Managing inquiries and messages',
        'Best practices for responsible breeding'
      ],
      action: () => navigate('/help/selling-breeding')
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: <MessageCircle className="w-6 h-6" />,
      action: () => console.log('Start live chat'),
      available: '24/7'
    },
    {
      title: 'Phone Support',
      description: 'Call us for immediate help',
      icon: <Phone className="w-6 h-6" />,
      action: () => window.open('tel:1-800-MY-PUPPY'),
      available: 'Mon-Fri 9AM-8PM EST'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail className="w-6 h-6" />,
      action: () => navigate('/contact'),
      available: 'Usually responds within 2 hours'
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90 mb-8">Find answers, guides, and support for all your MY PUP needs</p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cloud-white/60" size={20} />
              <Input
                placeholder="Search help articles..."
                className="pl-10 bg-white text-black"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Get Quick Help</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="border-royal-blue hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-royal-blue">{action.icon}</div>
                    <div>
                      <h3 className="font-semibold text-black">{action.title}</h3>
                      <p className="text-sm text-black/70">{action.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Clock size={12} />
                    <span>{action.available}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Browse Help Topics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.id} className={`${category.color} hover:shadow-lg transition-shadow cursor-pointer`} onClick={category.action}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-black">
                    <div className="text-royal-blue">{category.icon}</div>
                    <div>
                      <h3>{category.title}</h3>
                      <p className="text-sm font-normal text-black/70 mt-1">{category.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, index) => (
                      <li key={index} className="text-sm text-black/70 flex items-center">
                        <span className="w-1.5 h-1.5 bg-royal-blue rounded-full mr-3"></span>
                        {article}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-royal-blue text-black hover:bg-royal-blue/20"
                  >
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'How to verify a breeder', category: 'Safety', readTime: '5 min read' },
              { title: 'Understanding puppy health certificates', category: 'Buying Guide', readTime: '7 min read' },
              { title: 'Creating your first listing', category: 'Selling', readTime: '4 min read' },
              { title: 'Safe payment methods', category: 'Safety', readTime: '6 min read' },
              { title: 'Choosing the right breed', category: 'Buying Guide', readTime: '10 min read' },
              { title: 'Communication best practices', category: 'General', readTime: '3 min read' }
            ].map((article, index) => (
              <Card key={index} className="border-royal-blue hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-black mb-2">{article.title}</h3>
                  <div className="flex items-center justify-between text-sm text-black/60">
                    <span className="bg-royal-blue/10 text-royal-blue px-2 py-1 rounded-full text-xs">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-black mb-4">Still need help?</h3>
            <p className="text-black/70 mb-6">
              Our support team is standing by to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-royal-blue text-white hover:bg-royal-blue/90"
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/faq')}
                className="border-royal-blue text-black hover:bg-royal-blue/20"
              >
                View FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter;
