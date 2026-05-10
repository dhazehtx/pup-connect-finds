
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import FullPostModal from '@/components/post/FullPostModal';
import LoadingState from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { Images, Grid3X3 } from 'lucide-react';

interface ProfilePostsGridProps {
  userId: string;
  /** Affects empty-state caption */
  isOwnProfile?: boolean;
  /** Private account preview — hide grid and avoid fetching */
  locked?: boolean;
}

const ProfilePostsGrid = ({ userId, isOwnProfile = false, locked = false }: ProfilePostsGridProps) => {
  const { posts, loading, fetchPosts } = usePosts(userId, { enabled: !locked });
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    fetchPosts();
  };

  const handlePostDelete = (postId: string) => {
    fetchPosts();
    handleCloseModal();
  };

  const handleProfileClick = (clickedUserId: string) => {
    navigate(`/profile/${clickedUserId}`);
  };

  if (locked) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/90 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Grid3X3 className="h-7 w-7 opacity-70" strokeWidth={1.5} aria-hidden />
        </div>
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Posts are hidden</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          Follow this account to see their photos and updates.
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Loading posts..." />;
  }

  if (posts.length === 0) {
    if (!isOwnProfile) {
      return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-100/90 to-slate-50/95 px-6 py-16 text-center dark:border-slate-700 dark:from-slate-900/80 dark:to-slate-950/90">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.08]"
            aria-hidden
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 31%, rgb(148 163 184) 31%, rgb(148 163 184) 32%)`,
            }}
          />
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/90 dark:text-slate-400 dark:ring-slate-600">
            <Grid3X3 className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="relative text-base font-semibold text-slate-800 dark:text-slate-100">No posts yet</p>
          <p className="relative mt-2 max-w-sm mx-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            When they share photos or updates, they&apos;ll appear here.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/80 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700">
          <Images className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">No posts yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Share photos of your pups — your posts will appear here.
        </p>
        <Button asChild className="mt-8 w-full max-w-xs font-semibold shadow-sm transition-all duration-200" size="lg">
          <Link to="/post">Create a post</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80 transition-all duration-200 hover:opacity-95 hover:ring-2 hover:ring-blue-400/40 dark:bg-slate-800 dark:ring-slate-700"
            onClick={() => handlePostClick(post)}
          >
            {post.image_url || post.video_url ? (
              <img
                src={post.image_url || post.video_url || ''}
                alt=""
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-slate-500">
                {post.caption?.slice(0, 80) || 'Post'}
              </div>
            )}
          </button>
        ))}
      </div>

      {showModal && selectedPost && (
        <FullPostModal
          post={selectedPost}
          isOpen={showModal}
          onClose={handleCloseModal}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
          onProfileClick={handleProfileClick}
        />
      )}
    </>
  );
};

export default ProfilePostsGrid;
