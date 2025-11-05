import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Megaphone } from 'lucide-react';
import CampaignCard, { Campaign } from '@/components/CampaignCard';
import { useToast } from '@/hooks/use-toast';

const CampaignPage = () => {
  const { toast } = useToast();
  
  // Sample campaign data
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      companyName: 'FitLife Apparel',
      title: 'Summer Fitness Collection Launch',
      description: 'We\'re looking for fitness influencers to showcase our new summer collection of workout gear. Perfect for gym enthusiasts and fitness coaches.',
      budget: '$500 - $2,000',
      requirements: 'Fitness niche, 50K+ followers, good engagement rate',
      deadline: 'Dec 15, 2024',
      applicants: 24
    },
    {
      id: 2,
      companyName: 'TechFlow Solutions',
      title: 'SaaS Product Review Campaign',
      description: 'Seeking tech reviewers to create honest reviews of our productivity software. Multiple content formats accepted.',
      budget: '$300 - $1,200',
      requirements: 'Tech/Business niche, YouTube or LinkedIn presence',
      deadline: 'Dec 20, 2024',
      applicants: 18
    },
    {
      id: 3,
      companyName: 'GreenEats',
      title: 'Sustainable Food Brand Partnership',
      description: 'Looking for food bloggers and nutrition experts to promote our sustainable meal prep service.',
      budget: '$400 - $1,500',
      requirements: 'Food/Health niche, Instagram focused content',
      deadline: 'Dec 25, 2024',
      applicants: 31
    }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    description: '',
    budget: '',
    requirements: ''
  });

  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.title || !formData.description || !formData.budget) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newCampaign: Campaign = {
      id: campaigns.length + 1,
      companyName: formData.companyName,
      title: formData.title,
      description: formData.description,
      budget: formData.budget,
      requirements: formData.requirements || undefined,
      deadline: 'Just posted',
      applicants: 0
    };

    setCampaigns([newCampaign, ...campaigns]);
    setFormData({
      companyName: '',
      title: '',
      description: '',
      budget: '',
      requirements: ''
    });
    setShowForm(false);

    toast({
      title: 'Campaign Created!',
      description: 'Your campaign has been posted successfully. Creators will start seeing it now.',
    });
  };

  const handleApply = (campaign: Campaign) => {
    toast({
      title: 'Application Submitted',
      description: `Your application for "${campaign.title}" has been sent to ${campaign.companyName}!`,
    });
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

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
                  >
                    Post Campaign
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

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onApply={handleApply}
            />
          ))}
        </div>

        {campaigns.length === 0 && (
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