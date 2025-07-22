
import React from 'react';
import { Shield, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgesProps {
  isVerifiedBreeder?: boolean;
  hasVerifiedDelivery?: boolean;
  className?: string;
}

const VerifiedBadges = ({ 
  isVerifiedBreeder = false, 
  hasVerifiedDelivery = false,
  className = ""
}: VerifiedBadgesProps) => {
  if (!isVerifiedBreeder && !hasVerifiedDelivery) {
    return null;
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      <TooltipProvider>
        {isVerifiedBreeder && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified Breeder
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                This breeder has been verified through background checks and licensing verification.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {hasVerifiedDelivery && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                <Truck className="w-3 h-3 mr-1" />
                Verified Delivery
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                This breeder uses a trusted transport partner who complies with state regulations.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default VerifiedBadges;
