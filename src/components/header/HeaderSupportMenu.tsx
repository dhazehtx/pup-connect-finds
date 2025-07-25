
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
      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50">
        <DropdownMenuLabel>Legal</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/education" className="w-full cursor-pointer">
            Education
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/legal" className="w-full cursor-pointer">
            Legal Guide
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/terms" className="w-full cursor-pointer">
            Terms of Service
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/privacy-policy" className="w-full cursor-pointer">
            Privacy Policy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/terms" className="w-full cursor-pointer">
            Terms of Use
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Support</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/help-center" className="w-full cursor-pointer">
            Help Center
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/trust-safety" className="w-full cursor-pointer">
            Trust & Safety
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact" className="w-full cursor-pointer">
            Contact Us
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderSupportMenu;
