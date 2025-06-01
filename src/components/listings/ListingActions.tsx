
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Calendar as CalendarIcon, DollarSign, Share, Heart, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ListingActionsProps {
  listingId: number;
  title: string;
  price: string;
  sellerName: string;
  onContact: (id: number) => void;
  onFavorite: (id: number) => void;
  isFavorited: boolean;
}

const ListingActions: React.FC<ListingActionsProps> = ({
  listingId,
  title,
  price,
  sellerName,
  onContact,
  onFavorite,
  isFavorited
}) => {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleScheduleViewing = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for the viewing.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Viewing Scheduled",
      description: `Your viewing has been scheduled for ${selectedDate.toDateString()} at ${selectedTime}. The seller will be notified.`
    });
    setShowScheduleDialog(false);
  };

  const handleMakeOffer = () => {
    if (!offerAmount) {
      toast({
        title: "Missing Offer Amount",
        description: "Please enter your offer amount.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Offer Submitted",
      description: `Your offer of $${offerAmount} has been sent to ${sellerName}. They will respond shortly.`
    });
    setShowOfferDialog(false);
    setOfferAmount('');
    setOfferMessage('');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this adorable ${title} for ${price}!`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "The listing link has been copied to your clipboard."
        });
        break;
    }
    setShowShareDialog(false);
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Contact Seller */}
      <Button 
        onClick={() => onContact(listingId)}
        className="flex-1 min-w-[120px]"
      >
        <MessageCircle size={16} className="mr-1" />
        Contact Seller
      </Button>

      {/* Schedule Viewing */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 min-w-[120px]">
            <CalendarIcon size={16} className="mr-1" />
            Schedule Viewing
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Viewing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleScheduleViewing} className="flex-1">
                Schedule Viewing
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Make Offer */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <DollarSign size={16} className="mr-1" />
            Make Offer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Offer Amount ($)</label>
              <Input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <Textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Add a personal message with your offer..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleMakeOffer} className="flex-1">
                Submit Offer
              </Button>
              <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Share size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this listing</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleShare('facebook')} variant="outline">
              Facebook
            </Button>
            <Button onClick={() => handleShare('twitter')} variant="outline">
              Twitter
            </Button>
            <Button onClick={() => handleShare('email')} variant="outline">
              Email
            </Button>
            <Button onClick={() => handleShare('copy')} variant="outline">
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Favorite */}
      <Button 
        variant={isFavorited ? "default" : "outline"} 
        size="icon"
        onClick={() => onFavorite(listingId)}
      >
        <Heart size={16} className={isFavorited ? "fill-current" : ""} />
      </Button>
    </div>
  );
};

export default ListingActions;
