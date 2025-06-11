
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  Video, 
  Phone,
  Calendar as CalendarIcon,
  Users,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useCalendarScheduling } from '@/hooks/useCalendarScheduling';
import { useToast } from '@/hooks/use-toast';

interface AdvancedCalendarSchedulerProps {
  breederId?: string;
  listingId?: string;
  mode?: 'breeder' | 'buyer' | 'admin';
  onEventCreated?: (event: any) => void;
}

const AdvancedCalendarScheduler = ({ 
  breederId, 
  listingId, 
  mode = 'buyer',
  onEventCreated 
}: AdvancedCalendarSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    meeting_type: 'in_person' as 'in_person' | 'video' | 'phone',
    duration: 60,
    location: '',
    attendees: [] as string[]
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { events, loading, createEvent, updateEventStatus, deleteEvent } = useCalendarScheduling();
  const { toast } = useToast();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  const getAvailableTimeSlots = (date: Date) => {
    const dateStr = date.toDateString();
    const bookedSlots = events
      .filter(event => new Date(event.start_time).toDateString() === dateStr)
      .map(event => new Date(event.start_time).toTimeString().slice(0, 5));
    
    return timeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const handleCreateEvent = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + eventDetails.duration);

    const eventData = {
      title: eventDetails.title || `${eventDetails.meeting_type.replace('_', ' ')} Meeting`,
      description: eventDetails.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      user_id: breederId || 'current-user',
      listing_id: listingId,
      attendee_email: '',
      status: 'pending' as const
    };

    try {
      const newEvent = await createEvent(eventData);
      if (newEvent) {
        onEventCreated?.(newEvent);
        setIsCreateDialogOpen(false);
        setSelectedDate(undefined);
        setSelectedTime('');
        setEventDetails({
          title: '',
          description: '',
          meeting_type: 'in_person',
          duration: 60,
          location: '',
          attendees: []
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const getEventsByDate = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => 
      new Date(event.start_time).toDateString() === dateStr
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-muted-foreground">Manage appointments and meetings</p>
        </div>
        
        {mode !== 'admin' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="datetime" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="datetime">Date & Time</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="confirm">Confirm</TabsTrigger>
                </TabsList>

                <TabsContent value="datetime" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-md border"
                      />
                    </div>
                    
                    {selectedDate && (
                      <div>
                        <Label>Available Times</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {getAvailableTimeSlots(selectedDate).map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="justify-start"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={eventDetails.title}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Puppy Visit - Golden Retriever"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting_type">Meeting Type</Label>
                    <Select
                      value={eventDetails.meeting_type}
                      onValueChange={(value: 'in_person' | 'video' | 'phone') => 
                        setEventDetails(prev => ({ ...prev, meeting_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            In Person
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Call
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Call
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={eventDetails.duration.toString()}
                      onValueChange={(value) => 
                        setEventDetails(prev => ({ ...prev, duration: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={eventDetails.description}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Meeting agenda, special requests..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="confirm" className="space-y-4">
                  {selectedDate && selectedTime && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Meeting Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{selectedDate.toLocaleDateString()} at {selectedTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getMeetingTypeIcon(eventDetails.meeting_type)}
                          <span className="capitalize">
                            {eventDetails.meeting_type.replace('_', ' ')} Meeting
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{eventDetails.duration} minutes</span>
                        </div>
                        
                        {eventDetails.title && (
                          <div>
                            <strong>Title:</strong> {eventDetails.title}
                          </div>
                        )}
                        
                        {eventDetails.description && (
                          <div>
                            <strong>Description:</strong> {eventDetails.description}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateEvent} disabled={loading} className="flex-1">
                      {loading ? 'Scheduling...' : 'Schedule Meeting'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Calendar and Events */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
                modifiers={{
                  hasEvent: (date) => getEventsByDate(date).length > 0
                }}
                modifiersStyles={{
                  hasEvent: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedDate ? `Events for ${selectedDate.toLocaleDateString()}` : 'All Upcoming Events'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(selectedDate ? getEventsByDate(selectedDate) : events).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.start_time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(event.start_time).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {event.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateEventStatus(event.id, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateEventStatus(event.id, 'cancelled')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {event.status === 'confirmed' && (
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(selectedDate ? getEventsByDate(selectedDate) : events).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No events scheduled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCalendarScheduler;
