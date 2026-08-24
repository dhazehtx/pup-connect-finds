import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CreditCard, MessageCircle, Search, Star, Truck, Users, Heart } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Search,
      title: 'Smart Puppy Matching',
      description: 'AI-powered recommendations to find your perfect puppy companion based on lifestyle, preferences, and living situation.',
      features: ['Breed compatibility analysis', 'Lifestyle matching', 'Size and temperament preferences', 'Location-based suggestions'],
      price: 'Free',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Shield,
      title: 'Breeder Verification',
      description: 'Comprehensive background checks and facility inspections to ensure ethical breeding practices and puppy health.',
      features: ['Background verification', 'Facility inspections', 'Health documentation review', 'Ongoing monitoring'],
      price: 'Included',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment & Escrow',
      description: 'Protected transactions with escrow services to ensure safe payments and puppy delivery satisfaction.',
      features: ['Escrow protection', 'Secure payment processing', 'Dispute resolution', 'Refund protection'],
      price: 'Transaction fees apply',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: MessageCircle,
      title: 'Direct Breeder Communication',
      description: 'Secure messaging platform to communicate directly with verified breeders and ask important questions.',
      features: ['Real-time messaging', 'Photo and video sharing', 'Document exchange', 'Communication history'],
      price: 'Free',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      icon: Truck,
      title: 'Delivery & Transport',
      description: 'Safe and reliable puppy delivery services with real-time tracking and professional pet transport.',
      features: ['Professional pet transport', 'Real-time tracking', 'Health monitoring during transit', 'Delivery confirmation'],
      price: 'Starting at $299',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      icon: Heart,
      title: 'Ongoing Support',
      description: 'Continuous support and resources for new puppy parents, including training tips and health guidance.',
      features: ['24/7 support hotline', 'Training resources', 'Health monitoring tools', 'Community access'],
      price: 'Free for 6 months',
      color: 'text-pink-600 bg-pink-50'
    }
  ];

  const premiumServices = [
    {
      title: 'Premium Matching Service',
      description: 'Personal consultation with our experts to find the perfect puppy for your family',
      price: '$99',
      features: ['1-on-1 consultation', 'Personalized recommendations', 'Breeder introductions', '30-day follow-up']
    },
    {
      title: 'Health Guarantee Plus',
      description: 'Extended health coverage and genetic testing verification for your new puppy',
      price: '$149',
      features: ['Extended health guarantee', 'Genetic testing verification', 'Vet network access', 'Health tracking app']
    },
    {
      title: 'Concierge Service',
      description: 'Full-service support from selection to delivery with dedicated assistance',
      price: '$299',
      features: ['Dedicated consultant', 'Priority breeder access', 'Delivery coordination', 'Setup assistance']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-purple-100">
            Comprehensive services to help you find, connect with, and welcome your perfect puppy companion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-700">
            Ready to book now? The live provider marketplace is under{' '}
            <Link to="/marketplace" className="font-semibold text-blue-600 underline underline-offset-2">
              Marketplace
            </Link>
            . This page explains services and trust standards.
          </p>
        </div>
        
        {/* Core Services */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to find and connect with the perfect puppy, with safety and security built in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{service.price}</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/marketplace">Browse providers</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Premium Services */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enhanced services for those who want extra support and personalized assistance in their puppy journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {premiumServices.map((service, index) => (
              <Card key={index} className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-3xl font-bold text-purple-600">{service.price}</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Service Guarantee */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Service Guarantee</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              We're committed to providing exceptional service throughout your puppy adoption journey. 
              Our guarantee ensures your satisfaction and your puppy's well-being.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Quality Assurance</h3>
                <p className="text-gray-600 text-sm">All breeders are thoroughly vetted and continuously monitored for quality and ethical practices.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Support Guarantee</h3>
                <p className="text-gray-600 text-sm">24/7 customer support with response times under 2 hours for urgent matters.</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Satisfaction Promise</h3>
                <p className="text-gray-600 text-sm">If you're not satisfied with our service, we'll work to make it right or provide a full refund.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Perfect Puppy?</h2>
              <p className="text-gray-600 mb-6">
                Join thousands of happy families who have found their perfect puppy companion through PAWS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Start Your Search
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
};

export default Services;