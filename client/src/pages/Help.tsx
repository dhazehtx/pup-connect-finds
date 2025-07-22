
import React, { useState } from 'react';
import { ChevronDown, MessageSquare, Phone, Mail, Search, Shield, Heart, AlertTriangle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'Buying a Puppy',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
      faqs: [
        {
          question: 'How do I search for puppies?',
          answer: 'Use our search filters on the Explore page to filter by breed, location, price, age, and more. Enable location services for distance-based results.'
        },
        {
          question: 'What makes a seller "verified"?',
          answer: 'Verified sellers have completed ID verification, provided licensing documentation, and maintain good ratings from previous buyers.'
        },
        {
          question: 'What documents should I expect from a seller?',
          answer: 'Health certificates, vaccination records, registration papers (if applicable), and breeding license information for commercial breeders. Need more help? Contact our support team at support@mypup.com or use live chat.'
        },
        {
          question: 'What safety measures should I take when meeting a seller?',
          answer: 'Always meet in public places, bring a friend, verify health records, and trust your instincts. Never send money before meeting the puppy. For urgent concerns, call our emergency line at (555) 123-HELP.'
        }
      ]
    },
    {
      title: 'Payments & Transactions',
      icon: CreditCard,
      color: 'bg-green-100 text-green-600',
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept credit cards, debit cards, and bank transfers through our secure payment processor. Cash payments are not recommended. Questions about payments? Email us at billing@mypup.com.'
        },
        {
          question: 'How does buyer protection work?',
          answer: 'Our secure payment system holds funds until you confirm the transaction. Report issues within 48 hours for full protection coverage. Need immediate assistance? Chat with us 24/7.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'Refunds are handled case-by-case based on our buyer protection policy. Contact support immediately if you encounter issues. Call (555) 123-HELP for urgent matters.'
        }
      ]
    },
    {
      title: 'Account Security',
      icon: Shield,
      color: 'bg-blue-100 text-blue-600',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click "Sign Up" and verify your email address. For sellers, additional verification may be required including ID and breeding licenses.'
        },
        {
          question: 'How do I report a suspicious listing?',
          answer: 'Click the flag icon on any listing to report concerns. Urgent animal welfare issues are escalated immediately to our moderation team. For emergencies, call (555) 123-HELP.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page and follow the email instructions. Still having trouble? Contact support@mypup.com or start a live chat.'
        }
      ]
    },
    {
      title: 'Legal & Compliance',
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-600',
      faqs: [
        {
          question: 'What are the age requirements for puppy sales?',
          answer: 'Puppies must be at least 8 weeks old in most states. Some locations have stricter requirements. Check your local laws. Need legal guidance? Email legal@mypup.com.'
        },
        {
          question: 'Do I need a license to sell puppies?',
          answer: 'Commercial breeders typically need licenses. Occasional sellers may be exempt. Requirements vary by state and municipality. Contact us for specific guidance at support@mypup.com.'
        },
        {
          question: 'What happens if I violate the terms of service?',
          answer: 'Violations can result in listing removal, account suspension, or permanent bans depending on severity. Questions about policies? Chat with our support team.'
        },
        {
          question: 'How do I become a verified seller?',
          answer: 'Complete identity verification, provide breeding licenses, upload health testing results, and maintain a 4+ star rating. Need help with verification? Call (555) 123-HELP.'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageSquare,
      action: 'Start Chat',
      available: '24/7',
      contact: 'Available in-app'
    },
    {
      title: 'Email Support',
      description: 'support@mypup.com',
      icon: Mail,
      action: 'Send Email',
      available: 'Response within 4 hours',
      contact: 'support@mypup.com'
    },
    {
      title: 'Emergency Line',
      description: 'For urgent animal welfare concerns',
      icon: Phone,
      action: 'Call Now',
      available: '24/7',
      contact: '(555) 123-HELP'
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support Center</h1>
        <p className="text-gray-600">Find answers to common questions and get support when you need it</p>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search help articles... (e.g., 'puppy verification', 'payment methods')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
        {searchTerm && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="outline" className="text-xs">
              {filteredFAQs.reduce((acc, cat) => acc + cat.faqs.length, 0)} results
            </Badge>
          </div>
        )}
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {contactOptions.map((option, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <option.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{option.description}</p>
              <p className="text-xs text-blue-600 font-medium mb-1">{option.contact}</p>
              <p className="text-xs text-gray-500 mb-3">{option.available}</p>
              <Button size="sm" className="w-full">{option.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Sections - Grouped by Topic */}
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-sm">Browse by topic or use the search bar above to find specific answers</p>
        </div>
        
        {filteredFAQs.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon size={20} />
                </div>
                {category.title}
                <Badge variant="outline">{category.faqs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced "Still Need Help" Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-blue-900 mb-2">Still need help?</h3>
          <p className="text-blue-700 mb-4">
            Can't find what you're looking for? Our support team is here to assist you with any questions or concerns.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Live Chat
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail size={16} />
              Email Support
            </Button>
            <Button className="flex items-center gap-2">
              <Phone size={16} />
              Call Emergency Line
            </Button>
          </div>
          <div className="mt-4 text-sm text-blue-600">
            <p>📧 support@mypup.com • 📞 (555) 123-HELP • 💬 24/7 Live Chat Available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
