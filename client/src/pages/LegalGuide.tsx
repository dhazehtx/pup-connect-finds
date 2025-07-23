import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

interface StateRegulation {
  state: string;
  level: 'strict' | 'moderate' | 'lenient';
  licensing: string;
  health: string;
  restrictions: string;
  penalties: string;
  act: string;
}

const stateRegulations: StateRegulation[] = [
  // Strict Regulations (18 states - Red)
  { state: 'California', level: 'strict', licensing: 'Commercial breeder license required for 3+ litters annually', health: 'Veterinary inspection within 14 days', restrictions: 'No sales in pet stores, mandatory microchipping', penalties: 'Up to $5,000 fine, license revocation', act: 'Puppy Mill Prevention Act' },
  { state: 'New York', level: 'strict', licensing: 'Pet dealer license for commercial breeding', health: 'Health certificate from licensed vet', restrictions: 'Banned retail puppy sales, breeding facility inspections', penalties: 'Class A misdemeanor, $1,000 fine', act: 'Puppy Mill Pipeline Act' },
  { state: 'Maryland', level: 'strict', licensing: 'Kennel license for 20+ dogs', health: 'Annual vet inspections required', restrictions: 'Pet store sourcing restrictions', penalties: 'Criminal charges, $1,000 fine per violation', act: 'No Puppy Mills Act' },
  { state: 'Maine', level: 'strict', licensing: 'Commercial breeding license required', health: 'Pre-sale vet examination mandatory', restrictions: 'Retail ban on puppy mill puppies', penalties: 'Civil penalties up to $2,000', act: 'An Act to Prohibit Certain Dog Sales' },
  { state: 'Massachusetts', level: 'strict', licensing: 'Commercial breeder registration', health: 'Health certificate within 14 days', restrictions: 'Pet store sales ban', penalties: 'Fine up to $2,500 per violation', act: 'Puppy Mill Prevention Act' },
  { state: 'Connecticut', level: 'strict', licensing: 'Pet shop operator license', health: 'Vet health certificate required', restrictions: 'Commercial breeding facility standards', penalties: 'Class D felony for violations', act: 'An Act Concerning Dog Breeding Facilities' },
  { state: 'Rhode Island', level: 'strict', licensing: 'Commercial breeder permit', health: 'Annual veterinary inspections', restrictions: 'Retail puppy sale restrictions', penalties: 'Misdemeanor charges, fines', act: 'Commercial Dog Breeding Regulations' },
  { state: 'Vermont', level: 'strict', licensing: 'Kennel license for breeding operations', health: 'Health certificates mandatory', restrictions: 'Breeding facility standards', penalties: 'Criminal penalties for violations', act: 'Animal Welfare Act' },
  { state: 'New Jersey', level: 'strict', licensing: 'Pet shop and kennel licensing', health: 'Veterinary health documentation', restrictions: 'Puppy mill sourcing prohibited', penalties: 'Fines up to $3,000 per violation', act: 'Puppy Mill Prevention Act' },
  { state: 'Illinois', level: 'strict', licensing: 'Commercial dog dealer license', health: 'Health certificate from vet', restrictions: 'Pet store sourcing regulations', penalties: 'Class A misdemeanor charges', act: 'Humane Care for Animals Act' },
  { state: 'Oregon', level: 'strict', licensing: 'Commercial dog breeding license', health: 'Pre-sale veterinary exam', restrictions: 'Facility inspection requirements', penalties: 'Civil penalties up to $2,000', act: 'Commercial Dog Breeding Regulations' },
  { state: 'Washington', level: 'strict', licensing: 'Commercial kennel license required', health: 'Health certificates mandatory', restrictions: 'Breeding facility standards', penalties: 'Gross misdemeanor charges', act: 'Commercial Dog Breeding Act' },
  { state: 'Virginia', level: 'strict', licensing: 'Dealer permit for commercial breeding', health: 'Veterinary care documentation', restrictions: 'Facility inspection protocols', penalties: 'Class 1 misdemeanor penalties', act: 'Comprehensive Animal Care Laws' },
  { state: 'Nevada', level: 'strict', licensing: 'Breeder license for commercial operations', health: 'Health certificate requirements', restrictions: 'Pet store sourcing limitations', penalties: 'Fines and license suspension', act: 'Commercial Breeding Regulations' },
  { state: 'Colorado', level: 'strict', licensing: 'Pet animal care facility license', health: 'Veterinary health documentation', restrictions: 'Breeding facility standards', penalties: 'Criminal charges for violations', act: 'Pet Animal Care Facilities Act' },
  { state: 'Minnesota', level: 'strict', licensing: 'Commercial breeder license', health: 'Health certificates required', restrictions: 'Facility inspection requirements', penalties: 'Misdemeanor charges, fines', act: 'Commercial Dog and Cat Breeder Licensing' },
  { state: 'Hawaii', level: 'strict', licensing: 'Commercial breeder permit', health: 'Veterinary health certificates', restrictions: 'Import/export regulations', penalties: 'Administrative penalties', act: 'Animal Import Regulations' },
  { state: 'Delaware', level: 'strict', licensing: 'Kennel license for breeding', health: 'Health documentation required', restrictions: 'Commercial breeding standards', penalties: 'Criminal penalties for violations', act: 'Animal Welfare Laws' },

  // Moderate Regulations (23 states - Blue)
  { state: 'Florida', level: 'moderate', licensing: 'Kennel license for 4+ breeding females', health: 'Health certificate recommended', restrictions: 'Basic facility requirements', penalties: 'Administrative fines', act: 'Florida Animal Welfare Act' },
  { state: 'Texas', level: 'moderate', licensing: 'Commercial breeder license', health: 'Health records maintained', restrictions: 'Facility inspection guidelines', penalties: 'Civil penalties for violations', act: 'Texas Animal Health and Safety Code' },
  { state: 'Pennsylvania', level: 'moderate', licensing: 'Kennel license for commercial breeding', health: 'Veterinary care standards', restrictions: 'Breeding facility regulations', penalties: 'Summary offenses, fines', act: 'Dog Law and Regulations' },
  { state: 'Ohio', level: 'moderate', licensing: 'High volume breeder license', health: 'Health certificate standards', restrictions: 'Facility care requirements', penalties: 'Misdemeanor charges', act: 'Dangerous and Vicious Dog Laws' },
  { state: 'Michigan', level: 'moderate', licensing: 'Large scale dog breeding license', health: 'Veterinary care protocols', restrictions: 'Facility maintenance standards', penalties: 'Civil infractions', act: 'Large Scale Dog Breeding Facilities' },
  { state: 'Georgia', level: 'moderate', licensing: 'Pet dealer license', health: 'Health documentation', restrictions: 'Basic facility standards', penalties: 'Misdemeanor violations', act: 'Georgia Animal Protection Act' },
  { state: 'North Carolina', level: 'moderate', licensing: 'Commercial breeder license', health: 'Health certificate guidelines', restrictions: 'Facility inspection standards', penalties: 'Class 1 misdemeanor', act: 'Animal Welfare Act' },
  { state: 'Tennessee', level: 'moderate', licensing: 'Commercial breeder permit', health: 'Veterinary documentation', restrictions: 'Basic care requirements', penalties: 'Class A misdemeanor', act: 'Tennessee Animal Protection Laws' },
  { state: 'Indiana', level: 'moderate', licensing: 'Dealer license for breeding', health: 'Health record maintenance', restrictions: 'Facility standards', penalties: 'Class B misdemeanor', act: 'Indiana Animal Welfare Laws' },
  { state: 'Wisconsin', level: 'moderate', licensing: 'Dog seller license', health: 'Health certificate standards', restrictions: 'Breeding facility guidelines', penalties: 'Forfeitures up to $500', act: 'Dog Seller Licensing' },
  { state: 'Missouri', level: 'moderate', licensing: 'Commercial breeder license', health: 'Veterinary care requirements', restrictions: 'Facility maintenance standards', penalties: 'Class A misdemeanor', act: 'Animal Care Facilities Act' },
  { state: 'Arizona', level: 'moderate', licensing: 'Kennel permit for breeding', health: 'Health documentation', restrictions: 'Basic facility requirements', penalties: 'Class 2 misdemeanor', act: 'Arizona Animal Welfare Laws' },
  { state: 'Louisiana', level: 'moderate', licensing: 'Commercial breeder registration', health: 'Health record keeping', restrictions: 'Facility care standards', penalties: 'Fines up to $500', act: 'Louisiana Animal Welfare Laws' },
  { state: 'Kentucky', level: 'moderate', licensing: 'Dog breeder license', health: 'Veterinary care protocols', restrictions: 'Facility inspection guidelines', penalties: 'Class B misdemeanor', act: 'Kentucky Animal Welfare Laws' },
  { state: 'Iowa', level: 'moderate', licensing: 'Commercial breeder license', health: 'Health certificate requirements', restrictions: 'Facility standards', penalties: 'Simple misdemeanor', act: 'Iowa Animal Welfare Act' },
  { state: 'Kansas', level: 'moderate', licensing: 'Animal dealer license', health: 'Health documentation', restrictions: 'Basic care requirements', penalties: 'Class C misdemeanor', act: 'Kansas Pet Animal Act' },
  { state: 'Oklahoma', level: 'moderate', licensing: 'Commercial pet breeder license', health: 'Veterinary care standards', restrictions: 'Facility maintenance', penalties: 'Misdemeanor charges', act: 'Oklahoma Animal Welfare Laws' },
  { state: 'Arkansas', level: 'moderate', licensing: 'Dog breeder registration', health: 'Health record maintenance', restrictions: 'Basic facility standards', penalties: 'Class A misdemeanor', act: 'Arkansas Animal Welfare Laws' },
  { state: 'Utah', level: 'moderate', licensing: 'Commercial breeder permit', health: 'Health certificate guidelines', restrictions: 'Facility care requirements', penalties: 'Class B misdemeanor', act: 'Utah Animal Welfare Act' },
  { state: 'New Mexico', level: 'moderate', licensing: 'Animal dealer license', health: 'Veterinary documentation', restrictions: 'Basic facility standards', penalties: 'Petty misdemeanor', act: 'New Mexico Animal Welfare Laws' },
  { state: 'Nebraska', level: 'moderate', licensing: 'Dog and cat operator license', health: 'Health record keeping', restrictions: 'Facility maintenance standards', penalties: 'Class III misdemeanor', act: 'Nebraska Dog and Cat Operator Licensing' },
  { state: 'Alabama', level: 'moderate', licensing: 'Commercial breeder license', health: 'Health documentation', restrictions: 'Basic care requirements', penalties: 'Class C misdemeanor', act: 'Alabama Animal Welfare Laws' },
  { state: 'South Carolina', level: 'moderate', licensing: 'Pet dealer registration', health: 'Veterinary care protocols', restrictions: 'Facility standards', penalties: 'Misdemeanor violations', act: 'South Carolina Animal Welfare Laws' },

  // Lenient Regulations (9 states - Green)
  { state: 'Mississippi', level: 'lenient', licensing: 'Basic registration for large operations', health: 'Minimal health requirements', restrictions: 'Limited facility standards', penalties: 'Minor fines', act: 'Basic Animal Welfare Laws' },
  { state: 'West Virginia', level: 'lenient', licensing: 'Optional breeder registration', health: 'Basic health documentation', restrictions: 'Minimal facility requirements', penalties: 'Administrative penalties', act: 'West Virginia Animal Welfare Laws' },
  { state: 'Wyoming', level: 'lenient', licensing: 'Minimal licensing requirements', health: 'Basic veterinary care', restrictions: 'Limited regulations', penalties: 'Minor violations', act: 'Wyoming Animal Welfare Statutes' },
  { state: 'North Dakota', level: 'lenient', licensing: 'Basic breeder registration', health: 'Minimal health standards', restrictions: 'Limited facility requirements', penalties: 'Administrative fines', act: 'North Dakota Animal Welfare Laws' },
  { state: 'South Dakota', level: 'lenient', licensing: 'Optional commercial license', health: 'Basic health documentation', restrictions: 'Minimal regulations', penalties: 'Minor penalties', act: 'South Dakota Animal Welfare Laws' },
  { state: 'Montana', level: 'lenient', licensing: 'Basic registration for breeders', health: 'Minimal veterinary requirements', restrictions: 'Limited facility standards', penalties: 'Administrative violations', act: 'Montana Animal Welfare Laws' },
  { state: 'Idaho', level: 'lenient', licensing: 'Optional breeder permits', health: 'Basic health standards', restrictions: 'Minimal facility requirements', penalties: 'Minor infractions', act: 'Idaho Animal Welfare Statutes' },
  { state: 'New Hampshire', level: 'lenient', licensing: 'Basic kennel licensing', health: 'Minimal health documentation', restrictions: 'Limited regulations', penalties: 'Administrative penalties', act: 'New Hampshire Animal Welfare Laws' },
  { state: 'Alaska', level: 'lenient', licensing: 'Minimal licensing requirements', health: 'Basic veterinary care', restrictions: 'Limited facility standards', penalties: 'Minor violations', act: 'Alaska Animal Welfare Laws' }
];

const federalRequirements = [
  'Application and annual licensing fees ranging from $10-$750',
  'Facility inspections by USDA officials at least annually',
  'Compliance with Animal Welfare Act standards for housing, feeding, watering, sanitation, and veterinary care',
  'Detailed record keeping requirements for acquisition, disposition, transport, and veterinary care of all animals'
];

const legalResources = {
  federal: [
    { name: 'USDA Animal and Plant Health Inspection Service', link: 'https://www.aphis.usda.gov' },
    { name: 'Animal Welfare Information Center', link: 'https://www.nal.usda.gov/awic' },
    { name: 'Federal Trade Commission Consumer Guide', link: 'https://www.consumer.ftc.gov' }
  ],
  state: [
    { name: 'State Agriculture Departments', link: '#' },
    { name: 'State Veterinary Medical Boards', link: '#' },
    { name: 'State Attorney General Offices', link: '#' }
  ],
  professional: [
    { name: 'American Kennel Club', link: 'https://www.akc.org' },
    { name: 'National Animal Interest Alliance', link: 'https://www.naiaonline.org' },
    { name: 'Pet Industry Joint Advisory Council', link: 'https://www.pijac.org' }
  ]
};

const LegalGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'strict' | 'moderate' | 'lenient'>('all');

  const filteredStates = stateRegulations.filter(state => {
    const matchesSearch = state.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || state.level === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getRegulationCounts = () => {
    const strict = stateRegulations.filter(s => s.level === 'strict').length;
    const moderate = stateRegulations.filter(s => s.level === 'moderate').length;
    const lenient = stateRegulations.filter(s => s.level === 'lenient').length;
    return { strict, moderate, lenient };
  };

  const counts = getRegulationCounts();

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'strict': return 'destructive';
      case 'moderate': return 'default';
      case 'lenient': return 'secondary';
      default: return 'outline';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'strict': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lenient': return 'bg-green-100 text-green-800 border-green-200';
      default: return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Legal Guide</h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Understanding your rights and responsibilities when buying or selling puppies. Know the laws that protect you and ensure ethical practices in the pet industry.
        </p>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{counts.strict}</div>
            <div className="text-lg font-semibold text-red-800 mb-1">States with Strict Regulations</div>
            <div className="text-sm text-red-600">Comprehensive licensing, inspections, and retail restrictions</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{counts.moderate}</div>
            <div className="text-lg font-semibold text-blue-800 mb-1">States with Moderate Regulations</div>
            <div className="text-sm text-blue-600">Basic licensing and facility requirements</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{counts.lenient}</div>
            <div className="text-lg font-semibold text-green-800 mb-1">States with Lenient Regulations</div>
            <div className="text-sm text-green-600">Minimal licensing and oversight requirements</div>
          </CardContent>
        </Card>
      </div>

      {/* Federal USDA Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Federal USDA Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Commercial dog breeders who sell to pet stores, brokers, or research facilities must be licensed by the USDA under the Animal Welfare Act.
          </p>
          <ul className="space-y-2">
            {federalRequirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
            >
              All States
            </Button>
            <Button
              variant={selectedFilter === 'strict' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('strict')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Strict
            </Button>
            <Button
              variant={selectedFilter === 'moderate' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('moderate')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Moderate
            </Button>
            <Button
              variant={selectedFilter === 'lenient' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('lenient')}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              Lenient
            </Button>
          </div>
        </div>
      </div>

      {/* State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStates.map((state) => (
          <Card key={state.state} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{state.state}</CardTitle>
                <Badge className={getBadgeColor(state.level)}>
                  {state.level.charAt(0).toUpperCase() + state.level.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Licensing Requirements</h4>
                <p className="text-sm text-gray-600">{state.licensing}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Health Certificates</h4>
                <p className="text-sm text-gray-600">{state.health}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Key Restrictions</h4>
                <p className="text-sm text-gray-600">{state.restrictions}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Penalties</h4>
                <p className="text-sm text-gray-600">{state.penalties}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Legislative Act</h4>
                <p className="text-sm text-gray-600 font-medium">{state.act}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legal Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Resources and Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Federal Resources</h3>
              <ul className="space-y-2">
                {legalResources.federal.map((resource, index) => (
                  <li key={index}>
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      {resource.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">State Resources</h3>
              <ul className="space-y-2">
                {legalResources.state.map((resource, index) => (
                  <li key={index}>
                    <a
                      href={resource.link}
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      {resource.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Professional Organizations</h3>
              <ul className="space-y-2">
                {legalResources.professional.map((resource, index) => (
                  <li key={index}>
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      {resource.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Legal Disclaimer</h3>
              <p className="text-blue-800 text-sm">
                This information is provided for educational purposes only and should not be considered legal advice. 
                Laws and regulations vary by jurisdiction and are subject to change. Always consult with a qualified 
                attorney or legal professional for specific legal guidance regarding your situation. The information 
                presented here may not reflect the most current legal developments in your area.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalGuide;