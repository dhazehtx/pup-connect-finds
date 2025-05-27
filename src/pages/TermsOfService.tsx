
import React from 'react';
import { Shield, AlertTriangle, Scale, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last updated: December 2024</p>
      </div>

      <div className="space-y-6">
        {/* Key Highlights */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="w-5 h-5" />
              Key Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2">
              <li>• Sellers must provide accurate health and vaccination records</li>
              <li>• Puppies must be at least 8 weeks old before sale (state law compliance)</li>
              <li>• All listings must include truthful photos and descriptions</li>
              <li>• Commercial breeders must have appropriate licenses</li>
              <li>• No puppy mill operations or unethical breeding practices</li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-800">
            <ul className="space-y-2">
              <li>• Selling sick or unvaccinated animals</li>
              <li>• Misrepresenting breed, age, or health status</li>
              <li>• Operating puppy mills or supporting unethical breeding</li>
              <li>• Selling animals under 8 weeks of age</li>
              <li>• Fraudulent listings or stolen photos</li>
              <li>• Harassment or abusive behavior toward other users</li>
            </ul>
          </CardContent>
        </Card>

        {/* Legal Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Legal Compliance & Location-Based Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">State and Local Laws</h3>
              <p className="text-gray-600 text-sm mb-2">
                Pet sale laws vary significantly by location. Users are responsible for understanding and complying with:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Local breeding license requirements</li>
                <li>• Minimum age restrictions for pet sales</li>
                <li>• Health certificate and vaccination mandates</li>
                <li>• Sales tax and business registration requirements</li>
                <li>• Import/export restrictions for interstate sales</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Some cities and states have specific regulations about pet sales. 
                California, for example, requires pet stores to source animals from shelters or rescues. 
                Users must verify local laws before listing or purchasing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Health & Safety Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Health & Safety Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Required Documentation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Current vaccination records from licensed veterinarian</li>
                <li>• Health certificate dated within 10 days of sale</li>
                <li>• Deworming and parasite prevention records</li>
                <li>• Genetic health testing results (when applicable)</li>
                <li>• Spay/neuter status and agreements</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Breeder Standards</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Breeding females must be at least 18 months old</li>
                <li>• No more than one litter per female per year</li>
                <li>• Maximum of 4-5 litters per female lifetime</li>
                <li>• Proper socialization and care environment</li>
                <li>• Health testing of breeding parents</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Responsibilities & Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What We Provide</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Secure payment processing with buyer protection</li>
                <li>• Verification tools for seller credibility</li>
                <li>• Moderation and reporting systems</li>
                <li>• Educational resources about responsible pet ownership</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">User Responsibilities</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verify all health claims and documentation independently</li>
                <li>• Meet pets in person before completing purchase</li>
                <li>• Report suspicious or fraudulent listings</li>
                <li>• Comply with all applicable local, state, and federal laws</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              If you have questions about these terms or need to report a violation:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Email: legal@mypup.com</li>
              <li>• Report abuse: Use the report button on any listing</li>
              <li>• Emergency animal welfare concerns: Contact local authorities</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
