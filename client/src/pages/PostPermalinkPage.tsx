import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FullPostModal from '@/components/post/FullPostModal';
import { apiRequest } from '@/lib/api';
import { LoadingPage } from '@/components/ui/loading';

/**
 * Deep-link target for notifications and shares: /post/:postId?comment=:commentId
 * FullPostModal reads ?comment= from window.location for highlight/scroll.
 */
const PostPermalinkPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest(`/api/posts/${postId}`);
        if (!cancelled) setPost(data ?? null);
      } catch {
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (loading) {
    return <LoadingPage message="Loading post..." />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">This post could not be found.</p>
        <button
          type="button"
          className="text-primary underline"
          onClick={() => navigate('/home')}
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <FullPostModal
      post={post}
      isOpen
      onClose={() => navigate('/home')}
      onProfileClick={(userId) => navigate(`/profile/${userId}`)}
    />
  );
};

export default PostPermalinkPage;
