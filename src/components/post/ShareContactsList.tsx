
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface ShareContactsListProps {
  contacts: Contact[];
  onContactClick: (contactId: string) => void;
}

const ShareContactsList = ({ contacts, onContactClick }: ShareContactsListProps) => {
  return (
    <div>
      <h3 className="font-medium text-sm mb-3">Send to</h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onContactClick(contact.id)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{contact.name}</p>
              <p className="text-gray-600 text-xs">@{contact.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareContactsList;
