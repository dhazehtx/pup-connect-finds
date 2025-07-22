
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsSummaryProps {
  strictCount: number;
  moderateCount: number;
  lenientCount: number;
}

const StatsSummary = ({ strictCount, moderateCount, lenientCount }: StatsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{strictCount}</div>
          <div className="text-sm text-muted-foreground">States with Strict Regulations</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{moderateCount}</div>
          <div className="text-sm text-muted-foreground">States with Moderate Regulations</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{lenientCount}</div>
          <div className="text-sm text-muted-foreground">States with Lenient Regulations</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummary;
