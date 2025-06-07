
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HelpHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const HelpHeader: React.FC<HelpHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl opacity-90 mb-8">Find answers to your questions and get the help you need</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-deep-navy/60" size={20} />
          <Input
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 text-lg bg-white text-deep-navy"
          />
        </div>
      </div>
    </div>
  );
};

export default HelpHeader;
