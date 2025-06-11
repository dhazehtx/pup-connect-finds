
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Award, 
  Image, 
  Calendar, 
  Star,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useBreedingPortfolio } from '@/hooks/useBreedingPortfolio';
import { useToast } from '@/hooks/use-toast';

const BreedingPortfolioManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    portfolio_name: '',
    description: '',
    established_year: new Date().getFullYear(),
    breeding_philosophy: '',
    available_breeds: [] as string[],
    health_testing_protocols: [] as string[],
    is_public: true,
    achievements: [] as string[],
    facility_photos: [] as string[]
  });
  
  const { 
    portfolios, 
    achievements, 
    loading,
    createPortfolio,
    updatePortfolio,
    addAchievement 
  } = useBreedingPortfolio();
  const { toast } = useToast();

  const handleCreatePortfolio = async () => {
    try {
      await createPortfolio(newPortfolio);
      setIsCreateDialogOpen(false);
      setNewPortfolio({
        portfolio_name: '',
        description: '',
        established_year: new Date().getFullYear(),
        breeding_philosophy: '',
        available_breeds: [],
        health_testing_protocols: [],
        is_public: true,
        achievements: [],
        facility_photos: []
      });
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  const handleAddBreed = (portfolioIndex: number, breed: string) => {
    if (breed.trim()) {
      const updatedBreeds = [...(portfolios[portfolioIndex]?.available_breeds || []), breed.trim()];
      updatePortfolio(portfolios[portfolioIndex].id, { available_breeds: updatedBreeds });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Breeding Portfolio</h2>
          <p className="text-muted-foreground">Showcase your breeding program and achievements</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Breeding Portfolio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="portfolio_name">Portfolio Name</Label>
                <Input
                  id="portfolio_name"
                  value={newPortfolio.portfolio_name}
                  onChange={(e) => setNewPortfolio(prev => ({ ...prev, portfolio_name: e.target.value }))}
                  placeholder="Golden Paws Breeding Program"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your breeding program..."
                />
              </div>
              
              <div>
                <Label htmlFor="established_year">Established Year</Label>
                <Input
                  id="established_year"
                  type="number"
                  value={newPortfolio.established_year}
                  onChange={(e) => setNewPortfolio(prev => ({ ...prev, established_year: parseInt(e.target.value) }))}
                />
              </div>
              
              <div>
                <Label htmlFor="breeding_philosophy">Breeding Philosophy</Label>
                <Textarea
                  id="breeding_philosophy"
                  value={newPortfolio.breeding_philosophy}
                  onChange={(e) => setNewPortfolio(prev => ({ ...prev, breeding_philosophy: e.target.value }))}
                  placeholder="Your approach to breeding..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreatePortfolio} disabled={loading}>
                  Create Portfolio
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio List */}
      <div className="space-y-4">
        {portfolios.map((portfolio, index) => (
          <Card key={portfolio.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {portfolio.portfolio_name}
                    {portfolio.is_public && <Badge variant="outline">Public</Badge>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Established {portfolio.established_year} • Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="breeds">Breeds</TabsTrigger>
                  <TabsTrigger value="health">Health Testing</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                  </div>
                  
                  {portfolio.breeding_philosophy && (
                    <div>
                      <h4 className="font-medium mb-2">Breeding Philosophy</h4>
                      <p className="text-sm text-muted-foreground">{portfolio.breeding_philosophy}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="breeds" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {portfolio.available_breeds.map((breed, breedIndex) => (
                      <Badge key={breedIndex} variant="secondary">
                        {breed}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input placeholder="Add a breed..." className="flex-1" />
                    <Button size="sm">Add</Button>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <div className="grid gap-2">
                    {portfolio.health_testing_protocols.map((protocol, protocolIndex) => (
                      <div key={protocolIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-sm">{protocol}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                  <div className="grid gap-3">
                    {portfolio.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-medium">{achievement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Achievement
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolios.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Portfolios Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first breeding portfolio to showcase your program
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BreedingPortfolioManager;
