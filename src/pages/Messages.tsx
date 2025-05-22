
import React, { useState } from 'react';
import { Search, Phone, Video, MoreHorizontal } from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);

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
    },
    {
      id: 4,
      sender: "them",
      message: "The puppies will be ready for pickup next week!",
      time: "2:30 PM"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex h-full bg-white rounded-xl overflow-hidden border border-amber-100">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800 mb-3">Messages</h1>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === conv.id ? 'bg-amber-50 border-r-2 border-amber-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{conv.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={conversations.find(c => c.id === selectedChat)?.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-gray-800">
                  {conversations.find(c => c.id === selectedChat)?.name}
                </h2>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Video size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreHorizontal size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'me' ? 'text-amber-100' : 'text-gray-500'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
