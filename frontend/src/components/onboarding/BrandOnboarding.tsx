import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import { Building2, Globe, Users, DollarSign, Target } from 'lucide-react';

const BrandOnboarding = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Company Identity
    company_name: '',
    industry_vertical: '',
    website_url: '',
    linkedin_page: '',
    
    // Business Details
    company_size: '',
    hq_location: '',
    gst_tax_id: '',
    
    // Campaign Preferences
    typical_budget_range: '',
    looking_for: [] as string[],
    
    // Additional Info
    description: ''
  });

  const industryOptions = [
    'E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech', 
    'Finance', 'Travel', 'Food & Beverage', 'Other'
  ];

  const companySizeOptions = [
    'Startup (1-10)', 'SME (11-50)', 'Medium (51-200)', 'Enterprise (500+)'
  ];

  const budgetRangeOptions = [
    '₹10k - ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L - ₹5L', '₹5L+'
  ];

  const lookingForOptions = [
    'UGC', 'Instagram Reels', 'YouTube Integration', 'Affiliates', 
    'Blog Posts', 'TikTok Videos', 'Product Reviews'
  ];

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 🛡️ DEBUG: Log array changes
    if (field === 'looking_for') {
      console.log('🔍 DEBUG: looking_for updated to:', value);
    }
  };

  // 🛡️ SPECIAL HANDLER for checkbox arrays
  const handleCheckboxChange = (option: string, checked: boolean | string) => {
    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';
    
    setFormData(prev => {
      const currentLookingFor = Array.isArray(prev.looking_for) ? prev.looking_for : [];
      let newLookingFor: string[];
      
      if (isChecked) {
        newLookingFor = [...currentLookingFor, option];
      } else {
        newLookingFor = currentLookingFor.filter(item => item !== option);
      }
      
      console.log('🔍 DEBUG: Checkbox change:', { option, checked, isChecked, newLookingFor });
      
      return {
        ...prev,
        looking_for: newLookingFor
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 🛡️ Layer 3: Frontend safety check right before sending
    const payload = {
      ...formData,
      looking_for: Array.isArray(formData.looking_for) ? formData.looking_for : [] // Never send undefined
    };

    console.log('🔍 DEBUG: Original form data:', formData);
    console.log('🔍 DEBUG: Safe payload being submitted:', payload);

    try {
      const response = await fetch(`${getApiUrl()}/api/brands/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // 🚨 MANDATORY: Send auth cookie
        body: JSON.stringify(payload)
      });

      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ DEBUG: Success response:', result);
        toast({
          title: 'Brand Profile Created',
          description: 'Your business profile has been set up successfully!',
        });
      } else {
        const errorData = await response.json();
        console.log('❌ DEBUG: Error response:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to create profile');
      }
    } catch (error) {
      console.error('❌ Brand onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create your brand profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          💼
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Tell Creators More About You</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete your business profile to find the perfect creator partnerships for your brand
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Identity Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Building2 className="h-6 w-6 text-indigo-600" />
              Company Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="e.g., Kraaft Media"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry_vertical">Industry/Vertical *</Label>
                <Select value={formData.industry_vertical} onValueChange={(value) => handleChange('industry_vertical', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL *</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  placeholder="https://yourcompany.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin_page">LinkedIn/Company Page</Label>
                <Input
                  id="linkedin_page"
                  type="url"
                  value={formData.linkedin_page}
                  onChange={(e) => handleChange('linkedin_page', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Users className="h-6 w-6 text-green-600" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size *</Label>
                <Select value={formData.company_size} onValueChange={(value) => handleChange('company_size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizeOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hq_location">Location/HQ *</Label>
                <Input
                  id="hq_location"
                  value={formData.hq_location}
                  onChange={(e) => handleChange('hq_location', e.target.value)}
                  placeholder="Where is your billing address?"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_tax_id">GST/Tax ID (Optional but Pro)</Label>
              <Input
                id="gst_tax_id"
                value={formData.gst_tax_id}
                onChange={(e) => handleChange('gst_tax_id', e.target.value)}
                placeholder="Makes you look verified and serious to creators"
              />
              <p className="text-sm text-gray-500 mt-1">
                Adding your GST/Tax ID increases trust and verification status
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Preferences Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Target className="h-6 w-6 text-purple-600" />
              Campaign Preferences (Matchmaking Data)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="typical_budget_range">Typical Budget Range *</Label>
              <Select value={formData.typical_budget_range} onValueChange={(value) => handleChange('typical_budget_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your typical budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRangeOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                This helps us show you affordable creators
              </p>
            </div>

            <div className="space-y-3">
              <Label>Looking For (Multi-select)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lookingForOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.looking_for.includes(option)}
                      onCheckedChange={(checked) => handleCheckboxChange(option, checked)}
                    />
                    <Label htmlFor={option} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Globe className="h-6 w-6 text-orange-600" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell creators about your brand, values, and what kind of partnerships you're looking for..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg"
            className="px-12 py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Profile...' : 'Complete Brand Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BrandOnboarding;
