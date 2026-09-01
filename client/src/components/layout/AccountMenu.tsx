import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, List, PlusCircle, Heart, ShoppingBag, ShieldCheck, MessageCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Authenticated account control for the global header (desktop + mobile).
 * A single avatar → dropdown with the user's real destinations. Every link
 * points at a route that actually exists; no seller/admin role assumptions —
 * any authenticated user can create/manage their own listings.
 */
const ACCOUNT_LINKS = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/my-listings', label: 'My Listings', icon: List },
  { to: '/create-listing', label: 'Create Listing', icon: PlusCircle },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/deals', label: 'Protected Payments', icon: ShieldCheck },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

const AccountMenu = () => {
  const { user, profile, signOut } = useAuth();
  if (!user) return null;

  const displayName = profile?.full_name || user.email || 'Account';
  const initial = (profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex shrink-0 items-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src={profile?.avatar_url} alt="" />
            <AvatarFallback className="bg-[#0074d4]/10 text-sm font-semibold text-[#0074d4]">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to} className="flex w-full cursor-pointer items-center gap-2">
              <Icon className="h-4 w-4 text-slate-500" aria-hidden />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
