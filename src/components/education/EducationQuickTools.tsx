
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calculator, Search, Phone, Calendar, FileText, Heart } from 'lucide-react';

export const EducationQuickTools: React.FC = () => {
  const [zipCode, setZipCode] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [dogWeight, setDogWeight] = useState('');

  const quickTools = [
    {
      id: 'vet-finder',
      title: '🏥 Find Local Veterinarians',
      description: 'Locate trusted veterinarians and emergency clinics in your area',
      icon: <Search size={20} />,
      color: 'bg-red-50 border-red-200',
      content: (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter ZIP code" 
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="flex-1" 
            />
            <Button 
              onClick={() => window.open(`https://www.akc.org/vet-finder/?zip=${zipCode}`, '_blank')}
              disabled={!zipCode}
            >
              Find Vets
            </Button>
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.open('https://www.akc.org/expert-advice/vets-corner/emergency-vet-care/', '_blank')}
            >
              <Phone size={16} className="mr-2" />
              Emergency Vet Locator
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.open('https://www.akc.org/expert-advice/vets-corner/choosing-a-veterinarian/', '_blank')}
            >
              <FileText size={16} className="mr-2" />
              How to Choose a Vet
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'health-checker',
      title: '📋 Health Assessment Tools',
      description: 'Quick health checks and symptom guidance',
      icon: <Heart size={20} />,
      color: 'bg-blue-50 border-blue-200',
      content: (
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/health/symptoms-to-watch-for-in-your-dog/', '_blank')}
          >
            <ExternalLink size={16} className="mr-2" />
            Symptom Checker Guide
          </Button>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/', '_blank')}
            >
              Vaccination Schedule
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/health/parasite-prevention/', '_blank')}
            >
              Parasite Prevention
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/health/dog-allergies/', '_blank')}
            >
              Allergy Information
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'feeding-calculator',
      title: '🥗 Feeding Calculator',
      description: 'Calculate proper feeding amounts based on age and weight',
      icon: <Calculator size={20} />,
      color: 'bg-green-50 border-green-200',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input 
              placeholder="Dog's age (months)" 
              value={dogAge}
              onChange={(e) => setDogAge(e.target.value)}
              type="number"
            />
            <Input 
              placeholder="Weight (lbs)" 
              value={dogWeight}
              onChange={(e) => setDogWeight(e.target.value)}
              type="number"
            />
          </div>
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/dog-feeding-guide/', '_blank')}
          >
            <Calculator size={16} className="mr-2" />
            Get Feeding Guidelines
          </Button>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/', '_blank')}
            >
              Puppy Feeding Guide
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/nutrition/senior-dog-nutrition/', '_blank')}
            >
              Senior Dog Nutrition
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'training-planner',
      title: '🎓 Training Schedule Planner',
      description: 'Create personalized training schedules and track progress',
      icon: <Calendar size={20} />,
      color: 'bg-purple-50 border-purple-200',
      content: (
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/expert-advice/training/puppy-training-basics/', '_blank')}
          >
            <Calendar size={16} className="mr-2" />
            Create Training Plan
          </Button>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/training/basic-dog-training-commands/', '_blank')}
            >
              Basic Commands Guide
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/training/how-to-potty-train-a-puppy/', '_blank')}
            >
              House Training Schedule
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/puppy-information/puppy-socialization/', '_blank')}
            >
              Socialization Checklist
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'breed-selector',
      title: '🐕 Breed Matching Tool',
      description: 'Find the perfect dog breed for your lifestyle',
      icon: <Search size={20} />,
      color: 'bg-yellow-50 border-yellow-200',
      content: (
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => window.open('https://www.akc.org/dog-breed-selector/', '_blank')}
          >
            <Search size={16} className="mr-2" />
            Start Breed Quiz
          </Button>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/dog-breeds/', '_blank')}
            >
              Browse All Breeds
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/dog-breeds/how-to-choose-a-dog-breed/', '_blank')}
            >
              Breed Selection Guide
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'emergency-guide',
      title: '🚨 Emergency Quick Reference',
      description: 'Essential emergency contacts and first aid guidance',
      icon: <Phone size={20} />,
      color: 'bg-orange-50 border-orange-200',
      content: (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-800 mb-2">Emergency Numbers</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>ASPCA Poison Control:</span>
                <span className="font-mono">(888) 426-4435</span>
              </div>
              <div className="flex justify-between">
                <span>Pet Poison Helpline:</span>
                <span className="font-mono">(855) 764-7661</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/health/dog-first-aid/', '_blank')}
            >
              First Aid Guide
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.akc.org/expert-advice/vets-corner/emergency-vet-care/', '_blank')}
            >
              When to Seek Emergency Care
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Tools & Resources</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access essential tools and calculators for dog care, all powered by American Kennel Club expertise and trusted veterinary sources.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickTools.map((tool) => (
          <Card key={tool.id} className={`hover:shadow-lg transition-shadow ${tool.color}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                {tool.icon}
                <div>
                  <h3 className="text-base">{tool.title}</h3>
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    {tool.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tool.content}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h3 className="font-semibold text-blue-900 mb-2">Need More Resources?</h3>
          <p className="text-blue-700 text-sm mb-4">
            Access the complete American Kennel Club expert advice library with hundreds of articles, guides, and tools.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="outline"
              onClick={() => window.open('https://www.akc.org/expert-advice/', '_blank')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink size={16} className="mr-2" />
              Browse All Expert Advice
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://www.akc.org/products-services/', '_blank')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink size={16} className="mr-2" />
              AKC Services & Programs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
