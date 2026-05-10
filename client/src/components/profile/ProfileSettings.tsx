import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Camera,
  Eye,
  Shield,
  Bell,
  Briefcase,
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileAvatarPhotoControls } from '@/components/profile/ProfileAvatarPhotoControls';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { ProfileServiceVerificationBadges } from '@/components/profile/ProfileServiceVerificationBadges';
import { profileInitials } from '@/lib/profileInitials';

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
}

interface ProfileSettingsProps {
  profile: Profile;
  onBack: () => void;
  onUpdate: () => void;
}

type AccountVisibility = 'public' | 'private';
type MessagesFrom = 'everyone' | 'followers' | 'none';
type PostVisibility = 'everyone' | 'followers' | 'only_me';

function parsePrivacyState(raw: unknown): {
  show_location_on_public_profile: boolean;
  show_website_on_public_profile: boolean;
  account_visibility: AccountVisibility;
  messages_from: MessagesFrom;
  post_visibility: PostVisibility;
} {
  let o: Record<string, unknown> = {};
  if (raw) {
    try {
      o = typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : { ...(raw as object) };
    } catch {
      o = {};
    }
  }
  const vis = (v: string) => (o[v] === true ? true : false);
  const acc = o.account_visibility === 'private' ? 'private' : 'public';
  const msg = ['everyone', 'followers', 'none'].includes(o.messages_from as string)
    ? (o.messages_from as MessagesFrom)
    : 'everyone';
  const post = ['everyone', 'followers', 'only_me'].includes(o.post_visibility as string)
    ? (o.post_visibility as PostVisibility)
    : 'everyone';
  return {
    show_location_on_public_profile: vis('show_location_on_public_profile'),
    show_website_on_public_profile: vis('show_website_on_public_profile'),
    account_visibility: acc,
    messages_from: msg,
    post_visibility: post,
  };
}

const ProfileSettings = ({ profile, onBack, onUpdate }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const { settings: notif, loading: notifLoading, saveSettings: saveNotif, updateSetting } =
    useNotificationSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website_url: profile.website_url || '',
    avatar_url: profile.avatar_url || '',
  });
  const [privacy, setPrivacy] = useState(() => parsePrivacyState(null));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest('/api/profiles/me');
        if (cancelled) return;
        setPrivacy(parsePrivacyState(data.privacy_settings));
        setFormData((prev) => ({
          ...prev,
          full_name: data.full_name ?? prev.full_name,
          username: data.username ?? prev.username,
          bio: data.bio ?? prev.bio,
          location: data.location ?? prev.location,
          website_url: data.website_url ?? prev.website_url,
          avatar_url: data.avatar_url ?? prev.avatar_url,
        }));
      } catch {
        /* keep props */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildPrivacyJson = () =>
    JSON.stringify({
      show_location_on_public_profile: privacy.show_location_on_public_profile,
      show_website_on_public_profile: privacy.show_website_on_public_profile,
      account_visibility: privacy.account_visibility,
      messages_from: privacy.messages_from,
      post_visibility: privacy.post_visibility,
    });

  const patchProfile = async () => {
    const avatarTrim = formData.avatar_url?.trim();
    await apiRequest('/api/profiles/me', {
      method: 'PATCH',
      body: {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website_url: formData.website_url?.trim() ? formData.website_url.trim() : null,
        ...(avatarTrim ? { avatar_url: avatarTrim } : { avatar_url: null }),
        privacy_settings: buildPrivacyJson(),
      },
    } as any);
  };

  const handleSaveNotifications = async () => {
    await saveNotif();
    onUpdate();
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await patchProfile();
      await saveNotif();
      toast({
        title: 'Saved',
        description: 'Profile, privacy, and notification preferences updated.',
      });
      await refreshProfile();
      onUpdate();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something could not be saved.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-28">
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to profile
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Account, privacy, notifications, and services — everything in one place.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-slate-100/95 p-1.5 dark:bg-slate-900/90 sm:grid-cols-4">
          <TabsTrigger value="account" className="gap-1.5 text-xs font-semibold sm:text-sm">
            <Camera className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5 text-xs font-semibold sm:text-sm">
            <Shield className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs font-semibold sm:text-sm">
            <Bell className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5 text-xs font-semibold sm:text-sm">
            <Briefcase className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-6 outline-none">
          <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5 text-blue-600" aria-hidden />
                Profile
              </CardTitle>
              <CardDescription>Name, username, bio, and photo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-slate-100 to-slate-200/90 shadow-md ring-2 ring-slate-200/80 dark:border-slate-800 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700 sm:mx-0">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full select-none items-center justify-center text-2xl font-semibold tracking-tight text-slate-500 dark:text-slate-400"
                      aria-hidden
                    >
                      {profileInitials(formData.full_name, formData.username)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <Label className="text-base">Profile picture</Label>
                    <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                      Upload a photo (crop to a square, max 5MB) or paste an image URL.
                    </p>
                    <ProfileAvatarPhotoControls
                      variant="inline"
                      onSuccess={(url) => {
                        handleInputChange('avatar_url', url);
                        void refreshProfile();
                        onUpdate();
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar_url">Image URL (optional)</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                      placeholder="https://…"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Display name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Your name"
                  className="text-base font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="username"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell people about you and your pups…"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, state or region"
                />
              </div>

              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-6 outline-none">
          <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-600" aria-hidden />
                Privacy
              </CardTitle>
              <CardDescription>Who can see your profile, message you, and view your posts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Public / private account</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Private accounts only show full details to followers. Others see a limited preview.
                </p>
                <Select
                  value={privacy.account_visibility}
                  onValueChange={(v: AccountVisibility) =>
                    setPrivacy((p) => ({ ...p, account_visibility: v }))
                  }
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public — anyone can view</SelectItem>
                    <SelectItem value="private">Private — followers only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Who can message you</Label>
                <Select
                  value={privacy.messages_from}
                  onValueChange={(v: MessagesFrom) => setPrivacy((p) => ({ ...p, messages_from: v }))}
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">People who follow you</SelectItem>
                    <SelectItem value="none">No one (DMs off)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Who can see your posts</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fine-grained feed filtering may roll out next; your choice is stored now.
                </p>
                <Select
                  value={privacy.post_visibility}
                  onValueChange={(v: PostVisibility) => setPrivacy((p) => ({ ...p, post_visibility: v }))}
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">Followers only</SelectItem>
                    <SelectItem value="only_me">Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                <p className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-200">Public profile details</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                    <div>
                      <Label htmlFor="pub-loc">Show location on profile</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">When your account is viewable.</p>
                    </div>
                    <Switch
                      id="pub-loc"
                      checked={privacy.show_location_on_public_profile}
                      onCheckedChange={(v) => setPrivacy((p) => ({ ...p, show_location_on_public_profile: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                    <div>
                      <Label htmlFor="pub-web">Show website link</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Hide until you enable this.</p>
                    </div>
                    <Switch
                      id="pub-web"
                      checked={privacy.show_website_on_public_profile}
                      onCheckedChange={(v) => setPrivacy((p) => ({ ...p, show_website_on_public_profile: v }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6 outline-none">
          <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-blue-600" aria-hidden />
                Notifications
              </CardTitle>
              <CardDescription>Choose what we notify you about (stored on your account).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: 'nm',
                  label: 'Messages',
                  hint: 'New DMs and conversation activity',
                  get: () => notif.push_messages,
                  set: (v: boolean) => {
                    updateSetting('push_messages', v);
                    updateSetting('email_messages', v);
                  },
                },
                {
                  id: 'nb',
                  label: 'Bookings',
                  hint: 'Service bookings and schedule changes',
                  get: () => notif.notify_bookings,
                  set: (v: boolean) => updateSetting('notify_bookings', v),
                },
                {
                  id: 'nr',
                  label: 'Reviews',
                  hint: 'When someone leaves you a review',
                  get: () => notif.notify_reviews,
                  set: (v: boolean) => updateSetting('notify_reviews', v),
                },
                {
                  id: 'np',
                  label: 'Promotions',
                  hint: 'Product news and offers (optional)',
                  get: () => notif.notify_promotions,
                  set: (v: boolean) => {
                    updateSetting('notify_promotions', v);
                    updateSetting('email_marketing', v);
                  },
                },
              ].map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div>
                    <Label className="text-base">{row.label}</Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.hint}</p>
                  </div>
                  <Switch
                    checked={row.get()}
                    onCheckedChange={row.set}
                    disabled={notifLoading}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={notifLoading}
                onClick={() => void handleSaveNotifications()}
              >
                Save notification preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6 space-y-6 outline-none">
          <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-blue-600" aria-hidden />
                Pet services
              </CardTitle>
              <CardDescription>Manage listings, pricing, and verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="h-auto w-full justify-start gap-3 py-4 font-semibold" asChild>
                <Link to="/services">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span className="flex flex-col items-start gap-0.5">
                    <span>Manage services</span>
                    <span className="text-xs font-normal text-slate-500">Offer walks, grooming, training &amp; more</span>
                  </span>
                  <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              </Button>
              <Button variant="outline" className="h-auto w-full justify-start gap-3 py-4 font-semibold" asChild>
                <Link to="/services/onboarding">
                  <LayoutDashboard className="h-5 w-5 text-blue-600" />
                  <span className="flex flex-col items-start gap-0.5">
                    <span>Service onboarding</span>
                    <span className="text-xs font-normal text-slate-500">Set up or extend your provider profile</span>
                  </span>
                  <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              </Button>
              <Button variant="outline" className="h-auto w-full justify-start gap-3 py-4 font-semibold" asChild>
                <Link to="/dashboard/provider">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="flex flex-col items-start gap-0.5">
                    <span>Provider dashboard</span>
                    <span className="text-xs font-normal text-slate-500">Bookings, pricing, and performance</span>
                  </span>
                  <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <ProfileServiceVerificationBadges userId={profile.id} />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 z-10 border-t border-slate-200/90 bg-slate-50/95 pb-4 pt-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <Button
          onClick={() => void handleSaveAll()}
          disabled={loading || notifLoading}
          className="w-full"
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading || notifLoading ? 'Saving…' : 'Save all changes'}
        </Button>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Saves profile, privacy, and notification preferences together.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;
