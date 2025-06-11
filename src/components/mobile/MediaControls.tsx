
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface MediaControlsProps {
  isVideoOn: boolean;
  isRecording: boolean;
  onToggleVideo: () => void;
  onToggleRecording: () => void;
}

export const MediaControls = ({ 
  isVideoOn, 
  isRecording, 
  onToggleVideo, 
  onToggleRecording 
}: MediaControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={isVideoOn ? "default" : "outline"}
            onClick={onToggleVideo}
            className="flex flex-col gap-2 h-20"
          >
            {isVideoOn ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            <span className="text-xs">{isVideoOn ? 'Stop Camera' : 'Start Camera'}</span>
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={onToggleRecording}
            className="flex flex-col gap-2 h-20"
          >
            {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            <span className="text-xs">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </Button>
        </div>
        
        {isRecording && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700">Recording in progress...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
