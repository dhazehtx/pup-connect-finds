
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      
      // Show success toast
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll respond to your inquiry within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@mypup.com',
      responseTime: 'Usually responds within 2 hours'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      description: 'Speak with our team',
      contact: '1-800-MY-PUPPY',
      responseTime: 'Available Mon-Fri 9AM-8PM EST'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available 24/7',
      responseTime: 'Instant response'
    },
    {
      icon: <HelpCircle className="h-6 w-6" />,
      title: 'Help Center',
      description: 'Browse our knowledge base',
      contact: 'Self-service support',
      responseTime: 'Immediate access'
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl opacity-90">We're here to help you and your furry friends</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">How Can We Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="border-royal-blue hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-royal-blue mb-4 flex justify-center">
                    {method.icon}
                  </div>
                  <h3 className="font-semibold text-black mb-2">{method.title}</h3>
                  <p className="text-sm text-black/70 mb-3">{method.description}</p>
                  <p className="text-sm font-medium text-royal-blue mb-2">{method.contact}</p>
                  <p className="text-xs text-black/60">{method.responseTime}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-royal-blue">
            <CardHeader>
              <CardTitle className="text-black">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your full name"
                      required
                      disabled={isSubmitting}
                      className="border-royal-blue/30 focus:border-royal-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                      required
                      disabled={isSubmitting}
                      className="border-royal-blue/30 focus:border-royal-blue"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="border-royal-blue/30 focus:border-royal-blue">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="safety">Safety & Trust</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief description of your inquiry"
                    required
                    disabled={isSubmitting}
                    className="border-royal-blue/30 focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Please provide details about your inquiry..."
                    rows={5}
                    required
                    disabled={isSubmitting}
                    className="border-royal-blue/30 focus:border-royal-blue"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-royal-blue hover:bg-deep-navy text-white"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2" size={16} />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Business Hours */}
            <Card className="border-royal-blue">
              <CardHeader>
                <CardTitle className="text-black flex items-center">
                  <Clock className="mr-2" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/70">Monday - Friday</span>
                    <span className="font-medium text-black">9:00 AM - 8:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/70">Saturday</span>
                    <span className="font-medium text-black">10:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/70">Sunday</span>
                    <span className="font-medium text-black">12:00 PM - 5:00 PM EST</span>
                  </div>
                  <div className="mt-4 p-3 bg-royal-blue/10 rounded-lg">
                    <p className="text-sm text-black/70">
                      <strong>Live Chat:</strong> Available 24/7 for immediate assistance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-royal-blue bg-royal-blue/5">
              <CardHeader>
                <CardTitle className="text-black">Important Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70 mb-4">
                  For all emergency situations, safety concerns, or urgent fraud reports, please contact us immediately via email at:
                </p>
                <div className="bg-white p-3 rounded-lg border border-royal-blue">
                  <p className="text-royal-blue font-medium">emergency@mypup.com</p>
                </div>
                <p className="text-sm text-black/60 mt-3">
                  We monitor emergency emails 24/7 and will respond immediately to urgent matters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <Card className="border-royal-blue">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4">Looking for Quick Answers?</h3>
              <p className="text-black/70 mb-6">
                Check out our comprehensive FAQ section for instant answers to common questions.
              </p>
              <Button variant="outline" className="border-royal-blue text-black hover:bg-royal-blue hover:text-white">
                <HelpCircle className="mr-2" size={16} />
                Visit Help Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
