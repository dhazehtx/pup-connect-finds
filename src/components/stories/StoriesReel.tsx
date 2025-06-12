
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { sampleStories, Story } from '@/data/sampleStories';
import StoryViewer from './StoryViewer';

const StoriesReel = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);

  const handleStoryClick = (story: Story) => {
    if (story.isAddStory) {
      // Handle add story logic here
      console.log('Add story clicked');
      return;
    }
    
    setSelectedStory(story);
    setIsStoryViewerOpen(true);
  };

  const handleCloseStoryViewer = () => {
    setIsStoryViewerOpen(false);
    setSelectedStory(null);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          {sampleStories.map((story) => (
            <div
              key={story.id}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleStoryClick(story)}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  story.isAddStory 
                    ? 'bg-gray-200' 
                    : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'
                }`}>
                  <div className="w-full h-full bg-white rounded-full p-0.5">
                    {story.isAddStory ? (
                      <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus size={20} className="text-gray-600" />
                      </div>
                    ) : (
                      <img
                        src={story.avatar || '/placeholder.svg'}
                        alt={story.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-700 max-w-[64px] truncate">
                  {story.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer */}
      {isStoryViewerOpen && selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={handleCloseStoryViewer}
        />
      )}
    </>
  );
};

export default StoriesReel;
