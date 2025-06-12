
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface VoiceRecorderSettingsProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
  compressionQuality: number;
  setCompressionQuality: (quality: number) => void;
  enableCompression: boolean;
  setEnableCompression: (enable: boolean) => void;
  supportedFormats: string[];
}

const VoiceRecorderSettings = ({
  showSettings,
  setShowSettings,
  selectedFormat,
  setSelectedFormat,
  compressionQuality,
  setCompressionQuality,
  enableCompression,
  setEnableCompression,
  supportedFormats
}: VoiceRecorderSettingsProps) => {
  if (!showSettings) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(true)}
        className="text-muted-foreground"
      >
        <Settings size={16} />
      </Button>
    );
  }

  return (
    <div className="p-4 bg-muted rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Recording Settings</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(false)}
        >
          Done
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Format</label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable Compression</label>
          <Switch
            checked={enableCompression}
            onCheckedChange={setEnableCompression}
          />
        </div>

        {enableCompression && (
          <div>
            <label className="text-sm font-medium">
              Quality: {Math.round(compressionQuality * 100)}%
            </label>
            <Slider
              value={[compressionQuality]}
              onValueChange={([value]) => setCompressionQuality(value)}
              max={1}
              min={0.1}
              step={0.1}
              className="mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorderSettings;
