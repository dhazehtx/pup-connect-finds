
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarSchedulerProps {
  breederId: string;
  listingId: string;
  onScheduled?: (appointment: any) => void;
}

const CalendarScheduler = ({ breederId, listingId, onScheduled }: CalendarSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<'in_person' | 'video'>('in_person');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select both date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    const appointment = {
      date: selectedDate,
      time: selectedTime,
      type: meetingType,
      notes,
      breederId,
      listingId,
    };

    try {
      // Here you would typically save to Supabase
      toast({
        title: "Appointment scheduled!",
        description: `Your ${meetingType === 'video' ? 'video call' : 'in-person meeting'} has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });
      
      onScheduled?.(appointment);
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: "Unable to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule a Meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meeting Type Selection */}
        <div>
          <h3 className="font-medium mb-3">Meeting Type</h3>
          <div className="flex gap-3">
            <Button
              variant={meetingType === 'in_person' ? 'default' : 'outline'}
              onClick={() => setMeetingType('in_person')}
              className="flex items-center gap-2"
            >
              <MapPin size={16} />
              In Person
            </Button>
            <Button
              variant={meetingType === 'video' ? 'default' : 'outline'}
              onClick={() => setMeetingType('video')}
              className="flex items-center gap-2"
            >
              <Video size={16} />
              Video Call
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div>
          <h3 className="font-medium mb-3">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
            className="rounded-md border"
          />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h3 className="font-medium mb-3">Available Times</h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => setSelectedTime(time)}
                  className="flex items-center gap-1"
                >
                  <Clock size={14} />
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="font-medium mb-3">Additional Notes (Optional)</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific questions or requests for the meeting..."
            className="w-full p-3 border rounded-md resize-none"
            rows={3}
          />
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Appointment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {meetingType === 'video' ? <Video size={14} /> : <MapPin size={14} />}
                <span>{meetingType === 'video' ? 'Video Call' : 'In-Person Meeting'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{selectedDate.toLocaleDateString()} at {selectedTime}</span>
              </div>
              {notes && (
                <div>
                  <strong>Notes:</strong> {notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Button */}
        <Button 
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime}
          className="w-full"
        >
          Schedule Appointment
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalendarScheduler;
