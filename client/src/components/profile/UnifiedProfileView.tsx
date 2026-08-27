
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Globe,
  Calendar,
  UserPlus,
  UserCheck,
  Shield,
  MessageCircle,
  BadgeCheck,
  Cog,
  LogOut,
  User,
  Trash2,
  HelpCircle,
  Sparkles,
  Grid3X3,
  Briefcase,
  Star,
  SlidersHorizontal,
  Loader2,
  Clock,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './ProfileSettings';
import ProfilePostsGrid from './ProfilePostsGrid';
import { ProfileServicesTab } from './ProfileServicesTab';
import { ProviderReviewsSection } from './ProviderReviewsSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FollowersModal from './FollowersModal';
import {
  ProfileAvatarPhotoControls,
  type ProfileAvatarPhotoControlsHandle,
} from '@/components/profile/ProfileAvatarPhotoControls';
import BugReportButton from '@/components/bugs/BugReportButton';
import LoadingState from '@/components/ui/loading-state';
import { ProfileHeroBanner } from '@/components/profile/ProfileHeroBanner';
import { ProfileStatRow } from '@/components/profile/ProfileStatRow';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { PROFILE_AVATAR_SHELL } from '@/components/profile/profileAvatarClasses';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { usePosts } from '@/hooks/usePosts';
import { useToast } from '@/hooks/use-toast';
import { PawsWordmarkLockup } from '@/components/brand/PawsWordmark';
import { TrustSafetyProfileSection } from '@/components/trust/TrustSafetyProfileSection';
import { UserTrustActions } from '@/components/trust/UserTrustActions';
import { profileInitials } from '@/lib/profileInitials';
import { formatLastActiveLabel, formatVerifiedSinceMonthYear } from '@/lib/profileTrustFormat';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  location: string;
  website_url: string;
  avatar_url: string;
  user_type: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  years_experience: number;
  created_at: string;
  /** ISO — last login or profile update, whichever is newer */
  last_active_at?: string | null;
  /** Placeholder response-time band (server-side stable per user) */
  typical_response_time?: string | null;
  /** ISO — display-only; uses account created_at until a dedicated verified_at exists */
  verified_since?: string | null;
}

interface UnifiedProfileViewProps {
  userId?: string;
  isCurrentUser: boolean;
}

function userTypeLabel(userType: string): string {
  const t = (userType || 'buyer').toLowerCase();
  if (t === 'breeder') return 'Breeder';
  if (t === 'shelter') return 'Shelter / rescue';
  if (t === 'admin') return 'Team';
  return 'Pet parent';
}

/** Weighted fields for a simple “profile strength” bar (dark-mode-friendly slate tokens). */
function getProfileCompleteness(profile: Profile): { percent: number; hint: string } {
  const items: { weight: number; done: boolean; hint: string }[] = [
    { weight: 25, done: Boolean(profile.avatar_url?.trim()), hint: 'Add a photo to reach 100%!' },
    { weight: 15, done: Boolean(profile.full_name?.trim()), hint: 'Add your display name.' },
    { weight: 15, done: Boolean(profile.username?.trim()), hint: 'Choose a @username.' },
    { weight: 15, done: Boolean(profile.bio?.trim()), hint: 'Add a short bio so others know you.' },
    { weight: 15, done: Boolean(profile.location?.trim()), hint: 'Add your location.' },
    { weight: 15, done: Boolean(profile.website_url?.trim()), hint: 'Link a website or social profile.' },
  ];
  const percent = items.reduce((acc, i) => acc + (i.done ? i.weight : 0), 0);
  const next = items.find((i) => !i.done);
  return {
    percent,
    hint: next ? next.hint : 'Your profile looks complete — nice work!',
  };
}

const UnifiedProfileView = ({ userId, isCurrentUser }: UnifiedProfileViewProps) => {
  const { user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{
    kind: 'not_found' | 'unavailable' | 'auth';
    status?: number;
    message: string;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const avatarPhotoRef = useRef<ProfileAvatarPhotoControlsHandle>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileTab, setProfileTab] = useState('posts');

  const profileId = userId || user?.id;
  const { followers, following, isFollowing, followUser, unfollowUser } = useFollowSystem(profileId);
  const { postCount } = usePosts(profileId);

  useEffect(() => {
    if (isCurrentUser ? user?.id : profileId) {
      fetchProfile();
    }
  }, [profileId, isCurrentUser, user?.id]);

  useEffect(() => {
    if (isCurrentUser ? user?.id : profileId) {
      const timeoutId = setTimeout(() => {
        fetchProfile();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [profileId, isCurrentUser, user?.id, location.pathname]);

  const fetchProfile = async () => {
    try {
      const targetId = isCurrentUser ? user?.id : profileId;
      if (!targetId) {
        return;
      }

      setLoading(true);
      setLoadError(null);
      // Own profile: /me runs ensureProfile so a missing DB row is created on first visit.
      const profilePath = isCurrentUser
        ? import.meta.env.DEV
          ? '/api/profiles/me?sync_debug=1'
          : '/api/profiles/me'
        : `/api/profiles/${targetId}`;
      const data = await apiRequest(profilePath);
      if (import.meta.env.DEV && isCurrentUser && data?._syncDebug) {
        console.debug('[profile-sync] profile fetch', profilePath, data._syncDebug);
      }

      const profileData: Profile = {
        id: data.id,
        full_name: data.full_name || '',
        username: data.username || '',
        bio: data.bio || '',
        location: data.location || '',
        website_url: data.website_url || '',
        avatar_url: data.avatar_url || '',
        user_type: data.user_type || 'buyer',
        verified: data.verified || false,
        rating: data.rating || 0,
        total_reviews: data.total_reviews || 0,
        years_experience: data.years_experience || 0,
        created_at: data.created_at || new Date().toISOString(),
        last_active_at: data.last_active_at ?? null,
        typical_response_time: data.typical_response_time ?? null,
        verified_since: data.verified_since ?? null,
      };

      setProfile(profileData);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const status =
        typeof err.status === 'number'
          ? err.status
          : Number(err.message?.match(/failed (\d+)/)?.[1]) || undefined;

      let kind: 'not_found' | 'unavailable' | 'auth' = 'unavailable';
      let message = 'Could not load this profile. Please try again.';

      if (status === 404) {
        kind = 'not_found';
        message = 'Profile not found';
      } else if (status === 401 || status === 403) {
        kind = 'auth';
        message = 'Sign in to view this profile.';
      } else if (status && status >= 500) {
        message = 'Profile is temporarily unavailable. Please try again shortly.';
      }

      if (import.meta.env.DEV) {
        console.error('[profile] fetch failed:', { status, message: err.message });
      } else {
        console.warn('[profile] fetch failed:', status || 'NETWORK');
      }

      setProfile(null);
      setLoadError({ kind, status, message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    const label = profile.username?.trim()
      ? `@${profile.username.trim()}`
      : profile.full_name?.trim() || 'Profile';
    document.title = `${label} — Pet Adoption Web Services`;
  }, [profile]);

  const handleFollowToggle = async () => {
    if (!profileId) return;
    if (!user) {
      toast({
        title: 'Sign in to follow',
        description: 'Create an account or sign in to follow people.',
      });
      navigate('/greeting', { state: { from: location.pathname } });
      return;
    }

    if (isFollowing) {
      await unfollowUser(profileId);
    } else {
      await followUser(profileId);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to send messages',
        variant: 'destructive',
      });
      navigate('/greeting');
      return;
    }
    if (!profileId || profileId === user.id) return;

    setMessagingLoading(true);
    try {
      const response = await apiRequest('/api/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { targetUserId: profileId },
      });
      const conversationId = response?.conversationId || response?.id;
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      } else {
        toast({
          title: 'Messaging unavailable',
          description: `Messaging unavailable (${response.code || 'UNKNOWN'})`,
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('[message from profile]', err);
      let code = 'UNKNOWN';
      try {
        const msg = err instanceof Error ? err.message : String(err);
        const jsonMatch = msg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          code = parsed.code || code;
        }
      } catch {
        /* ignore */
      }
      toast({
        title: 'Messaging unavailable',
        description: `Messaging unavailable (${code})`,
        variant: 'destructive',
      });
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('guestMode');
      navigate('/');
      toast({
        title: 'Signed out',
        description: 'You have been signed out.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Could not sign out. Try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading || ((isCurrentUser && !user?.id) || (!isCurrentUser && !profileId))) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100/90 to-slate-50/80 dark:from-slate-950 dark:to-slate-950">
        <div className="mx-auto w-full max-w-xl px-3 py-4 md:max-w-2xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          {loadError?.message ?? 'Profile not found'}
        </p>
        {loadError?.status != null && (
          <p className="text-xs font-mono text-slate-400">HTTP {loadError.status}</p>
        )}
        {loadError?.kind !== 'not_found' && (
          <Button type="button" variant="outline" onClick={() => fetchProfile()}>
            Retry
          </Button>
        )}
        {loadError?.kind === 'auth' && (
          <Button type="button" onClick={() => navigate('/greeting')}>
            Sign in
          </Button>
        )}
      </div>
    );
  }

  if (showSettings && isCurrentUser) {
    return (
      <ProfileSettings profile={profile} onBack={() => setShowSettings(false)} onUpdate={fetchProfile} />
    );
  }

  const completeness = getProfileCompleteness(profile);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/50 to-slate-100/80 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
    <div className="mx-auto w-full max-w-xl space-y-3 px-3 py-3 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:space-y-4 sm:px-4 md:max-w-2xl">
      {!user && !isCurrentUser && (
        <div
          className="mb-4 rounded-xl border border-blue-200/90 bg-blue-50/95 px-4 py-3 text-sm text-blue-950 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-50"
          role="status"
        >
          <Link to="/greeting" className="font-semibold underline underline-offset-2">
            Sign in
          </Link>{' '}
          to follow, send messages, and manage your own profile. You can still browse this public profile.
        </div>
      )}
      {isCurrentUser && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-3 overflow-hidden rounded-xl border px-3.5 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70 ${
            completeness.percent >= 100
              ? 'border-emerald-200/90 bg-emerald-50/90 shadow-emerald-500/10 dark:border-emerald-900/50 dark:bg-emerald-950/30'
              : 'border-slate-200/90 bg-white/90 dark:bg-slate-900/60'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Profile strength</span>
                <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">{completeness.percent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-700">
                <motion.div
                  className={`h-full rounded-full ${completeness.percent >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness.percent}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{completeness.hint}</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-16px_rgba(15,23,42,0.14)] ring-1 ring-inset ring-white/50 dark:border-slate-800/80 dark:bg-slate-950 dark:shadow-[0_12px_48px_-20px_rgba(0,0,0,0.5)] dark:ring-slate-800/40">
        <ProfileHeroBanner />
        {isCurrentUser && (
          <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-white/30 bg-white/95 text-slate-800 shadow-md backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100"
                  aria-label="Profile menu"
                >
                  <Cog className="h-5 w-5" strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex cursor-pointer items-center">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/privacy-settings" className="flex cursor-pointer items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help-center" className="flex cursor-pointer items-center">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help center
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Sign out — a plain, safe action; kept visually separate from the
                    destructive Delete account below so they are never confused. */}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/account-settings"
                    className="flex cursor-pointer items-center text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <CardContent className="relative z-0 bg-white px-5 pb-6 pt-0 dark:bg-slate-950 sm:px-6">
          <div className="relative z-10 -mt-16 flex items-end gap-4 md:-mt-20 md:gap-5">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="shrink-0">
              {isCurrentUser ? (
                <div className={`group ${PROFILE_AVATAR_SHELL}`}>
                  <div
                    className="absolute inset-0 z-[1] cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload or change profile photo"
                    onClick={() => avatarPhotoRef.current?.openFilePicker()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        avatarPhotoRef.current?.openFilePicker();
                      }
                    }}
                  />
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="pointer-events-none relative z-0 h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="pointer-events-none relative z-0 flex h-full w-full select-none items-center justify-center text-2xl font-semibold tracking-tight text-slate-500 sm:text-3xl dark:text-slate-400"
                      aria-hidden
                    >
                      {profileInitials(profile.full_name, profile.username)}
                    </span>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 z-[2] flex items-end justify-center rounded-full bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition duration-200 group-hover:opacity-100"
                    aria-hidden
                  >
                    <span className="mb-4 max-w-[90%] truncate px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white drop-shadow-sm">
                      Change photo
                    </span>
                  </div>
                  {avatarUploading && (
                    <div
                      className="absolute inset-0 z-[15] flex items-center justify-center rounded-full bg-slate-950/45 backdrop-blur-[1px]"
                      role="status"
                      aria-live="polite"
                      aria-label="Uploading profile photo"
                    >
                      <Loader2 className="h-9 w-9 animate-spin text-white" aria-hidden />
                    </div>
                  )}
                  <ProfileAvatarPhotoControls
                    ref={avatarPhotoRef}
                    variant="picker-only"
                    onUploadingChange={setAvatarUploading}
                    onSuccess={(url) => {
                      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
                      void fetchProfile();
                      void refreshProfile();
                    }}
                  />
                </div>
              ) : (
                <div className={PROFILE_AVATAR_SHELL}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span
                      className="flex h-full w-full select-none items-center justify-center text-2xl font-semibold tracking-tight text-slate-500 sm:text-3xl dark:text-slate-400"
                      aria-hidden
                    >
                      {profileInitials(profile.full_name, profile.username)}
                    </span>
                  )}
                </div>
              )}

            </motion.div>
            <ProfileStatRow
              className="min-w-0 flex-1 pb-0.5"
              posts={postCount}
              followers={followers.length}
              following={following.length}
              onPostsClick={() => setProfileTab('posts')}
              onFollowersClick={() => setShowFollowersModal(true)}
              onFollowingClick={() => setShowFollowingModal(true)}
            />
          </div>

          <motion.div
            className="relative z-10 mt-4 space-y-2 md:mt-5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
          >
<div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
                  {profile.full_name || 'Member'}
                </h1>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                    Verified
                  </span>
                )}
                {!profile.verified && profile.user_type === 'breeder' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                    <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
                    Breeder
                  </span>
                )}
              </div>

              {profile.username && (
                <p className="mt-0.5 text-sm font-medium tracking-normal text-slate-500 dark:text-slate-400">@{profile.username}</p>
              )}

              <p className="text-xs leading-relaxed text-slate-500/90 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 opacity-70" aria-hidden />
                  {userTypeLabel(profile.user_type)}
                </span>
                {!profile.verified && (
                  <>
                    <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 opacity-70" aria-hidden />
                      Joined {new Date(profile.created_at).getFullYear()}
                    </span>
                  </>
                )}
              </p>

              {(formatLastActiveLabel(profile.last_active_at) ||
                profile.typical_response_time ||
                (profile.verified && formatVerifiedSinceMonthYear(profile.verified_since))) && (
                <div
                  className="flex flex-wrap justify-start gap-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400 sm:justify-start"
                  aria-label="Trust and activity"
                >
                  {formatLastActiveLabel(profile.last_active_at) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
                      <Clock className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
                      {formatLastActiveLabel(profile.last_active_at)}
                    </span>
                  )}
                  {profile.typical_response_time && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400"
                      title="Typical time to reply to messages (estimate)."
                    >
                      <MessageCircle className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Reply:</span>{' '}
                      {profile.typical_response_time}
                    </span>
                  )}
                  {profile.verified && formatVerifiedSinceMonthYear(profile.verified_since) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50/90 px-2.5 py-1 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-100">
                      <BadgeCheck className="h-3 w-3 shrink-0" aria-hidden />
                      Verified since {formatVerifiedSinceMonthYear(profile.verified_since)}
                    </span>
                  )}
                </div>
              )}

              <div className="mx-auto max-w-lg pt-1 sm:mx-0">
                {profile.bio ? (
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{profile.bio}</p>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-200/90 px-3 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {isCurrentUser
                      ? 'Add a bio in Edit profile — tell people about you and your pups.'
                      : 'No bio yet.'}
                  </p>
                )}
              </div>

              {(profile.location || profile.website_url) && (
                <div className="flex flex-wrap gap-2 text-sm">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/95 px-3 py-1 dark:bg-slate-800/90">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
                      {profile.location}
                    </span>
                  )}
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/95 px-3 py-1 font-medium text-blue-600 hover:underline dark:bg-slate-800/90"
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Website
                    </a>
                  )}
                </div>
              )}

              <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!isCurrentUser && (
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Button
                      size="default"
                      onClick={handleFollowToggle}
                      variant={isFollowing ? 'outline' : 'default'}
                      className="h-10 min-w-[7.5rem] flex-1 rounded-xl font-semibold shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] sm:flex-initial"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      size="default"
                      variant="outline"
                      disabled={messagingLoading}
                      onClick={handleMessage}
                      className="h-10 min-w-[7.5rem] flex-1 rounded-xl font-semibold border-slate-200/90 shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] sm:flex-initial"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {messagingLoading ? 'Opening…' : 'Message'}
                    </Button>
                  </div>
                )}
                {isCurrentUser && (
                  <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      size="default"
                      className="h-10 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-sm shadow-blue-500/20 transition-all duration-200 hover:scale-[1.01] hover:from-blue-500 hover:to-indigo-500 hover:shadow-md active:scale-[0.99]"
                      onClick={() => setShowSettings(true)}
                    >
                      Edit profile
                    </Button>
                    <BugReportButton
                      variant="outline"
                      size="md"
                      className="h-10 flex-1 rounded-xl border-slate-200/90 bg-white/90 font-medium shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80"
                      iconClassName="text-blue-600"
                    />
                  </div>
                )}
              </div>
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>

      {!isCurrentUser && profileId && (
        <div className="space-y-4">
          <TrustSafetyProfileSection
            verified={profile.verified}
            rating={profile.rating}
            totalReviews={profile.total_reviews}
            userType={profile.user_type}
          />
          <UserTrustActions
            targetUserId={profileId}
            targetLabel={profile.full_name?.trim() || profile.username || 'User'}
          />
        </div>
      )}

      {profileId && (
        <Tabs value={profileTab} onValueChange={setProfileTab} className="relative z-10 w-full">
          <TabsList className="sticky top-0 z-10 mb-0 grid h-auto w-full grid-cols-3 gap-0 rounded-none border-b border-slate-200/90 bg-white/85 p-0 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
            <TabsTrigger
              value="posts"
              className="gap-1.5 rounded-none border-b-2 border-transparent py-3 text-sm font-semibold text-slate-600 transition-all duration-200 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none dark:text-slate-400 dark:data-[state=active]:text-blue-400"
            >
              <Grid3X3 className="h-4 w-4 opacity-80" aria-hidden />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="gap-1.5 rounded-none border-b-2 border-transparent py-3 text-sm font-semibold text-slate-600 transition-all duration-200 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none dark:text-slate-400 dark:data-[state=active]:text-blue-400"
            >
              <Briefcase className="h-4 w-4 opacity-80" aria-hidden />
              Services
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="gap-1.5 rounded-none border-b-2 border-transparent py-3 text-sm font-semibold text-slate-600 transition-all duration-200 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none dark:text-slate-400 dark:data-[state=active]:text-blue-400"
            >
              <Star className="h-4 w-4 opacity-80" aria-hidden />
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="relative z-10 mt-3 outline-none focus-visible:ring-0">
            <ProfilePostsGrid userId={profileId} isOwnProfile={isCurrentUser} />
          </TabsContent>
          <TabsContent value="services" className="mt-3 outline-none transition-opacity duration-200">
            <div className="rounded-2xl border border-slate-200/85 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/45 sm:p-6">
              <ProfileServicesTab userId={profileId} isOwnProfile={isCurrentUser} />
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-3 outline-none transition-opacity duration-200">
            <div className="rounded-2xl border border-slate-200/85 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/45 sm:p-6">
              <ProviderReviewsSection providerId={profileId} isCurrentUser={isCurrentUser} />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {isCurrentUser && (
        <div className="mb-2 mt-4 flex justify-center px-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="min-w-[200px] border-red-200 bg-white font-semibold text-red-600 shadow-sm hover:bg-red-50/80 hover:text-red-700 dark:border-red-900/60 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      )}

      {isCurrentUser && (
        <div className="mt-12 flex flex-col items-center justify-center gap-2 pb-8 text-center">
          <div className="font-brand-wordmark inline-flex items-baseline justify-center gap-1 text-lg font-medium tracking-widest text-slate-400 opacity-90 dark:text-slate-500">
            <PawsWordmarkLockup />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Pet Adoption &amp; Web Services</p>
        </div>
      )}

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        type="followers"
        users={followers.map((f) => ({
          id: f.follower_id,
          full_name: f.follower_profile?.full_name || 'User',
          username: f.follower_profile?.username || 'user',
          avatar_url: f.follower_profile?.avatar_url || undefined,
          verified: false,
          user_type: 'buyer',
        }))}
        currentUserId={user?.id}
      />

      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        type="following"
        users={following.map((f) => ({
          id: f.following_id,
          full_name: f.following_profile?.full_name || 'User',
          username: f.following_profile?.username || 'user',
          avatar_url: f.following_profile?.avatar_url || undefined,
          verified: false,
          user_type: 'buyer',
        }))}
        currentUserId={user?.id}
      />
    </div>
    </div>
  );
};

export default UnifiedProfileView;
