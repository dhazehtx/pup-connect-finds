import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  BookOpen, 
  Users, 
  Heart, 
  Shield, 
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Bookmark,
  Share2,
  FileText,
  Star,
  Check,
  Home,
  Stethoscope,
  Tag,
  Link,
  Utensils,
  Bed,
  Scissors,
  Car,
  ClipboardList,
  Camera,
  GraduationCap,
  ShoppingCart,
  Activity
} from 'lucide-react';

// Educational articles data
const educationalArticles = [
  {
    id: 1,
    title: 'Complete Guide to Puppy Vaccination Schedule',
    description: 'Essential vaccination timeline and health requirements for your new puppy from 6-16 weeks.',
    author: 'American Veterinary Medical Association',
    readTime: '8 min read',
    rating: 4.9,
    tags: ['vaccines', 'health', 'puppy', 'veterinary'],
    category: 'Health & Wellness',
    image: '/api/placeholder/300/200',
    url: 'https://www.avma.org/resources/pet-owners/petcare/dog-care/puppy-vaccinations'
  },
  {
    id: 2,
    title: 'French Bulldog Breed Profile',
    description: 'Comprehensive guide to French Bulldog temperament, exercise needs, grooming, and health considerations.',
    author: 'American Kennel Club',
    readTime: '12 min read',
    rating: 4.8,
    tags: ['french-bulldog', 'breed-guide', 'care', 'exercise'],
    category: 'Breed Information',
    image: '/api/placeholder/300/200',
    url: 'https://www.akc.org/dog-breeds/french-bulldog/'
  },
  {
    id: 3,
    title: 'House Training Your New Puppy: Step-by-Step Guide',
    description: 'Proven methods for successful house training, crate training, and establishing good bathroom habits.',
    author: 'Certified Dog Trainer Institute',
    readTime: '10 min read',
    rating: 4.7,
    tags: ['training', 'house-training', 'puppy', 'behavior'],
    category: 'Training & Behavior',
    image: '/api/placeholder/300/200',
    url: 'https://www.akc.org/expert-advice/training/how-to-potty-train-a-puppy/'
  },
  {
    id: 4,
    title: 'Nutrition Guidelines for Growing Puppies',
    description: 'Complete feeding guide including portion sizes, feeding schedules, and nutritional requirements.',
    author: 'Pet Nutrition Alliance',
    readTime: '7 min read',
    rating: 4.6,
    tags: ['nutrition', 'feeding', 'puppy', 'health'],
    category: 'Nutrition',
    image: '/api/placeholder/300/200',
    url: 'https://www.akc.org/expert-advice/nutrition/puppy-feeding-guide/'
  },
  {
    id: 5,
    title: 'Creating a Safe Environment: Puppy-Proofing Your Home',
    description: 'Essential safety checklist and hazard identification for new puppy owners.',
    author: 'ASPCA Safety Division',
    readTime: '6 min read',
    rating: 4.8,
    tags: ['safety', 'puppy-proofing', 'home', 'preparation'],
    category: 'Safety & Preparation',
    image: '/api/placeholder/300/200',
    url: 'https://www.aspca.org/pet-care/dog-care/puppy-proofing'
  }
];

// New Owner Starter Pack checklist
const starterPackItems = [
  { icon: Home, task: 'Puppy-proof your home', completed: false },
  { icon: Stethoscope, task: 'Schedule first vet appointment', completed: false },
  { icon: Tag, task: 'Get ID tag and collar', completed: false },
  { icon: Link, task: 'Purchase leash and harness', completed: false },
  { icon: Utensils, task: 'Buy food and water bowls', completed: false },
  { icon: Bed, task: 'Set up sleeping area', completed: false },
  { icon: Scissors, task: 'Find grooming supplies', completed: false },
  { icon: Car, task: 'Plan transportation setup', completed: false },
  { icon: ClipboardList, task: 'Create care schedule', completed: false },
  { icon: Camera, task: 'Document puppy photos', completed: false },
  { icon: GraduationCap, task: 'Research training classes', completed: false },
  { icon: ShoppingCart, task: 'Stock up on puppy supplies', completed: false }
];

const Education = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const categories = ['all', 'Health & Wellness', 'Breed Information', 'Training & Behavior', 'Nutrition', 'Safety & Preparation'];

  const filteredArticles = educationalArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (articleId: number) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const toggleCheckItem = (index: number) => {
    setCheckedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleReadArticle = (article: any) => {
    // Create a modal or navigate to full article view
    window.open(article.url || '#', '_blank');
  };

  const handleShareArticle = (article: any) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${article.title} - ${window.location.href}`);
      alert('Article link copied to clipboard!');
    }
  };

  const handleDownloadPDF = (article: any) => {
    // Simulate PDF download or open sample PDF
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
      `${article.title}\n\n${article.description}\n\nBy ${article.author}\n${article.readTime}`
    )}`;
    link.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    link.click();
  };

  const handleLegalGuideFilter = (regulationType: string) => {
    // Navigate to legal page with filter applied
    window.location.href = `/legal?filter=${regulationType.toLowerCase()}`;
  };

  const handleViewFullLegalGuide = () => {
    // Navigate to the full legal guide page
    window.location.href = '/legal';
  };

  const completionPercentage = (checkedItems.length / starterPackItems.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Educational Resources</h1>
        <p className="text-lg text-gray-600">
          Learn everything you need to know about dog ownership and care
        </p>
      </div>

      {/* Progress and Bookmarks Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your Learning Progress</h3>
              <span className="text-sm text-gray-600">{checkedItems.length} of 5 articles completed</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Bookmarked</h3>
                <p className="text-sm text-gray-600">{bookmarkedArticles.length} articles saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search resources, tags, authors…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-lg"
        />
      </div>

      {/* New Owner Starter Pack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-600" />
            New Owner Starter Pack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {starterPackItems.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleCheckItem(index)}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      checkedItems.includes(index) 
                        ? 'bg-green-600 border-green-600' 
                        : 'border-gray-300'
                    }`}>
                      {checkedItems.includes(index) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <item.icon className={`w-5 h-5 ${
                      checkedItems.includes(index) ? 'text-green-600' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      checkedItems.includes(index) ? 'text-green-600 line-through' : 'text-gray-700'
                    }`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Educational Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-40 rounded-t-lg flex items-center justify-center overflow-hidden">
                {article.category === 'Health & Wellness' && (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-green-100 to-emerald-200">
                    <Stethoscope className="w-12 h-12 text-green-600" />
                  </div>
                )}
                {article.category === 'Breed Information' && (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-amber-100 to-orange-200">
                    <Heart className="w-12 h-12 text-orange-600" />
                  </div>
                )}
                {article.category === 'Training & Behavior' && (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-100 to-violet-200">
                    <GraduationCap className="w-12 h-12 text-purple-600" />
                  </div>
                )}
                {article.category === 'Nutrition' && (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-red-100 to-pink-200">
                    <Utensils className="w-12 h-12 text-red-600" />
                  </div>
                )}
                {article.category === 'Safety & Preparation' && (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-cyan-200">
                    <Shield className="w-12 h-12 text-blue-600" />
                  </div>
                )}
              </div>
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 bg-white/90"
              >
                {article.category}
              </Badge>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {article.description}
              </p>
              
              <div className="text-xs text-gray-500">
                By {article.author}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{article.readTime}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{article.rating}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadPDF(article)}
                    title="Download as PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShareArticle(article)}
                    title="Share article"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleReadArticle(article)}
                    className="ml-2"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    Read
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleBookmark(article.id)}
                  title="Bookmark article"
                >
                  <Bookmark className={`w-4 h-4 ${
                    bookmarkedArticles.includes(article.id) 
                      ? 'text-blue-600 fill-current' 
                      : 'text-gray-400'
                  }`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* State-by-State Legal Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            State-by-State Legal Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Understanding your rights and responsibilities when buying or selling puppies varies by state. 
            Explore regulations that protect you and ensure ethical practices.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleLegalGuideFilter('strict')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Strict Regulations
            </Button>
            <Button 
              variant="outline" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => handleLegalGuideFilter('moderate')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Moderate Regulations
            </Button>
            <Button 
              variant="outline" 
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => handleLegalGuideFilter('lenient')}
            >
              <Check className="w-4 h-4 mr-2" />
              Lenient Regulations
            </Button>
            <Button 
              variant="default"
              onClick={handleViewFullLegalGuide}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Legal Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Education;