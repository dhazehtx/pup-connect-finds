import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ModeToggle"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Moon,
  Sun,
  Home,
  Compass,
  Search as SearchIcon,
  Mail,
  HelpCircle,
  User,
  Settings,
  LogOut,
  LogIn,
  Plus,
  LayoutDashboard
} from 'lucide-react';

const Header = () => {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Explore', href: '/explore' },
    { name: 'Search', href: '/search' },
    { name: 'Services', href: '/services' }, // New
    { name: 'PawBox', href: '/pawbox' }, // New
    { name: 'Messages', href: '/messages' },
    { name: 'Help', href: '/help' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center text-xl font-semibold text-gray-800 dark:text-white">
          <img src="/logo.svg" alt="MYPUP Logo" className="h-8 w-auto mr-2" />
          MYPUP
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link key={item.name} to={item.href} className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth and Actions */}
        <div className="flex items-center space-x-4">
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || `https://avatar.vercel.sh/${user.email?.split('@')[0]}.png`} alt={profile?.fullName || user.email || "User Avatar"} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.fullName || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')} >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/sign-in')}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/sign-up')}>
                <Plus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate the app and manage your profile.
                </SheetDescription>
              </SheetHeader>
              <nav className="grid gap-4 text-sm mt-8">
                {navigationItems.map((item) => (
                  <Link key={item.name} to={item.href} className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Compass className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Button variant="ghost" size="sm" className="justify-start" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start" onClick={() => navigate('/sign-in')}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button size="sm" className="justify-start" onClick={() => navigate('/sign-up')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
