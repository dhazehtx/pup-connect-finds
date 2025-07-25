
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarUserDropdownProps {
  user: any;
  profile: any;
  signOut: () => void;
}

const NavbarUserDropdown = ({ user, profile, signOut }: NavbarUserDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel>{profile?.full_name || user.email}</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link to="/profile" className="w-full h-full block">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/messages" className="w-full h-full block">
            Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/notifications" className="w-full h-full block">
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/my-listings" className="w-full h-full block">
            My Listings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/create-listing" className="w-full h-full block">
            Create Listing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to="/messaging-test" className="w-full h-full block">
            Message Testing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/messaging-analytics" className="w-full h-full block">
            Message Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUserDropdown;
