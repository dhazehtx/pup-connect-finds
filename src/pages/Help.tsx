
import React, { useState } from 'react';
import { ChevronDown, MessageSquare, Phone, Mail, Search, Shield, Heart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Heart,
      color: 'bg-blue-100 text-blue-600',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click "Sign Up" and verify your email address. For sellers, additional verification may be required including ID and breeding licenses.'
        },
        {
          question: 'How do I search for puppies?',
          answer: 'Use our search filters on the Explore page to filter by breed, location, price, age, and more. Enable location services for distance-based results.'
        },
        {
          question: 'What makes a seller "verified"?',
          answer: 'Verified sellers have completed ID verification, provided licensing documentation, and maintain good ratings from previous buyers.'
        }
      ]
    },
    {
      title: 'Safety & Security',
      icon: Shield,
      color: 'bg-green-100 text-green-600',
      faqs: [
        {
          question: 'How do I report a suspicious listing?',
          answer: 'Click the flag icon on any listing to report concerns. Urgent animal welfare issues are escalated immediately to our moderation team.'
        },
        {
          question: 'What safety measures should I take when meeting a seller?',
          answer: 'Always meet in public places, bring a friend, verify health records, and trust your instincts. Never send money before meeting the puppy.'
        },
        {
          question: 'How does buyer protection work?',
          answer: 'Our secure payment system holds funds until you confirm the transaction. Report issues within 48 hours for full protection coverage.'
        }
      ]
    },
    {
      title: 'Buying & Selling',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600',
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept credit cards, debit cards, and bank transfers through our secure payment processor. Cash payments are not recommended.'
        },
        {
          question: 'What documents should I expect from a seller?',
          answer: 'Health certificates, vaccination records, registration papers (if applicable), and breeding license information for commercial breeders.'
        },
        {
          question: 'How do I become a verified seller?',
          answer: 'Complete identity verification, provide breeding licenses, upload health testing results, and maintain a 4+ star rating.'
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
          answer: 'Puppies must be at least 8 weeks old in most states. Some locations have stricter requirements. Check your local laws.'
        },
        {
          question: 'Do I need a license to sell puppies?',
          answer: 'Commercial breeders typically need licenses. Occasional sellers may be exempt. Requirements vary by state and municipality.'
        },
        {
          question: 'What happens if I violate the terms of service?',
          answer: 'Violations can result in listing removal, account suspension, or permanent bans depending on severity.'
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
      available: '24/7'
    },
    {
      title: 'Email Support',
      description: 'support@mypup.com',
      icon: Mail,
      action: 'Send Email',
      available: 'Response within 4 hours'
    },
    {
      title: 'Emergency Line',
      description: 'For urgent animal welfare concerns',
      icon: Phone,
      action: 'Call Now',
      available: '24/7'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600">Find answers to common questions and get support</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search for help articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {contactOptions.map((option, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <option.icon className="w-8 h-8 mx-auto mb-2 text-royal-blue" />
              <h3 className="font-semibold mb-1">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{option.description}</p>
              <p className="text-xs text-gray-500 mb-3">{option.available}</p>
              <Button size="sm" className="w-full">{option.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
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

      {/* Still Need Help */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-blue-900 mb-2">Still need help?</h3>
          <p className="text-blue-700 mb-4">
            Our support team is here to assist you with any questions or concerns.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">Contact Support</Button>
            <Button>Submit a Ticket</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
