
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HelpCircle, 
  Shield, 
  Mail, 
  FileText, 
  Users, 
  Heart,
  ExternalLink
} from 'lucide-react';

interface FooterLinksMenuProps {
  variant?: 'card' | 'list';
  className?: string;
}

const FooterLinksMenu = ({ variant = 'card', className = '' }: FooterLinksMenuProps) => {
  const quickLinks = [
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Trust & Safety', href: '/trust-safety', icon: Shield },
    { name: 'Contact Us', href: '/contact', icon: Mail },
    { name: 'Community Guidelines', href: '/guidelines', icon: Users },
  ];

  const supportLinks = [
    { name: 'Terms of Service', href: '/terms', icon: FileText },
    { name: 'Privacy Policy', href: '/privacy', icon: FileText },
    { name: 'Cookie Policy', href: '/cookies', icon: FileText },
    { name: 'About Us', href: '/about', icon: Heart },
  ];

  if (variant === 'list') {
    return (
      <div className={`space-y-1 ${className}`}>
        {[...quickLinks, ...supportLinks].map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <link.icon className="w-4 h-4" />
            <span>{link.name}</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Quick Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <link.icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{link.name}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Legal & Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {supportLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <link.icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{link.name}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterLinksMenu;
