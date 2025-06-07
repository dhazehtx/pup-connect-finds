
import { EducationResource } from '../hooks/useEducationSearch';

export const educationResources: EducationResource[] = [
  {
    id: 5,
    category: 'breeds',
    title: 'French Bulldog Breed Profile',
    description: 'Complete AKC breed profile for French Bulldogs including health considerations, temperament, and care requirements.',
    readTime: '14 min read',
    rating: 4.8,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Breed Guide',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Advanced',
    tags: ['french bulldog', 'breed profile', 'health', 'care'],
    downloadable: true,
    content: 'Comprehensive breed profile for French Bulldogs...',
    relatedArticles: [9, 7],
    url: 'https://www.akc.org/dog-breeds/french-bulldog/'
  },
  {
    id: 7,
    category: 'vetcare',
    title: 'Puppy Shots: Complete Vaccination Guide',
    description: 'Complete AKC puppy and adult dog vaccination timeline. Core vs non-core vaccines explained with schedule.',
    readTime: '12 min read',
    rating: 4.7,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Health Guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Intermediate',
    tags: ['vaccines', 'health', 'prevention', 'schedule'],
    downloadable: true,
    content: 'Complete vaccination guide...',
    relatedArticles: [9, 5],
    url: 'https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/'
  },
  {
    id: 9,
    category: 'breeds',
    title: 'Labrador Retriever Breed Guide',
    description: 'Complete AKC guide to Labrador Retrievers including temperament, exercise needs, and grooming requirements.',
    readTime: '13 min read',
    rating: 4.9,
    reviews: 245,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Breed Guide',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['labrador', 'retriever', 'family dogs', 'exercise'],
    downloadable: true,
    content: 'Comprehensive Labrador Retriever breed guide...',
    relatedArticles: [5, 7],
    url: 'https://www.akc.org/dog-breeds/labrador-retriever/'
  },
  {
    id: 10,
    category: 'firsttime',
    title: 'Home Living with Dogs',
    description: 'Essential AKC guide to creating a dog-friendly home environment and living harmoniously with your pet.',
    readTime: '10 min read',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Home Living Guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['home living', 'dog care', 'environment', 'lifestyle'],
    downloadable: true,
    content: 'Complete guide to home living with dogs...',
    relatedArticles: [5, 7, 9],
    url: 'https://www.akc.org/expert-advice/home-living/'
  },
  {
    id: 11,
    category: 'firsttime',
    title: 'Dog Lifestyle Guide',
    description: 'Comprehensive AKC lifestyle guide for dog owners covering daily routines, exercise, and enrichment activities.',
    readTime: '8 min read',
    rating: 4.7,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Lifestyle Guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['lifestyle', 'daily care', 'exercise', 'enrichment'],
    downloadable: true,
    content: 'Complete lifestyle guide for dog owners...',
    relatedArticles: [5, 7, 9, 10],
    url: 'https://www.akc.org/expert-advice/lifestyle/'
  }
];

export const categories = [
  { id: 'all', name: 'All Resources', icon: '📚' },
  { id: 'breeds', name: 'Breed Guides', icon: '🐕' },
  { id: 'firsttime', name: 'First-Time Owners', icon: '👶' },
  { id: 'vetcare', name: 'Vet & Care', icon: '🏥' },
  { id: 'legal', name: 'Legal Guide', icon: '⚖️' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗' }
];
