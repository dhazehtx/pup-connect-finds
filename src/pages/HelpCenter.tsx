
import React, { useState } from 'react';
import { Search, Book, MessageCircle, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const categories = [
    {
      title: 'Getting Started',
      icon: <Book className="h-6 w-6" />,
      articles: 15,
      description: 'Learn the basics of using MY PUP'
    },
    {
      title: 'Buying a Puppy',
      icon: <MessageCircle className="h-6 w-6" />,
      articles: 12,
      description: 'Tips for finding and purchasing your perfect companion'
    },
    {
      title: 'Selling & Breeding',
      icon: <Phone className="h-6 w-6" />,
      articles: 18,
      description: 'Guidelines for listing and selling puppies'
    },
    {
      title: 'Safety & Trust',
      icon: <Mail className="h-6 w-6" />,
      articles: 8,
      description: 'Staying safe and building trust on the platform'
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account on MY PUP?',
      answer: 'Creating an account is easy! Click the "Sign Up" button in the top right corner, enter your email and create a password. You can also sign up using your Google or Facebook account for faster registration.'
    },
    {
      question: 'How do I verify my breeder account?',
      answer: 'To become a verified breeder, go to your profile settings and click "Get Verified." You\'ll need to provide documentation including business license, health certificates, and references. Our team reviews all applications within 3-5 business days.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our escrow system to protect both buyers and sellers.'
    },
    {
      question: 'How does the escrow system work?',
      answer: 'Our escrow system holds your payment securely until you meet the puppy and confirm the transaction. The seller only receives payment after you\'ve had the chance to verify the puppy\'s health and that everything matches the listing.'
    },
    {
      question: 'What if I have issues with a purchase?',
      answer: 'If you encounter any issues, contact our support team immediately. We offer buyer protection and will work with both parties to resolve disputes. In cases of fraud or misrepresentation, we provide full refunds through our guarantee program.'
    },
    {
      question: 'How do I report a suspicious listing?',
      answer: 'Click the "Report" button on any listing that seems suspicious. Our moderation team reviews all reports within 24 hours. You can also contact us directly if you notice patterns of fraudulent behavior.'
    }
  ];

  const popularArticles = [
    'How to Choose the Right Puppy Breed for Your Family',
    'Understanding Puppy Health Certificates',
    'First-Time Buyer\'s Guide to Puppy Adoption',
    'Red Flags to Watch Out for When Buying a Puppy',
    'Preparing Your Home for a New Puppy'
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90 mb-8">Find answers to your questions and get the help you need</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-deep-navy/60" size={20} />
            <Input
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-lg bg-white text-deep-navy"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-deep-navy mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="border-soft-sky hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-royal-blue mb-4 flex justify-center">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-deep-navy mb-2">{category.title}</h3>
                  <p className="text-sm text-deep-navy/70 mb-3">{category.description}</p>
                  <span className="text-xs text-royal-blue font-medium">{category.articles} articles</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-deep-navy mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-soft-sky">
                  <Collapsible
                    open={openFAQ === index}
                    onOpenChange={() => setOpenFAQ(openFAQ === index ? null : index)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-soft-sky/10 transition-colors">
                        <CardTitle className="text-base font-medium text-deep-navy flex justify-between items-center">
                          {faq.question}
                          {openFAQ === index ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <p className="text-deep-navy/70">{faq.answer}</p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Articles */}
            <Card className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy">Popular Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <li key={index}>
                      <a href="#" className="text-sm text-royal-blue hover:underline">
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy">Need More Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-deep-navy/70">Can't find what you're looking for? Our support team is here to help.</p>
                <div className="space-y-3">
                  <Button className="w-full bg-royal-blue hover:bg-deep-navy">
                    <MessageCircle className="mr-2" size={16} />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
                    <Mail className="mr-2" size={16} />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
                    <Phone className="mr-2" size={16} />
                    Call Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy">Support Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-deep-navy/70">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9AM - 8PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10AM - 6PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>12PM - 5PM EST</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
