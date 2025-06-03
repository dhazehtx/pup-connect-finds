
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Flag, Shield, Camera, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QualityCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  weight: number;
}

interface ListingQuality {
  listingId: string;
  overallScore: number;
  checks: QualityCheck[];
  suggestions: string[];
  flagged: boolean;
}

const ListingQualityChecker = ({ listing }: { listing: any }) => {
  const [qualityData, setQualityData] = useState<ListingQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (listing) {
      runQualityChecks();
    }
  }, [listing]);

  const runQualityChecks = async () => {
    setLoading(true);
    
    // Simulate quality checks
    const checks: QualityCheck[] = [
      {
        id: 'title',
        name: 'Title Quality',
        status: listing.dog_name?.length > 3 ? 'pass' : 'fail',
        message: listing.dog_name?.length > 3 ? 'Good title length' : 'Title too short',
        weight: 15
      },
      {
        id: 'description',
        name: 'Description',
        status: listing.description?.length > 50 ? 'pass' : 'warning',
        message: listing.description?.length > 50 ? 'Detailed description provided' : 'Description could be more detailed',
        weight: 20
      },
      {
        id: 'images',
        name: 'Image Quality',
        status: listing.image_url ? 'pass' : 'fail',
        message: listing.image_url ? 'Image provided' : 'No image uploaded',
        weight: 25
      },
      {
        id: 'price',
        name: 'Price Information',
        status: listing.price > 0 ? 'pass' : 'fail',
        message: listing.price > 0 ? 'Price specified' : 'No price information',
        weight: 15
      },
      {
        id: 'contact',
        name: 'Contact Information',
        status: listing.profiles?.email ? 'pass' : 'warning',
        message: listing.profiles?.email ? 'Contact info available' : 'Limited contact information',
        weight: 10
      },
      {
        id: 'verification',
        name: 'Seller Verification',
        status: listing.profiles?.verified ? 'pass' : 'warning',
        message: listing.profiles?.verified ? 'Verified seller' : 'Unverified seller',
        weight: 15
      }
    ];

    // Calculate overall score
    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    const passedWeight = checks
      .filter(check => check.status === 'pass')
      .reduce((sum, check) => sum + check.weight, 0);
    const warningWeight = checks
      .filter(check => check.status === 'warning')
      .reduce((sum, check) => sum + check.weight * 0.5, 0);
    
    const overallScore = ((passedWeight + warningWeight) / totalWeight) * 100;

    // Generate suggestions
    const suggestions = [];
    if (!listing.image_url) suggestions.push('Add high-quality photos of your dog');
    if (!listing.description || listing.description.length < 100) {
      suggestions.push('Write a detailed description including temperament and health info');
    }
    if (!listing.profiles?.verified) suggestions.push('Complete seller verification for better trust');
    if (listing.price <= 0) suggestions.push('Set a fair market price');

    setQualityData({
      listingId: listing.id,
      overallScore: Math.round(overallScore),
      checks,
      suggestions,
      flagged: overallScore < 40
    });

    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const flagListing = async () => {
    // Implementation for flagging listing for manual review
    toast({
      title: "Listing Flagged",
      description: "This listing has been flagged for manual review",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Running quality checks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qualityData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Listing Quality Score
          </CardTitle>
          {qualityData.flagged && (
            <Button variant="outline" size="sm" onClick={flagListing}>
              <Flag className="h-4 w-4 mr-2" />
              Flag for Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${getScoreColor(qualityData.overallScore)}`}>
            {qualityData.overallScore}%
          </div>
          {getScoreBadge(qualityData.overallScore)}
          <Progress value={qualityData.overallScore} className="w-full" />
        </div>

        {/* Individual Checks */}
        <div className="space-y-3">
          <h4 className="font-semibold">Quality Checks</h4>
          {qualityData.checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getCheckIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
              <Badge variant="outline">{check.weight}pts</Badge>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        {qualityData.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Improvement Suggestions</h4>
            <div className="space-y-2">
              {qualityData.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Photos</p>
              <p className="text-xs text-muted-foreground">
                {listing.image_url ? 'Available' : 'Missing'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Details</p>
              <p className="text-xs text-muted-foreground">
                {listing.description?.length > 50 ? 'Complete' : 'Limited'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingQualityChecker;
