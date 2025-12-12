import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Filter as FilterIcon } from 'lucide-react';
import CreatorCard, { Creator } from '@/components/CreatorCard';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import creator1 from '@/assets/creator1.jpg';
import creator2 from '@/assets/creator2.jpg';
import creator3 from '@/assets/creator3.jpg';
import creator4 from '@/assets/creator4.jpg';

const Filter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();



  const niches = ['All', 'Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology'];

  // Fetch creators data from API
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/creators`);
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match Creator interface
          const transformedCreators: Creator[] = data.creators.map((creator: any, index: number) => ({
            id: creator.id,
            name: creator.name || creator.email?.split('@')[0] || `Creator ${creator.id}`,
            niche: creator.niche || 'General',
            bio: creator.bio || 'No bio available',
            image: [creator1, creator2, creator3, creator4][index % 4], // Cycle through available images
            followers: creator.follower_count ? `${creator.follower_count.toLocaleString()}` : '0',
            audience: creator.audience,
            budget: creator.budget,
            social_links: creator.social_links,
            portfolio_links: creator.portfolio_links
          }));
          setCreators(transformedCreators);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load creators data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching creators:', error);
        toast({
          title: 'Error',
          description: 'Failed to load creators data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, [toast]);

  // Filter creators based on search term and selected niche
  const filteredCreators = useMemo(() => {
    if (!creators.length) return [];
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
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-soft animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCreators.length > 0 ? (
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