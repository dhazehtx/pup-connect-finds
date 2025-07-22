
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  FileText, 
  Search, 
  Zap, 
  BarChart3, 
  TestTube, 
  Settings 
} from 'lucide-react';

const MessagingTabNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-7">
      <TabsTrigger value="messages" className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Messages
      </TabsTrigger>
      <TabsTrigger value="templates" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Templates
      </TabsTrigger>
      <TabsTrigger value="search" className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        Search
      </TabsTrigger>
      <TabsTrigger value="performance" className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Performance
      </TabsTrigger>
      <TabsTrigger value="analytics" className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Analytics
      </TabsTrigger>
      <TabsTrigger value="testing" className="flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        Testing
      </TabsTrigger>
      <TabsTrigger value="monitor" className="flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Monitor
      </TabsTrigger>
    </TabsList>
  );
};

export default MessagingTabNavigation;
