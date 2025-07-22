
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
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
  );
};

export default FAQSection;
