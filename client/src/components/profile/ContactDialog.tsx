
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    full_name: string;
    email?: string;
    phone?: string;
  };
}

const ContactDialog = ({ isOpen, onClose, profile }: ContactDialogProps) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const { toast } = useToast();

  const handleSendMessage = () => {
    // Simulate sending message
    toast({
      title: "Message sent!",
      description: `Your message has been sent to ${profile.full_name}`,
    });
    setMessage('');
    setSubject('');
    onClose();
  };

  const handleCall = () => {
    if (profile.phone) {
      window.open(`tel:${profile.phone}`);
    }
  };

  const handleEmail = () => {
    if (profile.email) {
      window.open(`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {profile.full_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            {profile.phone && (
              <Button 
                onClick={handleCall}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Phone size={16} />
                Call
              </Button>
            )}
            {profile.email && (
              <Button 
                onClick={handleEmail}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Mail size={16} />
                Email
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSendMessage}
            className="w-full flex items-center gap-2"
            disabled={!message.trim()}
          >
            <MessageSquare size={16} />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
