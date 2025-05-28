
import React, { useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/messaging/ChatInterface';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Golden Paws Kennel',
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Thanks for your message! I\'ll get back to you soon.',
      timestamp: '2m ago',
      unread: 0,
      isOnline: true
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Is the puppy still available?',
      timestamp: '1h ago',
      unread: 2,
      isOnline: false
    },
    {
      id: '3',
      name: 'Mike\'s Pet Store',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Great! When can we schedule a visit?',
      timestamp: '3h ago',
      unread: 0,
      isOnline: true
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  if (selectedChat && selectedConversation) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="h-screen">
          <ChatInterface
            recipientName={selectedConversation.name}
            recipientAvatar={selectedConversation.avatar}
            isOnline={selectedConversation.isOnline}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-black">Messages</h1>
          <Button variant="ghost" size="icon">
            <Edit size={20} className="text-black" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-black placeholder:text-black"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-gray-100">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setSelectedChat(conversation.id)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate text-black">{conversation.name}</h3>
                  <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black truncate">{conversation.lastMessage}</p>
                  {conversation.unread > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Edit size={48} className="mx-auto" />
          </div>
          <h3 className="font-medium text-black mb-1">No conversations found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start a new conversation to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
