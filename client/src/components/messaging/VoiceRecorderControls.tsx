
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, X, Loader2 } from 'lucide-react';

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
    <div className="flex items-center justify-center gap-3">
      {!isRecording && !audioBlob && (
        <Button
          onClick={onStartRecording}
          size="lg"
          className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
        >
          <Mic size={24} />
        </Button>
      )}

      {isRecording && (
        <Button
          onClick={onStopRecording}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <Square size={24} />
        </Button>
      )}

      {audioBlob && (
        <>
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12"
            disabled={uploading}
          >
            <X size={20} />
          </Button>
          <Button
            onClick={onSendVoiceMessage}
            disabled={uploading}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorderControls;
