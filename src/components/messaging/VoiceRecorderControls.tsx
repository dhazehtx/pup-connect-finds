
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderControlsProps {
  isRecording: boolean;
  audioBlob: Blob | null;
  uploading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendVoiceMessage: () => void;
  onCancel: () => void;
}

const VoiceRecorderControls = ({
  isRecording,
  audioBlob,
  uploading,
  onStartRecording,
  onStopRecording,
  onSendVoiceMessage,
  onCancel
}: VoiceRecorderControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      {!audioBlob && (
        <Button
          onClick={isRecording ? onStopRecording : onStartRecording}
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "rounded-full w-16 h-16",
            isRecording && "animate-pulse"
          )}
        >
          {isRecording ? <Square size={24} /> : <Mic size={24} />}
        </Button>
      )}

      {audioBlob && (
        <>
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <X size={20} />
          </Button>
          <Button
            onClick={onSendVoiceMessage}
            disabled={uploading}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Send size={20} />
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorderControls;
