import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, Shield, Users, AlertTriangle } from 'lucide-react';

function CommunityGuidelines() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Guidelines</h1>
        <p className="text-muted-foreground">Creating a safe and welcoming space for all pet lovers</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-blue-600" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            PAWS is dedicated to connecting responsible pet owners, ethical breeders, and trusted service providers 
            in a safe, supportive community. These guidelines help ensure every interaction is positive and every pet is treated with care.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Ethical Pet Sales & Breeding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Required Standards:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>All pets must have current health certificates and vaccination records</li>
            <li>Provide honest, accurate descriptions of pet health and temperament</li>
            <li>Allow potential buyers to meet pets in person before purchase</li>
            <li>Follow ethical breeding practices with proper care and socialization</li>
            <li>Maintain clean, safe living environments for all animals</li>
          </ul>

          <h4 className="font-semibold mt-4">Prohibited Activities:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4 text-red-700">
            <li>Operating puppy mills or inhumane breeding facilities</li>
            <li>Selling sick, injured, or underage animals</li>
            <li>Misrepresenting pet breed, age, health, or vaccination status</li>
            <li>Refusing to provide health documentation or allow pet visits</li>
            <li>Engaging in backyard breeding without proper care or knowledge</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Community Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Be Respectful:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Treat all community members with kindness and respect</li>
            <li>Provide helpful, constructive feedback and advice</li>
            <li>Respect different opinions about pet care and training methods</li>
            <li>Use appropriate language in all communications</li>
          </ul>

          <h4 className="font-semibold mt-4">Help Others:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Share helpful tips and experiences with new pet owners</li>
            <li>Recommend trusted veterinarians and services in your area</li>
            <li>Support rescue and adoption initiatives</li>
            <li>Celebrate pet milestones and achievements together</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Provider Standards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Professional Requirements:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Maintain current insurance and required certifications</li>
            <li>Provide services exactly as described and scheduled</li>
            <li>Communicate clearly with pet owners about service details</li>
            <li>Follow all safety protocols and emergency procedures</li>
            <li>Respect pet owner preferences and special instructions</li>
          </ul>

          <h4 className="font-semibold mt-4">Safety First:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Handle all pets with care, patience, and gentleness</li>
            <li>Report any incidents or concerns immediately</li>
            <li>Maintain secure, safe environments during service provision</li>
            <li>Follow proper protocols for pet medication and special needs</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Encouraged Content:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>High-quality photos and videos of healthy, happy pets</li>
            <li>Educational content about pet care and training</li>
            <li>Success stories and positive experiences</li>
            <li>Local community events and meetups</li>
            <li>Helpful product reviews and recommendations</li>
          </ul>

          <h4 className="font-semibold mt-4">Prohibited Content:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4 text-red-700">
            <li>Images or videos showing animal abuse or neglect</li>
            <li>Spam, promotional content, or unrelated advertising</li>
            <li>Offensive, discriminatory, or hateful language</li>
            <li>False or misleading information about pets or services</li>
            <li>Content that promotes illegal activities</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Reporting and Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">When to Report:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Suspected animal abuse or neglect</li>
            <li>Fraudulent or misleading listings</li>
            <li>Harassment or inappropriate behavior</li>
            <li>Safety concerns about service providers</li>
            <li>Violations of community guidelines</li>
          </ul>

          <h4 className="font-semibold mt-4">How to Report:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use the "Report" button on any listing or profile</li>
            <li>Contact our support team at support@petadoptionwebservices.com</li>
            <li>For emergencies, contact local authorities immediately</li>
            <li>Provide detailed information to help us investigate</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consequences for Violations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Violations of these guidelines may result in:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Warning:</strong> First-time minor violations</li>
            <li><strong>Content Removal:</strong> Posts or listings that violate guidelines</li>
            <li><strong>Temporary Suspension:</strong> Repeat violations or serious infractions</li>
            <li><strong>Permanent Ban:</strong> Severe violations, fraud, or animal abuse</li>
            <li><strong>Legal Action:</strong> Criminal activities reported to authorities</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appeals Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you believe your content was removed or account was suspended in error:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Email appeals@petadoptionwebservices.com with your username and details</li>
            <li>Provide evidence supporting your appeal</li>
            <li>Our team will review within 3-5 business days</li>
            <li>You'll receive a response with our final decision</li>
          </ol>
        </CardContent>
      </Card>

      <Separator className="my-8" />
      
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-6 text-sm">
          <a href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</a>
          <a href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          <a href="/support" className="text-blue-600 hover:underline">Contact Support</a>
        </div>
        <p className="text-sm text-muted-foreground">
          Together, we're building the best community for pet lovers everywhere.
        </p>
      </div>
    </div>
  );
}

export default CommunityGuidelines;