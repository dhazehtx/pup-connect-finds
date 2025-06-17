
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Help</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/help">Help Center</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/trust-safety">Trust & Safety</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact">Contact Support</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/guidelines">Community Guidelines</Link>
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
          <Link to="/about">About PawFinds</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderSupportMenu;
