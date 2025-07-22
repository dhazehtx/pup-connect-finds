
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mic } from 'lucide-react';
import VoiceRecorder from '../VoiceRecorder';

interface VoiceControlProps {
  onVoiceMessage: (audioBlob: Blob, duration: number) => void;
}

const VoiceControl = ({ onVoiceMessage }: VoiceControlProps) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    onVoiceMessage(audioBlob, duration);
    setShowVoiceRecorder(false);
  };

  const handleSendVoiceMessage = (audioUrl: string, duration: number) => {
    fetch(audioUrl)
      .then(response => response.blob())
      .then(blob => handleVoiceRecording(blob, duration));
  };

  return (
    <Popover open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Mic className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <VoiceRecorder
          onSendVoiceMessage={handleSendVoiceMessage}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default VoiceControl;
