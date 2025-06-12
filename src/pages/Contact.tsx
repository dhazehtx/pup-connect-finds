
import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@mypup.com',
      responseTime: 'Usually within 4 hours'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Speak with our team',
      contact: '1-800-MY-PUPPY',
      responseTime: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with us now',
      contact: 'Available 24/7',
      responseTime: 'Instant response'
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl opacity-90">We're here to help! Get in touch with our support team.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="border-royal-blue">
              <CardHeader>
                <CardTitle className="text-black">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="border-royal-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="border-royal-blue"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="border-royal-blue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={6}
                      className="border-royal-blue"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-royal-blue text-white hover:bg-royal-blue/90">
                    <Send className="mr-2" size={16} />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">Other Ways to Reach Us</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="border-royal-blue">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-royal-blue">{method.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black mb-1">{method.title}</h3>
                          <p className="text-black/70 text-sm mb-2">{method.description}</p>
                          <p className="font-medium text-royal-blue">{method.contact}</p>
                          <p className="text-xs text-black/60">{method.responseTime}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Office Info */}
            <Card className="border-royal-blue bg-royal-blue/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-royal-blue flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">Our Office</h3>
                    <p className="text-black/70 mb-2">
                      123 Puppy Lane<br />
                      Dog City, DC 12345<br />
                      United States
                    </p>
                    <div className="flex items-center gap-2 text-sm text-black/60">
                      <Clock className="w-4 h-4" />
                      <span>Monday - Friday: 9:00 AM - 6:00 PM EST</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
