
import React, { useState } from 'react';
import { Scale, FileText, AlertTriangle, Shield, Users, CheckCircle, Gavel, Book, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Legal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const stateData = [
    {
      name: "Alabama",
      category: "lenient" as const,
      licensing: "Basic registration only",
      healthCertificates: "Not required",
      restrictions: [
        "Minimal facility requirements",
        "Basic animal cruelty laws"
      ],
      penalties: "Minor fines",
      legislativeAct: "Limited state regulation"
    },
    {
      name: "Alaska",
      category: "moderate" as const,
      licensing: "Commercial breeder permits required",
      healthCertificates: "Basic health documentation",
      restrictions: [
        "Minimum care standards",
        "Inspection requirements",
        "Record keeping"
      ],
      penalties: "Civil penalties and license revocation",
      legislativeAct: "Alaska Statutes Title 3"
    },
    {
      name: "Arizona",
      category: "moderate" as const,
      licensing: "Commercial licensing required",
      healthCertificates: "Health certificates recommended",
      restrictions: [
        "Facility inspection requirements",
        "Consumer protection laws",
        "Basic care standards"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "Arizona Revised Statutes Title 3"
    },
    {
      name: "Arkansas",
      category: "lenient" as const,
      licensing: "Minimal licensing requirements",
      healthCertificates: "Not mandatory",
      restrictions: [
        "Basic facility standards",
        "Animal welfare minimums"
      ],
      penalties: "Minor penalties",
      legislativeAct: "Arkansas Code Title 2"
    },
    {
      name: "California",
      category: "strict" as const,
      licensing: "Required for commercial breeders with 4+ breeding females",
      healthCertificates: "Mandatory health certificates and genetic testing disclosure",
      restrictions: [
        "Pet store sales restrictions",
        "Mandatory spay/neuter contracts",
        "Regular facility inspections",
        "Breeding age restrictions"
      ],
      penalties: "Fines up to $10,000 and business closure",
      legislativeAct: "AB 485 - Pet Store Sale Ban"
    },
    {
      name: "Colorado",
      category: "strict" as const,
      licensing: "Enhanced licensing for commercial operations",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Consumer protection laws",
        "Breeding limitations",
        "Regular inspections"
      ],
      penalties: "Significant fines and criminal charges",
      legislativeAct: "Colorado Pet Animal Care Facilities Act"
    },
    {
      name: "Connecticut",
      category: "strict" as const,
      licensing: "Commercial breeder licensing mandatory",
      healthCertificates: "Required health certifications",
      restrictions: [
        "Facility inspection requirements",
        "Consumer disclosure laws",
        "Breeding restrictions",
        "Animal welfare standards"
      ],
      penalties: "Heavy fines and license revocation",
      legislativeAct: "Connecticut General Statutes Chapter 435"
    },
    {
      name: "Delaware",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Record keeping mandates"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "Delaware Code Title 3"
    },
    {
      name: "Florida",
      category: "moderate" as const,
      licensing: "Registration required for commercial operations",
      healthCertificates: "Health certificates recommended",
      restrictions: [
        "Puppy lemon law protection",
        "Basic facility standards",
        "Disclosure requirements"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "Chapter 687 - Puppy Lemon Law"
    },
    {
      name: "Georgia",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Basic health requirements",
      restrictions: [
        "Facility inspection standards",
        "Consumer protection measures",
        "Animal care minimums"
      ],
      penalties: "Civil penalties and license actions",
      legislativeAct: "Georgia Code Title 4"
    },
    {
      name: "Hawaii",
      category: "strict" as const,
      licensing: "Strict licensing and quarantine requirements",
      healthCertificates: "Extensive health and quarantine protocols",
      restrictions: [
        "Quarantine requirements",
        "Import restrictions",
        "Health certification mandates",
        "Facility inspections"
      ],
      penalties: "Severe penalties and quarantine violations",
      legislativeAct: "Hawaii Revised Statutes Chapter 142"
    },
    {
      name: "Idaho",
      category: "lenient" as const,
      licensing: "Basic licensing only",
      healthCertificates: "Not required",
      restrictions: [
        "Minimal facility requirements",
        "Basic animal welfare laws"
      ],
      penalties: "Minor fines",
      legislativeAct: "Idaho Code Title 25"
    },
    {
      name: "Illinois",
      category: "strict" as const,
      licensing: "Commercial breeder licensing required",
      healthCertificates: "Health certificates mandatory",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Breeding limitations"
      ],
      penalties: "Significant fines and criminal charges",
      legislativeAct: "Animal Welfare Act - Illinois"
    },
    {
      name: "Indiana",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Basic health documentation",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Record keeping"
      ],
      penalties: "Fines and license actions",
      legislativeAct: "Indiana Code Title 15"
    },
    {
      name: "Iowa",
      category: "moderate" as const,
      licensing: "Commercial breeder licensing",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility inspection standards",
        "Animal care requirements",
        "Consumer protections"
      ],
      penalties: "Civil penalties and license suspension",
      legislativeAct: "Iowa Code Chapter 162"
    },
    {
      name: "Kansas",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Basic health requirements",
      restrictions: [
        "Facility standards",
        "Inspection protocols",
        "Record maintenance"
      ],
      penalties: "Fines and license revocation",
      legislativeAct: "Kansas Statutes Chapter 47"
    },
    {
      name: "Kentucky",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Health documentation recommended",
      restrictions: [
        "Basic facility standards",
        "Animal welfare minimums",
        "Consumer disclosure"
      ],
      penalties: "Civil penalties",
      legislativeAct: "Kentucky Revised Statutes Chapter 258"
    },
    {
      name: "Louisiana",
      category: "lenient" as const,
      licensing: "Minimal licensing requirements",
      healthCertificates: "Not mandatory",
      restrictions: [
        "Basic animal welfare laws",
        "Minimal facility standards"
      ],
      penalties: "Minor fines",
      legislativeAct: "Louisiana Revised Statutes Title 3"
    },
    {
      name: "Maine",
      category: "strict" as const,
      licensing: "Commercial breeder licensing mandatory",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Animal welfare mandates"
      ],
      penalties: "Heavy fines and criminal charges",
      legislativeAct: "Maine Revised Statutes Title 7"
    },
    {
      name: "Maryland",
      category: "strict" as const,
      licensing: "Enhanced licensing for commercial operations",
      healthCertificates: "Health certificates required",
      restrictions: [
        "Facility inspection requirements",
        "Consumer protection laws",
        "Breeding restrictions",
        "Animal welfare standards"
      ],
      penalties: "Significant fines and license revocation",
      legislativeAct: "Maryland Code Agriculture Article"
    },
    {
      name: "Massachusetts",
      category: "strict" as const,
      licensing: "Commercial breeder licensing required",
      healthCertificates: "Health certificates mandatory",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Pet store restrictions"
      ],
      penalties: "Heavy fines and criminal charges",
      legislativeAct: "Massachusetts General Laws Chapter 140"
    },
    {
      name: "Michigan",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Consumer protections"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "Michigan Compiled Laws Chapter 287"
    },
    {
      name: "Minnesota",
      category: "strict" as const,
      licensing: "Commercial breeder licensing mandatory",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Breeding limitations"
      ],
      penalties: "Significant fines and criminal charges",
      legislativeAct: "Minnesota Statutes Chapter 347"
    },
    {
      name: "Mississippi",
      category: "lenient" as const,
      licensing: "Basic registration only",
      healthCertificates: "Not required",
      restrictions: [
        "Minimal facility requirements",
        "Basic animal cruelty laws"
      ],
      penalties: "Minor fines",
      legislativeAct: "Mississippi Code Title 69"
    },
    {
      name: "Missouri",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Basic health documentation",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Record keeping"
      ],
      penalties: "Civil penalties and license actions",
      legislativeAct: "Missouri Revised Statutes Chapter 273"
    },
    {
      name: "Montana",
      category: "lenient" as const,
      licensing: "Minimal licensing requirements",
      healthCertificates: "Not mandatory",
      restrictions: [
        "Basic animal welfare laws",
        "Limited facility standards"
      ],
      penalties: "Minor penalties",
      legislativeAct: "Montana Code Annotated Title 81"
    },
    {
      name: "Nebraska",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation recommended",
      restrictions: [
        "Facility standards",
        "Basic inspection requirements",
        "Consumer protections"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "Nebraska Revised Statutes Chapter 54"
    },
    {
      name: "Nevada",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Basic health requirements",
      restrictions: [
        "Facility inspection standards",
        "Animal care minimums",
        "Record keeping"
      ],
      penalties: "Civil penalties",
      legislativeAct: "Nevada Revised Statutes Chapter 574"
    },
    {
      name: "New Hampshire",
      category: "strict" as const,
      licensing: "Commercial breeder licensing required",
      healthCertificates: "Health certificates mandatory",
      restrictions: [
        "Facility inspection requirements",
        "Consumer protection laws",
        "Animal welfare standards",
        "Breeding restrictions"
      ],
      penalties: "Heavy fines and license revocation",
      legislativeAct: "New Hampshire Revised Statutes Title 437"
    },
    {
      name: "New Jersey",
      category: "strict" as const,
      licensing: "Enhanced licensing for commercial operations",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Pet store regulations"
      ],
      penalties: "Significant fines and criminal charges",
      legislativeAct: "New Jersey Statutes Title 4"
    },
    {
      name: "New Mexico",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Animal welfare minimums"
      ],
      penalties: "Fines and license actions",
      legislativeAct: "New Mexico Statutes Chapter 77"
    },
    {
      name: "New York",
      category: "strict" as const,
      licensing: "Commercial breeder licensing required",
      healthCertificates: "Health certificates required for all sales",
      restrictions: [
        "Pet dealer licensing",
        "Facility inspection requirements",
        "Record keeping mandates",
        "Consumer protection laws"
      ],
      penalties: "Criminal charges and civil penalties",
      legislativeAct: "Agriculture and Markets Law Article 7"
    },
    {
      name: "North Carolina",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Basic health documentation",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Consumer protections"
      ],
      penalties: "Civil penalties and license suspension",
      legislativeAct: "North Carolina General Statutes Chapter 19A"
    },
    {
      name: "North Dakota",
      category: "lenient" as const,
      licensing: "Basic registration only",
      healthCertificates: "Not required",
      restrictions: [
        "Minimal facility requirements",
        "Basic animal welfare laws"
      ],
      penalties: "Minor fines",
      legislativeAct: "North Dakota Century Code Title 36"
    },
    {
      name: "Ohio",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility inspection standards",
        "Animal care requirements",
        "Consumer protections"
      ],
      penalties: "Fines and license actions",
      legislativeAct: "Ohio Revised Code Chapter 956"
    },
    {
      name: "Oklahoma",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Basic health requirements",
      restrictions: [
        "Facility standards",
        "Inspection protocols",
        "Record keeping"
      ],
      penalties: "Civil penalties",
      legislativeAct: "Oklahoma Statutes Title 4"
    },
    {
      name: "Oregon",
      category: "strict" as const,
      licensing: "Commercial breeder licensing mandatory",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Animal welfare mandates"
      ],
      penalties: "Significant fines and criminal charges",
      legislativeAct: "Oregon Revised Statutes Chapter 686"
    },
    {
      name: "Pennsylvania",
      category: "strict" as const,
      licensing: "Enhanced kennel licensing system",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Regular unannounced inspections",
        "Veterinary care requirements",
        "Exercise and socialization mandates"
      ],
      penalties: "Criminal charges and facility closure",
      legislativeAct: "Dog Law - Enhanced Standards"
    },
    {
      name: "Rhode Island",
      category: "strict" as const,
      licensing: "Commercial breeder licensing required",
      healthCertificates: "Health certificates mandatory",
      restrictions: [
        "Facility inspection requirements",
        "Consumer protection laws",
        "Animal welfare standards",
        "Breeding restrictions"
      ],
      penalties: "Heavy fines and license revocation",
      legislativeAct: "Rhode Island General Laws Title 4"
    },
    {
      name: "South Carolina",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation recommended",
      restrictions: [
        "Basic facility standards",
        "Inspection requirements",
        "Consumer protections"
      ],
      penalties: "Civil penalties and license suspension",
      legislativeAct: "South Carolina Code Title 47"
    },
    {
      name: "South Dakota",
      category: "lenient" as const,
      licensing: "Minimal licensing requirements",
      healthCertificates: "Not mandatory",
      restrictions: [
        "Basic animal welfare laws",
        "Limited facility standards"
      ],
      penalties: "Minor penalties",
      legislativeAct: "South Dakota Codified Laws Title 40"
    },
    {
      name: "Tennessee",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Basic health documentation",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Record keeping"
      ],
      penalties: "Fines and license actions",
      legislativeAct: "Tennessee Code Title 44"
    },
    {
      name: "Texas",
      category: "moderate" as const,
      licensing: "Commercial breeder permits required",
      healthCertificates: "Basic health documentation",
      restrictions: [
        "Minimum care standards",
        "Inspection requirements",
        "Record keeping"
      ],
      penalties: "Civil penalties and license revocation",
      legislativeAct: "Health and Safety Code Chapter 802"
    },
    {
      name: "Utah",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility standards",
        "Inspection protocols",
        "Animal care minimums"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "Utah Code Title 4"
    },
    {
      name: "Vermont",
      category: "strict" as const,
      licensing: "Commercial breeder licensing mandatory",
      healthCertificates: "Comprehensive health requirements",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Animal welfare mandates"
      ],
      penalties: "Significant fines and criminal charges",
      legislativeAct: "Vermont Statutes Title 20"
    },
    {
      name: "Virginia",
      category: "moderate" as const,
      licensing: "Commercial breeder permits",
      healthCertificates: "Health documentation required",
      restrictions: [
        "Facility inspection standards",
        "Animal care requirements",
        "Consumer protections"
      ],
      penalties: "Civil penalties and license actions",
      legislativeAct: "Virginia Code Title 3.2"
    },
    {
      name: "Washington",
      category: "strict" as const,
      licensing: "Enhanced licensing for commercial operations",
      healthCertificates: "Health certificates required",
      restrictions: [
        "Strict facility standards",
        "Regular inspections",
        "Consumer protection laws",
        "Pet store regulations"
      ],
      penalties: "Heavy fines and criminal charges",
      legislativeAct: "Washington Revised Code Chapter 16.70"
    },
    {
      name: "West Virginia",
      category: "moderate" as const,
      licensing: "Commercial operation permits",
      healthCertificates: "Basic health requirements",
      restrictions: [
        "Facility standards",
        "Inspection requirements",
        "Record keeping"
      ],
      penalties: "Fines and license suspension",
      legislativeAct: "West Virginia Code Chapter 19"
    },
    {
      name: "Wisconsin",
      category: "strict" as const,
      licensing: "Commercial breeder licensing required",
      healthCertificates: "Health certificates mandatory",
      restrictions: [
        "Facility inspection requirements",
        "Consumer protection laws",
        "Animal welfare standards",
        "Breeding restrictions"
      ],
      penalties: "Significant fines and license revocation",
      legislativeAct: "Wisconsin Statutes Chapter 174"
    },
    {
      name: "Wyoming",
      category: "lenient" as const,
      licensing: "Basic registration only",
      healthCertificates: "Not required",
      restrictions: [
        "Minimal facility requirements",
        "Basic animal cruelty laws"
      ],
      penalties: "Minor fines",
      legislativeAct: "Wyoming Statutes Title 11"
    }
  ];

  const filteredStates = stateData.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || state.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const strictCount = stateData.filter(s => s.category === 'strict').length;
  const moderateCount = stateData.filter(s => s.category === 'moderate').length;
  const lenientCount = stateData.filter(s => s.category === 'lenient').length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strict': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lenient': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'strict': return 'Strict Regulations';
      case 'moderate': return 'Moderate Regulations';
      case 'lenient': return 'Lenient Regulations';
      default: return 'Unknown';
    }
  };

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

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{strictCount}</div>
              <div className="text-sm text-gray-600">States with Strict Regulations</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{moderateCount}</div>
              <div className="text-sm text-gray-600">States with Moderate Regulations</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{lenientCount}</div>
              <div className="text-sm text-gray-600">States with Lenient Regulations</div>
            </CardContent>
          </Card>
        </div>

        {/* Federal Section */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Gavel size={20} />
              Federal USDA Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 text-blue-800">Commercial Breeding Operations</h4>
              <p className="text-sm text-blue-700 mb-2">
                Any person who maintains breeding female dogs and sells puppies at wholesale for resale, 
                or sells directly to the public if they maintain more than 4 breeding females, must be licensed by USDA.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2 text-blue-800">USDA Licensing Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-start">
                  <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Application and annual licensing fees
                </li>
                <li className="flex items-start">
                  <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Facility inspections by USDA officials
                </li>
                <li className="flex items-start">
                  <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Compliance with Animal Welfare Act standards
                </li>
                <li className="flex items-start">
                  <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Detailed record keeping requirements
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              All States
            </Button>
            <Button
              variant={selectedCategory === 'strict' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('strict')}
              size="sm"
              className={selectedCategory === 'strict' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-200 text-red-700 hover:bg-red-50'}
            >
              Strict Regulations
            </Button>
            <Button
              variant={selectedCategory === 'moderate' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('moderate')}
              size="sm"
              className={selectedCategory === 'moderate' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}
            >
              Moderate Regulations
            </Button>
            <Button
              variant={selectedCategory === 'lenient' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('lenient')}
              size="sm"
              className={selectedCategory === 'lenient' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-200 text-green-700 hover:bg-green-50'}
            >
              Lenient Regulations
            </Button>
          </div>
        </div>

        {/* State Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredStates.map((state) => (
            <Card key={state.name} className="h-full border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-gray-900">{state.name}</CardTitle>
                  <Badge className={getCategoryColor(state.category)}>
                    {getCategoryLabel(state.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Licensing Requirements</h4>
                  <p className="text-sm text-gray-600">{state.licensing}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Health Certificates</h4>
                  <p className="text-sm text-gray-600">{state.healthCertificates}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Key Restrictions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {state.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900">Penalties</h4>
                  <p className="text-sm text-gray-600">{state.penalties}</p>
                </div>
                
                {state.legislativeAct && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-gray-900">Legislative Act</h4>
                    <p className="text-sm text-gray-600">{state.legislativeAct}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resources */}
        <div className="bg-white p-8 rounded-lg border border-blue-200 shadow-sm">
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
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mt-8">
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
      </div>
    </div>
  );
};

export default Legal;
