
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, ExternalLink, Play } from 'lucide-react';

export const EducationLearningPaths: React.FC = () => {
  const learningPaths = [
    {
      id: 'new-puppy-parent',
      title: '🐶 New Puppy Parent Journey',
      description: 'Complete 6-week guided path from preparation to confident puppy ownership',
      duration: '6 weeks',
      difficulty: 'Beginner',
      modules: 15,
      students: '32,000+',
      completion: 0,
      color: 'bg-green-50 border-green-200',
      lessons: [
        {
          week: 'Week 1',
          title: 'Preparation & Home Setup',
          description: 'Puppy-proof your home and gather essential supplies',
          url: 'https://www.akc.org/expert-advice/puppy-information/preparing-for-your-new-puppy/',
          duration: '45 min'
        },
        {
          week: 'Week 2',
          title: 'First Week Essentials',
          description: 'Navigate your puppy\'s critical first week at home',
          url: 'https://www.akc.org/expert-advice/puppy-information/first-week-new-puppy/',
          duration: '60 min'
        },
        {
          week: 'Week 3',
          title: 'Health & Vaccination Basics',
          description: 'Understanding puppy health and vaccination schedules',
          url: 'https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/',
          duration: '50 min'
        },
        {
          week: 'Week 4',
          title: 'Feeding & Nutrition Foundation',
          description: 'Establishing proper feeding routines and nutrition',
          url: 'https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/',
          duration: '40 min'
        },
        {
          week: 'Week 5',
          title: 'Basic Training & Socialization',
          description: 'Start basic training and critical socialization',
          url: 'https://www.akc.org/expert-advice/training/puppy-training-basics/',
          duration: '75 min'
        },
        {
          week: 'Week 6',
          title: 'Building Lifelong Habits',
          description: 'Establishing routines for long-term success',
          url: 'https://www.akc.org/expert-advice/puppy-information/puppy-development-stages/',
          duration: '55 min'
        }
      ]
    },
    {
      id: 'nutrition-mastery',
      title: '🥗 Complete Nutrition Mastery',
      description: 'Master dog nutrition from puppyhood through senior years',
      duration: '4 weeks',
      difficulty: 'Intermediate',
      modules: 12,
      students: '24,500+',
      completion: 0,
      color: 'bg-orange-50 border-orange-200',
      lessons: [
        {
          week: 'Module 1',
          title: 'Puppy Nutrition Fundamentals',
          description: 'Essential nutrition for growing puppies',
          url: 'https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/',
          duration: '40 min'
        },
        {
          week: 'Module 2',
          title: 'Adult Dog Diet Planning',
          description: 'Creating balanced diets for adult dogs',
          url: 'https://www.akc.org/expert-advice/nutrition/dog-feeding-guide/',
          duration: '50 min'
        },
        {
          week: 'Module 3',
          title: 'Food Safety & Toxic Foods',
          description: 'Understanding what dogs can and cannot eat safely',
          url: 'https://www.akc.org/expert-advice/nutrition/human-foods-dogs-can-and-cannot-eat/',
          duration: '45 min'
        },
        {
          week: 'Module 4',
          title: 'Special Dietary Needs & Senior Care',
          description: 'Managing allergies, health conditions, and senior nutrition',
          url: 'https://www.akc.org/expert-advice/nutrition/senior-dog-nutrition/',
          duration: '55 min'
        }
      ]
    },
    {
      id: 'training-expert',
      title: '🎓 Dog Training Expert Path',
      description: 'Advanced training techniques from basic commands to behavioral excellence',
      duration: '8 weeks',
      difficulty: 'Advanced',
      modules: 20,
      students: '18,200+',
      completion: 0,
      color: 'bg-blue-50 border-blue-200',
      lessons: [
        {
          week: 'Foundation',
          title: 'Training Philosophy & Positive Reinforcement',
          description: 'Understanding modern, science-based training methods',
          url: 'https://www.akc.org/expert-advice/training/positive-reinforcement/',
          duration: '60 min'
        },
        {
          week: 'Basic Skills',
          title: 'Essential Commands Mastery',
          description: 'Perfect the fundamental commands every dog needs',
          url: 'https://www.akc.org/expert-advice/training/basic-dog-training-commands/',
          duration: '90 min'
        },
        {
          week: 'House Training',
          title: 'Complete House Training System',
          description: 'Master potty training and indoor behavior',
          url: 'https://www.akc.org/expert-advice/training/how-to-potty-train-a-puppy/',
          duration: '75 min'
        },
        {
          week: 'Behavioral Issues',
          title: 'Advanced Problem Solving',
          description: 'Address and resolve challenging behavioral issues',
          url: 'https://www.akc.org/expert-advice/training/destructive-behavior/',
          duration: '120 min'
        }
      ]
    },
    {
      id: 'health-guardian',
      title: '🏥 Complete Health Guardian',
      description: 'Comprehensive health management and preventive care expertise',
      duration: '5 weeks',
      difficulty: 'Intermediate',
      modules: 16,
      students: '21,800+',
      completion: 0,
      color: 'bg-red-50 border-red-200',
      lessons: [
        {
          week: 'Prevention',
          title: 'Preventive Care Foundation',
          description: 'Vaccination schedules and preventive health measures',
          url: 'https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/',
          duration: '55 min'
        },
        {
          week: 'Recognition',
          title: 'Health Symptom Recognition',
          description: 'Identifying early warning signs and health issues',
          url: 'https://www.akc.org/expert-advice/health/symptoms-to-watch-for-in-your-dog/',
          duration: '70 min'
        },
        {
          week: 'Management',
          title: 'Common Health Issues Management',
          description: 'Managing allergies, parasites, and chronic conditions',
          url: 'https://www.akc.org/expert-advice/health/dog-allergies/',
          duration: '65 min'
        },
        {
          week: 'Veterinary Care',
          title: 'Working with Veterinarians',
          description: 'Choosing vets, understanding costs, and emergency care',
          url: 'https://www.akc.org/expert-advice/vets-corner/choosing-a-veterinarian/',
          duration: '45 min'
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Structured Learning Paths</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Follow our expertly designed learning paths based on American Kennel Club expertise. 
          Each path provides step-by-step guidance with reliable, veterinarian-approved content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id} className={`hover:shadow-lg transition-shadow ${path.color}`}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg mb-2">{path.title}</h3>
                  <p className="text-sm text-gray-600 font-normal">{path.description}</p>
                </div>
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getDifficultyColor(path.difficulty)}>
                  {path.difficulty}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock size={12} />
                  {path.duration}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users size={12} />
                  {path.students}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {path.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer group"
                    onClick={() => window.open(lesson.url, '_blank')}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue-600">{lesson.week}</span>
                        <span className="text-xs text-gray-500">• {lesson.duration}</span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{lesson.description}</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => window.open(path.lessons[0].url, '_blank')}
                >
                  <Play size={16} className="mr-2" />
                  Start Learning Path
                </Button>
                <p className="text-xs text-center text-gray-500">
                  All content provided by the American Kennel Club
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Need More Specialized Training?</h3>
        <p className="text-blue-700 text-sm mb-4">
          Explore additional specialized courses and certifications
        </p>
        <Button 
          variant="outline"
          onClick={() => window.open('https://www.akc.org/expert-advice/training/', '_blank')}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ExternalLink size={16} className="mr-2" />
          Browse All Training Resources
        </Button>
      </div>
    </div>
  );
};
