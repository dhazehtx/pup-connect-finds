
import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Golden Paws Kennel",
      lastMessage: "The puppies will be ready for pickup next week!",
      time: "2:30 PM",
      unread: 2,
      avatar: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=50&h=50&fit=crop&crop=face",
      online: true
    },
    {
      id: 2,
      name: "Sarah Chen",
      lastMessage: "Thank you for the health certificates",
      time: "11:45 AM",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
      online: false
    },
    {
      id: 3,
      name: "Noble German Shepherds",
      lastMessage: "Would you like to schedule a visit?",
      time: "Yesterday",
      unread: 1,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      online: true
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "them",
      message: "Hi! I saw your interest in our Golden Retriever puppies. Are you still looking?",
      time: "2:15 PM"
    },
    {
      id: 2,
      sender: "me", 
      message: "Yes, absolutely! Could you tell me more about the available puppies?",
      time: "2:18 PM"
    },
    {
      id: 3,
      sender: "them",
      message: "We have 3 beautiful puppies available. All are 8 weeks old and have their first shots.",
      time: "2:20 PM"
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  const currentConversation = conversations.find(c => c.id === selectedChat);

  if (!selectedChat) {
    return (
      <div className="max-w-md mx-auto h-full">
        <div className="bg-white h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">Messages</h1>
            <div className="mt-3 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className="p-3 border-b border-blue-100 cursor-pointer hover:bg-blue-50 active:bg-blue-100"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{conv.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-white">
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => setSelectedChat(null)} className="text-blue-500">
          ←
        </button>
        <img
          src={currentConversation?.avatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full"
        />
        <h2 className="font-medium">{currentConversation?.name}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-0 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full ${
              newMessage.trim()
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
