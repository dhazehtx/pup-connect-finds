
export interface StateBreedingLaw {
  name: string;
  category: 'strict' | 'moderate' | 'lenient';
  licensing: string;
  healthCertificates: string;
  restrictions: string[];
  penalties: string;
  legislativeAct?: string;
}

export const stateBreedingLaws: StateBreedingLaw[] = [
  // Strict Regulation States (12 states)
  {
    name: "California",
    category: "strict",
    licensing: "Commercial breeders must obtain a license from the state. Hobby breeders selling more than 2 litters per year require permits.",
    healthCertificates: "Required health certificates and vaccination records for all puppies. Mandatory spay/neuter contracts.",
    restrictions: [
      "No puppy sales under 8 weeks old",
      "Maximum of 50 adult dogs per facility",
      "Mandatory cooling/heating systems",
      "Regular veterinary inspections required"
    ],
    penalties: "Fines up to $5,000 per violation, potential criminal charges for severe cases",
    legislativeAct: "Polly's Law (AB 485) - Pet Store Animal Sourcing"
  },
  {
    name: "New York",
    category: "strict",
    licensing: "Pet dealers license required for commercial operations. Municipal permits may be required.",
    healthCertificates: "Health certificates required within 10 days of sale. Vaccination records mandatory.",
    restrictions: [
      "No sales under 8 weeks",
      "Strict facility inspection requirements",
      "Detailed record keeping for 2 years",
      "Prohibition on certain breeding practices"
    ],
    penalties: "Up to $1,000 per violation, license suspension or revocation",
    legislativeAct: "Agriculture and Markets Law Article 7"
  },
  {
    name: "Washington",
    category: "strict",
    licensing: "Commercial breeding operations require state registration and local business licenses.",
    healthCertificates: "Health certificates required for all sales. Veterinary care documentation mandatory.",
    restrictions: [
      "Maximum 50 adult dogs for commercial operations",
      "No puppy sales under 8 weeks",
      "Mandatory facility inspections",
      "Climate control requirements"
    ],
    penalties: "Fines up to $5,000, potential felony charges for neglect",
    legislativeAct: "Commercial Dog Breeding Act (RCW 16.52)"
  },
  {
    name: "Oregon",
    category: "strict",
    licensing: "Dog breeding business license required for 4+ breeding females. Local permits needed.",
    healthCertificates: "Health certificates within 10 days of sale. Full vaccination records required.",
    restrictions: [
      "Annual facility inspections",
      "Maximum 50 adult dogs",
      "Climate-controlled housing required",
      "No tethering or chaining of breeding dogs"
    ],
    penalties: "Up to $6,250 per violation, license revocation possible",
    legislativeAct: "Oregon Commercial Dog Breeding Act"
  },
  {
    name: "Massachusetts",
    category: "strict",
    licensing: "Pet shop license required for commercial breeders. Municipal licensing may apply.",
    healthCertificates: "Health certificates required. Genetic testing documentation for certain breeds.",
    restrictions: [
      "No sales under 8 weeks",
      "Mandatory veterinary care",
      "Detailed breeding records",
      "Facility size limitations"
    ],
    penalties: "Fines up to $2,500 per violation",
    legislativeAct: "Massachusetts General Laws Chapter 140"
  },
  {
    name: "Connecticut",
    category: "strict",
    licensing: "Pet shop permit required for commercial operations. Local zoning compliance needed.",
    healthCertificates: "Health certificates within 14 days. Vaccination and health guarantee required.",
    restrictions: [
      "Annual inspections required",
      "Maximum 25 adult dogs for hobby breeders",
      "Climate control mandatory",
      "No puppy mill operations"
    ],
    penalties: "Up to $1,000 per violation, license suspension",
    legislativeAct: "Connecticut General Statutes Title 22"
  },
  {
    name: "New Jersey",
    category: "strict",
    licensing: "Kennel license required for 5+ dogs. Commercial breeder permits for large operations.",
    healthCertificates: "Health certificates mandatory. Genetic screening documentation required.",
    restrictions: [
      "Regular veterinary inspections",
      "No sales under 7 weeks",
      "Maximum 50 adult dogs",
      "Proper housing and exercise requirements"
    ],
    penalties: "Fines up to $3,000, possible criminal charges",
    legislativeAct: "New Jersey Animal Welfare Act"
  },
  {
    name: "Maryland",
    category: "strict",
    licensing: "Pet dealer license for commercial operations. County permits may be required.",
    healthCertificates: "Health certificates within 10 days. Vaccination records mandatory.",
    restrictions: [
      "Annual facility inspections",
      "No puppy sales under 8 weeks",
      "Detailed record keeping",
      "Climate control requirements"
    ],
    penalties: "Up to $1,000 per violation, license revocation",
    legislativeAct: "Maryland Commercial Law Code"
  },
  {
    name: "Vermont",
    category: "strict",
    licensing: "Pet dealer license required for commercial breeding. Municipal permits needed.",
    healthCertificates: "Health certificates mandatory. Genetic testing for hereditary conditions.",
    restrictions: [
      "Maximum 10 adult dogs for unlicensed breeders",
      "Annual inspections required",
      "No sales under 8 weeks",
      "Mandatory veterinary care"
    ],
    penalties: "Fines up to $5,000 per violation",
    legislativeAct: "Vermont Statutes Title 20"
  },
  {
    name: "Rhode Island",
    category: "strict",
    licensing: "Kennel license for 4+ dogs. Commercial breeder permits required.",
    healthCertificates: "Health certificates within 14 days. Full vaccination records.",
    restrictions: [
      "Regular facility inspections",
      "No puppy sales under 8 weeks",
      "Maximum 25 adult dogs for hobby breeders",
      "Climate control mandatory"
    ],
    penalties: "Up to $500-$1,000 per violation",
    legislativeAct: "Rhode Island General Laws Title 4"
  },
  {
    name: "Hawaii",
    category: "strict",
    licensing: "Commercial breeder license and quarantine compliance required due to island status.",
    healthCertificates: "Extensive health certificates and quarantine documentation. Rabies vaccination mandatory.",
    restrictions: [
      "Strict quarantine procedures",
      "No inter-island transport without permits",
      "Limited breeding facility sizes",
      "Environmental impact assessments"
    ],
    penalties: "Fines up to $10,000, potential criminal charges",
    legislativeAct: "Hawaii Revised Statutes Chapter 142"
  },
  {
    name: "Delaware",
    category: "strict",
    licensing: "Pet dealer license for commercial operations. Local business permits required.",
    healthCertificates: "Health certificates within 10 days. Vaccination and genetic screening records.",
    restrictions: [
      "Annual facility inspections",
      "Maximum 40 adult dogs",
      "No sales under 8 weeks",
      "Mandatory climate control"
    ],
    penalties: "Fines up to $2,300 per violation",
    legislativeAct: "Delaware Code Title 3"
  },

  // Moderate Regulation States (18 states)
  {
    name: "Texas",
    category: "moderate",
    licensing: "Commercial breeder license required for 11+ adult intact females. Local permits may apply.",
    healthCertificates: "Health certificates required for sales. Vaccination records must be provided.",
    restrictions: [
      "No puppy sales under 8 weeks",
      "Annual facility inspections for licensed breeders",
      "Basic housing and care standards",
      "Record keeping for 3 years"
    ],
    penalties: "Fines ranging from $500 to $10,000 depending on violation severity",
    legislativeAct: "Texas Occupations Code Chapter 802"
  },
  {
    name: "Florida",
    category: "moderate",
    licensing: "Class A or B dealer license for commercial operations. Local business licenses required.",
    healthCertificates: "Health certificates within 30 days. Vaccination records mandatory.",
    restrictions: [
      "No sales under 8 weeks old",
      "Facility inspections every 2 years",
      "Basic animal welfare standards",
      "Record keeping requirements"
    ],
    penalties: "Fines up to $5,000 per violation, license suspension possible",
    legislativeAct: "Florida Statutes Chapter 828"
  },
  {
    name: "Illinois",
    category: "moderate",
    licensing: "Dog dealer license for commercial operations. Municipal permits required.",
    healthCertificates: "Health certificates required. Vaccination documentation mandatory.",
    restrictions: [
      "No puppy sales under 8 weeks",
      "Regular facility inspections",
      "Maximum 40 adult dogs without commercial license",
      "Proper housing standards"
    ],
    penalties: "Fines up to $2,500 per violation",
    legislativeAct: "Illinois Animal Welfare Act"
  },
  {
    name: "Pennsylvania",
    category: "moderate",
    licensing: "Kennel license for 26+ dogs. Commercial breeder permits for large operations.",
    healthCertificates: "Health certificates within 10 days. Vaccination records required.",
    restrictions: [
      "Annual inspections for commercial operations",
      "No sales under 8 weeks",
      "Climate control requirements",
      "Detailed record keeping"
    ],
    penalties: "Fines up to $750 per violation, license suspension",
    legislativeAct: "Pennsylvania Dog Law"
  },
  {
    name: "Virginia",
    category: "moderate",
    licensing: "Dealer license for commercial breeding. Local business permits may be required.",
    healthCertificates: "Health certificates mandatory. Vaccination and health guarantee required.",
    restrictions: [
      "Facility inspections required",
      "No puppy sales under 8 weeks",
      "Basic housing standards",
      "Record keeping for 2 years"
    ],
    penalties: "Fines up to $2,500 per violation",
    legislativeAct: "Virginia Code Title 3.2"
  },
  {
    name: "North Carolina",
    category: "moderate",
    licensing: "Pet dealer license for commercial operations. County permits may apply.",
    healthCertificates: "Health certificates required. Vaccination records mandatory.",
    restrictions: [
      "Annual facility inspections",
      "No sales under 8 weeks",
      "Basic animal welfare standards",
      "Record keeping requirements"
    ],
    penalties: "Fines up to $5,000 per violation",
    legislativeAct: "North Carolina General Statutes Chapter 19A"
  },
  {
    name: "Georgia",
    category: "moderate",
    licensing: "Pet dealer license for commercial breeding. Local business licenses required.",
    healthCertificates: "Health certificates within 30 days. Vaccination documentation required.",
    restrictions: [
      "Facility inspections every 2 years",
      "No puppy sales under 8 weeks",
      "Basic housing and care standards",
      "Record keeping for 2 years"
    ],
    penalties: "Fines up to $1,000 per violation",
    legislativeAct: "Georgia Code Title 4"
  },
  {
    name: "Arizona",
    category: "moderate",
    licensing: "Commercial breeder license for large operations. Local permits required.",
    healthCertificates: "Health certificates mandatory. Vaccination records required.",
    restrictions: [
      "No sales under 8 weeks",
      "Basic facility standards",
      "Regular inspections for commercial breeders",
      "Climate control in extreme weather"
    ],
    penalties: "Fines up to $2,500 per violation",
    legislativeAct: "Arizona Revised Statutes Title 3"
  },
  {
    name: "Colorado",
    category: "moderate",
    licensing: "Pet animal facility license for commercial operations. Local permits may be required.",
    healthCertificates: "Health certificates required. Vaccination and genetic screening documentation.",
    restrictions: [
      "Annual facility inspections",
      "No puppy sales under 8 weeks",
      "Maximum 40 adult dogs without commercial license",
      "Proper housing standards"
    ],
    penalties: "Fines up to $1,000 per violation",
    legislativeAct: "Colorado Revised Statutes Title 35"
  },
  {
    name: "Michigan",
    category: "moderate",
    licensing: "Commercial breeder license for 4+ breeding females. Local permits required.",
    healthCertificates: "Health certificates within 10 days. Vaccination records mandatory.",
    restrictions: [
      "Annual inspections for licensed breeders",
      "No sales under 8 weeks",
      "Basic animal welfare standards",
      "Record keeping requirements"
    ],
    penalties: "Fines up to $5,000 per violation",
    legislativeAct: "Michigan Compiled Laws Act 287"
  },
  {
    name: "Ohio",
    category: "moderate",
    licensing: "High volume breeder license for 9+ breeding females. Local permits may apply.",
    healthCertificates: "Health certificates required. Vaccination documentation mandatory.",
    restrictions: [
      "Facility inspections for licensed operations",
      "No puppy sales under 8 weeks",
      "Basic housing standards",
      "Record keeping for 2 years"
    ],
    penalties: "Fines up to $2,000 per violation",
    legislativeAct: "Ohio Revised Code Chapter 956"
  },
  {
    name: "Indiana",
    category: "moderate",
    licensing: "Commercial dog breeding license for 20+ intact dogs. Local permits required.",
    healthCertificates: "Health certificates mandatory. Vaccination records required.",
    restrictions: [
      "Annual facility inspections",
      "No sales under 8 weeks",
      "Basic animal welfare standards",
      "Climate control requirements"
    ],
    penalties: "Fines up to $1,000 per violation",
    legislativeAct: "Indiana Code Title 15"
  },
  {
    name: "Wisconsin",
    category: "moderate",
    licensing: "Dog seller license for commercial operations. Local business permits required.",
    healthCertificates: "Health certificates within 30 days. Vaccination documentation required.",
    restrictions: [
      "Facility inspections every 2 years",
      "No puppy sales under 7 weeks",
      "Basic housing standards",
      "Record keeping requirements"
    ],
    penalties: "Fines up to $5,000 per violation",
    legislativeAct: "Wisconsin Statutes Chapter 174"
  },
  {
    name: "Minnesota",
    category: "moderate",
    licensing: "Commercial breeder license for large operations. Local permits may be required.",
    healthCertificates: "Health certificates required. Vaccination and health guarantee mandatory.",
    restrictions: [
      "Annual inspections for licensed breeders",
      "No sales under 8 weeks",
      "Basic animal welfare standards",
      "Record keeping for 3 years"
    ],
    penalties: "Fines up to $3,000 per violation",
    legislativeAct: "Minnesota Statutes Chapter 347"
  },
  {
    name: "Nevada",
    category: "moderate",
    licensing: "Commercial breeder permit for large operations. Local business licenses required.",
    healthCertificates: "Health certificates mandatory. Vaccination records required.",
    restrictions: [
      "Facility inspections for commercial breeders",
      "No puppy sales under 8 weeks",
      "Basic housing and care standards",
      "Climate control in extreme heat"
    ],
    penalties: "Fines up to $1,000 per violation",
    legislativeAct: "Nevada Revised Statutes Chapter 574"
  },
  {
    name: "New Mexico",
    category: "moderate",
    licensing: "Commercial breeder license for large operations. Local permits may be required.",
    healthCertificates: "Health certificates required. Vaccination documentation mandatory.",
    restrictions: [
      "Basic facility inspections",
      "No sales under 8 weeks",
      "Standard animal welfare requirements",
      "Record keeping for 2 years"
    ],
    penalties: "Fines up to $500 per violation",
    legislativeAct: "New Mexico Statutes Chapter 77"
  },
  {
    name: "Utah",
    category: "moderate",
    licensing: "Commercial breeder license for large operations. Local business permits required.",
    healthCertificates: "Health certificates mandatory. Vaccination records required.",
    restrictions: [
      "Facility inspections for commercial operations",
      "No puppy sales under 8 weeks",
      "Basic housing standards",
      "Record keeping requirements"
    ],
    penalties: "Fines up to $2,500 per violation",
    legislativeAct: "Utah Code Title 4"
  },
  {
    name: "Maine",
    category: "moderate",
    licensing: "Commercial breeder license for 5+ breeding females. Local permits may be required.",
    healthCertificates: "Health certificates within 30 days. Vaccination documentation required.",
    restrictions: [
      "Annual inspections for licensed breeders",
      "No sales under 8 weeks",
      "Basic animal welfare standards",
      "Climate control requirements"
    ],
    penalties: "Fines up to $500 per violation",
    legislativeAct: "Maine Revised Statutes Title 7"
  },

  // Lenient Regulation States (20 states)
  {
    name: "Alabama",
    category: "lenient",
    licensing: "Generally no specific breeding licenses required. Local business permits may apply.",
    healthCertificates: "Basic health documentation recommended but not always mandatory.",
    restrictions: [
      "No sales under 6 weeks (some areas 8 weeks)",
      "Basic animal welfare laws apply",
      "Local ordinances may vary",
      "Minimal inspection requirements"
    ],
    penalties: "Fines typically under $500 for violations",
    legislativeAct: "Alabama Code Title 3"
  },
  {
    name: "Mississippi",
    category: "lenient",
    licensing: "No state-specific breeding licenses. Local permits may be required for business operations.",
    healthCertificates: "Health certificates recommended but not strictly enforced.",
    restrictions: [
      "Basic animal cruelty laws apply",
      "No specific age restrictions for sales",
      "Minimal facility requirements",
      "Limited inspection protocols"
    ],
    penalties: "Fines generally under $1,000",
    legislativeAct: "Mississippi Code Title 69"
  },
  {
    name: "Louisiana",
    category: "lenient",
    licensing: "Commercial operations may need general business licenses. No specific breeding permits.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal welfare laws",
      "Local ordinances may apply",
      "Minimal facility requirements",
      "Limited state oversight"
    ],
    penalties: "Fines typically $200-$1,000",
    legislativeAct: "Louisiana Revised Statutes Title 3"
  },
  {
    name: "Arkansas",
    category: "lenient",
    licensing: "No specific state breeding licenses. Local business permits may apply.",
    healthCertificates: "Health certificates recommended but not mandatory for all sales.",
    restrictions: [
      "Basic animal welfare laws",
      "No sales under 6 weeks in some areas",
      "Limited inspection requirements",
      "Local ordinances vary"
    ],
    penalties: "Fines generally under $500",
    legislativeAct: "Arkansas Code Title 20"
  },
  {
    name: "Tennessee",
    category: "lenient",
    licensing: "Commercial operations may need general business licenses. No specific breeding requirements.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal cruelty laws apply",
      "Local regulations may vary",
      "Minimal state oversight",
      "Basic facility standards"
    ],
    penalties: "Fines typically $50-$500",
    legislativeAct: "Tennessee Code Title 44"
  },
  {
    name: "Kentucky",
    category: "lenient",
    licensing: "No state-specific breeding licenses required. Local permits may apply.",
    healthCertificates: "Health certificates recommended but not strictly enforced.",
    restrictions: [
      "Basic animal welfare laws",
      "Local ordinances may apply",
      "Limited facility requirements",
      "Minimal inspection protocols"
    ],
    penalties: "Fines generally under $500",
    legislativeAct: "Kentucky Revised Statutes Chapter 258"
  },
  {
    name: "Missouri",
    category: "lenient",
    licensing: "Commercial breeder license for large operations (50+ dogs). Most hobby breeders exempt.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal welfare laws",
      "Limited state oversight for small operations",
      "Local ordinances may vary",
      "Minimal facility requirements for hobby breeders"
    ],
    penalties: "Fines typically $200-$1,000",
    legislativeAct: "Missouri Revised Statutes Chapter 273"
  },
  {
    name: "Kansas",
    category: "lenient",
    licensing: "Commercial operations may need general business licenses. No specific breeding permits required.",
    healthCertificates: "Health certificates recommended but not mandatory.",
    restrictions: [
      "Basic animal cruelty laws apply",
      "Local regulations may vary significantly",
      "Limited state inspection programs",
      "Minimal facility standards"
    ],
    penalties: "Fines generally under $1,000",
    legislativeAct: "Kansas Statutes Chapter 47"
  },
  {
    name: "Oklahoma",
    category: "lenient",
    licensing: "No specific state breeding licenses. Local business permits may be required.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal welfare laws",
      "Local ordinances apply",
      "Limited state oversight",
      "Minimal facility requirements"
    ],
    penalties: "Fines typically $25-$500",
    legislativeAct: "Oklahoma Statutes Title 4"
  },
  {
    name: "Iowa",
    category: "lenient",
    licensing: "Commercial breeder license for large operations. Most hobby breeders exempt.",
    healthCertificates: "Health certificates recommended but not always required.",
    restrictions: [
      "Basic animal welfare laws apply",
      "Limited oversight for small operations",
      "Local ordinances may vary",
      "Minimal facility requirements for hobby breeders"
    ],
    penalties: "Fines generally $100-$625",
    legislativeAct: "Iowa Code Chapter 162"
  },
  {
    name: "Nebraska",
    category: "lenient",
    licensing: "No specific state breeding licenses required. Local permits may apply.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal cruelty laws",
      "Local regulations vary",
      "Limited state inspection programs",
      "Minimal facility standards"
    ],
    penalties: "Fines typically under $500",
    legislativeAct: "Nebraska Revised Statutes Chapter 54"
  },
  {
    name: "South Dakota",
    category: "lenient",
    licensing: "No state-specific breeding licenses. Local business permits may be required.",
    healthCertificates: "Health certificates recommended but not mandatory.",
    restrictions: [
      "Basic animal welfare laws apply",
      "Local ordinances may apply",
      "Limited state oversight",
      "Minimal facility requirements"
    ],
    penalties: "Fines generally under $500",
    legislativeAct: "South Dakota Codified Laws Title 40"
  },
  {
    name: "North Dakota",
    category: "lenient",
    licensing: "Commercial operations may need general business licenses. No specific breeding requirements.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal cruelty laws",
      "Local regulations may vary",
      "Limited state inspection programs",
      "Minimal facility standards"
    ],
    penalties: "Fines typically under $1,000",
    legislativeAct: "North Dakota Century Code Title 36"
  },
  {
    name: "South Carolina",
    category: "lenient",
    licensing: "No specific state breeding licenses required. Local permits may apply.",
    healthCertificates: "Health certificates recommended but not strictly enforced.",
    restrictions: [
      "Basic animal welfare laws apply",
      "Local ordinances may vary",
      "Limited state oversight",
      "Minimal facility requirements"
    ],
    penalties: "Fines generally $200-$1,000",
    legislativeAct: "South Carolina Code Title 47"
  },
  {
    name: "West Virginia",
    category: "lenient",
    licensing: "No state-specific breeding licenses. Local business permits may be required.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal cruelty laws",
      "Local regulations vary significantly",
      "Limited state inspection programs",
      "Minimal facility standards"
    ],
    penalties: "Fines typically under $500",
    legislativeAct: "West Virginia Code Chapter 19"
  },
  {
    name: "Montana",
    category: "lenient",
    licensing: "Commercial operations may need general business licenses. No specific breeding permits.",
    healthCertificates: "Health certificates recommended but not mandatory.",
    restrictions: [
      "Basic animal welfare laws apply",
      "Local ordinances may apply",
      "Limited state oversight",
      "Minimal facility requirements"
    ],
    penalties: "Fines generally under $500",
    legislativeAct: "Montana Code Annotated Title 81"
  },
  {
    name: "Wyoming",
    category: "lenient",
    licensing: "No specific state breeding licenses required. Local permits may apply.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal cruelty laws",
      "Local regulations may vary",
      "Limited state inspection programs",
      "Minimal facility standards"
    ],
    penalties: "Fines typically under $750",
    legislativeAct: "Wyoming Statutes Title 11"
  },
  {
    name: "Idaho",
    category: "lenient",
    licensing: "No state-specific breeding licenses. Local business permits may be required.",
    healthCertificates: "Health certificates recommended but not strictly enforced.",
    restrictions: [
      "Basic animal welfare laws apply",
      "Local ordinances may apply",
      "Limited state oversight",
      "Minimal facility requirements"
    ],
    penalties: "Fines generally under $300",
    legislativeAct: "Idaho Code Title 25"
  },
  {
    name: "New Hampshire",
    category: "lenient",
    licensing: "Commercial operations may need general licenses. No specific breeding requirements.",
    healthCertificates: "Basic health documentation recommended.",
    restrictions: [
      "Standard animal cruelty laws",
      "Local regulations may vary",
      "Limited state inspection programs",
      "Minimal facility standards"
    ],
    penalties: "Fines typically $50-$1,000",
    legislativeAct: "New Hampshire Revised Statutes Title XL"
  },
  {
    name: "Alaska",
    category: "lenient",
    licensing: "No specific state breeding licenses required. Local permits may apply.",
    healthCertificates: "Health certificates recommended but not mandatory.",
    restrictions: [
      "Basic animal welfare laws apply",
      "Remote areas have limited oversight",
      "Local ordinances may vary",
      "Minimal facility requirements"
    ],
    penalties: "Fines generally under $500",
    legislativeAct: "Alaska Statutes Title 3"
  }
];
