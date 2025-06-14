
import React from 'react';
import { Scale, FileText, AlertTriangle, Shield, Users, CheckCircle, Gavel, Book } from 'lucide-react';

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
        "Texas - Health and Safety Code Chapter 802",
        "Pennsylvania - Unfair Trade Practices Act",
        "Connecticut - Puppy Lemon Law CGS 22-344a"
      ]
    },
    {
      title: "Breeder Licensing Requirements",
      icon: FileText,
      description: "Legal requirements for commercial dog breeding operations",
      items: [
        "USDA Animal Welfare Act licensing for commercial breeders",
        "State commercial breeder permits and registration",
        "Local business licensing and zoning requirements",
        "Health department certifications and inspections",
        "Professional liability insurance requirements",
        "Record keeping and documentation mandates"
      ]
    },
    {
      title: "Consumer Protection Laws",
      icon: Shield,
      description: "Federal and state laws protecting pet buyers",
      items: [
        "Truth in advertising requirements for pet sales",
        "Health guarantee mandates and disclosure laws",
        "Mandatory disclosure of medical history and genetic testing",
        "Return and refund policy requirements",
        "Cooling-off period provisions in some states",
        "Anti-fraud and misrepresentation protections"
      ]
    },
    {
      title: "Animal Welfare Regulations",
      icon: Users,
      description: "Laws governing the care and treatment of breeding animals",
      items: [
        "Minimum housing and space requirements",
        "Veterinary care and health monitoring standards",
        "Breeding age and frequency limitations",
        "Socialization and exercise requirements",
        "Nutrition and feeding standards",
        "Humane treatment and anti-cruelty provisions"
      ]
    },
    {
      title: "Contract and Sale Requirements",
      icon: CheckCircle,
      description: "Legal requirements for puppy purchase agreements",
      items: [
        "Written contract requirements in many states",
        "Mandatory health certificate provisions",
        "Spay/neuter agreement disclosures",
        "Registration paper transfer requirements",
        "Warranty and guarantee terms",
        "Dispute resolution and arbitration clauses"
      ]
    },
    {
      title: "Important Legal Warnings",
      icon: AlertTriangle,
      description: "Key legal considerations for buyers and sellers",
      items: [
        "Always verify breeder licensing and permits",
        "Understand your state's specific lemon laws",
        "Review all contracts and agreements carefully",
        "Keep detailed documentation of all transactions",
        "Know your rights regarding returns and refunds",
        "Report suspected violations to appropriate authorities"
      ]
    }
  ];

  const federalLaws = [
    {
      title: "Animal Welfare Act (AWA)",
      description: "Federal law regulating the treatment of animals in research, exhibition, transport, and by dealers",
      requirements: [
        "USDA licensing for commercial breeders",
        "Regular inspections and compliance checks",
        "Minimum standards for animal care and treatment",
        "Record keeping and reporting requirements"
      ]
    },
    {
      title: "Interstate Commerce Regulations",
      description: "Federal regulations governing the transport and sale of animals across state lines",
      requirements: [
        "Health certificates for interstate transport",
        "Quarantine and testing requirements",
        "Transportation safety standards",
        "Import/export documentation"
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
            Know the laws that protect you and ensure ethical practices in the pet industry.
          </p>
        </div>

        {/* Legal Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {legalSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <Icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">•</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Federal Laws Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <Gavel className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Federal Laws and Regulations</h2>
            <p className="text-lg text-gray-600">Key federal legislation affecting the pet industry</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {federalLaws.map((law, index) => (
              <div key={index} className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{law.title}</h3>
                <p className="text-gray-700 mb-4">{law.description}</p>
                <ul className="space-y-2">
                  {law.requirements.map((requirement, reqIndex) => (
                    <li key={reqIndex} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* State-by-State Guide */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">State-by-State Quick Reference</h2>
            <p className="text-lg text-gray-600">Know your state's specific requirements</p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold text-gray-900 mb-2">California</h4>
                <p className="text-sm text-gray-600">Strict breeder licensing, pet store regulations, and comprehensive lemon laws</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold text-gray-900 mb-2">New York</h4>
                <p className="text-sm text-gray-600">Puppy mill regulations, pet dealer licensing, and consumer protection laws</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold text-gray-900 mb-2">Florida</h4>
                <p className="text-sm text-gray-600">Comprehensive puppy lemon law and strict breeder registration requirements</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold text-gray-900 mb-2">Texas</h4>
                <p className="text-sm text-gray-600">Commercial breeder licensing and animal welfare standards</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold text-gray-900 mb-2">Pennsylvania</h4>
                <p className="text-sm text-gray-600">Enhanced kennel licensing and regular facility inspections</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold text-gray-900 mb-2">Other States</h4>
                <p className="text-sm text-gray-600">Varying requirements - always check local and state laws</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Disclaimer</h3>
              <p className="text-gray-700 mb-4">
                This information is for educational purposes only and does not constitute legal advice. 
                Laws vary by state and locality and are subject to change. Always consult with a qualified 
                attorney for specific legal questions related to pet purchases, breeding operations, or business licensing.
              </p>
              <p className="text-gray-700">
                MY PUP is not responsible for any legal issues arising from the use of this information. 
                Users should verify current laws and regulations in their jurisdiction before making any decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Resources and Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Federal Resources</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• USDA Animal Care Program</li>
                <li>• Federal Trade Commission (FTC)</li>
                <li>• Better Business Bureau (BBB)</li>
                <li>• Consumer Financial Protection Bureau</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">State Resources</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• State Attorney General Offices</li>
                <li>• Department of Agriculture</li>
                <li>• Consumer Protection Agencies</li>
                <li>• State Veterinary Boards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Professional Organizations</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• American Kennel Club (AKC)</li>
                <li>• Pet Industry Distributors Association</li>
                <li>• National Animal Interest Alliance</li>
                <li>• American Veterinary Medical Association</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Emergency Legal Contact</h4>
            <p className="text-gray-700 mb-2">
              If you suspect fraud, animal abuse, or other serious violations:
            </p>
            <ul className="text-gray-700 space-y-1">
              <li>• Contact local law enforcement immediately</li>
              <li>• Report to your state's consumer protection agency</li>
              <li>• File a complaint with the USDA if a licensed breeder is involved</li>
              <li>• Contact MY PUP support to report platform violations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
