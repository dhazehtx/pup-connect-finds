
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react';

interface PopularArticle {
  title: string;
  url: string;
}

interface HelpSidebarProps {
  popularArticles: PopularArticle[];
}

const HelpSidebar: React.FC<HelpSidebarProps> = ({ popularArticles }) => {
  return (
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
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-royal-blue hover:underline flex items-center justify-between group"
                >
                  <span>{article.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
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
  );
};

export default HelpSidebar;
