
import React, { useState } from 'react';
import VoiceControl from './controls/VoiceControl';
import VideoCallControl from './controls/VideoCallControl';
import TemplatesControl from './controls/TemplatesControl';
import SearchControl from './controls/SearchControl';
import EncryptionControl from './controls/EncryptionControl';
import MoreOptionsControl from './controls/MoreOptionsControl';

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
  const [showSearch, setShowSearch] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  const handleEncryptionClick = () => {
    setShowEncryption(true);
  };

  const handleVideoCallClick = () => {
    setShowVideoCall(true);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t bg-background">
      <VoiceControl onVoiceMessage={onVoiceMessage} />
      
      <VideoCallControl 
        conversationId={conversationId}
        otherUserId={otherUserId}
      />
      
      <TemplatesControl onTemplateSelect={onTemplateSelect} />
      
      <SearchControl
        messages={messages}
        onSearchResults={onSearchResults}
        onClearSearch={onClearSearch}
      />
      
      <EncryptionControl
        conversationId={conversationId}
        isEncrypted={isEncrypted}
        onToggleEncryption={onToggleEncryption}
      />
      
      <MoreOptionsControl
        onSearchClick={handleSearchClick}
        onEncryptionClick={handleEncryptionClick}
        onVideoCallClick={handleVideoCallClick}
      />
    </div>
  );
};

export default EnhancedChatControls;
