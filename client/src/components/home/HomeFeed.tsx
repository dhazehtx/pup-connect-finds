
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import FullPostModal from '@/components/post/FullPostModal';
import { apiRequest, isAbortError } from '@/lib/api';
import { AlertTriangle, RotateCcw } from 'lucide-react';

const DEBUG = import.meta.env.DEV && false;

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
}

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  likedBy?: User[];
}

interface Post {
  id: string;
  postUuid: string;
  user: {
    id: string;
    username: string;
    name: string;
    location: string;
    avatar: string;
  };
  image: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
  likedBy: User[];
  comments: Comment[];
}

/** Dev-only sample posts — never shown in production builds. */
const DEV_MOCK_POSTS: Post[] = import.meta.env.DEV
  ? [
      {
        id: 'dev-mock-1',
        postUuid: 'dev-mock-1',
        user: {
          id: 'dev-user-1',
          username: 'dev_sample',
          name: 'Dev Sample',
          location: 'Local',
          avatar: '/logo/paws-logo.png',
        },
        image: '/logo/paws-logo.png',
        likes: 0,
        isLiked: false,
        caption: 'Dev-only placeholder post',
        timeAgo: 'just now',
        likedBy: [],
        comments: [],
      },
    ]
  : [];

function formatFeedError(err: unknown): { message: string; status?: number; code?: string } {
  const e = err as { message?: string; status?: number; code?: string };
  const status =
    typeof e?.status === 'number'
      ? e.status
      : Number(e?.message?.match(/failed (\d+)/)?.[1]) || undefined;
  const code = e?.code;
  let message = 'Could not load your feed. Please try again.';
  if (status === 401) {
    message = 'Your session expired. Sign in again to see your feed.';
  } else if (status === 503) {
    message = 'The service is temporarily unavailable. Please try again in a moment.';
  } else if (status && status >= 500) {
    message = 'Something went wrong loading posts. Please try again shortly.';
  }
  if (import.meta.env.DEV) {
    console.error('[HOME FEED] Feed fetch failed:', { status, code, raw: e?.message });
  } else {
    console.warn('[HOME FEED] Feed fetch failed:', status || 'NETWORK', code || '');
  }
  return { message, status, code };
}

const HomeFeed = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMeta, setErrorMeta] = useState<{ status?: number; code?: string } | null>(null);
  const [fetchGeneration, setFetchGeneration] = useState(0);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPostModal, setShowFullPostModal] = useState(false);

  const loadFeed = useCallback(
    (signal?: AbortSignal) => {
      if (authLoading) return;
      if (!user?.id) {
        setLoading(false);
        setError('Sign in to see posts from people you follow.');
        setErrorMeta(null);
        setPosts([]);
        return;
      }

      setLoading(true);
      setError(null);
      setErrorMeta(null);

      apiRequest('posts/home-feed', { signal })
        .then((data) => {
          if (signal?.aborted) return;
          if (DEBUG) console.debug('[HOME FEED] Posts fetch success, count:', data?.length || 0);
          setPosts(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (signal?.aborted || isAbortError(err)) return;
          const formatted = formatFeedError(err);
          setError(formatted.message);
          setErrorMeta({ status: formatted.status, code: formatted.code });
          setPosts(import.meta.env.DEV ? DEV_MOCK_POSTS : []);
        })
        .finally(() => {
          if (signal?.aborted) return;
          setLoading(false);
        });
    },
    [user?.id, authLoading],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadFeed(controller.signal);
    return () => controller.abort();
  }, [loadFeed, fetchGeneration]);

  const displayPosts = React.useMemo(() => {
    if (!posts?.length) return [];

    if (posts[0]?.postUuid) {
      return posts as Post[];
    }

    return posts.map((post) => ({
      id: post.id,
      postUuid: post.id,
      user: {
        id: post.user_id,
        username: post.profiles?.username || 'User',
        name: post.profiles?.full_name || 'Unknown User',
        location: 'Location',
        avatar: post.profiles?.avatar_url || '/logo/paws-logo.png',
      },
      image: post.image_url || post.thumb_url || '/logo/paws-logo.png',
      likes: post.likes_count ?? 0,
      isLiked: false,
      caption: post.caption || post.content || '',
      timeAgo: post.created_at ? new Date(post.created_at).toLocaleDateString() : '',
      likedBy: [],
      comments: [],
    }));
  }, [posts]);

  const handleRetry = () => setFetchGeneration((g) => g + 1);

  const handleLike = async (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId || post.postUuid === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? (post.likes ?? 1) - 1 : (post.likes ?? 0) + 1,
            }
          : post,
      ),
    );
  };

  const handleProfileClick = (userId: string) => {
    if (DEBUG) console.debug(`Navigating to profile: ${userId}`);
  };

  const handleShare = () => {};
  const handleBookmark = () => {};
  const handleComment = () => {};
  const handleShowLikes = () => {};

  const handleCommentsUpdate =
    (postId: string) => (updateFn: (comments: Comment[]) => Comment[]) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId || post.postUuid === postId
            ? { ...post, comments: updateFn(post.comments || []) }
            : post,
        ),
      );
    };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.postUuid === postId ? { ...post, caption: newCaption } : post)),
    );
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.postUuid !== postId));
    setShowFullPostModal(false);
    setSelectedPost(null);
  };

  const handleImageClick = (post: Post) => {
    setSelectedPost({
      id: post.postUuid,
      user_id: post.user.id,
      caption: post.caption,
      image_url: post.image,
      video_url: null,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: post.user.name,
        username: post.user.username,
        avatar_url: post.user.avatar,
      },
    });
    setShowFullPostModal(true);
  };

  const postListProps = {
    onLike: handleLike,
    onProfileClick: handleProfileClick,
    onShare: handleShare,
    onBookmark: handleBookmark,
    onComment: handleComment,
    onShowLikes: handleShowLikes,
    onCommentsUpdate: handleCommentsUpdate,
    onImageClick: handleImageClick,
    onPostUpdate: handlePostUpdate,
    onPostDelete: handlePostDelete,
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <FeedSpinner label="Authenticating..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <FeedSpinner label="Loading Home Feed..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FeedErrorCard
          message={error}
          status={errorMeta?.status}
          code={errorMeta?.code}
          onRetry={handleRetry}
        />
        {import.meta.env.DEV && displayPosts.length > 0 && (
          <>
            <p className="mt-4 text-xs text-amber-700">Dev-only sample posts after error:</p>
            <FeedPostList posts={displayPosts} {...postListProps} />
          </>
        )}
      </div>
    );
  }

  return (
    <FeedPostList
      posts={displayPosts}
      emptyTitle={user ? 'No posts in your feed yet' : 'Sign in to see your feed'}
      emptySubtitle={
        user
          ? 'Follow other members to see their posts here.'
          : 'Posts from people you follow will appear here.'
      }
      showModal={showFullPostModal}
      selectedPost={selectedPost}
      onCloseModal={() => {
        setShowFullPostModal(false);
        setSelectedPost(null);
      }}
      {...postListProps}
    />
  );
};

function FeedSpinner({ label }: { label: string }) {
  return (
    <>
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
      <span className="ml-2 text-gray-600">{label}</span>
    </>
  );
}

function FeedErrorCard({
  message,
  status,
  code,
  onRetry,
}: {
  message: string;
  status?: number;
  code?: string;
  onRetry: () => void;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto text-center">
      <AlertTriangle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Feed unavailable</h3>
      <p className="text-blue-700 mb-2">{message}</p>
      {(status || code) && (
        <p className="text-blue-600/80 text-xs mb-4 font-mono">
          {[status && `HTTP ${status}`, code].filter(Boolean).join(' · ')}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
        <Button
          onClick={() => {
            window.location.href = '/explore';
          }}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Explore
        </Button>
      </div>
    </div>
  );
}

function FeedPostList({
  posts,
  emptyTitle = 'No posts yet',
  emptySubtitle = 'Be the first to share something!',
  showModal,
  selectedPost,
  onCloseModal,
  onLike,
  onProfileClick,
  onShare,
  onBookmark,
  onComment,
  onShowLikes,
  onCommentsUpdate,
  onImageClick,
  onPostUpdate,
  onPostDelete,
}: {
  posts: Post[];
  emptyTitle?: string;
  emptySubtitle?: string;
  showModal?: boolean;
  selectedPost?: any;
  onCloseModal?: () => void;
  onLike: (id: string) => void;
  onProfileClick: (id: string) => void;
  onShare: (id: string) => void;
  onBookmark: (id: string) => void;
  onComment: (id: string) => void;
  onShowLikes: (id: string) => void;
  onCommentsUpdate: (postId: string) => (fn: (c: Comment[]) => Comment[]) => void;
  onImageClick: (post: Post) => void;
  onPostUpdate: (id: string, caption: string) => void;
  onPostDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6 py-4">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">{emptyTitle}</div>
          <div className="text-gray-400">{emptySubtitle}</div>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onProfileClick={onProfileClick}
            onShare={onShare}
            onBookmark={onBookmark}
            onComment={onComment}
            onShowLikes={onShowLikes}
            onCommentsUpdate={onCommentsUpdate(post.id)}
            onImageClick={() => onImageClick(post)}
            onPostUpdate={onPostUpdate}
            onPostDelete={onPostDelete}
          />
        ))
      )}

      {showModal && selectedPost && onCloseModal && (
        <FullPostModal
          post={selectedPost}
          isOpen={showModal}
          onClose={onCloseModal}
          onProfileClick={onProfileClick}
          onPostUpdate={onPostUpdate}
          onPostDelete={onPostDelete}
        />
      )}
    </div>
  );
}

export default HomeFeed;
