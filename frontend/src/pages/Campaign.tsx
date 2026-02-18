import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Megaphone, Sparkles, TrendingUp, Zap, Star } from 'lucide-react';
import CampaignCard, { Campaign } from '@/components/CampaignCard';
import SmartAvatar from '@/components/SmartAvatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/utils/apiHelper';

const CampaignPage = () => {
  const { toast } = useToast();
  // ... rest of component

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    product_type: 'UGC',
    description: '',
    budget: '',
    requirements: '',
    isUrgent: false,
    isFeatured: false
  });

  const [showForm, setShowForm] = useState(false);
  const [showAIPricing, setShowAIPricing] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      // Use apiCall instead of fetch
      const response = await apiCall('/api/campaigns');

      if (response.ok) {
        const data = await response.json();
        // Map backend data to frontend Campaign interface
        const mappedCampaigns: Campaign[] = data.campaigns.map((c: any) => ({
          id: c.id,
          companyName: c.brand_name || 'Unknown Brand',
          title: c.title,
          description: c.description,
          budget: c.budget_range,
          requirements: c.niche,
          deadline: new Date(c.created_at).toLocaleDateString(),
          applicants: 0, // Backend doesn't return this yet
          status: c.status,
          brand_user_id: c.brand_user_id,
          isUrgent: c.is_urgent,
          isFeatured: c.is_featured
        }));
        setCampaigns(mappedCampaigns);
      } else {
        console.error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.companyName || !formData.title || !formData.description || !formData.budget) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiCall('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          product_type: formData.product_type,
          description: formData.description,
          budget_range: formData.budget, // Send as string/varchar
          requirements: formData.requirements,
          is_urgent: formData.isUrgent,
          is_featured: formData.isFeatured
        })
      });

      if (response.ok) {
        toast({
          title: 'Campaign Created!',
          description: 'Your campaign has been posted successfully. Creators will start seeing it now.',
        });

        setFormData({
          companyName: '',
          title: '',
          product_type: 'UGC',
          description: '',
          budget: '',
          requirements: '',
          isUrgent: false,
          isFeatured: false
        });
        setShowForm(false);
        fetchCampaigns(); // Refresh list
      } else {
        const errorData = await response.json();
        const msg = errorData.details || errorData.message || errorData.error?.issues?.[0]?.message || errorData.error || "Submission Failed";
        console.error("Campaign Error:", errorData);
        toast({
          title: 'Failed to create campaign',
          description: msg,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Unable to create campaign. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (campaign: Campaign) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to apply for campaigns.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await apiCall(`/api/campaigns/${campaign.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposal_text: `I am interested in collaborating on "${campaign.title}". Please consider my application.`
        })
      });

      if (response.ok) {
        toast({
          title: 'Application Submitted',
          description: `Your application for "${campaign.title}" has been sent to ${campaign.companyName}!`,
        });
      } else {
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Please log in again.',
            variant: 'destructive'
          });
        } else {
          const errorData = await response.json();
          toast({
            title: 'Application Failed',
            description: errorData.error || 'Please try again.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Unable to submit application. Please check your connection.',
        variant: 'destructive'
      });
    }
  };

  const handleCloseCampaign = async (campaign: Campaign) => {
    try {
      const response = await apiCall(`/api/campaigns/${campaign.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'closed'
        })
      });

      if (response.ok) {
        toast({
          title: 'Campaign Closed',
          description: 'The campaign has been successfully closed.',
        });
        fetchCampaigns(); // Refresh list
      } else {
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Please log in again to manage your campaign.',
            variant: 'destructive'
          });
        } else {
          const errorData = await response.json();
          toast({
            title: 'Failed to close campaign',
            description: errorData.error || 'Please try again.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Unable to close campaign. Please check your connection.',
        variant: 'destructive'
      });
    }
  };

  const handleAIPricing = async (creator: any) => {
    setSelectedCreator(creator);
    setIsLoadingPricing(true);

    try {
      const response = await apiCall('/api/ai/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creatorId: creator.id,
          campaignType: 'social_media_promotion',
          targetAudience: 'young_professionals',
          expectedReach: 50000
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiPricing(data);
        setShowAIPricing(true);
      } else {
        throw new Error('Pricing calculation failed');
      }
    } catch (error) {
      toast({
        title: 'Pricing Calculation Failed',
        description: 'Unable to get AI pricing recommendation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPricing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold text-foreground mb-4">
            Active Campaigns
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover exciting brand partnerships and launch your own campaigns
          </p>
        </div>

        {/* Add Campaign Button */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showForm ? 'Cancel' : 'Create New Campaign'}
          </Button>
        </div>

        {/* Campaign Creation Form */}
        {showForm && (
          <Card className="mb-8 bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Megaphone className="w-6 h-6 text-primary" />
                Create New Campaign
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company name"
                      required
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium">
                      Budget Range *
                    </Label>
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g., $500 - $2,000"
                      required
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Campaign Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Give your campaign an engaging title"
                    required
                    className="bg-background border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_type" className="text-sm font-medium">
                    Campaign Type *
                  </Label>
                  <select
                    id="product_type"
                    name="product_type"
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="UGC">UGC</option>
                    <option value="Reels">Reels</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Campaign Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your campaign goals, what you're looking for, and what creators can expect..."
                    required
                    rows={4}
                    className="bg-background border-border focus:border-primary resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-sm font-medium">
                    Creator Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Specify follower count, niche, platform preferences, etc..."
                    rows={3}
                    className="bg-background border-border focus:border-primary resize-none"
                  />
                </div>

                {/* Advanced Flags */}
                <div className="flex gap-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isUrgent"
                      checked={formData.isUrgent}
                      onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'isUrgent')}
                    />
                    <Label htmlFor="isUrgent" className="flex items-center gap-1 cursor-pointer">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Urgent Hiring
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(c) => handleCheckboxChange(c as boolean, 'isFeatured')}
                    />
                    <Label htmlFor="isFeatured" className="flex items-center gap-1 cursor-pointer">
                      <Star className="h-4 w-4 text-primary" />
                      Featured Campaign
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Campaign"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* AI Pricing Modal */}
        {showAIPricing && aiPricing && (
          <Card className="mb-8 bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">AI Pricing Recommendation</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIPricing(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <SmartAvatar
                      name={selectedCreator?.username}
                      type="creator"
                      className="w-8 h-8"
                    />
                    Creator: {selectedCreator?.username}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price:</span>
                      <span className="font-semibold">₹{aiPricing.basePrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Recommended Price:</span>
                      <span className="font-semibold text-primary">₹{aiPricing.recommendedPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Position:</span>
                      <span className="font-semibold">{aiPricing.marketPosition || 'medium'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Confidence:</span>
                      <span className="font-semibold">{((aiPricing.confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Followers:</span>
                      <span className="font-semibold">{aiPricing.factors?.followers?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement Rate:</span>
                      <span className="font-semibold">{aiPricing.factors?.engagement?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-4">AI Pricing Analysis</h4>
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiPricing.aiAnalysis || 'AI analysis not available'}
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>Campaign Type: {aiPricing.factors?.campaignType}</p>
                    <p>Target Audience: {aiPricing.factors?.targetAudience}</p>
                    <p>Expected Reach: {aiPricing.factors?.expectedReach?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`Recommended price for ${selectedCreator?.username}: ₹${aiPricing.recommendedPrice?.toLocaleString()}`);
                    toast({
                      title: 'Copied to Clipboard',
                      description: 'Pricing recommendation copied successfully.',
                    });
                  }}
                  variant="outline"
                >
                  Copy Recommendation
                </Button>
                <Button
                  onClick={() => setShowAIPricing(false)}
                  className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="relative">
                <CampaignCard
                  campaign={campaign}
                  onApply={handleApply}
                  isOwner={currentUserId === campaign.brand_user_id}
                  onClose={handleCloseCampaign}
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                  {/* Access internal campaign properties which are usually passed to Card, but here we overlay for now since we didn't update Card component internal logic fully yet, or we can update CampaignCard.tsx as well. */}
                  {/* Actually, CampaignCard might not have props for these yet. Let's assume standard layout. */}
                  {/* Better approach: Update CampaignCard.tsx to accept these props. But for now, putting them inside CampaignCard is better. */}
                </div>
                {/* AI Pricing Button Overlay */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md z-20"
                  onClick={() => handleAIPricing({ id: campaign.id, username: campaign.companyName })}
                  disabled={isLoadingPricing}
                >
                  {isLoadingPricing ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && campaigns.length === 0 && (
          <Card className="text-center py-12 bg-gradient-card border-0">
            <CardContent>
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Campaigns Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a campaign and connect with amazing creators!
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignPage;