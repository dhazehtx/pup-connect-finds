
import React from 'react';
import { Scale, FileText, AlertTriangle, Shield } from 'lucide-react';

const Legal = () => {
  const legalSections = [
    {
      title: "Puppy Lemon Laws by State",
      icon: Scale,
      description: "State-specific laws protecting puppy buyers from defective pets",
      items: [
        "California - Song-Beverly Consumer Warranty Act",
        "New York - General Business Law Section 753-a",
        "Florida - Puppy Lemon Law Chapter 687",
        "Texas - Health and Safety Code Chapter 802"
      ]
    },
    {
      title: "Breeder Licensing Requirements",
      icon: FileText,
      description: "Legal requirements for commercial dog breeding operations",
      items: [
        "USDA Animal Welfare Act licensing",
        "State commercial breeder permits",
        "Local business licensing requirements",
        "Health department certifications"
      ]
    },
    {
      title: "Consumer Protection Laws",
      icon: Shield,
      description: "Federal and state laws protecting pet buyers",
      items: [
        "Truth in advertising requirements",
        "Health guarantee mandates",
        "Disclosure of medical history",
        "Return and refund policies"
      ]
    },
    {
      title: "Important Legal Warnings",
      icon: AlertTriangle,
      description: "Key legal considerations for buyers and sellers",
      items: [
        "Always verify breeder licensing",
        "Understand your state's lemon laws",
        "Review contracts carefully",
        "Keep all documentation"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Scale className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Guide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding your rights and responsibilities when buying or selling puppies. 
            Know the laws that protect you and ensure ethical practices.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {legalSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                <Icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Disclaimer</h3>
              <p className="text-gray-700">
                This information is for educational purposes only and does not constitute legal advice. 
                Laws vary by state and locality. Always consult with a qualified attorney for specific 
                legal questions related to pet purchases, breeding operations, or business licensing.
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Federal Resources</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• USDA Animal Care Program</li>
                <li>• Federal Trade Commission (FTC)</li>
                <li>• Better Business Bureau</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">State Resources</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• State Attorney General Offices</li>
                <li>• Department of Agriculture</li>
                <li>• Consumer Protection Agencies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
