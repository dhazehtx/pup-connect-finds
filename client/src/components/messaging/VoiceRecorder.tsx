
import React from 'react';
import VoiceRecorderSettings from './VoiceRecorderSettings';
import VoiceRecorderControls from './VoiceRecorderControls';
import VoiceRecorderStatus from './VoiceRecorderStatus';
import { useVoiceRecorderLogic } from '@/hooks/useVoiceRecorderLogic';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onCancel?: () => void;
}

const VoiceRecorder = ({ onSendVoiceMessage, isRecording, setIsRecording, onCancel }: VoiceRecorderProps) => {
  const {
    recordingDuration,
    audioBlob,
    audioUrl,
    showSettings,
    setShowSettings,
    compressionQuality,
    setCompressionQuality,
    selectedFormat,
    setSelectedFormat,
    enableCompression,
    setEnableCompression,
    uploading,
    supportedFormats,
    estimatedSize,
    startRecording,
    stopRecording,
    sendVoiceMessage,
    handleCancel
  } = useVoiceRecorderLogic(onSendVoiceMessage, isRecording, setIsRecording);

  const handleCancelClick = () => {
    handleCancel();
    onCancel?.();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <VoiceRecorderStatus
        recordingDuration={recordingDuration}
        estimatedSize={estimatedSize}
        isRecording={isRecording}
        uploading={uploading}
        selectedFormat={selectedFormat}
        audioUrl={audioUrl}
        audioBlob={audioBlob}
        onCancel={onCancel}
      />

      <VoiceRecorderSettings
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        compressionQuality={compressionQuality}
        setCompressionQuality={setCompressionQuality}
        enableCompression={enableCompression}
        setEnableCompression={setEnableCompression}
        supportedFormats={supportedFormats}
      />

      <VoiceRecorderControls
        isRecording={isRecording}
        audioBlob={audioBlob}
        uploading={uploading}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSendVoiceMessage={sendVoiceMessage}
        onCancel={handleCancelClick}
      />
    </div>
  );
};

export default VoiceRecorder;
