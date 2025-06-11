
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SupportedAudioFormat } from '@/utils/audioFormatConverter';

interface VoiceRecorderSettingsProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  selectedFormat: SupportedAudioFormat;
  setSelectedFormat: (format: SupportedAudioFormat) => void;
  compressionQuality: number[];
  setCompressionQuality: (quality: number[]) => void;
  enableCompression: boolean;
  setEnableCompression: (enabled: boolean) => void;
  supportedFormats: SupportedAudioFormat[];
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
  return (
    <Collapsible open={showSettings} onOpenChange={setShowSettings} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          <Settings size={16} className="mr-2" />
          Audio Settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Select value={selectedFormat} onValueChange={(value: SupportedAudioFormat) => setSelectedFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedFormats.map(format => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Compression</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEnableCompression(!enableCompression)}
              className={cn(
                "text-xs",
                enableCompression ? "text-primary" : "text-muted-foreground"
              )}
            >
              {enableCompression ? 'ON' : 'OFF'}
            </Button>
          </div>
          {enableCompression && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Quality: {Math.round(compressionQuality[0] * 100)}%</span>
                <span>Size reduction: ~{Math.round((1 - compressionQuality[0]) * 60)}%</span>
              </div>
              <Slider
                value={compressionQuality}
                onValueChange={setCompressionQuality}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default VoiceRecorderSettings;
