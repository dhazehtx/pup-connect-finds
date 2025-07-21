import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Video, Type } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import ModernPostCreator from './ModernPostCreator';
import EditPostModal from './EditPostModal';
import FullPostModal from '@/components/post/FullPostModal';

interface User {
  id: string;
  username: string;
  name: string;
  location: string;
  avatar: string;
}

interface Post {
  id: number;
  postUuid: string;
  user: User;
  image: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
  likedBy: User[];
  comments: Comment[];
}

interface Comment {
  id: string;
  text: string;
  user: User;
  timeAgo: string;
}

const HomeFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isFullPostModalOpen, setIsFullPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Simulate fetching posts from a database or API
      // Replace this with your actual data fetching logic
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user: user_id (
            id,
            username,
            name,
            location,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Format the posts to match the Post interface
      const formattedPosts = data?.map(post => ({
        id: post.id,
        postUuid: post.id,
        user: {
          id: post.user_id,
          username: post.user?.username || 'User',
          name: post.user?.name || 'User',
          location: post.user?.location || 'Location',
          avatar: post.user?.avatar || 'https://source.unsplash.com/100x100/?portrait'
        },
        image: post.image_url || 'https://source.unsplash.com/600x400/?nature',
        likes: Math.floor(Math.random() * 100),
        isLiked: Math.random() > 0.5,
        caption: post.caption || 'A beautiful day',
        timeAgo: `${Math.floor(Math.random() * 24)} hours ago`,
        likedBy: [],
        comments: []
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setIsCreateModalOpen(false);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsFullPostModalOpen(true);
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(prevPosts => prevPosts.filter(p => p.postUuid !== postId));
      
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePostUpdate = (postId: string, newCaption: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.postUuid === postId 
          ? { ...post, caption: newCaption }
          : post
      )
    );
    setEditingPost(null);
  };

  const handlePostUpdateFromModal = (postId: string, newCaption: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId 
          ? { ...post, caption: newCaption }
          : post
      )
    );
  };

  const handlePostDeleteFromModal = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Create Post Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-6 py-3 text-left text-gray-500 transition-colors"
          >
            What's on your mind?
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Upload size={20} />
            <span>Photo</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Video size={20} />
            <span>Video</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Type size={20} />
            <span>Text</span>
          </Button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No posts yet</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostClick={handlePostClick}
              onProfileClick={handleProfileClick}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ModernPostCreator
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onUpdate={handlePostUpdate}
      />

      <FullPostModal
        post={selectedPost ? {
          id: selectedPost.id,
          user_id: selectedPost.user.id,
          caption: selectedPost.caption,
          image_url: selectedPost.image,
          video_url: null,
          created_at: new Date().toISOString(),
          profiles: {
            full_name: selectedPost.user.name,
            username: selectedPost.user.username,
            avatar_url: selectedPost.user.avatar
          }
        } : null}
        isOpen={isFullPostModalOpen}
        onClose={() => {
          setIsFullPostModalOpen(false);
          setSelectedPost(null);
        }}
        onProfileClick={handleProfileClick}
        onPostUpdate={handlePostUpdateFromModal}
        onPostDelete={handlePostDeleteFromModal}
      />
    </div>
  );
};

export default HomeFeed;
