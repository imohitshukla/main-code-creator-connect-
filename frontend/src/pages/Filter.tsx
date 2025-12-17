import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider'; // Ensure this matches your component path
import { Label } from '@/components/ui/label';
import { Search, Filter as FilterIcon, RotateCcw, SlidersHorizontal } from 'lucide-react';
import CreatorCard, { Creator } from '@/components/CreatorCard';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import creator1 from '@/assets/creator1.jpg';
import creator2 from '@/assets/creator2.jpg';
import creator3 from '@/assets/creator3.jpg';
import creator4 from '@/assets/creator4.jpg';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"

const Filter = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [followersRange, setFollowersRange] = useState([0]); // Min followers
  const [engagementRange, setEngagementRange] = useState([0]); // Min engagement
  const [budgetRange, setBudgetRange] = useState([0]); // Max budget (0 means any/max)

  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const niches = ['All', 'Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology', 'Travel', 'Lifestyle'];

  // Debounce helper
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCreators();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedNiche, followersRange, engagementRange, budgetRange]);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedNiche !== 'All') params.append('niche', selectedNiche);
      if (followersRange[0] > 0) params.append('minFollowers', followersRange[0].toString());
      if (engagementRange[0] > 0) params.append('minEngagement', engagementRange[0].toString());
      if (budgetRange[0] > 0) params.append('maxBudget', budgetRange[0].toString());
      // Note: Search term is typically handled on client side in this hybrid approach unless backend supports it
      // Adding basic client side filtering for name search if backend doesn't support 'search' param yet,
      // but assuming we fetch all filtered by numeric params first.

      const response = await fetch(`${getApiUrl()}/api/creators?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let transformedCreators: Creator[] = data.creators.map((creator: any, index: number) => ({
          id: creator.id,
          name: creator.name || creator.email?.split('@')[0] || `Creator ${creator.id}`,
          niche: creator.niche || 'General',
          bio: creator.bio || 'No bio available',
          image: [creator1, creator2, creator3, creator4][index % 4],
          followers: creator.follower_count ? `${creator.follower_count.toLocaleString()}` : '0',
          followerCountRaw: creator.follower_count, // Keep raw for sorting/client logic if needed
          audience: creator.audience,
          budget: creator.budget,
          social_links: creator.social_links,
          portfolio_links: creator.portfolio_links
        }));

        // Client-side text search (until backend update)
        if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          transformedCreators = transformedCreators.filter(c =>
            c.name.toLowerCase().includes(lowerTerm) ||
            c.bio.toLowerCase().includes(lowerTerm) ||
            c.niche.toLowerCase().includes(lowerTerm)
          );
        }

        setCreators(transformedCreators);
      } else {
        console.error('Failed to fetch creators');
        // fallback to empty or show error
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to load creators. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (creator: Creator) => {
    toast({
      title: 'Contact Request Sent',
      description: `Your contact request has been sent to ${creator.name}.`,
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedNiche('All');
    setFollowersRange([0]);
    setEngagementRange([0]);
    setBudgetRange([0]);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-display font-bold text-foreground mb-4">
            Find Your Perfect Creator
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced search across our exclusive network
          </p>
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden md:block bg-background/50 backdrop-blur-md border border-border/50 rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-12 gap-6 items-end">
            {/* Search */}
            <div className="col-span-4 space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Name, bio, or keyword..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Niche */}
            <div className="col-span-3 space-y-2">
              <Label>Niche</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
              >
                {niches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Advanced Sliders Trigger (Desktop Dialog or Popover usually, but laying out inline for 'Advanced' feel) */}
            <div className="col-span-5 flex items-center justify-end gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Advanced Filters
                    {(followersRange[0] > 0 || engagementRange[0] > 0 || budgetRange[0] > 0) && (
                      <span className="flex h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search with specific metrics.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-8">
                    {/* Followers Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label>Min Followers</Label>
                        <span className="text-sm font-medium text-muted-foreground">
                          {followersRange[0] === 0 ? 'Any' : `${followersRange[0].toLocaleString()}+`}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0]}
                        max={1000000}
                        step={10000}
                        value={followersRange}
                        onValueChange={setFollowersRange}
                        className="w-full"
                      />
                    </div>

                    {/* Engagement Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label>Min Engagement Rate</Label>
                        <span className="text-sm font-medium text-muted-foreground">
                          {engagementRange[0] === 0 ? 'Any' : `${engagementRange[0]}%+`}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0]}
                        max={20}
                        step={0.5}
                        value={engagementRange}
                        onValueChange={setEngagementRange}
                        className="w-full"
                      />
                    </div>

                    {/* Budget Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label>Max Budget</Label>
                        <span className="text-sm font-medium text-muted-foreground">
                          {budgetRange[0] === 0 ? 'Any' : `Under ₹${budgetRange[0].toLocaleString()}`}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0]}
                        max={500000}
                        step={5000}
                        value={budgetRange}
                        onValueChange={setBudgetRange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button type="submit" className="w-full">Show Results</Button>
                    </SheetClose>
                    <div className="mt-2">
                      <Button variant="ghost" className="w-full" onClick={resetFilters}>Reset All</Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Badges */}
          {(followersRange[0] > 0 || engagementRange[0] > 0 || budgetRange[0] > 0 || selectedNiche !== 'All') && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {selectedNiche !== 'All' && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                  Niche: {selectedNiche}
                </span>
              )}
              {followersRange[0] > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                  {followersRange[0].toLocaleString()}+ Followers
                </span>
              )}
              {engagementRange[0] > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                  {engagementRange[0]}% Engagement
                </span>
              )}
              {budgetRange[0] > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                  &lt; ₹{budgetRange[0].toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6 flex justify-between gap-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                  >
                    {niches.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <Label>Min Followers: {followersRange[0].toLocaleString()}</Label>
                  <Slider value={followersRange} onValueChange={setFollowersRange} max={1000000} step={10000} />
                </div>
                <div className="space-y-4">
                  <Label>Min Engagement: {engagementRange[0]}%</Label>
                  <Slider value={engagementRange} onValueChange={setEngagementRange} max={20} step={0.5} />
                </div>
                <div className="space-y-4">
                  <Label>Max Budget: {budgetRange[0] === 0 ? 'Any' : budgetRange[0].toLocaleString()}</Label>
                  <Slider value={budgetRange} onValueChange={setBudgetRange} max={500000} step={5000} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>


        {/* Results Grid */}
        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {creators.length} creator{creators.length !== 1 ? 's' : ''}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : creators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onContact={handleContact}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-xl">
              <FilterIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No creators found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results.</p>
              <Button onClick={resetFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;