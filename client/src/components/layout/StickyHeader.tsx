import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, ShieldCheck } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { PawsWordmarkLockup } from '@/components/brand/PawsWordmark';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import { useToast } from '@/hooks/use-toast';
import ModernPostCreator from '@/components/home/ModernPostCreator';
import NotificationButton from '@/components/notifications/NotificationButton';

const PLACEHOLDER = 'Search puppies, breeders, or messages...';

const StickyHeader = () => {
  const { user, isGuest, profile, loading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showPostCreator, setShowPostCreator] = useState(false);
  const showHeaderSearch =
    !location.pathname.startsWith('/greeting') && !location.pathname.startsWith('/auth');

  const handleCreatePost = () => {
    if (!user && !isGuest) {
      navigate('/auth');
      return;
    }

    const isMarketplacePage = location.pathname === '/marketplace' || location.pathname === '/explore';
    
    if (isMarketplacePage) {
      navigate('/create-listing');
    } else {
      setShowPostCreator(true);
    }
  };

  const handlePostCreated = (newPost: any) => {
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
  };

  const getHomeLink = () => {
    if (user || isGuest) {
      return "/home";
    }
    return "/";
  };

  const primaryNav = useMemo(
    () =>
      [
        { to: '/explore', label: 'Explore' },
        { to: '/marketplace', label: 'Shop' },
        { to: '/services', label: 'Services' },
        { to: '/help-center', label: 'Help' },
      ] as const,
    [],
  );

  const isNavActive = (to: string) => {
    const p = location.pathname;
    if (to === '/explore') return p === '/explore' || p.startsWith('/listing/');
    if (to === '/marketplace')
      return p === '/marketplace' || p.startsWith('/cart') || p.startsWith('/checkout') || p === '/shop';
    if (to === '/services') return p.startsWith('/services');
    if (to === '/help-center')
      return p.startsWith('/help') || p === '/contact' || p === '/support' || p.startsWith('/legal');
    return p === to;
  };

  const showToolbar = !location.pathname.startsWith('/auth');

  /** Glass bar: one surface behind logo + tools — logo link stays transparent (no “boxed” chip). */
  const headerSurface =
    'border-b border-white/25 bg-white/70 shadow-none backdrop-blur-md dark:border-slate-700/40 dark:bg-slate-950/65';

  const HeaderToolbar = ({ className }: { className?: string }) => (
    <div className={className}>
      {(user || isGuest) && (
        <button
          type="button"
          onClick={handleCreatePost}
          title="Create Post"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0074d4] transition-colors hover:bg-[#0074d4]/10"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}

      {loading ? (
        <div className="h-6 w-6 shrink-0" />
      ) : profile?.is_admin ? (
        <Link
          to="/admin"
          title="Admin Dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0074d4] hover:bg-[#0074d4]/10"
        >
          <ShieldCheck className="h-5 w-5" />
        </Link>
      ) : null}

      {user && !isGuest && (
        <NotificationButton className="rounded-full p-2 text-[#0074d4] transition-colors hover:bg-[#0074d4]/5 hover:shadow-sm" />
      )}
    </div>
  );

  return (
    <>
      <header className={`sticky top-0 z-50 ${headerSurface}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-2 sm:gap-3">
            <Link
              to={getHomeLink()}
              className="group font-brand-wordmark inline-flex shrink-0 items-baseline gap-1 rounded-none bg-transparent text-base font-medium tracking-widest text-slate-700 shadow-none ring-0 ring-offset-0 hover:bg-transparent focus-visible:outline-none focus-visible:ring-0 dark:text-slate-100 sm:text-lg"
              aria-label="PAWS — Home"
            >
              <PawsWordmarkLockup />
            </Link>

            {showHeaderSearch && (
              <nav
                className="hidden shrink-0 items-center gap-0.5 lg:flex"
                aria-label="Primary"
              >
                {primaryNav.map((item) => {
                  const active = isNavActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
                        active
                          ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {showHeaderSearch ? (
              <div className="relative z-40 mx-auto min-w-0 w-full max-w-md flex-1 px-1 sm:px-2">
                <SearchBar placeholder={PLACEHOLDER} className="[&_input]:h-9 [&_input]:rounded-full [&_input]:border-slate-200/90 [&_input]:bg-slate-100/90 sm:[&_input]:h-10" />
              </div>
            ) : (
              <div className="min-w-0 flex-1" aria-hidden />
            )}

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              {showToolbar && (
                <HeaderToolbar className="flex items-center gap-2 sm:gap-3" />
              )}
              {!user && !isGuest && (
                <Link to="/auth">
                  <Button size="sm" className="btn-primary px-5 py-2">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {showPostCreator && (
        <ModernPostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default StickyHeader;
