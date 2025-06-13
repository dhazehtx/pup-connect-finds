
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface QuickRepliesProps {
  onQuickReply: (reply: string) => void;
}

const QuickReplies = ({ onQuickReply }: QuickRepliesProps) => {
  const quickReplies = [
    "Thanks for your interest!",
    "I'll get back to you soon.",
    "Yes, still available.",
    "Let me know if you have questions.",
    "Happy to schedule a meeting.",
    "Check out our other listings too!",
    "Price is negotiable.",
    "Puppies are ready to go home."
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1 w-full">
        <Zap className="w-3 h-3" />
        Quick Replies
      </div>
      {quickReplies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => onQuickReply(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
