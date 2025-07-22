
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ScheduledMessage {
  id: string;
  content: string;
  scheduledFor: Date;
  conversationId: string;
  status: 'pending' | 'sent' | 'cancelled';
}

interface MessageSchedulerNewProps {
  conversationId: string;
  onSchedule: (message: Omit<ScheduledMessage, 'id' | 'status'>) => void;
  children: React.ReactNode;
}

const MessageSchedulerNew = ({ conversationId, onSchedule, children }: MessageSchedulerNewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const { toast } = useToast();

  const handleSchedule = () => {
    if (!content.trim() || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledFor = new Date(selectedDate);
    scheduledFor.setHours(hours, minutes);

    if (scheduledFor <= new Date()) {
      toast({
        title: "Invalid time",
        description: "Please select a future date and time",
        variant: "destructive"
      });
      return;
    }

    onSchedule({
      content,
      scheduledFor,
      conversationId
    });

    toast({
      title: "Message scheduled",
      description: `Message will be sent on ${format(scheduledFor, 'PPp')}`,
    });

    setContent('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="message-content">Message</Label>
            <Textarea
              id="message-content"
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>

              {selectedDate && selectedTime && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-medium">Scheduled for:</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(
                      new Date(selectedDate.setHours(
                        parseInt(selectedTime.split(':')[0]),
                        parseInt(selectedTime.split(':')[1])
                      )),
                      'PPp'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>
              Schedule Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSchedulerNew;
