import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Search, Filter as FilterIcon, RotateCcw, SlidersHorizontal, Users } from 'lucide-react';
import CreatorCard, { Creator } from '@/components/CreatorCard';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/utils/apiHelper';
import { Sparkles, BrainCircuit } from 'lucide-react';
import CreatorCompare from '@/components/CreatorCompare';


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

const DEBOUNCE_MS = 280;

function transformCreator(creator: any): Creator {
  return {
    id: creator.id,
    name: creator.name || creator.email?.split('@')[0] || `Creator ${creator.id}`,
    niche: creator.niche || 'General',
    bio: creator.bio || 'No bio available',
    avatar: creator.avatar,
    image: creator.image,
    email: creator.email,
    location: creator.location,
    followers: creator.followers || creator.follower_count || '0',
    audience: creator.audience || { engagement: creator.engagement_rate ? `${creator.engagement_rate}%` : 'N/A' },
    budget: creator.budget,
    social_links: creator.social_links,
    portfolio_links: creator.portfolio_links,
    details: creator.details,
    contact: creator.contact,
    matchScore: creator.matchScore,
    explanation: creator.explanation
  };
}

function parseFollowers(raw: any) {
  if (!raw) return 0;
  const s = String(raw).replace(/,/g, '').trim().toLowerCase();
  if (s.endsWith('k')) return parseFloat(s) * 1000;
  if (s.endsWith('m')) return parseFloat(s) * 1000000;
  return parseFloat(s) || 0;
}

const Filter = () => {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [latestCampaign, setLatestCampaign] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'followers' | 'engagement' | 'matchScore'>('followers');
  const [selectedForCompare, setSelectedForCompare] = useState<(string | number)[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const niches = ['All', 'AI Recommended', 'Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology', 'Travel', 'Lifestyle'];

  const urlNiche = useMemo(() => {
    if (!category) return 'All';
    if (category === 'ai-recommended') return 'AI Recommended';
    const found = niches.find(n => n.toLowerCase() === category.toLowerCase());
    return found || 'All';
  }, [category]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState(urlNiche);
  const [followersRange, setFollowersRange] = useState([0]);
  const [engagementRange, setEngagementRange] = useState([0]);
  const [budgetRange, setBudgetRange] = useState([0]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'BRAND') {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const response = await apiCall('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        if (data.campaigns && data.campaigns.length > 0) {
          // Find the latest active campaign to use as brief context
          const active = data.campaigns.find((c: any) => c.status === 'ACTIVE' || c.status === 'DRAFT' || c.status === 'OFFER');
          setLatestCampaign(active || data.campaigns[0]);
        }
      }
    } catch (e) {
      console.warn('Error fetching campaigns for smart matching:', e);
    }
  };

  useEffect(() => {
    setSelectedNiche(urlNiche);
    if (urlNiche === 'AI Recommended') {
      setSortBy('matchScore');
    }
  }, [urlNiche]);

  const handleNicheChange = (newNiche: string) => {
    setSelectedNiche(newNiche);
    if (newNiche === 'AI Recommended') {
      navigate('/filter/ai-recommended');
      setSortBy('matchScore');
    } else if (newNiche === 'All') {
      navigate('/filter');
      if (sortBy === 'matchScore') setSortBy('followers');
    } else {
      navigate(`/filter/${newNiche.toLowerCase()}`);
      if (sortBy === 'matchScore') setSortBy('followers');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const queryKey = useMemo(
    () => ['creators', debouncedSearch, selectedNiche, followersRange[0], engagementRange[0], budgetRange[0]],
    [debouncedSearch, selectedNiche, followersRange, engagementRange, budgetRange]
  );

  const { data: creators = [], isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (selectedNiche === 'AI Recommended') {
        const response = await apiCall('/api/ai/smart-match', {
          method: 'POST',
          body: JSON.stringify({
            campaignDescription: latestCampaign?.description || 'Looking for high engagement creators for product promotion.',
            targetAudience: latestCampaign?.requirements || 'General D2C audience',
            budget: latestCampaign?.budget_range || '₹25,000',
            niche: latestCampaign?.niche || '',
            brief: latestCampaign?.title || 'Matching search'
          })
        });
        if (!response.ok) throw new Error('Failed to fetch AI matches');
        const data = await response.json();
        return (data.matches || []).map(transformCreator);
      }

      const params = new URLSearchParams();
      if (selectedNiche !== 'All') params.append('niche', selectedNiche);
      if (followersRange[0] > 0) params.append('minFollowers', followersRange[0].toString());
      if (engagementRange[0] > 0) params.append('minEngagement', engagementRange[0].toString());
      if (budgetRange[0] > 0) params.append('maxBudget', budgetRange[0].toString());
      if (debouncedSearch) params.append('search', debouncedSearch);
      const res = await fetch(`${getApiUrl()}/api/creators?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch creators');
      const data = await res.json();
      return (data.creators || []).map(transformCreator);
    },
    staleTime: 90 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const sortedCreators = useMemo(() => {
    return [...creators].sort((a, b) => {
      if (sortBy === 'matchScore') {
        const scoreA = a.matchScore || 0;
        const scoreB = b.matchScore || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'engagement') {
        const erA = parseFloat(String(a.audience?.engagement || '').replace(/%/g, '')) || 0;
        const erB = parseFloat(String(b.audience?.engagement || '').replace(/%/g, '')) || 0;
        return erB - erA;
      }
      const fA = parseFollowers(a.followers);
      const fB = parseFollowers(b.followers);
      return fB - fA;
    });
  }, [creators, sortBy]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection Error',
        description: 'Failed to load creators. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleContact = (creator: Creator) => {
    toast({
      title: 'Contact Request Sent',
      description: `Your contact request has been sent to ${creator.name}.`,
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    handleNicheChange('All');
    setFollowersRange([0]);
    setEngagementRange([0]);
    setBudgetRange([0]);
  };

  return (
    <main className="min-h-screen bg-gradient-subtle pt-24 pb-16 px-4">
      <SEO 
        title={urlNiche !== 'All' ? `Top ${urlNiche} Creators | Creator Connect` : "Creator Filter | Find The Perfect Influencer"} 
        description={`Find the best ${urlNiche !== 'All' ? urlNiche : 'diverse'} creators and influencers for your brand's next campaign.`} 
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-display font-bold text-foreground mb-4">
            Find Your Perfect Creator
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced search across our exclusive network
          </p>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {niches.map(n => (
            <Button
              key={n}
              variant={selectedNiche === n ? "default" : "outline"}
              className={`rounded-full shrink-0 snap-start transition-all ${
                selectedNiche === n 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-background hover:bg-muted font-normal text-muted-foreground'
              }`}
              onClick={() => handleNicheChange(n)}
            >
              {n}
            </Button>
          ))}
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden md:block bg-background/50 backdrop-blur-md border border-border/50 rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-12 gap-6 items-end">
            {/* Search */}
            <div className="col-span-7 lg:col-span-8 space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Name, bio, or keyword..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="Search"
                />
              </div>
            </div>

            {/* Advanced Sliders Trigger */}
            <div className="col-span-5 lg:col-span-4 flex items-center justify-end gap-2">
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

              <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters" aria-label="Reset Filters">
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
            aria-label="Search Input"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open Filters">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6 overflow-y-auto">
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
        <div className="min-h-[500px]">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
            <div className="text-sm text-muted-foreground">
              Found {sortedCreators.length} creator{sortedCreators.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort By</label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 border rounded-lg bg-background text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="followers">Reach (Followers)</option>
                <option value="engagement">Engagement Rate</option>
                {selectedNiche === 'AI Recommended' && (
                  <option value="matchScore">Best Match (AI Score)</option>
                )}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[430px] w-full bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : sortedCreators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {sortedCreators.map((creator) => (
                <div key={creator.id} className="relative group flex flex-col gap-2">
                  <div className="relative flex-1">
                    {user?.role === 'BRAND' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForCompare(prev => 
                            prev.includes(creator.id) 
                              ? prev.filter(id => id !== creator.id) 
                              : prev.length < 3 ? [...prev, creator.id] : prev
                          );
                        }}
                        className={`absolute top-3 left-3 z-30 px-3 py-1.5 rounded-lg border font-bold text-xxs shadow-md transition-all duration-300 ${
                          selectedForCompare.includes(creator.id)
                            ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                            : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {selectedForCompare.includes(creator.id) ? '✓ Selected' : '+ Compare'}
                      </button>
                    )}
                    {creator.matchScore && (
                      <div className="absolute top-3 right-3 z-30 bg-indigo-600/90 text-white font-black text-xxs px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{Math.round(creator.matchScore * 100)}% Match</span>
                      </div>
                    )}
                    <CreatorCard
                      creator={creator}
                      onContact={handleContact}
                    />
                  </div>
                  {/* AI Match explanation tooltip */}
                  {selectedNiche === 'AI Recommended' && creator.explanation && (
                    <div className="p-3.5 bg-indigo-50/40 border border-indigo-100/50 rounded-xl text-xxs text-indigo-950 font-normal leading-relaxed relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-600/5 rounded-bl-full pointer-events-none"></div>
                      <p className="flex items-center gap-1 font-extrabold text-indigo-900 uppercase tracking-wider mb-1">
                        <BrainCircuit className="h-3.5 w-3.5 text-indigo-600" /> AI Insights
                      </p>
                      {creator.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No creators found</h2>
              <p className="text-muted-foreground mb-2 max-w-sm mx-auto">
                No creators match your current filters. Try:
              </p>
              <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                <li>• Removing the niche filter</li>
                <li>• Lowering the minimum followers</li>
                <li>• Clearing the search term</li>
              </ul>
              <Button onClick={resetFilters} className="rounded-xl px-6">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Floating Compare Panel */}
        {selectedForCompare.length >= 2 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl p-4 rounded-2xl flex items-center gap-6 animate-in slide-in-from-bottom duration-300">
            <div className="text-xs text-slate-800 font-bold">
              Compare {selectedForCompare.length} selected creators
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowComparisonModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xxs px-4 py-2"
              >
                Compare Now 🚀
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedForCompare([])}
                className="rounded-xl border-slate-200 text-xxs px-3 py-2 text-slate-600 hover:bg-slate-50"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparisonModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-4xl my-8">
              <CreatorCompare 
                creatorIds={selectedForCompare} 
                brandContext={latestCampaign ? {
                  campaignDescription: latestCampaign.description,
                  targetAudience: latestCampaign.requirements,
                  budget: latestCampaign.budget_range
                } : undefined}
                onClose={() => setShowComparisonModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Filter;