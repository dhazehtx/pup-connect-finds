
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationSettings = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="likes">Likes</Label>
            <Switch id="likes" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comments">Comments</Label>
            <Switch id="comments" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="price-alerts">Price drop alerts</Label>
            <Switch id="price-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-listings">New listing matches</Label>
            <Switch id="new-listings" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="messages">Chat messages</Label>
            <Switch id="messages" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="applications">Application updates</Label>
            <Switch id="applications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="follows">New followers</Label>
            <Switch id="follows" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="reviews">Reviews & ratings</Label>
            <Switch id="reviews" defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
