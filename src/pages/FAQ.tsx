
import React from 'react';
import { ChevronDown, ChevronUp, help } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "How do I find puppies near me?",
      answer: "Use our Browse Puppies feature to search by location, breed, and other preferences. Our location-based search will show you available puppies in your area with distance indicators."
    },
    {
      question: "Are all breeders on MY PUP verified?",
      answer: "We have multiple verification levels for breeders, including identity verification, breeder licenses, and facility inspections. Look for verification badges on breeder profiles to see their verification status."
    },
    {
      question: "How do I contact a breeder?",
      answer: "You can message breeders directly through our secure messaging system. Simply click 'Contact' on any listing to start a conversation with the breeder."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We support secure payment processing through our platform. You can use credit cards, debit cards, and bank transfers. All payments are protected by our escrow service for your security."
    },
    {
      question: "Can I schedule visits with breeders?",
      answer: "Yes! Many breeders offer facility visits. You can coordinate visits directly through our messaging system or use our built-in scheduling tools available on some breeder profiles."
    },
    {
      question: "What if I have issues with a purchase?",
      answer: "Our Trust & Safety team is here to help resolve any issues. We offer dispute resolution services and our escrow payment system provides additional protection for your transactions."
    },
    {
      question: "How do I leave a review for a breeder?",
      answer: "After completing a purchase, you'll receive an invitation to leave a review. You can also leave reviews by visiting the breeder's profile and clicking the 'Write Review' button."
    },
    {
      question: "Is MY PUP free to use?",
      answer: "Browsing and searching for puppies is completely free. We offer premium features for breeders and advanced tools for serious buyers through our subscription plans."
    },
    {
      question: "How do I create an account?",
      answer: "Click 'Sign Up' in the top navigation or any 'Join MY PUP' button. You can create an account with email, Google, or Facebook. Account creation is quick and free!"
    },
    {
      question: "What breeds are available on MY PUP?",
      answer: "We feature over 200 different breeds and mixed breeds. From popular breeds like Golden Retrievers and Labs to rare breeds and designer mixes - you'll find them all on MY PUP."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
          <help size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about MY PUP and our services
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={() => toggleItem(index)}
                className="w-full p-6 justify-between text-left hover:bg-muted/50"
              >
                <span className="font-medium text-foreground">{item.question}</span>
                {openItems.includes(index) ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </Button>
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you find your perfect puppy companion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" className="bg-primary hover:bg-primary/90">
                Contact Support
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                Browse Help Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
