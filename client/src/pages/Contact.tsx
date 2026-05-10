import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Mail, LifeBuoy, Clock, Send, ChevronRight, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { APP_SHELL_CONTAINER_CLASS } from '@/lib/appShell';

const SUPPORT_EMAIL_PLACEHOLDER = 'support@paws.app';

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });

  useEffect(() => {
    document.title = 'Contact & support — PAWS';
  }, []);

  const supportCategories = [
    'General inquiry',
    'Orders & shipping',
    'Pup Box & subscriptions',
    'Account & sign-in',
    'Payments & billing',
    'Safety & trust',
    'Technical issue',
    'Partnerships',
    'Other',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category.trim()) {
      toast({
        title: 'Choose a category',
        description: 'Select the topic that best matches your message.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      // Owner can wire to `/api/support` or CRM later; UX is complete for launch shell.
      console.info('[contact] message intent', { ...formData, at: new Date().toISOString() });
      toast({
        title: 'Message recorded',
        description:
          'Thanks — we received your note. When support email is live, this will route to the team automatically.',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white">
        <div className={`${APP_SHELL_CONTAINER_CLASS} py-12 sm:py-14`}>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <MessageCircle className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact PAWS</h1>
            <p className="mt-3 text-base text-blue-100 sm:text-lg">
              We&apos;re here for orders, safety questions, and anything about your pup. Responses are prioritized
              by urgency.
            </p>
          </div>
        </div>
      </div>

      <div className={`${APP_SHELL_CONTAINER_CLASS} py-10 sm:py-12`}>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  Primary inbox (publish your real address at launch):{' '}
                  <a
                    href={`mailto:${SUPPORT_EMAIL_PLACEHOLDER}`}
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL_PLACEHOLDER}
                  </a>
                </p>
                <p className="text-xs text-slate-500">Typical reply: within one business day.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LifeBuoy className="h-5 w-5 text-blue-600" />
                  In-app support
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                <p className="mb-3">Track requests and follow up in one place.</p>
                <Button variant="outline" className="w-full border-slate-200" asChild>
                  <Link to="/support" className="inline-flex items-center justify-center gap-2">
                    Open support tickets
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-slate-600" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <span>Mon–Fri</span>
                  <span className="font-medium text-slate-800">9:00 – 18:00 PT</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Sat–Sun</span>
                  <span className="font-medium text-slate-800">Limited email</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/60 shadow-sm">
              <CardContent className="flex gap-3 pt-6">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <div className="text-sm text-blue-950">
                  <p className="font-medium">Urgent safety concern?</p>
                  <p className="mt-1 text-blue-900/90">
                    Use{' '}
                    <Link to="/support" className="font-semibold underline-offset-2 hover:underline">
                      support tickets
                    </Link>{' '}
                    with category <em>Safety concern</em> — we prioritize those reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-blue-600" />
                  Send a message
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Include order numbers or listing links if relevant — it helps us resolve faster.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your name"
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Subject *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Short summary"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Message *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      placeholder="What can we help with?"
                      required
                      className="resize-y min-h-[140px]"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="min-h-[44px] sm:min-w-[200px]" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Send message'}
                    </Button>
                    <Button type="button" variant="ghost" asChild className="text-slate-600">
                      <Link to="/help-center" className="inline-flex items-center gap-1">
                        Browse Help Center
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
