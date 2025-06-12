
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStories } from '@/hooks/useStories';
import StoryCreator from './StoryCreator';
import StoryViewer from './StoryViewer';
import { sampleStories } from '@/data/sampleStories';

interface Story {
  id: string;
  username: string;
  avatar?: string;
  isAddStory?: boolean;
  stories: Array<{
    id: string;
    type: 'image' | 'text';
    content: string;
    timestamp: string;
  }>;
}

const StoriesReel = () => {
  const { user } = useAuth();
  const { stories: userStories, createStory } = useStories();
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [allStories, setAllStories] = useState<Story[]>(sampleStories);

  const handleStoryClick = (index: number) => {
    if (allStories[index].isAddStory) {
      setShowStoryCreator(true);
    } else {
      setSelectedStoryIndex(index);
      setShowStoryViewer(true);
    }
  };

  const handleStoryCreated = (newStory: any) => {
    const story: Story = {
      id: newStory.id.toString(),
      username: newStory.username,
      avatar: newStory.avatar,
      stories: newStory.content.map((item: any, idx: number) => ({
        id: `${newStory.id}-${idx}`,
        type: item.type,
        content: item.url || item.content,
        timestamp: newStory.timestamp
      }))
    };

    setAllStories(prev => {
      const withoutAddStory = prev.filter(s => !s.isAddStory);
      return [
        {
          id: 'add-story',
          username: 'Your Story',
          isAddStory: true,
          stories: []
        },
        story,
        ...withoutAddStory
      ];
    });
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-4 overflow-x-auto">
        <div className="flex space-x-4">
          {allStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(index)}
              className="flex-shrink-0 text-center"
            >
              <div className="relative">
                {story.isAddStory ? (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <img
                        src={story.avatar || '/placeholder.svg'}
                        alt={story.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 truncate w-16">{story.username}</p>
            </button>
          ))}
        </div>
      </div>

      {showStoryCreator && (
        <StoryCreator
          onClose={() => setShowStoryCreator(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {showStoryViewer && (
        <StoryViewer
          stories={allStories.filter(s => !s.isAddStory)}
          initialIndex={selectedStoryIndex - 1}
          onClose={() => setShowStoryViewer(false)}
        />
      )}
    </>
  );
};

export default StoriesReel;
