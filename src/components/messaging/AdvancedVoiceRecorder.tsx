
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  Trash2, 
  Send, 
  Settings,
  Activity
} from 'lucide-react';
import { useAdvancedVoiceRecording } from '@/hooks/useAdvancedVoiceRecording';
import { useFileUpload } from '@/hooks/useFileUpload';

interface AdvancedVoiceRecorderProps {
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

const AdvancedVoiceRecorder = ({ onSendVoiceMessage, onCancel }: AdvancedVoiceRecorderProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState(80);
  
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    audioSettings,
    setAudioSettings,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    compressAudio
  } = useAdvancedVoiceRecording();

  const { uploadVoiceMessage, uploading } = useFileUpload();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (audioBlob) {
      const compressedBlob = await compressAudio(audioBlob, compressionLevel / 100);
      const uploadedUrl = await uploadVoiceMessage(compressedBlob, duration);
      if (uploadedUrl) {
        onSendVoiceMessage(uploadedUrl, duration);
      }
    }
  };

  const getFileSizeEstimate = () => {
    if (!audioBlob) return '0 KB';
    const sizeInBytes = audioBlob.size;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    return sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Advanced Voice Recorder
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Recording Settings</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Sample Rate</label>
                <Select
                  value={audioSettings.sampleRate.toString()}
                  onValueChange={(value) => 
                    setAudioSettings({...audioSettings, sampleRate: parseInt(value)})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="22050">22.05 kHz</SelectItem>
                    <SelectItem value="44100">44.1 kHz</SelectItem>
                    <SelectItem value="48000">48 kHz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Audio Quality</label>
                <Select
                  value={audioSettings.bitRate.toString()}
                  onValueChange={(value) => 
                    setAudioSettings({...audioSettings, bitRate: parseInt(value)})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="64000">64 kbps (Low)</SelectItem>
                    <SelectItem value="128000">128 kbps (Medium)</SelectItem>
                    <SelectItem value="256000">256 kbps (High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Compression Level: {compressionLevel}%</label>
                <Slider
                  value={[compressionLevel]}
                  onValueChange={(value) => setCompressionLevel(value[0])}
                  max={100}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mono Audio</label>
                <Switch
                  checked={audioSettings.channels === 1}
                  onCheckedChange={(checked) => 
                    setAudioSettings({...audioSettings, channels: checked ? 1 : 2})
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Recording Status */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-mono">
            {formatDuration(duration)}
          </div>
          
          {audioBlob && (
            <div className="text-sm text-muted-foreground">
              File size: {getFileSizeEstimate()}
            </div>
          )}

          {(isRecording || isPaused) && (
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-sm">
                {isRecording ? 'Recording...' : 'Paused'}
              </span>
            </div>
          )}
        </div>

        {/* Audio Preview */}
        {audioUrl && (
          <div className="space-y-2">
            <audio controls className="w-full">
              <source src={audioUrl} type={`audio/${audioSettings.format}`} />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex justify-center gap-2">
          {!isRecording && !isPaused && !audioBlob && (
            <Button
              onClick={startRecording}
              size="lg"
              className="rounded-full w-16 h-16"
            >
              <Mic size={24} />
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Pause size={20} />
              </Button>
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Square size={20} />
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button
                onClick={resumeRecording}
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Play size={20} />
              </Button>
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Square size={20} />
              </Button>
            </>
          )}

          {audioBlob && (
            <>
              <Button
                onClick={cancelRecording}
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Trash2 size={20} />
              </Button>
              <Button
                onClick={handleSend}
                disabled={uploading}
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Send size={20} />
              </Button>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          
          {audioBlob && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              {audioSettings.sampleRate / 1000}kHz • {audioSettings.bitRate / 1000}kbps
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedVoiceRecorder;
