
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const HeaderSupportMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden md:inline">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
        <DropdownMenuLabel>Main Features</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/education">Education</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/services">Services</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/customer-reviews">Customer Reviews</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/premium-dashboard">Premium</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/legal">Legal Guide</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Support</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/help">Help Center</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/trust-safety">Trust & Safety</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact">Contact Us</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Business</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/b2b-dashboard">B2B Analytics</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Legal</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/terms">Terms of Service</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/privacy">Privacy Policy</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/terms">Terms of Use</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderSupportMenu;
