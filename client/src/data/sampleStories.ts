
export interface StoryContent {
  id: string;
  type: 'image' | 'text';
  content: string;
  timestamp: string;
}

export interface Story {
  id: string;
  username: string;
  avatar?: string;
  isAddStory?: boolean;
  stories: StoryContent[];
}

export const sampleStories: Story[] = [
  {
    id: 'add-story',
    username: 'Your Story',
    isAddStory: true,
    stories: []
  },
  {
    id: '1',
    username: 'goldenpaws',
    avatar: '/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png',
    stories: [
      {
        id: '1-1',
        type: 'image',
        content: '/lovable-uploads/e5a0f017-3263-4e2a-b8eb-c15611287ed7.png',
        timestamp: '2h ago'
      },
      {
        id: '1-2',
        type: 'text',
        content: 'Beautiful day at the dog park! 🐕',
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: '2',
    username: 'puppylove',
    avatar: '/lovable-uploads/75316943-0598-40bc-bcb4-84665859ea00.png',
    stories: [
      {
        id: '2-1',
        type: 'image',
        content: '/lovable-uploads/3ae80125-17a2-47bf-85a7-2e69d508dee0.png',
        timestamp: '3h ago'
      }
    ]
  },
  {
    id: '3',
    username: 'dogtrainer',
    avatar: '/lovable-uploads/5c25f5ac-d644-465c-abc2-dc66bbdf3a94.png',
    stories: [
      {
        id: '3-1',
        type: 'text',
        content: 'Training session complete! 🎾',
        timestamp: '4h ago'
      }
    ]
  },
  {
    id: '4',
    username: 'furryfrends',
    avatar: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
    stories: [
      {
        id: '4-1',
        type: 'image',
        content: '/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png',
        timestamp: '5h ago'
      }
    ]
  }
];
