import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, AtSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface CommentInputProps {
  placeholder?: string;
  onSubmit: (content: string, mentions: string[]) => void;
  onCancel?: () => void;
  buttonText?: string;
  autoFocus?: boolean;
  maxLength?: number;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder = "Write a comment...",
  onSubmit,
  onCancel,
  buttonText = "Comment",
  autoFocus = false,
  maxLength = 500
}) => {
  const [content, setContent] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentions, setMentions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Mock users for mention suggestions
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'sarahlovesdogs',
      full_name: 'Sarah Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
    },
    {
      id: '2',
      username: 'dogtrainer_mike',
      full_name: 'Mike Wilson',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      id: '3',
      username: 'bellaadventures',
      full_name: 'Emma Davis',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    },
    {
      id: '4',
      username: 'rescuepawsorg',
      full_name: 'Rescue Paws Organization',
      avatar_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150'
    },
    {
      id: '5',
      username: 'goldenfamily',
      full_name: 'Golden Family',
    }
  ];

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(value);
    
    // Check for mention trigger
    const beforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setShowMentionDropdown(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPosition - mentionMatch[0].length);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentionDropdown) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredUsers[selectedMentionIndex]) {
          selectMention(filteredUsers[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentionDropdown(false);
        break;
    }
  };

  const selectMention = (user: User) => {
    const beforeMention = content.substring(0, mentionPosition);
    const afterCursor = content.substring(textareaRef.current?.selectionStart || 0);
    const newContent = `${beforeMention}@${user.username} ${afterCursor}`;
    
    setContent(newContent);
    setShowMentionDropdown(false);
    setMentionQuery('');
    
    // Add to mentions list if not already included
    if (!mentions.includes(user.username)) {
      setMentions(prev => [...prev, user.username]);
    }
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionPosition + user.username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const removeMention = (username: string) => {
    setMentions(prev => prev.filter(m => m !== username));
    // Also remove from content
    const regex = new RegExp(`@${username}\\s?`, 'g');
    setContent(prev => prev.replace(regex, ''));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    // Extract mentions from content
    const contentMentions = Array.from(
      content.matchAll(/@(\w+)/g),
      match => match[1]
    );
    
    const allMentions = Array.from(new Set([...mentions, ...contentMentions]));
    
    onSubmit(content.trim(), allMentions);
    setContent('');
    setMentions([]);
  };

  return (
    <div className="space-y-3">
      {/* User Avatar */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-xs">
            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          {/* Mentioned Users */}
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mentions.map(username => (
                <Badge key={username} variant="secondary" className="text-xs">
                  @{username}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeMention(username)}
                  />
                </Badge>
              ))}
            </div>
          )}
          
          {/* Text Input */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[80px] resize-none"
              maxLength={maxLength}
            />
            
            {/* Mention Dropdown */}
            {showMentionDropdown && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => selectMention(user)}
                    className={`w-full flex items-center gap-2 p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      index === selectedMentionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user.full_name}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Character Count */}
          <div className="text-xs text-muted-foreground text-right">
            {content.length}/{maxLength}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={!content.trim()}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;