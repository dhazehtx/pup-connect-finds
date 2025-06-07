
import React, { useState } from 'react';
import { Scale, MapPin, AlertTriangle, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Legal = () => {
  const [openSections, setOpenSections] = useState<string[]>(['california']);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const stateLaws = [
    {
      id: 'california',
      state: 'California',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'Assembly Bill 2273 (2022) - Strict regulations on commercial dog breeding',
        'Pet Store Ban - Must source from shelters/rescues only',
        'Maximum 50 intact female dogs for commercial breeders',
        'Mandatory spay/neuter by 4 months (with exemptions)',
        'USDA licensing required for 4+ breeding females'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'USDA license required for commercial operations (4+ breeding females)',
        healthCerts: 'Health certificate from licensed veterinarian required',
        records: 'Detailed breeding and health records must be maintained',
        inspections: 'Annual facility inspections for commercial breeders'
      },
      restrictions: [
        'Pet stores cannot sell dogs from commercial breeders',
        'Maximum of 6 litters per breeder per year without commercial license',
        'Breeding females must be at least 12 months old',
        'No more than 4 litters per female per lifetime',
        'Cannot separate puppies from mother before 8 weeks'
      ],
      penalties: 'Violations can result in fines up to $1,000 per violation and criminal charges for repeat offenders'
    },
    {
      id: 'texas',
      state: 'Texas',
      severity: 'moderate',
      lastUpdated: '2023',
      keyPoints: [
        'House Bill 1818 - Commercial dog breeder regulations',
        'USDA licensing for 20+ intact females',
        'State licensing for 11-19 intact females',
        'Regular veterinary care requirements',
        'Facility inspection requirements'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'State license required for 11+ breeding females, USDA for 20+',
        healthCerts: 'Health certificate and vaccination records required',
        records: 'Breeding records must be kept for 3 years',
        inspections: 'Annual inspections for licensed breeders'
      },
      restrictions: [
        'Maximum of 6 litters per female per 2-year period',
        'Breeding females must be at least 18 months old',
        'Adequate space and exercise requirements',
        'Temperature control in facilities required',
        'Cannot breed female on consecutive heat cycles'
      ],
      penalties: 'Civil penalties up to $10,000 per violation, possible license revocation'
    },
    {
      id: 'florida',
      state: 'Florida',
      severity: 'moderate',
      lastUpdated: '2023',
      keyPoints: [
        'Chapter 828 - Animal Protection Laws',
        'Commercial breeder registration required',
        'Pet dealer licensing for sales',
        'Facility standards and inspections',
        'Health certificate requirements'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Pet dealer license required for selling more than 2 litters per year',
        healthCerts: 'Health certificate within 30 days of sale',
        records: 'Sales and health records must be maintained',
        inspections: 'Regular facility inspections'
      },
      restrictions: [
        'Cannot separate puppies from mother before 8 weeks',
        'Adequate housing and sanitation standards',
        'Regular veterinary care required',
        'Proper identification and record keeping',
        'Cannot sell sick or diseased animals'
      ],
      penalties: 'Misdemeanor charges, fines up to $5,000, and license suspension possible'
    },
    {
      id: 'newyork',
      state: 'New York',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'Agriculture and Markets Law Article 7',
        'Pet dealer licensing requirements',
        'Puppy mill regulations',
        'Consumer protection laws',
        'Health guarantee requirements'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Pet dealer license required for commercial operations',
        healthCerts: 'Health certificate and vaccination records required',
        records: 'Detailed health and breeding records',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Cannot sell dogs under 8 weeks old',
        'Must provide health guarantee for 14 days',
        'Facility standards for space, ventilation, sanitation',
        'Cannot import dogs from puppy mills',
        'Consumer disclosure requirements'
      ],
      penalties: 'Criminal charges possible, fines up to $1,000 per violation, license revocation'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'strict': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lenient': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
          <Scale size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Legal Requirements for Dog Breeders
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Comprehensive state-by-state legal requirements and regulations for dog breeding and sales
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Important Legal Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <p className="mb-4">
            <strong>This information is for educational purposes only and should not be considered legal advice.</strong> 
            Laws change frequently and vary by municipality. Always consult with a qualified attorney and verify 
            current regulations with local authorities before beginning any breeding operation.
          </p>
          <ul className="space-y-2 text-sm">
            <li>• Laws vary significantly between states, counties, and cities</li>
            <li>• Some municipalities have complete bans on commercial breeding</li>
            <li>• Federal USDA regulations may also apply depending on operation size</li>
            <li>• Zoning laws may restrict breeding activities in residential areas</li>
          </ul>
        </CardContent>
      </Card>

      {/* State-by-State Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">State-by-State Requirements</h2>
        
        {stateLaws.map((state) => (
          <Card key={state.id} className="border-border">
            <Collapsible open={openSections.includes(state.id)} onOpenChange={() => toggleSection(state.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {openSections.includes(state.id) ? (
                          <ChevronDown size={20} className="text-muted-foreground" />
                        ) : (
                          <ChevronRight size={20} className="text-muted-foreground" />
                        )}
                        <MapPin size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{state.state}</h3>
                        <p className="text-sm text-muted-foreground">Last updated: {state.lastUpdated}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(state.severity)}>
                      {state.severity.charAt(0).toUpperCase() + state.severity.slice(1)} Regulations
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Key Points */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText size={16} />
                        Key Legislative Points
                      </h4>
                      <ul className="space-y-2">
                        {state.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Legal Requirements</h4>
                        <div className="space-y-3">
                          {Object.entries(state.requirements).map(([key, value]) => (
                            <div key={key} className="bg-muted/50 p-3 rounded-lg">
                              <p className="font-medium text-sm text-foreground capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </p>
                              <p className="text-sm text-muted-foreground">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Restrictions & Standards</h4>
                        <ul className="space-y-2">
                          {state.restrictions.map((restriction, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                              {restriction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Penalties */}
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Penalties for Violations</h4>
                      <p className="text-sm text-red-700">{state.penalties}</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Federal Requirements */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Federal USDA Requirements</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-4">
            <p className="font-medium">
              The Animal Welfare Act requires USDA licensing for commercial dog breeders who:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Have 4+ breeding females AND sell to pet stores, brokers, or research facilities</li>
              <li>• Sell dogs sight unseen (online/mail-order) with 4+ breeding females</li>
              <li>• Wholesale dogs to other dealers</li>
            </ul>
            <p className="text-sm">
              <strong>Note:</strong> Direct sales to individuals at your facility typically do not require USDA licensing, 
              but state and local laws may still apply.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Government Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• USDA Animal and Plant Health Inspection Service (APHIS)</li>
                <li>• State Department of Agriculture (varies by state)</li>
                <li>• Local city/county animal control departments</li>
                <li>• State veterinary boards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Professional Organizations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• American Kennel Club (AKC)</li>
                <li>• Professional Animal Workers of America</li>
                <li>• National Animal Interest Alliance</li>
                <li>• Responsible Dog Owners Association</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Legal;
