
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText } from 'lucide-react';
import MessageTemplates from '../MessageTemplates';

interface TemplatesControlProps {
  onTemplateSelect: (content: string) => void;
}

const TemplatesControl = ({ onTemplateSelect }: TemplatesControlProps) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (content: string) => {
    onTemplateSelect(content);
    setShowTemplates(false);
  };

  return (
    <Popover open={showTemplates} onOpenChange={setShowTemplates}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-y-auto">
        <MessageTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default TemplatesControl;
