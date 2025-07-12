
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { useNavigate } from 'react-router-dom';

const MessageInbox = () => {
  const { user } = useAuth();
  const { conversations, loading } = useMessaging();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with other pet lovers</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view messages</h3>
            <p className="text-gray-600 mb-4">Connect with breeders and other dog lovers</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with other pet lovers</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading messages...</h3>
            <p className="text-gray-600">Please wait while we fetch your conversations</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with other pet lovers</p>
        </div>
        <Button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Search size={16} />
          Browse Listings
        </Button>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-4">
              Start browsing puppies to connect with breeders and other dog lovers
            </p>
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Start Browsing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversations ({conversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/chat/${conversation.id}`)}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {conversation.other_user?.avatar_url ? (
                    <img
                      src={conversation.other_user.avatar_url}
                      alt={conversation.other_user.full_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium">
                      {(conversation.other_user?.full_name || 'User').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">
                    {conversation.other_user?.full_name || 'Unknown User'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {conversation.listing?.dog_name 
                      ? `About ${conversation.listing.dog_name} (${conversation.listing.breed})`
                      : 'General conversation'
                    }
                  </p>
                  {conversation.last_message_at && (
                    <p className="text-xs text-gray-400">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessageInbox;
