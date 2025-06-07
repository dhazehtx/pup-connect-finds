
import React from 'react';
import { SectionCard } from './SectionCard';
import { educationSectionsData } from '../../data/educationSectionsData';
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
  return (
    <div className="space-y-8">
      {educationSectionsData.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
};
