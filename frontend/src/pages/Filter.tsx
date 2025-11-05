import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Filter as FilterIcon } from 'lucide-react';
import CreatorCard, { Creator } from '@/components/CreatorCard';
import { useToast } from '@/hooks/use-toast';
import creator1 from '@/assets/creator1.jpg';
import creator2 from '@/assets/creator2.jpg';
import creator3 from '@/assets/creator3.jpg';
import creator4 from '@/assets/creator4.jpg';

const Filter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const { toast } = useToast();

  // Sample creator data
  const creators: Creator[] = [
    {
      id: 1,
      name: 'John Fit',
      niche: 'Fitness',
      bio: 'Certified personal trainer and fitness influencer with 5+ years of experience helping people achieve their health goals.',
      image: creator1,
      followers: '125K',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Healthy Hannah',
      niche: 'Nutrition',
      bio: 'Registered nutritionist and wellness blogger sharing evidence-based nutrition tips for a healthier lifestyle.',
      image: creator2,
      followers: '89K',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Alex Camera',
      niche: 'Photography',
      bio: 'Professional photographer and content creator specializing in lifestyle and brand photography.',
      image: creator3,
      followers: '156K',
      rating: 4.9
    },
    {
      id: 4,
      name: 'GameMaster Mike',
      niche: 'Gaming',
      bio: 'Gaming content creator and streamer covering the latest games, reviews, and gaming tech.',
      image: creator4,
      followers: '234K',
      rating: 4.7
    },
    {
      id: 5,
      name: 'Fashion Fiona',
      niche: 'Fashion',
      bio: 'Fashion stylist and influencer showcasing the latest trends and sustainable fashion choices.',
      image: creator2, // Reusing for demo
      followers: '198K',
      rating: 4.8
    },
    {
      id: 6,
      name: 'Tech Tom',
      niche: 'Technology',
      bio: 'Technology reviewer and educator helping people make informed decisions about gadgets and software.',
      image: creator3, // Reusing for demo
      followers: '167K',
      rating: 4.6
    }
  ];

  const niches = ['All', 'Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology'];

  // Filter creators based on search term and selected niche
  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creator.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creator.bio.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNiche = selectedNiche === '' || selectedNiche === 'All' || creator.niche === selectedNiche;
      
      return matchesSearch && matchesNiche;
    });
  }, [searchTerm, selectedNiche, creators]);

  const handleContact = (creator: Creator) => {
    toast({
      title: 'Contact Request Sent',
      description: `Your contact request has been sent to ${creator.name}. They will get back to you soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold text-foreground mb-4">
            Find Your Perfect Creator
          </h1>
          <p className="text-xl text-muted-foreground">
            Search through our network of talented creators across all niches
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FilterIcon className="w-5 h-5 text-primary" />
              Search & Filter
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, niche, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Niche Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Filter by Niche</label>
                <div className="flex flex-wrap gap-2">
                  {niches.map((niche) => (
                    <Button
                      key={niche}
                      variant={selectedNiche === niche ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedNiche(niche)}
                      className={selectedNiche === niche ? "bg-gradient-hero" : ""}
                    >
                      {niche}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedNiche && selectedNiche !== 'All' && ` in ${selectedNiche}`}
          </p>
        </div>

        {/* Creators Grid */}
        {filteredCreators.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onContact={handleContact}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 bg-gradient-card border-0">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Creators Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find more creators.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedNiche('');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Filter;