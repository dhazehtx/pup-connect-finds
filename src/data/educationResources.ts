
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
      name: 'Dr. Sarah Johnson',
      credentials: 'DVM, Animal Behaviorist',
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
    title: 'Puppy-Proofing Your Home',
    description: 'Essential checklist for preparing your home for a new puppy arrival. Safety tips and must-have supplies.',
    readTime: '8 min read',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
    author: {
      name: 'Mark Thompson',
      credentials: 'Certified Dog Trainer',
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
    title: 'California Dog Sale Laws',
    description: 'State-specific regulations for buying and selling dogs in California. Understanding your rights and responsibilities.',
    readTime: '15 min read',
    rating: 4.6,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=200&fit=crop',
    author: {
      name: 'Jennifer Martinez',
      credentials: 'Animal Law Attorney',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Intermediate',
    tags: ['legal', 'california', 'regulations', 'buying'],
    downloadable: true,
    content: 'Detailed overview of California dog sale regulations...',
    relatedArticles: [8, 9],
    url: 'https://www.akc.org/expert-advice/lifestyle/dog-laws-what-you-need-to-know/'
  },
  {
    id: 4,
    category: 'vetcare',
    title: 'Finding the Right Veterinarian',
    description: 'How to choose a veterinarian and what to expect during your first visit. Questions to ask and red flags to watch.',
    readTime: '10 min read',
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop',
    author: {
      name: 'Dr. Michael Chen',
      credentials: 'DVM, Emergency Medicine',
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
    title: 'French Bulldog Health Guide',
    description: 'Common health issues in French Bulldogs and prevention strategies. Breeding considerations and care tips.',
    readTime: '14 min read',
    rating: 4.8,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop',
    author: {
      name: 'Dr. Lisa Wang',
      credentials: 'DVM, Specialist in Brachycephalic Breeds',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Advanced',
    tags: ['french bulldog', 'health', 'breathing', 'brachycephalic'],
    downloadable: true,
    content: 'Comprehensive health guide for French Bulldogs...',
    relatedArticles: [1, 4],
    url: 'https://www.akc.org/dog-breeds/french-bulldog/'
  },
  {
    id: 6,
    category: 'firsttime',
    title: 'Puppy Training Basics',
    description: 'Foundation training techniques for new puppy owners. House training, basic commands, and socialization.',
    readTime: '18 min read',
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    author: {
      name: 'Rachel Brooks',
      credentials: 'CCPDT-KA Certified Trainer',
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
    title: 'AKC Vaccination Schedule Guide',
    description: 'Complete puppy and adult dog vaccination timeline from the American Kennel Club. Core vs non-core vaccines explained.',
    readTime: '12 min read',
    rating: 4.7,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1584302179602-e4a3d3ecc688?w=300&h=200&fit=crop',
    author: {
      name: 'Dr. Robert Kim',
      credentials: 'DVM, Preventive Medicine',
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
    title: 'Puppy Nutrition Fundamentals',
    description: 'Essential nutrition guide for growing puppies. Food selection, feeding schedules, and nutritional needs.',
    readTime: '16 min read',
    rating: 4.8,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    author: {
      name: 'Dr. Emily Foster',
      credentials: 'DVM, Veterinary Nutritionist',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face'
    },
    difficulty: 'Beginner',
    tags: ['nutrition', 'puppy food', 'feeding', 'growth'],
    downloadable: true,
    content: 'Comprehensive puppy nutrition guide...',
    relatedArticles: [7, 6],
    url: 'https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/'
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
