
import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateListingForm from '@/components/listings/CreateListingForm';
import MyListingsManager from '@/components/listings/MyListingsManager';
import { useAuth } from '@/contexts/AuthContext';

const Post = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 flex items-center justify-between bg-white border-b">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Create Listing</h1>
          <div></div>
        </div>
        
        <div className="p-4">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Please sign in to create listings.</p>
              <Button 
                onClick={() => navigate('/auth')} 
                className="mt-4"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      <div className="p-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Listing Management</h1>
        <div></div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Create Listing
            </TabsTrigger>
            <TabsTrigger value="manage">
              My Listings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-0">
            <CreateListingForm
              onSuccess={() => {
                setActiveTab('manage');
              }}
              className="border-0 shadow-none"
            />
          </TabsContent>
          
          <TabsContent value="manage" className="mt-0">
            <MyListingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Post;
