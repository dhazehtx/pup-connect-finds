
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Phone, Mail } from 'lucide-react';

const ResourcesSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          Additional Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Federal Resources</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://www.aphis.usda.gov/animal_welfare/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                USDA Animal Welfare Information
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://www.aphis.usda.gov/licensing-and-registration/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                USDA Licensing and Registration
              </a>
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Professional Organizations</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://www.akc.org/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                American Kennel Club (AKC)
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://www.ukcdogs.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                United Kennel Club (UKC)
              </a>
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Legal Assistance</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone size={16} />
              <span>For specific legal questions, consult with a local attorney</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={16} />
              <span>Contact your state's department of agriculture for current regulations</span>
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This information is for educational purposes only and should not be considered legal advice. 
            Laws and regulations change frequently. Always consult with local authorities and legal professionals for the most 
            current and specific requirements in your area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesSection;
