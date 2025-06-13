
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle } from 'lucide-react';

interface QuickRepliesProps {
  onQuickReply: (message: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ onQuickReply }) => {
  const quickReplies = [
    "Thank you for your interest!",
    "Yes, still available",
    "Let me check and get back to you",
    "Would you like to schedule a visit?",
    "I'll send you more photos",
    "What specific questions do you have?"
  ];

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={14} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Quick Replies</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {quickReplies.map((reply, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            onClick={() => onQuickReply(reply)}
            className="text-xs h-7"
          >
            {reply}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
