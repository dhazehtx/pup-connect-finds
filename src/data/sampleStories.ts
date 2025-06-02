
export interface StoryContent {
  type: 'image' | 'video' | 'ai-generated';
  url: string;
  prompt?: string;
}

export interface Story {
  id: string | number;
  username: string;
  avatar: string | null;
  content: StoryContent[];
  timestamp: string;
  isAddStory?: boolean;
}

export const sampleStories: Story[] = [
  {
    id: 'add-story',
    username: 'Your Story',
    avatar: null,
    content: [],
    timestamp: '',
    isAddStory: true
  },
  {
    id: 2,
    username: 'goldenbreeder',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
    content: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop'
      },
      {
        type: 'ai-generated',
        url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=600&fit=crop',
        prompt: 'A golden retriever puppy playing in a sunny garden'
      }
    ],
    timestamp: '2h ago'
  },
  {
    id: 3,
    username: 'puppylover',
    avatar: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop&crop=face',
    content: [
      {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=600&fit=crop'
      }
    ],
    timestamp: '4h ago'
  },
  {
    id: 4,
    username: 'dogrescue',
    avatar: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=100&h=100&fit=crop&crop=face',
    content: [
      {
        type: 'ai-generated',
        url: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=400&h=600&fit=crop',
        prompt: 'A rescue dog finding its forever home with a happy family'
      }
    ],
    timestamp: '6h ago'
  },
  {
    id: 5,
    username: 'frenchbulldog',
    avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop&crop=face',
    content: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=600&fit=crop'
      },
      {
        type: 'ai-generated',
        url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
        prompt: 'French bulldog wearing sunglasses at the beach'
      }
    ],
    timestamp: '8h ago'
  }
];
