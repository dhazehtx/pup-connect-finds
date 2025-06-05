
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
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

  const officeLocations = [
    {
      city: 'Austin, TX',
      address: '123 Puppy Lane, Austin, TX 78701',
      phone: '(512) 555-0123'
    },
    {
      city: 'Denver, CO',
      address: '456 Dog Street, Denver, CO 80202',
      phone: '(303) 555-0456'
    },
    {
      city: 'Miami, FL',
      address: '789 Pet Avenue, Miami, FL 33101',
      phone: '(305) 555-0789'
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
          <h2 className="text-3xl font-bold text-deep-navy mb-8 text-center">How Can We Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="border-soft-sky hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-royal-blue mb-4 flex justify-center">
                    {method.icon}
                  </div>
                  <h3 className="font-semibold text-deep-navy mb-2">{method.title}</h3>
                  <p className="text-sm text-deep-navy/70 mb-3">{method.description}</p>
                  <p className="text-sm font-medium text-royal-blue mb-2">{method.contact}</p>
                  <p className="text-xs text-deep-navy/60">{method.responseTime}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-soft-sky">
            <CardHeader>
              <CardTitle className="text-deep-navy">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-deep-navy mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-navy mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-deep-navy mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
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
                  <label className="block text-sm font-medium text-deep-navy mb-2">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief description of your inquiry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-deep-navy mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Please provide details about your inquiry..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-royal-blue hover:bg-deep-navy">
                  <Send className="mr-2" size={16} />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information & Office Locations */}
          <div className="space-y-8">
            {/* Business Hours */}
            <Card className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy flex items-center">
                  <Clock className="mr-2" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-deep-navy/70">Monday - Friday</span>
                    <span className="font-medium text-deep-navy">9:00 AM - 8:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deep-navy/70">Saturday</span>
                    <span className="font-medium text-deep-navy">10:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deep-navy/70">Sunday</span>
                    <span className="font-medium text-deep-navy">12:00 PM - 5:00 PM EST</span>
                  </div>
                  <div className="mt-4 p-3 bg-soft-sky/20 rounded-lg">
                    <p className="text-sm text-deep-navy/70">
                      <strong>Live Chat:</strong> Available 24/7 for immediate assistance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy flex items-center">
                  <MapPin className="mr-2" />
                  Office Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div key={index} className="border-b border-soft-sky last:border-b-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-deep-navy mb-2">{office.city}</h4>
                      <p className="text-sm text-deep-navy/70 mb-1">{office.address}</p>
                      <p className="text-sm text-royal-blue">{office.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Emergency Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">
                  For urgent safety concerns, fraud reports, or emergency situations:
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Phone className="mr-2" size={16} />
                  Emergency Hotline: 1-800-URGENT-1
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <Card className="border-soft-sky">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-deep-navy mb-4">Looking for Quick Answers?</h3>
              <p className="text-deep-navy/70 mb-6">
                Check out our comprehensive FAQ section for instant answers to common questions.
              </p>
              <Button variant="outline" className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
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
