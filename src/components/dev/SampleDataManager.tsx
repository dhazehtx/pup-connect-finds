
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RippleButton from '@/components/ui/ripple-button';
import { useToast } from '@/hooks/use-toast';
import { loadSampleData, clearSampleData } from '@/utils/sampleDataLoader';
import { Database, Trash2, Users, Heart, MessageCircle, Star } from 'lucide-react';

const SampleDataManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLoadData = async () => {
    setLoading(true);
    try {
      const success = await loadSampleData();
      if (success) {
        toast({
          title: "Sample Data Loaded",
          description: "All sample data has been loaded successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load sample data. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      const success = await clearSampleData();
      if (success) {
        toast({
          title: "Sample Data Cleared",
          description: "All sample data has been removed successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to clear sample data. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Sample Data Manager
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Load or clear sample data for testing the application
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <Users className="w-8 h-8 mx-auto text-blue-500" />
            <div className="text-sm font-medium">4 Users</div>
            <div className="text-xs text-muted-foreground">Breeders & Buyers</div>
          </div>
          <div className="space-y-2">
            <Heart className="w-8 h-8 mx-auto text-red-500" />
            <div className="text-sm font-medium">6 Listings</div>
            <div className="text-xs text-muted-foreground">Dog Listings</div>
          </div>
          <div className="space-y-2">
            <Star className="w-8 h-8 mx-auto text-yellow-500" />
            <div className="text-sm font-medium">4 Reviews</div>
            <div className="text-xs text-muted-foreground">User Reviews</div>
          </div>
          <div className="space-y-2">
            <MessageCircle className="w-8 h-8 mx-auto text-green-500" />
            <div className="text-sm font-medium">4 Messages</div>
            <div className="text-xs text-muted-foreground">Conversations</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <RippleButton
            onClick={handleLoadData}
            disabled={loading}
            className="flex-1 bg-royal-blue hover:bg-royal-blue/90"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Loading...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Load Sample Data
              </>
            )}
          </RippleButton>

          <RippleButton
            onClick={handleClearData}
            disabled={loading}
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Sample Data
              </>
            )}
          </RippleButton>
        </div>

        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> This manager is for development and testing purposes only. 
          It loads realistic sample data to help you test all the app features including 
          search, messaging, reviews, and user profiles.
        </div>
      </CardContent>
    </Card>
  );
};

export default SampleDataManager;
