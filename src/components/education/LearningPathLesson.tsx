
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Lesson {
  week: string;
  title: string;
  description: string;
  url: string;
  duration: string;
}

interface LearningPathLessonProps {
  lesson: Lesson;
  index: number;
}

export const LearningPathLesson: React.FC<LearningPathLessonProps> = ({ lesson, index }) => {
  return (
    <div
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
  );
};
