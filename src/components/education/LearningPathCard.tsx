
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Play } from 'lucide-react';
import { LearningPathLesson } from './LearningPathLesson';

interface Lesson {
  week: string;
  title: string;
  description: string;
  url: string;
  duration: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  modules: number;
  students: string;
  completion: number;
  color: string;
  lessons: Lesson[];
}

interface LearningPathCardProps {
  path: LearningPath;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${path.color}`}>
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
            <LearningPathLesson
              key={index}
              lesson={lesson}
              index={index}
            />
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
  );
};
