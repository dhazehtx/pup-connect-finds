import React, { useState } from 'react';
import { Search, ArrowLeft, Phone, Video, MoreHorizontal, Send, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Quick message templates
  const quickMessages = [
    "Is this puppy still available?",
    "Can I schedule a visit to meet the puppy?",
    "What health certificates do you have?",
    "Has the puppy been vaccinated?",
    "What is included in the price?",
    "Can you provide more photos/videos?",
    "What is the puppy's temperament like?",
    "Are the parents on site?",
    "What is your pickup process?",
    "Do you offer a health guarantee?"
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ];

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
    },
    {
      id: 4,
      name: "Bella's Breeder",
      lastMessage: "Here are some new photos!",
      time: "Yesterday",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=50&h=50&fit=crop&crop=face",
      online: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "them",
      message: "Hi! I saw your interest in our Golden Retriever puppies. Are you still looking?",
      time: "2:15 PM",
      translated: false,
      originalMessage: ""
    },
    {
      id: 2,
      sender: "me",
      message: "Yes, absolutely! Could you tell me more about the available puppies?",
      time: "2:18 PM",
      translated: false,
      originalMessage: ""
    },
    {
      id: 3,
      sender: "them",
      message: "We have 3 beautiful puppies available. All are 8 weeks old and have their first shots.",
      time: "2:20 PM",
      translated: false,
      originalMessage: ""
    },
    {
      id: 4,
      sender: "them",
      message: "The puppies will be ready for pickup next week!",
      time: "2:30 PM",
      translated: false,
      originalMessage: ""
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message
      console.log('Sending message:', newMessage);
      setNewMessage('');
      setShowQuickMessages(false);
    }
  };

  const handleQuickMessage = (message: string) => {
    setNewMessage(message);
    setShowQuickMessages(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openChat = (chatId: number) => {
    setSelectedChat(chatId);
  };

  const goBackToChats = () => {
    setSelectedChat(null);
  };

  const toggleAutoTranslate = () => {
    setAutoTranslate(!autoTranslate);
    console.log('Auto-translate toggled:', !autoTranslate);
  };

  const currentConversation = conversations.find(c => c.id === selectedChat);

  // Chat List View
  if (!selectedChat) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full">
          <div className="p-6 bg-white border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => openChat(conv.id)}
                className="p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                    {conv.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">{conv.name}</h3>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
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

  // Individual Chat View
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={goBackToChats}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="relative">
                <img
                  src={currentConversation?.avatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">
                  {currentConversation?.name}
                </h2>
                <p className="text-sm text-green-500 font-medium">Active now</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleAutoTranslate}
                className={`p-3 rounded-full transition-colors ${autoTranslate ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Auto-translate messages"
              >
                <Globe size={20} />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Translation Settings */}
          {autoTranslate && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Translate to:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-xs ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'them' && (
                  <img
                    src={currentConversation?.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.sender === 'me'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  {autoTranslate && msg.sender === 'them' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 italic">
                        Translated: {msg.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Messages */}
        {showQuickMessages && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Messages</h3>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMessage(msg)}
                    className="text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickMessages(!showQuickMessages)}
              className={`p-2 rounded-full transition-colors ${showQuickMessages ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Quick messages"
            >
              <Zap size={18} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a message..."
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm pr-12"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                  newMessage.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
