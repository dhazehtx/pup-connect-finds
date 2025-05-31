
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Instagram, Facebook, Globe, Twitter, Youtube, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const socialMediaSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'youtube', 'website']),
  url: z.string().url('Please enter a valid URL'),
  display_name: z.string().min(1, 'Display name is required'),
});

type SocialMediaFormData = z.infer<typeof socialMediaSchema>;

interface SocialLink {
  platform: string;
  url: string;
  display_name: string;
}

interface SocialMediaManagerProps {
  socialLinks: Record<string, SocialLink>;
  onUpdate: (links: Record<string, SocialLink>) => void;
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

const platformLabels = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter',
  youtube: 'YouTube',
  website: 'Website',
};

const SocialMediaManager = ({ socialLinks, onUpdate }: SocialMediaManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<SocialMediaFormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      platform: 'instagram',
      url: '',
      display_name: '',
    },
  });

  const onSubmit = (data: SocialMediaFormData) => {
    const updatedLinks = {
      ...socialLinks,
      [data.platform]: {
        platform: data.platform,
        url: data.url,
        display_name: data.display_name,
      },
    };
    onUpdate(updatedLinks);
    form.reset();
    setIsOpen(false);
  };

  const removeLink = (platform: string) => {
    const updatedLinks = { ...socialLinks };
    delete updatedLinks[platform];
    onUpdate(updatedLinks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Social Media Links
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus size={16} className="mr-1" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Media Link</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(platformLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="@username or Page Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Link</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(socialLinks).length === 0 ? (
          <p className="text-gray-500 text-sm">No social media links added yet</p>
        ) : (
          <div className="space-y-2">
            {Object.values(socialLinks).map((link) => {
              const Icon = platformIcons[link.platform as keyof typeof platformIcons] || Globe;
              return (
                <div key={link.platform} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="font-medium">{link.display_name}</span>
                    <span className="text-sm text-gray-500">({platformLabels[link.platform as keyof typeof platformLabels]})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLink(link.platform)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaManager;
