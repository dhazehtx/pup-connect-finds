import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Briefcase,
  ChevronRight,
  HelpCircle,
  Info,
  LayoutDashboard,
  LifeBuoy,
  Shield,
  User,
} from 'lucide-react';

type Row = {
  to: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

const GROUPS: { title: string; items: Row[] }[] = [
  {
    title: 'Account',
    items: [
      {
        to: '/account-settings',
        label: 'Account & data',
        description: 'Export, theme, language, sign-in & account deletion',
        icon: User,
      },
    ],
  },
  {
    title: 'Privacy',
    items: [
      {
        to: '/privacy-settings',
        label: 'Privacy & data',
        description: 'Visibility, cookies, and your data choices',
        icon: Shield,
      },
    ],
  },
  {
    title: 'Notifications',
    items: [
      {
        to: '/settings/notifications',
        label: 'Notifications',
        description: 'Push, email, and in-app alerts',
        icon: Bell,
      },
    ],
  },
  {
    title: 'Services',
    items: [
      {
        to: '/marketplace',
        label: 'Browse pet services',
        description: 'Marketplace — find providers, Pup Box, and store',
        icon: Briefcase,
      },
      {
        to: '/services',
        label: 'Services overview',
        description: 'Platform features and provider information',
        icon: Info,
      },
      {
        to: '/dashboard/provider',
        label: 'Provider dashboard',
        description: 'Bookings and performance',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Safety',
    items: [
      {
        to: '/account-settings#settings-safety',
        label: 'Safety & blocking',
        description: 'Blocked users, help, and reporting',
        icon: LifeBuoy,
      },
      {
        to: '/help-center',
        label: 'Help center',
        description: 'Get help and report issues',
        icon: HelpCircle,
      },
    ],
  },
];

/**
 * Profile settings hub — list-style navigation to account, privacy, notifications, services, and safety.
 */
const SettingsHubPage = () => {
  // The global <Layout> (App.tsx) already provides the shared header/account menu.
  // Do NOT wrap in a second <Layout> or the header + account menu render twice.
  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your account, privacy, notifications, services, and safety.
          </p>
        </div>

        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.title} aria-labelledby={`settings-group-${group.title}`}>
              <h2
                id={`settings-group-${group.title}`}
                className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {group.title}
              </h2>
              <ul
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/80"
                role="list"
              >
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isLast = idx === group.items.length - 1;
                  return (
                    <li key={item.to + item.label}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-900/80 ${
                          !isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
                            {item.description}
                          </span>
                        </span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
          Profile photo and bio are under <span className="font-medium text-slate-600 dark:text-slate-400">Edit profile</span>{' '}
          on your profile.
        </p>
    </div>
  );
};

export default SettingsHubPage;
