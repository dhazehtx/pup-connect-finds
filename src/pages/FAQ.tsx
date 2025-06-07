
import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      icon: <HelpCircle className="w-5 h-5" />,
      faqs: [
        {
          id: 'what-is-mypup',
          question: 'What is MY PUP?',
          answer: 'MY PUP is a trusted platform that connects loving families with verified breeders and their puppies. We ensure safe, transparent transactions and provide educational resources for responsible dog ownership.'
        },
        {
          id: 'how-it-works',
          question: 'How does MY PUP work?',
          answer: 'Browse verified listings, contact breeders directly, arrange meetings, and complete secure transactions. Our platform includes safety measures, breeder verification, and ongoing support.'
        },
        {
          id: 'is-it-free',
          question: 'Is MY PUP free to use?',
          answer: 'Yes, browsing and contacting breeders is free for families. We offer premium features for enhanced search and breeder tools for listing management.'
        }
      ]
    },
    {
      id: 'buying',
      title: 'Buying a Puppy',
      icon: <MessageCircle className="w-5 h-5" />,
      faqs: [
        {
          id: 'how-to-find',
          question: 'How do I find the right puppy?',
          answer: 'Use our advanced search filters to find puppies by breed, location, price, and other criteria. Read breeder profiles, reviews, and health information before making contact.'
        },
        {
          id: 'verification',
          question: 'How are breeders verified?',
          answer: 'We verify breeders through documentation review, facility inspections, and reference checks. Look for the verified badge on breeder profiles.'
        },
        {
          id: 'payment-safety',
          question: 'Is payment secure?',
          answer: 'Yes, we offer secure payment processing and escrow services to protect both buyers and sellers throughout the transaction.'
        }
      ]
    },
    {
      id: 'breeders',
      title: 'For Breeders',
      icon: <Phone className="w-5 h-5" />,
      faqs: [
        {
          id: 'how-to-list',
          question: 'How do I list my puppies?',
          answer: 'Create a breeder account, complete verification, and create detailed listings with photos and health information. Our team will review and approve your listings.'
        },
        {
          id: 'listing-fees',
          question: 'What are the listing fees?',
          answer: 'Basic listings are free. Premium features and enhanced visibility options are available through our subscription plans.'
        },
        {
          id: 'payment-processing',
          question: 'How do I receive payments?',
          answer: 'Payments are processed securely through our platform. You can receive funds via bank transfer or check after successful transaction completion.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Safety',
      icon: <Mail className="w-5 h-5" />,
      faqs: [
        {
          id: 'report-issue',
          question: 'How do I report a problem?',
          answer: 'Contact our support team immediately via email, phone, or live chat. We take all reports seriously and investigate promptly.'
        },
        {
          id: 'scam-protection',
          question: 'How do you protect against scams?',
          answer: 'We verify all breeders, monitor communications, offer secure payments, and provide fraud protection. Never send money outside our platform.'
        },
        {
          id: 'get-help',
          question: 'How can I get additional help?',
          answer: 'Our support team is available via live chat, email, and phone. We also have comprehensive help articles and video guides.'
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">Find answers to common questions about MY PUP</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60" size={20} />
            <Input
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-royal-blue focus:ring-royal-blue"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQs.map((category) => (
            <Card key={category.id} className="border-royal-blue">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-black">
                  <div className="text-royal-blue">{category.icon}</div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.faqs.map((faq) => (
                    <Collapsible
                      key={faq.id}
                      open={openItems.includes(faq.id)}
                      onOpenChange={() => toggleItem(faq.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-royal-blue/5 rounded-lg hover:bg-royal-blue/10 transition-colors">
                          <span className="font-medium text-left text-black">{faq.question}</span>
                          <ChevronDown 
                            className={`w-5 h-5 text-royal-blue transition-transform ${
                              openItems.includes(faq.id) ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 text-black/70 bg-white rounded-lg mt-2 border border-royal-blue/20">
                          {faq.answer}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {searchTerm && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto h-12 w-12 text-black/40 mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No results found</h3>
            <p className="text-black/70">Try adjusting your search terms or browse all categories</p>
          </div>
        )}

        {/* Contact Support */}
        <Card className="mt-12 border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-black mb-4">Still Need Help?</h3>
            <p className="text-black/70 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-royal-blue text-white hover:bg-royal-blue/90"
              >
                <MessageCircle className="mr-2" size={16} />
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/help')}
                className="border-royal-blue text-black hover:bg-royal-blue/20"
              >
                <HelpCircle className="mr-2" size={16} />
                Help Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
