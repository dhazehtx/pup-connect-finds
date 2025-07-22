
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Shield, 
  FileText, 
  Mail,
  MessageSquare,
  TrendingUp,
  Users
} from 'lucide-react';

interface FooterLinksMenuProps {
  variant?: 'default' | 'card';
}

const FooterLinksMenu = ({ variant = 'default' }: FooterLinksMenuProps) => {
  const linkGroups = [
    {
      title: 'Legal',
      links: [
        { name: 'Education', path: '/education', icon: <FileText className="w-4 h-4" /> },
        { name: 'Legal Guide', path: '/legal', icon: <Shield className="w-4 h-4" /> },
        { name: 'Terms of Service', path: '/terms', icon: <FileText className="w-4 h-4" /> },
        { name: 'Privacy Policy', path: '/privacy-policy', icon: <Shield className="w-4 h-4" /> },
        { name: 'Terms of Use', path: '/terms', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help-center', icon: <HelpCircle className="w-4 h-4" /> },
        { name: 'Trust & Safety', path: '/trust-safety', icon: <Shield className="w-4 h-4" /> },
        { name: 'Contact Us', path: '/contact', icon: <Mail className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Analytics',
      links: [
        { name: 'Messaging Analytics', path: '/messaging-analytics', icon: <MessageSquare className="w-4 h-4" /> },
        { name: 'Enhanced Analytics', path: '/analytics', icon: <TrendingUp className="w-4 h-4" /> },
        { name: 'Professional Network', path: '/network', icon: <Users className="w-4 h-4" /> },
      ]
    }
  ];

  if (variant === 'card') {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Help & Support</h3>
          <div className="grid grid-cols-1 gap-2">
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">{group.title}</h4>
                {group.links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-base text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FooterLinksMenu;
