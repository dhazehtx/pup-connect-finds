
import React from 'react';
import { MessageCircle, Search, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Messages = () => {
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view messages</h3>
            <p className="text-gray-600 mb-4">Connect with breeders and buyers</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Connect with breeders and buyers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start browsing listings to connect with breeders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation to start messaging</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
