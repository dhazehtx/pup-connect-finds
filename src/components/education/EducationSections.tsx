
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, ChevronRight, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { EducationResource } from '../../hooks/useEducationSearch';

interface EducationSectionsProps {
  resources: EducationResource[];
  onResourceClick: (resource: EducationResource) => void;
  isBookmarked: (id: number) => boolean;
  onToggleBookmark: (id: number) => void;
  isRead: (id: number) => boolean;
  getProgress: (id: number) => { progress: number };
}

export const EducationSections: React.FC<EducationSectionsProps> = ({
  resources,
  onResourceClick,
  isBookmarked,
  onToggleBookmark,
  isRead,
  getProgress
}) => {
  const sections = [
    {
      id: 'health',
      title: 'Health Guides',
      icon: '🏥',
      description: 'Comprehensive health information and medical care guides',
      color: 'bg-red-50 border-red-200',
      articles: [
        {
          title: 'Puppy Vaccination Schedule',
          description: 'Complete guide to puppy shots and vaccination timeline',
          url: 'https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/',
          readTime: '12 min read',
          rating: 4.9,
          difficulty: 'Intermediate'
        },
        {
          title: 'Dog Health Symptoms to Watch For',
          description: 'Warning signs that require immediate veterinary attention',
          url: 'https://www.akc.org/expert-advice/health/symptoms-to-watch-for-in-your-dog/',
          readTime: '14 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Spaying and Neutering Guide',
          description: 'Everything you need to know about spaying and neutering',
          url: 'https://www.akc.org/expert-advice/health/spaying-neutering/',
          readTime: '11 min read',
          rating: 4.7,
          difficulty: 'Intermediate'
        },
        {
          title: 'Dog Allergies: Causes and Treatment',
          description: 'Understanding and managing allergies in dogs',
          url: 'https://www.akc.org/expert-advice/health/dog-allergies/',
          readTime: '10 min read',
          rating: 4.6,
          difficulty: 'Intermediate'
        },
        {
          title: 'Parasite Prevention and Treatment',
          description: 'Protecting your dog from fleas, ticks, and worms',
          url: 'https://www.akc.org/expert-advice/health/parasite-prevention/',
          readTime: '13 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Senior Dog Health Care',
          description: 'Special health considerations for aging dogs',
          url: 'https://www.akc.org/expert-advice/health/senior-dog-care/',
          readTime: '15 min read',
          rating: 4.7,
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      id: 'nutrition',
      title: 'Nutrition & Diet',
      icon: '🥗',
      description: 'Complete nutrition guides for optimal dog health',
      color: 'bg-orange-50 border-orange-200',
      articles: [
        {
          title: 'Puppy Feeding Guide',
          description: 'Complete nutrition guide for puppies from 8 weeks to 1 year',
          url: 'https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/',
          readTime: '13 min read',
          rating: 4.9,
          difficulty: 'Beginner'
        },
        {
          title: 'How Much Should I Feed My Dog?',
          description: 'Portion control and feeding guidelines for adult dogs',
          url: 'https://www.akc.org/expert-advice/nutrition/dog-feeding-guide/',
          readTime: '9 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Human Foods Dogs Can and Cannot Eat',
          description: 'Comprehensive list of safe and toxic foods for dogs',
          url: 'https://www.akc.org/expert-advice/nutrition/human-foods-dogs-can-and-cannot-eat/',
          readTime: '16 min read',
          rating: 4.9,
          difficulty: 'Beginner'
        },
        {
          title: 'Dog Food Ingredients to Avoid',
          description: 'Understanding harmful ingredients in commercial dog food',
          url: 'https://www.akc.org/expert-advice/nutrition/what-dog-food-ingredients-to-avoid/',
          readTime: '12 min read',
          rating: 4.6,
          difficulty: 'Intermediate'
        },
        {
          title: 'Senior Dog Nutrition',
          description: 'Special dietary needs for older dogs',
          url: 'https://www.akc.org/expert-advice/nutrition/senior-dog-nutrition/',
          readTime: '11 min read',
          rating: 4.7,
          difficulty: 'Intermediate'
        },
        {
          title: 'Dog Nutrition Basics',
          description: 'Essential nutrients and feeding fundamentals',
          url: 'https://www.akc.org/expert-advice/nutrition/nutrition-101-for-dogs/',
          readTime: '8 min read',
          rating: 4.5,
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'training',
      title: 'Training & Behavior',
      icon: '🎓',
      description: 'Expert training techniques and behavioral guidance',
      color: 'bg-blue-50 border-blue-200',
      articles: [
        {
          title: 'Puppy Training Basics',
          description: 'Fundamental training techniques for puppies',
          url: 'https://www.akc.org/expert-advice/training/puppy-training-basics/',
          readTime: '14 min read',
          rating: 4.9,
          difficulty: 'Beginner'
        },
        {
          title: 'House Training Your Puppy',
          description: 'Step-by-step guide to potty training',
          url: 'https://www.akc.org/expert-advice/training/how-to-potty-train-a-puppy/',
          readTime: '12 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Basic Dog Training Commands',
          description: 'Essential commands every dog should know',
          url: 'https://www.akc.org/expert-advice/training/basic-dog-training-commands/',
          readTime: '15 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Stopping Destructive Behavior',
          description: 'How to address common behavioral problems',
          url: 'https://www.akc.org/expert-advice/training/destructive-behavior/',
          readTime: '13 min read',
          rating: 4.7,
          difficulty: 'Intermediate'
        },
        {
          title: 'Positive Reinforcement Training',
          description: 'Understanding reward-based training methods',
          url: 'https://www.akc.org/expert-advice/training/positive-reinforcement/',
          readTime: '11 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Teaching Your Dog to Walk on a Leash',
          description: 'Step-by-step leash training guide',
          url: 'https://www.akc.org/expert-advice/training/teach-your-puppy-to-walk-on-a-leash/',
          readTime: '10 min read',
          rating: 4.6,
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'puppy',
      title: 'Puppy Information',
      icon: '🐶',
      description: 'Essential information for new puppy parents',
      color: 'bg-green-50 border-green-200',
      articles: [
        {
          title: 'Preparing for Your New Puppy',
          description: 'Complete checklist for bringing your puppy home',
          url: 'https://www.akc.org/expert-advice/puppy-information/preparing-for-your-new-puppy/',
          readTime: '16 min read',
          rating: 4.9,
          difficulty: 'Beginner'
        },
        {
          title: 'First Week With Your New Puppy',
          description: 'Essential guide for your puppy\'s first week at home',
          url: 'https://www.akc.org/expert-advice/puppy-information/first-week-new-puppy/',
          readTime: '12 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Puppy Socialization Guide',
          description: 'Critical socialization period and techniques',
          url: 'https://www.akc.org/expert-advice/puppy-information/puppy-socialization/',
          readTime: '14 min read',
          rating: 4.9,
          difficulty: 'Beginner'
        },
        {
          title: 'Puppy Development Stages',
          description: 'Understanding your puppy\'s growth and development',
          url: 'https://www.akc.org/expert-advice/puppy-information/puppy-development-stages/',
          readTime: '13 min read',
          rating: 4.7,
          difficulty: 'Beginner'
        },
        {
          title: 'Why Puppies Sleep So Much',
          description: 'Understanding puppy sleep patterns and needs',
          url: 'https://www.akc.org/expert-advice/puppy-information/why-do-puppies-sleep-so-much/',
          readTime: '9 min read',
          rating: 4.6,
          difficulty: 'Beginner'
        },
        {
          title: 'When Puppies Open Their Eyes',
          description: 'Puppy development milestones and eye opening',
          url: 'https://www.akc.org/expert-advice/puppy-information/when-do-puppies-open-their-eyes/',
          readTime: '11 min read',
          rating: 4.7,
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'veterinary',
      title: 'Veterinary Corner',
      icon: '👨‍⚕️',
      description: 'Professional veterinary advice and insights',
      color: 'bg-purple-50 border-purple-200',
      articles: [
        {
          title: 'How to Choose a Veterinarian',
          description: 'Essential tips for finding the right vet for your dog',
          url: 'https://www.akc.org/expert-advice/vets-corner/choosing-a-veterinarian/',
          readTime: '10 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        },
        {
          title: 'Emergency Veterinary Care',
          description: 'When to seek immediate veterinary attention',
          url: 'https://www.akc.org/expert-advice/vets-corner/emergency-vet-care/',
          readTime: '12 min read',
          rating: 4.9,
          difficulty: 'Intermediate'
        },
        {
          title: 'Dog Dental Care and Cleaning',
          description: 'Maintaining your dog\'s oral health',
          url: 'https://www.akc.org/expert-advice/health/dog-dental-care/',
          readTime: '8 min read',
          rating: 4.5,
          difficulty: 'Beginner'
        },
        {
          title: 'Dog Insurance: What You Need to Know',
          description: 'Understanding pet insurance options and coverage',
          url: 'https://www.akc.org/expert-advice/health/dog-insurance/',
          readTime: '11 min read',
          rating: 4.6,
          difficulty: 'Intermediate'
        },
        {
          title: 'Annual Dog Health Checkups',
          description: 'What to expect during routine veterinary visits',
          url: 'https://www.akc.org/expert-advice/health/annual-dog-health-checkups/',
          readTime: '9 min read',
          rating: 4.7,
          difficulty: 'Beginner'
        },
        {
          title: 'Dog X-Ray Costs and Procedures',
          description: 'Understanding veterinary diagnostic procedures',
          url: 'https://www.akc.org/expert-advice/health/dog-x-ray-cost/',
          readTime: '13 min read',
          rating: 4.8,
          difficulty: 'Beginner'
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <Card key={section.id} className={`${section.color}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h3>{section.title}</h3>
                <p className="text-sm font-normal text-gray-600 mt-1">
                  {section.description}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {section.articles.length} articles
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
              {section.articles.map((article, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors ml-2 flex-shrink-0" />
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Clock size={12} />
                    <span>{article.readTime}</span>
                    <Star size={12} className="text-amber-500 fill-current ml-2" />
                    <span>{article.rating}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getDifficultyColor(article.difficulty)}`}
                    >
                      {article.difficulty}
                    </Badge>
                    
                    <span className="text-xs text-blue-600 font-medium">
                      Read Article →
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                className="group"
                onClick={() => window.open(`https://www.akc.org/expert-advice/${section.id === 'veterinary' ? 'vets-corner' : section.id === 'puppy' ? 'puppy-information' : section.id}/`, '_blank')}
              >
                View all {section.title} articles
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
