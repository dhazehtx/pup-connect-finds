import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationsManager } from '@/hooks/messaging/useConversationsManager';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DEBUG = import.meta.env.DEV && false;

interface MessageInboxProps {
  onConversationSelect?: (conversation: any) => void;
  loading?: boolean;
}

/** Heuristic: show “recent activity” dot (not live presence). */
function isRecentlyActive(lastAt: string | null | undefined): boolean {
  if (!lastAt) return false;
  const t = new Date(lastAt).getTime();
  return Date.now() - t < 24 * 60 * 60 * 1000;
}

const EMPTY_PUPPY_IMG =
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop';

const MessageInbox = ({ onConversationSelect, loading }: MessageInboxProps) => {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading } = useConversationsManager();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (DEBUG) console.debug('[MESSAGE INBOX]', { user: !!user, loading, conversationsLoading });
  }, [user, loading, conversationsLoading]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = (c.other_user?.full_name || c.other_user?.username || '').toLowerCase();
      const dog = (c.listing?.dog_name || '').toLowerCase();
      const breed = (c.listing?.breed || '').toLowerCase();
      return name.includes(q) || dog.includes(q) || breed.includes(q);
    });
  }, [conversations, query]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-600">Stay connected with breeders and pet lovers</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-md">
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Sign in to view messages</h3>
            <p className="text-slate-600">Connect with breeders and other dog lovers</p>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = loading || conversationsLoading;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 rounded-xl border-slate-200 bg-white/90 pl-10 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-blue-500/30"
          aria-label="Search conversations"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-md">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <MessageCircle className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
          <span className="font-semibold text-slate-800">Conversations</span>
          {isLoading && (
            <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          )}
        </div>

        <div className="min-h-[12rem]">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-slate-500">Loading conversations…</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-5 h-36 w-36 overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-100">
                <img
                  src={EMPTY_PUPPY_IMG}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">No conversations yet</h3>
              <p className="mb-6 text-sm text-slate-600">
                Browse listings and message verified breeders when you&apos;re ready.
              </p>
              <Button asChild className="rounded-xl bg-blue-600 px-6 font-semibold hover:bg-blue-700">
                <Link to="/explore">Start exploring</Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No matches for &quot;{query}&quot;</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((conversation) => {
                const recent = isRecentlyActive(conversation.last_message_at);
                const verified = Boolean(conversation.other_user?.is_verified_breeder);

                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => onConversationSelect?.(conversation)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/50 active:bg-blue-50/80"
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-base font-semibold text-slate-700 sm:h-14 sm:w-14 sm:text-lg">
                          {conversation.other_user?.avatar_url ? (
                            <img
                              src={conversation.other_user.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>
                              {conversation.other_user?.full_name?.charAt(0) ||
                                conversation.other_user?.username?.charAt(0) ||
                                '?'}
                            </span>
                          )}
                        </div>
                        {recent && (
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
                            title="Active on PAWS recently"
                            aria-hidden
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-1">
                          <h4 className="truncate font-semibold text-slate-900">
                            {conversation.other_user?.full_name ||
                              conversation.other_user?.username ||
                              'Unknown User'}
                          </h4>
                          {verified && (
                            <span
                              className="inline-flex shrink-0 text-blue-600"
                              title="Verified breeder"
                            >
                              <BadgeCheck className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                            </span>
                          )}
                        </div>
                        {conversation.listing && (
                          <p className="truncate text-sm text-slate-600">
                            About: {conversation.listing.dog_name}
                            {conversation.listing.breed ? ` (${conversation.listing.breed})` : ''}
                          </p>
                        )}
                        {(conversation.unread_count || 0) > 0 && (
                          <span className="mt-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white">
                            {conversation.unread_count} new
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {conversation.last_message_at && (
                          <time
                            className="text-[11px] text-slate-400"
                            dateTime={conversation.last_message_at}
                          >
                            {formatDistanceToNow(new Date(conversation.last_message_at), {
                              addSuffix: true,
                            })}
                          </time>
                        )}
                        {conversation.listing?.image_url && (
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-100">
                            <img
                              src={conversation.listing.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInbox;
