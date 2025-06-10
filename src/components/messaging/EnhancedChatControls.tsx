
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Mic, 
  Video, 
  FileText, 
  Shield, 
  Search,
  MoreVertical,
  Phone
} from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import MessageTemplates from './MessageTemplates';
import EncryptionManager from './EncryptionManager';
import WebRTCVideoCall from './WebRTCVideoCall';
import AdvancedMessageSearch from './AdvancedMessageSearch';

interface EnhancedChatControlsProps {
  conversationId: string;
  otherUserId: string;
  isEncrypted: boolean;
  onToggleEncryption: (enabled: boolean) => void;
  onTemplateSelect: (content: string) => void;
  onVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
  messages: any[];
}

const EnhancedChatControls = ({
  conversationId,
  otherUserId,
  isEncrypted,
  onToggleEncryption,
  onTemplateSelect,
  onVoiceMessage,
  onSearchResults,
  onClearSearch,
  messages
}: EnhancedChatControlsProps) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    onVoiceMessage(audioBlob, duration);
    setShowVoiceRecorder(false);
  };

  const handleTemplateSelect = (content: string) => {
    onTemplateSelect(content);
    setShowTemplates(false);
  };

  const handleCallStart = () => {
    setIsCallActive(true);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setShowVideoCall(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t bg-background">
      {/* Voice Recording */}
      <Popover open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Mic className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </PopoverContent>
      </Popover>

      {/* Video Call */}
      <Popover open={showVideoCall} onOpenChange={setShowVideoCall}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Video className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <WebRTCVideoCall
            conversationId={conversationId}
            otherUserId={otherUserId}
            isCallActive={isCallActive}
            onCallStart={handleCallStart}
            onEndCall={handleCallEnd}
          />
        </PopoverContent>
      </Popover>

      {/* Message Templates */}
      <Popover open={showTemplates} onOpenChange={setShowTemplates}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-96 overflow-y-auto">
          <MessageTemplates
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        </PopoverContent>
      </Popover>

      {/* Advanced Search */}
      <Popover open={showSearch} onOpenChange={setShowSearch}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <AdvancedMessageSearch
            messages={messages}
            onSearchResults={onSearchResults}
            onClearSearch={onClearSearch}
          />
        </PopoverContent>
      </Popover>

      {/* Encryption Manager */}
      <Popover open={showEncryption} onOpenChange={setShowEncryption}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Shield className={`w-4 h-4 ${isEncrypted ? 'text-green-600' : 'text-gray-400'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <EncryptionManager
            conversationId={conversationId}
            isEncrypted={isEncrypted}
            onToggleEncryption={onToggleEncryption}
          />
        </PopoverContent>
      </Popover>

      {/* More Options */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Messages
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowEncryption(true)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Encryption Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowVideoCall(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Options
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EnhancedChatControls;
