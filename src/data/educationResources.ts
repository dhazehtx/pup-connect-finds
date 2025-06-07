
import { EducationResource } from '../hooks/useEducationSearch';

export const educationResources: EducationResource[] = [
  {
    id: 1,
    category: 'breeds',
    title: 'Golden Retriever Complete Guide',
    description: 'Everything you need to know about Golden Retrievers - temperament, care, training tips, and health considerations.',
    readTime: '12 min read',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Guide',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['golden retriever', 'family dogs', 'training', 'grooming'],
    downloadable: true,
    content: 'Comprehensive guide covering all aspects of Golden Retriever ownership...',
    relatedArticles: [6, 4],
    url: 'https://www.akc.org/dog-breeds/golden-retriever/'
  },
  {
    id: 2,
    category: 'firsttime',
    title: 'Puppy-Proofing Your Home: Essential Safety Guide',
    description: 'Complete AKC guide for preparing your home for a new puppy. Essential safety tips and must-have supplies.',
    readTime: '8 min read',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Guide',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['puppy', 'safety', 'preparation', 'home'],
    downloadable: true,
    content: 'Complete checklist for puppy-proofing your home...',
    relatedArticles: [6, 3],
    url: 'https://www.akc.org/expert-advice/home-living/puppy-proofing-your-home/'
  },
  {
    id: 3,
    category: 'legal',
    title: 'Dog Laws: What You Need to Know',
    description: 'Understanding dog ownership laws, regulations, and your rights and responsibilities as a dog owner.',
    readTime: '15 min read',
    rating: 4.6,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Legal Guide',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Intermediate',
    tags: ['legal', 'regulations', 'ownership', 'laws'],
    downloadable: true,
    content: 'Detailed overview of dog ownership laws and regulations...',
    relatedArticles: [8, 9],
    url: 'https://www.akc.org/expert-advice/lifestyle/dog-laws-what-you-need-to-know/'
  },
  {
    id: 4,
    category: 'vetcare',
    title: 'How to Choose a Veterinarian',
    description: 'AKC guide on finding the right veterinarian and what to expect during your first visit. Questions to ask and red flags to watch.',
    readTime: '10 min read',
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Health Guide',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['veterinarian', 'health', 'first visit', 'medical care'],
    downloadable: false,
    content: 'Guide to selecting the right veterinarian...',
    relatedArticles: [5, 7],
    url: 'https://www.akc.org/expert-advice/health/how-to-choose-a-veterinarian/'
  },
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
    relatedArticles: [1, 4],
    url: 'https://www.akc.org/dog-breeds/french-bulldog/'
  },
  {
    id: 6,
    category: 'firsttime',
    title: 'Puppy Training Basics: Complete Guide',
    description: 'AKC foundation training techniques for new puppy owners. House training, basic commands, and socialization.',
    readTime: '18 min read',
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Training Guide',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['training', 'puppy', 'commands', 'socialization'],
    downloadable: true,
    content: 'Step-by-step puppy training guide...',
    relatedArticles: [2, 1],
    url: 'https://www.akc.org/expert-advice/training/puppy-training-basics/'
  },
  {
    id: 7,
    category: 'vetcare',
    title: 'Puppy Shots: Complete Vaccination Guide',
    description: 'Complete AKC puppy and adult dog vaccination timeline. Core vs non-core vaccines explained with schedule.',
    readTime: '12 min read',
    rating: 4.7,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1584302179602-e4a3d3ecc688?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Health Guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Intermediate',
    tags: ['vaccines', 'health', 'prevention', 'schedule'],
    downloadable: true,
    content: 'Complete vaccination guide...',
    relatedArticles: [4, 8],
    url: 'https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/'
  },
  {
    id: 8,
    category: 'nutrition',
    title: 'Puppy Feeding Guide: Nutrition Fundamentals',
    description: 'AKC essential nutrition guide for growing puppies. Food selection, feeding schedules, and nutritional needs.',
    readTime: '16 min read',
    rating: 4.8,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Nutrition Guide',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['nutrition', 'puppy food', 'feeding', 'growth'],
    downloadable: true,
    content: 'Comprehensive puppy nutrition guide...',
    relatedArticles: [7, 6],
    url: 'https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/'
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
    relatedArticles: [1, 6],
    url: 'https://www.akc.org/dog-breeds/labrador-retriever/'
  },
  {
    id: 10,
    category: 'vetcare',
    title: 'Dog Health: Signs of Illness',
    description: 'AKC guide to recognizing signs of illness in dogs and when to contact your veterinarian.',
    readTime: '11 min read',
    rating: 4.8,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Health Guide',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Intermediate',
    tags: ['health', 'illness', 'symptoms', 'veterinary'],
    downloadable: true,
    content: 'Guide to recognizing health issues in dogs...',
    relatedArticles: [4, 7],
    url: 'https://www.akc.org/expert-advice/health/dog-health-signs-of-illness/'
  },
  {
    id: 11,
    category: 'nutrition',
    title: 'Dog Nutrition: What Makes a Balanced Diet',
    description: 'AKC comprehensive guide to dog nutrition, including essential nutrients and feeding guidelines for all life stages.',
    readTime: '14 min read',
    rating: 4.7,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Nutrition Guide',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Intermediate',
    tags: ['nutrition', 'diet', 'balanced', 'feeding'],
    downloadable: true,
    content: 'Complete guide to balanced dog nutrition...',
    relatedArticles: [8, 6],
    url: 'https://www.akc.org/expert-advice/nutrition/dog-nutrition/'
  },
  {
    id: 12,
    category: 'firsttime',
    title: 'Bringing Home a New Dog',
    description: 'AKC guide for successfully introducing a new dog to your home and family, including preparation and first week tips.',
    readTime: '10 min read',
    rating: 4.6,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
    author: {
      name: 'American Kennel Club',
      credentials: 'Official AKC Guide',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['new dog', 'introduction', 'preparation', 'first week'],
    downloadable: true,
    content: 'Guide to bringing home a new dog...',
    relatedArticles: [2, 6],
    url: 'https://www.akc.org/expert-advice/home-living/bringing-home-a-new-dog/'
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
