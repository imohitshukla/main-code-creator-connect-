import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Users, Target, History, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';

const AIMatch = () => {
  const { user } = useAuth();
const [campaignDescription, setCampaignDescription] = useState(''); // Campaign description input
const [brief, setBrief] = useState(''); // New state for brief input
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [previousMatchesList, setPreviousMatchesList] = useState<any[]>([]);
  const [isLoadingPreviousMatches, setIsLoadingPreviousMatches] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPreviousMatches, setShowPreviousMatches] = useState(false);
  const { toast } = useToast();

  const niches = ['All', 'Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology'];

  // Note: Search hash is generated on the backend

  // Load list of previous matches
  useEffect(() => {
    if (user) {
      loadPreviousMatchesList();
    }
  }, [user]);

  const loadPreviousMatchesList = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${getApiUrl()}/api/ai/smart-match/list?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPreviousMatchesList(data.matches || []);
      }
    } catch (error) {
      console.error('Load Previous Matches List Error:', error);
    }
  };

  const handleLoadPreviousMatch = async (match: any) => {
    if (!user) {
      toast({
        title: 'User Not Authenticated',
        description: 'Please login to continue previous matches.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingPreviousMatches(true);
    try {
      const params = new URLSearchParams({
        userId: user.id.toString(),
      });
      
      if (match.campaignId) {
        params.append('campaignId', match.campaignId.toString());
      } else if (match.searchHash) {
        params.append('searchHash', match.searchHash);
      }

      const response = await fetch(`${getApiUrl()}/api/ai/smart-match/continue?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiMatches(data.aiMatches || []);
        
        // Restore search context if available
        if (data.searchContext) {
          const context = typeof data.searchContext === 'string' ? JSON.parse(data.searchContext) : data.searchContext;
          setCampaignDescription(context.campaignDescription || '');
          setTargetAudience(context.targetAudience || '');
          setBudget(context.budget || '');
          setSelectedNiche(context.niche || '');
        }
        
        setShowResults(true);
        setShowPreviousMatches(false);
        toast({
          title: 'Previous Matches Loaded',
          description: `Loaded ${data.aiMatches?.length || 0} previous matches.`,
        });
      } else {
        throw new Error('Failed to load previous matches');
      }
    } catch (error) {
      console.error('Load Previous Match Error:', error);
      toast({
        title: 'Load Failed',
        description: 'Unable to load previous matches. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPreviousMatches(false);
    }
  };

  const handleAIMatch = async () => {
    if (!campaignDescription.trim()) {
      toast({
        title: 'Campaign Description Required',
        description: 'Please describe your campaign to use AI matching.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/ai/smart-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignDescription,
          targetAudience,
          budget,
          niche: selectedNiche,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiMatches(data.matches || []);
        setShowResults(true);
        toast({
          title: 'AI Matching Complete!',
          description: `Found ${data.matches?.length || 0} perfect creator matches for your campaign.`,
        });

        // Save AI match results to backend
        if (user) {
          try {
            const saveResponse = await fetch(`${getApiUrl()}/api/ai/smart-match/save`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                userId: user.id,
                aiMatches: data.matches || [],
                campaignDescription,
                targetAudience,
                budget,
                niche: selectedNiche,
              }),
            });
            if (saveResponse.ok) {
              // Reload previous matches list
              loadPreviousMatchesList();
            } else {
              console.warn('Failed to save AI match results');
            }
          } catch (saveError) {
            console.warn('Error saving AI match results:', saveError);
          }
        }
      } else {
        throw new Error('AI matching failed');
      }
    } catch (error) {
      console.error('AI Match Error:', error);
      toast({
        title: 'AI Matching Failed',
        description: 'Unable to perform AI matching. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleContact = (creator: any) => {
    toast({
      title: 'Contact Request Sent',
      description: `Your contact request has been sent to ${creator.username || creator.name}. They will get back to you soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-hero font-bold text-foreground mb-4">
            AI-Powered Creator Matching
          </h1>
          <p className="text-xl text-muted-foreground">
            Let our AI find the perfect creators for your campaigns
          </p>
        </div>

        {!showResults && !showPreviousMatches ? (
          <>
            {previousMatchesList.length > 0 && (
              <Card className="bg-gradient-card border-0 shadow-soft mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Continue Previous Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have {previousMatchesList.length} previous AI matching session{previousMatchesList.length > 1 ? 's' : ''}. Continue from where you left off.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreviousMatches(true)}
                    className="w-full"
                  >
                    <History className="w-4 h-4 mr-2" />
                    View Previous Matches
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="bg-gradient-card border-0 shadow-hover mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  How AI Matching Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Define Your Criteria</h3>
                    <p className="text-sm text-muted-foreground">
                      Specify your campaign goals, target audience, and preferred creator types
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">AI Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI analyzes creator profiles, performance data, and engagement metrics
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Perfect Matches</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a curated list of creators that best match your campaign needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Describe Your Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Campaign Description</label>
                    <Input
                      placeholder="e.g., We are a new fitness app targeting young professionals..."
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Target Audience</label>
                    <Input
                      placeholder="e.g., 25-35 year olds in Mumbai and Delhi"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Budget</label>
                    <Input
                      placeholder="e.g., ₹50,000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Preferred Niche</label>
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
                <div className="text-center pt-6">
                  <Button
                    size="lg"
                    onClick={handleAIMatch}
                    disabled={isLoadingAI}
                    className="bg-gradient-hero hover:shadow-glow"
                  >
                    {isLoadingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Finding Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Find AI Matches
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">AI Recommended Matches</h2>
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {aiMatches.length} Perfect Matches
                </span>
              </div>
              <div className="flex gap-2">
                {previousMatchesList.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResults(false);
                      setShowPreviousMatches(true);
                    }}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Previous Matches
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setShowPreviousMatches(false);
                  }}
                >
                  New Search
                </Button>
              </div>
            </div>

            {aiMatches.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiMatches.map((match) => (
                  <Card key={match.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
                          {match.username?.charAt(0).toUpperCase() || match.name?.charAt(0).toUpperCase() || match.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{match.username || match.name || `Creator ${match.id}`}</h3>
                          <p className="text-sm text-muted-foreground">{match.niche}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">AI Match Score:</span>
                          <span className="font-semibold text-primary">{(match.matchScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Followers:</span>
                          <span className="font-semibold">{match.followers?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Engagement:</span>
                          <span className="font-semibold">{match.engagement_rate?.toFixed(1) || 'N/A'}%</span>
                        </div>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3 mb-4">
                        <p className="text-sm text-foreground font-medium mb-1">AI Analysis:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {match.explanation}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleContact(match)}
                        className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                      >
                        Contact Creator
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12 bg-gradient-card border-0">
                <CardContent>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Matches Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your campaign description or criteria to find more creators.
                  </p>
                  <Button
                    onClick={() => setShowResults(false)}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMatch;
