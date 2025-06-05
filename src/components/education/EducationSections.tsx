
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
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
      id: 'breeds',
      title: 'Breed Guides',
      icon: '🐕',
      description: 'Complete guides for specific dog breeds',
      color: 'bg-primary/10 border-primary/20'
    },
    {
      id: 'firsttime',
      title: 'First-Time Owners',
      icon: '👶',
      description: 'Essential information for new dog parents',
      color: 'bg-secondary/10 border-secondary/20'
    },
    {
      id: 'vetcare',
      title: 'Veterinary Care',
      icon: '🏥',
      description: 'Health and medical care information',
      color: 'bg-accent/10 border-accent/20'
    },
    {
      id: 'nutrition',
      title: 'Nutrition & Diet',
      icon: '🥗',
      description: 'Feeding and nutrition guidelines',
      color: 'bg-primary/5 border-primary/10'
    },
    {
      id: 'legal',
      title: 'Legal Information',
      icon: '⚖️',
      description: 'Laws and regulations for dog ownership',
      color: 'bg-accent/5 border-accent/10'
    }
  ];

  const getResourcesByCategory = (categoryId: string) => {
    return resources.filter(resource => resource.category === categoryId);
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const sectionResources = getResourcesByCategory(section.id);
        
        if (sectionResources.length === 0) return null;

        return (
          <Card key={section.id} className={`${section.color} bg-card border-border`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <span className="text-2xl">{section.icon}</span>
                <div>
                  <h3>{section.title}</h3>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    {section.description}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto bg-secondary/20 text-secondary-foreground">
                  {sectionResources.length} articles
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionResources.slice(0, 6).map((resource) => {
                  const progress = getProgress(resource.id);
                  return (
                    <div
                      key={resource.id}
                      className="bg-background rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-pointer group hover:bg-muted/50"
                      onClick={() => onResourceClick(resource)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 text-foreground">
                          {resource.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 flex-shrink-0 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(resource.id);
                          }}
                        >
                          {isBookmarked(resource.id) ? (
                            <BookmarkCheck size={12} className="text-primary" />
                          ) : (
                            <Bookmark size={12} className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock size={12} />
                        <span>{resource.readTime}</span>
                        <Star size={12} className="text-primary fill-current ml-2" />
                        <span>{resource.rating}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-border text-muted-foreground"
                        >
                          {resource.difficulty}
                        </Badge>
                        
                        {isRead(resource.id) && (
                          <Badge className="bg-primary/20 text-primary text-xs">
                            Read
                          </Badge>
                        )}
                        
                        {progress.progress > 0 && progress.progress < 100 && (
                          <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary-foreground">
                            {Math.round(progress.progress)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {sectionResources.length > 6 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" className="group border-border hover:bg-muted">
                    View all {sectionResources.length} articles
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
