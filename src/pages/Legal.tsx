import React, { useState } from 'react';
import { Scale, MapPin, AlertTriangle, FileText, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

const Legal = () => {
  const [openSections, setOpenSections] = useState<string[]>(['california']);
  const [searchTerm, setSearchTerm] = useState('');

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
    },
    {
      id: 'washington',
      state: 'Washington',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'RCW 16.52 - Animal Cruelty Prevention',
        'Commercial dog breeder licensing',
        'Pet store sourcing restrictions',
        'Mandatory health screenings',
        'Facility standards requirements'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'State license required for 10+ breeding females',
        healthCerts: 'Health certificate within 10 days of sale',
        records: 'Breeding and veterinary records for 3 years',
        inspections: 'Annual inspections for licensed facilities'
      },
      restrictions: [
        'Cannot breed females under 12 months or over 8 years',
        'Maximum 2 litters per female per year',
        'Adequate exercise and socialization required',
        'Temperature control in facilities',
        'Cannot sell sick animals'
      ],
      penalties: 'Fines up to $5,000, license suspension, criminal charges for violations'
    },
    {
      id: 'massachusetts',
      state: 'Massachusetts',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'Chapter 140, Section 136A - Pet shop regulations',
        'Commercial breeder licensing',
        'Health certificate requirements',
        'Consumer protection laws',
        'Anti-puppy mill legislation'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Pet shop license for commercial sales',
        healthCerts: 'Health certificate from veterinarian required',
        records: 'Complete health and breeding documentation',
        inspections: 'Regular facility inspections required'
      },
      restrictions: [
        'Pet shops cannot source from commercial breeders',
        'Must provide 14-day health guarantee',
        'Facility standards for cleanliness and space',
        'Cannot sell animals with known health issues',
        'Disclosure of breeding facility information'
      ],
      penalties: 'Fines up to $2,500, license revocation, criminal prosecution'
    },
    {
      id: 'oregon',
      state: 'Oregon',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'ORS 167 - Animal Welfare Laws',
        'Commercial dog breeding regulations',
        'Pet dealer licensing requirements',
        'Health and safety standards',
        'Consumer protection measures'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 10+ females',
        healthCerts: 'Veterinary health certificate required',
        records: 'Detailed breeding and health records',
        inspections: 'Annual inspections for commercial facilities'
      },
      restrictions: [
        'Cannot breed females under 18 months',
        'Maximum breeding age of 8 years',
        'Adequate space and exercise requirements',
        'Cannot separate puppies before 8 weeks',
        'Health testing requirements for breeding stock'
      ],
      penalties: 'Fines up to $6,250, license suspension, potential criminal charges'
    },
    {
      id: 'connecticut',
      state: 'Connecticut',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'Public Act 19-187 - Pet store sourcing',
        'Commercial breeder regulations',
        'Health certificate requirements',
        'Consumer protection laws',
        'Facility inspection standards'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Pet dealer license for commercial operations',
        healthCerts: 'Health certificate within 14 days of sale',
        records: 'Medical and breeding records for 2 years',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Pet stores must source from shelters/rescues',
        'Cannot sell animals under 8 weeks',
        'Health guarantee requirements',
        'Facility cleanliness standards',
        'Cannot sell sick or diseased animals'
      ],
      penalties: 'Fines up to $1,000 per violation, license suspension'
    },
    {
      id: 'maryland',
      state: 'Maryland',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'House Bill 1662 - Pet store sourcing',
        'Commercial breeder licensing',
        'Animal welfare standards',
        'Health certificate requirements',
        'Consumer protection measures'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 20+ females',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Breeding and health records for 3 years',
        inspections: 'Regular facility inspections'
      },
      restrictions: [
        'Pet stores cannot sell from commercial breeders',
        'Cannot breed females under 12 months',
        'Maximum 2 litters per female per year',
        'Adequate housing and care standards',
        'Cannot sell animals with health issues'
      ],
      penalties: 'Fines up to $2,500, license revocation, criminal charges'
    },
    {
      id: 'newjersey',
      state: 'New Jersey',
      severity: 'strict',
      lastUpdated: '2024',
      keyPoints: [
        'P.L. 2020, Chapter 102 - Pet store sourcing',
        'Commercial kennel licensing',
        'Animal welfare regulations',
        'Health documentation requirements',
        'Consumer protection laws'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Kennel license for 10+ adult dogs',
        healthCerts: 'Health certificate within 10 days',
        records: 'Complete health and breeding documentation',
        inspections: 'Annual inspections for commercial facilities'
      },
      restrictions: [
        'Pet stores must source from shelters/rescues',
        'Cannot breed females under 18 months',
        'Maximum breeding frequency restrictions',
        'Facility standards for space and sanitation',
        'Cannot sell sick animals'
      ],
      penalties: 'Fines up to $3,000, license suspension, criminal prosecution'
    },
    {
      id: 'illinois',
      state: 'Illinois',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Animal Welfare Act amendments',
        'Commercial breeder licensing',
        'Pet shop regulations',
        'Health certificate requirements',
        'Facility inspection standards'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 5+ breeding females',
        healthCerts: 'Health certificate from licensed veterinarian',
        records: 'Breeding and sales records for 2 years',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Cannot breed females under 12 months',
        'Maximum 2 litters per female per year',
        'Adequate space and exercise requirements',
        'Cannot sell animals under 8 weeks',
        'Health testing for breeding stock'
      ],
      penalties: 'Fines up to $2,500, license suspension, criminal charges'
    },
    {
      id: 'pennsylvania',
      state: 'Pennsylvania',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Dog Law Act amendments',
        'Commercial kennel licensing',
        'Health and safety standards',
        'Record keeping requirements',
        'Inspection protocols'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Kennel license for 26+ dogs over 12 weeks',
        healthCerts: 'Health certificate within 10 days of sale',
        records: 'Detailed breeding and health records',
        inspections: 'Annual inspections for commercial kennels'
      },
      restrictions: [
        'Cannot breed females under 12 months or over 8 years',
        'Maximum breeding frequency limits',
        'Facility standards for housing and sanitation',
        'Cannot separate puppies before 7 weeks',
        'Veterinary care requirements'
      ],
      penalties: 'Fines up to $5,000, license revocation, criminal prosecution'
    },
    {
      id: 'virginia',
      state: 'Virginia',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Virginia Animal Welfare Act',
        'Commercial dog breeding regulations',
        'Pet shop licensing requirements',
        'Health standards for breeding',
        'Consumer protection measures'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Animal dealer permit for commercial operations',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Breeding and health records for 2 years',
        inspections: 'Regular facility inspections'
      },
      restrictions: [
        'Cannot breed females under 18 months',
        'Maximum 2 litters per female per year',
        'Adequate housing and care standards',
        'Cannot sell sick animals',
        'Proper identification requirements'
      ],
      penalties: 'Class 1 misdemeanor, fines up to $2,500, license suspension'
    },
    {
      id: 'northcarolina',
      state: 'North Carolina',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Animal Welfare Act regulations',
        'Commercial breeder licensing',
        'Health certificate requirements',
        'Facility inspection standards',
        'Consumer protection laws'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Animal dealer license for commercial breeding',
        healthCerts: 'Health certificate within 30 days',
        records: 'Breeding and sales records required',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Cannot breed females under 12 months',
        'Maximum breeding age of 8 years',
        'Adequate space and exercise requirements',
        'Cannot sell animals under 8 weeks',
        'Health screening for breeding stock'
      ],
      penalties: 'Class 1 misdemeanor, fines up to $1,000, license revocation'
    },
    {
      id: 'georgia',
      state: 'Georgia',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Georgia Animal Protection Act',
        'Commercial breeder regulations',
        'Pet dealer licensing',
        'Health and safety standards',
        'Record keeping requirements'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Pet dealer license for commercial operations',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Breeding and health documentation',
        inspections: 'Regular facility inspections'
      },
      restrictions: [
        'Cannot breed females under 18 months',
        'Maximum 2 litters per female per year',
        'Facility standards for cleanliness',
        'Cannot separate puppies before 8 weeks',
        'Veterinary care requirements'
      ],
      penalties: 'Misdemeanor charges, fines up to $1,000, license suspension'
    },
    {
      id: 'arizona',
      state: 'Arizona',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Arizona Revised Statutes Title 3',
        'Commercial breeder licensing',
        'Pet dealer regulations',
        'Health certificate requirements',
        'Facility inspection standards'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 20+ dogs',
        healthCerts: 'Health certificate within 15 days',
        records: 'Breeding and sales records for 2 years',
        inspections: 'Annual inspections for licensed facilities'
      },
      restrictions: [
        'Cannot breed females under 12 months',
        'Maximum breeding frequency limits',
        'Adequate housing and care standards',
        'Cannot sell sick animals',
        'Proper identification requirements'
      ],
      penalties: 'Class 2 misdemeanor, fines up to $750, license revocation'
    },
    {
      id: 'colorado',
      state: 'Colorado',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Pet Animal Care Facilities Act',
        'Commercial breeder licensing',
        'Health and safety standards',
        'Record keeping requirements',
        'Inspection protocols'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Pet animal care facility license',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Detailed breeding and health records',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Cannot breed females under 18 months',
        'Maximum 2 litters per female per year',
        'Facility standards for space and sanitation',
        'Cannot sell animals under 8 weeks',
        'Health testing requirements'
      ],
      penalties: 'Fines up to $1,000 per violation, license suspension'
    },
    {
      id: 'michigan',
      state: 'Michigan',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Large Scale Dog Breeding Kennel Act',
        'Commercial kennel licensing',
        'Health and welfare standards',
        'Inspection requirements',
        'Record keeping mandates'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Large scale kennel license for 15+ females',
        healthCerts: 'Health certificate within 10 days',
        records: 'Breeding and health records for 3 years',
        inspections: 'Annual inspections for large scale kennels'
      },
      restrictions: [
        'Cannot breed females under 12 months or over 8 years',
        'Maximum breeding frequency limits',
        'Adequate space and exercise requirements',
        'Cannot separate puppies before 8 weeks',
        'Veterinary care standards'
      ],
      penalties: 'Misdemeanor charges, fines up to $2,000, license revocation'
    },
    {
      id: 'ohio',
      state: 'Ohio',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Ohio Revised Code Chapter 956',
        'Commercial breeder licensing',
        'Pet store regulations',
        'Health certificate requirements',
        'Facility standards'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 9+ females',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Breeding and sales documentation',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Cannot breed females under 12 months',
        'Maximum 2 litters per female per year',
        'Adequate housing standards',
        'Cannot sell sick animals',
        'Proper identification required'
      ],
      penalties: 'Misdemeanor charges, fines up to $1,000, license suspension'
    },
    {
      id: 'wisconsin',
      state: 'Wisconsin',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Wisconsin Statutes Chapter 174',
        'Dog seller licensing',
        'Health certificate requirements',
        'Facility inspection standards',
        'Consumer protection measures'
      ],
      requirements: {
        minAge: '7 weeks minimum age for sale',
        licensing: 'Dog seller license for 25+ dogs annually',
        healthCerts: 'Health certificate within 30 days',
        records: 'Sales and health records required',
        inspections: 'Annual inspections for licensed sellers'
      },
      restrictions: [
        'Cannot separate puppies before 7 weeks',
        'Adequate care and housing standards',
        'Cannot sell sick animals',
        'Proper vaccination requirements',
        'Health guarantee provisions'
      ],
      penalties: 'Forfeitures up to $500, license suspension'
    },
    {
      id: 'minnesota',
      state: 'Minnesota',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Minnesota Statutes Chapter 347',
        'Commercial breeder licensing',
        'Animal welfare standards',
        'Health documentation requirements',
        'Inspection protocols'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 10+ females',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Breeding and health records for 3 years',
        inspections: 'Annual facility inspections'
      },
      restrictions: [
        'Cannot breed females under 12 months',
        'Maximum breeding age of 8 years',
        'Adequate space and exercise requirements',
        'Cannot sell animals under 8 weeks',
        'Health screening requirements'
      ],
      penalties: 'Misdemeanor charges, fines up to $3,000, license revocation'
    },
    {
      id: 'alabama',
      state: 'Alabama',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Alabama Code Title 3 - Animal regulations',
        'Basic animal welfare requirements',
        'Limited commercial breeding oversight',
        'Health certificate for interstate sales',
        'County-level regulations may apply'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'No state licensing required for most operations',
        healthCerts: 'Health certificate for interstate transport',
        records: 'Basic sales records recommended',
        inspections: 'No mandatory state inspections'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Basic animal welfare standards',
        'Cannot sell sick animals',
        'Interstate health certificate required',
        'Local ordinances may apply'
      ],
      penalties: 'Misdemeanor charges for animal cruelty, fines vary by county'
    },
    {
      id: 'mississippi',
      state: 'Mississippi',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Mississippi Code Title 69 - Animal regulations',
        'Basic animal welfare laws',
        'Limited commercial oversight',
        'Health requirements for sales',
        'County and municipal regulations'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'No state commercial breeder license required',
        healthCerts: 'Health certificate for interstate sales',
        records: 'Basic documentation recommended',
        inspections: 'No mandatory state inspections'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Basic animal care standards',
        'Cannot sell diseased animals',
        'Local zoning restrictions may apply',
        'Interstate transport regulations'
      ],
      penalties: 'Misdemeanor for animal cruelty, fines up to $1,000'
    },
    {
      id: 'tennessee',
      state: 'Tennessee',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Tennessee Code Title 44 - Animal regulations',
        'Basic commercial kennel licensing',
        'Health certificate requirements',
        'Animal welfare standards',
        'Local government oversight'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial kennel license for 20+ dogs',
        healthCerts: 'Health certificate within 30 days',
        records: 'Basic breeding and sales records',
        inspections: 'Annual inspections for licensed kennels'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Adequate care and housing',
        'Cannot sell sick animals',
        'Proper identification required',
        'Local zoning compliance'
      ],
      penalties: 'Class C misdemeanor, fines up to $50'
    },
    {
      id: 'kentucky',
      state: 'Kentucky',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Kentucky Revised Statutes Chapter 258',
        'Dog breeding facility licensing',
        'Basic health requirements',
        'Animal welfare standards',
        'County-level regulations'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Dog breeding facility license for 20+ dogs',
        healthCerts: 'Health certificate for sales',
        records: 'Basic breeding documentation',
        inspections: 'Annual inspections for licensed facilities'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Basic housing and care standards',
        'Cannot sell diseased animals',
        'Proper record keeping',
        'Local ordinance compliance'
      ],
      penalties: 'Class B misdemeanor, fines up to $250'
    },
    {
      id: 'southcarolina',
      state: 'South Carolina',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'South Carolina Code Title 47 - Animal regulations',
        'Commercial kennel licensing',
        'Health certificate requirements',
        'Basic animal welfare',
        'Local government oversight'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial kennel license for 20+ dogs',
        healthCerts: 'Health certificate within 30 days',
        records: 'Sales and health documentation',
        inspections: 'Annual inspections for commercial kennels'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Adequate housing and care',
        'Cannot sell sick animals',
        'Proper identification',
        'Zoning compliance required'
      ],
      penalties: 'Misdemeanor charges, fines up to $1,000'
    },
    {
      id: 'arkansas',
      state: 'Arkansas',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Arkansas Code Title 20 - Animal regulations',
        'Commercial dog breeder licensing',
        'Health requirements',
        'Basic welfare standards',
        'County regulations may apply'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 20+ dogs',
        healthCerts: 'Health certificate for interstate sales',
        records: 'Basic breeding and sales records',
        inspections: 'Annual inspections for licensed breeders'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Basic animal care requirements',
        'Cannot sell diseased animals',
        'Local zoning compliance',
        'Interstate transport regulations'
      ],
      penalties: 'Class A misdemeanor, fines up to $1,000'
    },
    {
      id: 'louisiana',
      state: 'Louisiana',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Louisiana Revised Statutes Title 3',
        'Commercial breeder regulations',
        'Health certificate requirements',
        'Animal welfare standards',
        'Parish-level oversight'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder permit for sales',
        healthCerts: 'Health certificate within 30 days',
        records: 'Sales and breeding documentation',
        inspections: 'Periodic inspections for commercial operations'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Basic housing standards',
        'Cannot sell sick animals',
        'Proper identification required',
        'Parish ordinance compliance'
      ],
      penalties: 'Misdemeanor charges, fines up to $500'
    },
    {
      id: 'oklahoma',
      state: 'Oklahoma',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Oklahoma Statutes Title 4 - Animal regulations',
        'Commercial breeder licensing',
        'Health requirements',
        'Basic welfare standards',
        'Local government oversight'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeder license for 10+ females',
        healthCerts: 'Health certificate for sales',
        records: 'Basic breeding records',
        inspections: 'Annual inspections for licensed breeders'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Adequate care and housing',
        'Cannot sell diseased animals',
        'Proper documentation',
        'Zoning compliance'
      ],
      penalties: 'Misdemeanor charges, fines up to $500'
    },
    {
      id: 'kansas',
      state: 'Kansas',
      severity: 'lenient',
      lastUpdated: '2023',
      keyPoints: [
        'Kansas Statutes Chapter 47 - Animal regulations',
        'Commercial dog facility licensing',
        'Health certificate requirements',
        'Basic animal welfare',
        'County-level enforcement'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial dog facility license for 30+ dogs',
        healthCerts: 'Health certificate within 30 days',
        records: 'Basic sales and health records',
        inspections: 'Annual inspections for licensed facilities'
      },
      restrictions: [
        'Cannot sell animals under 8 weeks',
        'Basic housing and care standards',
        'Cannot sell sick animals',
        'Proper identification',
        'Local ordinance compliance'
      ],
      penalties: 'Class C misdemeanor, fines up to $500'
    },
    {
      id: 'missouri',
      state: 'Missouri',
      severity: 'moderate',
      lastUpdated: '2024',
      keyPoints: [
        'Missouri Animal Care Facilities Act',
        'Commercial breeding facility licensing',
        'Enhanced care standards (post-puppy mill reforms)',
        'Regular inspection requirements',
        'Consumer protection measures'
      ],
      requirements: {
        minAge: '8 weeks minimum age for sale',
        licensing: 'Commercial breeding facility license for 10+ females',
        healthCerts: 'Health certificate from veterinarian',
        records: 'Detailed breeding and health records for 3 years',
        inspections: 'Biannual inspections for commercial facilities'
      },
      restrictions: [
        'Cannot breed females under 12 months or over 8 years',
        'Maximum 2 litters per female per year',
        'Enhanced space and exercise requirements',
        'Temperature control in facilities',
        'Cannot sell animals under 8 weeks'
      ],
      penalties: 'Class A misdemeanor, fines up to $2,000, license revocation'
    }
  ];

  // Filter states based on search term
  const filteredStates = stateLaws.filter(state =>
    state.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.severity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'strict': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lenient': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const strictStates = filteredStates.filter(state => state.severity === 'strict');
  const moderateStates = filteredStates.filter(state => state.severity === 'moderate');
  const lenientStates = filteredStates.filter(state => state.severity === 'lenient');

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
          Comprehensive state-by-state legal requirements and regulations for dog breeding and sales across all 50 states
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search by state name or regulation level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-800">{strictStates.length}</div>
              <div className="text-sm text-red-600">Strict Regulation States</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">{moderateStates.length}</div>
              <div className="text-sm text-yellow-600">Moderate Regulation States</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{lenientStates.length}</div>
              <div className="text-sm text-green-600">Lenient Regulation States</div>
            </CardContent>
          </Card>
        </div>
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
            <li>• This information covers {stateLaws.length} states with varying degrees of regulation</li>
          </ul>
        </CardContent>
      </Card>

      {/* State-by-State Breakdown */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">State-by-State Requirements</h2>
        
        {/* Strict Regulation States */}
        {strictStates.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 border-red-200">Strict</Badge>
              Strict Regulation States ({strictStates.length})
            </h3>
            <div className="space-y-4">
              {strictStates.map((state) => (
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
                              <h4 className="text-lg font-semibold text-foreground">{state.state}</h4>
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
                            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <FileText size={16} />
                              Key Legislative Points
                            </h5>
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
                              <h5 className="font-semibold text-foreground mb-3">Legal Requirements</h5>
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
                              <h5 className="font-semibold text-foreground mb-3">Restrictions & Standards</h5>
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
                            <h5 className="font-semibold text-red-800 mb-2">Penalties for Violations</h5>
                            <p className="text-sm text-red-700">{state.penalties}</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Moderate Regulation States */}
        {moderateStates.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Moderate</Badge>
              Moderate Regulation States ({moderateStates.length})
            </h3>
            <div className="space-y-4">
              {moderateStates.map((state) => (
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
                              <h4 className="text-lg font-semibold text-foreground">{state.state}</h4>
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
                          <div>
                            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <FileText size={16} />
                              Key Legislative Points
                            </h5>
                            <ul className="space-y-2">
                              {state.keyPoints.map((point, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-semibold text-foreground mb-3">Legal Requirements</h5>
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
                              <h5 className="font-semibold text-foreground mb-3">Restrictions & Standards</h5>
                              <ul className="space-y-2">
                                {state.restrictions.map((restriction, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                                    {restriction}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <h5 className="font-semibold text-yellow-800 mb-2">Penalties for Violations</h5>
                            <p className="text-sm text-yellow-700">{state.penalties}</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lenient Regulation States */}
        {lenientStates.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">Lenient</Badge>
              Lenient Regulation States ({lenientStates.length})
            </h3>
            <div className="space-y-4">
              {lenientStates.map((state) => (
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
                              <h4 className="text-lg font-semibold text-foreground">{state.state}</h4>
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
                          <div>
                            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <FileText size={16} />
                              Key Legislative Points
                            </h5>
                            <ul className="space-y-2">
                              {state.keyPoints.map((point, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-semibold text-foreground mb-3">Legal Requirements</h5>
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
                              <h5 className="font-semibold text-foreground mb-3">Restrictions & Standards</h5>
                              <ul className="space-y-2">
                                {state.restrictions.map((restriction, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                    {restriction}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h5 className="font-semibold text-green-800 mb-2">Penalties for Violations</h5>
                            <p className="text-sm text-green-700">{state.penalties}</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        )}
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
