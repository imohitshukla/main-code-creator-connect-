import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

const BrandOnboarding = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form state - KEEPING IT SIMPLE
  const [formData, setFormData] = useState({
    company_name: '',
    industry_vertical: '',
    website_url: ''
  });

  const industryOptions = [
    'E-commerce', 'SaaS', 'Fashion', 'D2C', 'Healthcare', 'EdTech',
    'Finance', 'Travel', 'Food & Beverage', 'Other'
  ];

  // ⚡️ State for edit mode
  const [isEditing, setIsEditing] = useState(false);

  // 🔄 Fetch existing data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/brands/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setIsEditing(true);
            setFormData({
              company_name: data.profile.company_name || '',
              industry_vertical: data.profile.industry_vertical || '',
              website_url: data.profile.website_url || ''
            });
            console.log("✅ Loaded existing brand profile");
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = `${import.meta.env.VITE_API_URL}/api/brands/profile`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Profile Updated" : "Welcome aboard!",
          description: "Your brand profile has been set up successfully.",
        });
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Network error", error);
      toast({
        title: "Network Error",
        description: "Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          💼
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Let's Get Started</h1>
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          Just a few details to set up your brand workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Simple Card */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Building2 className="h-6 w-6 text-indigo-600" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="e.g., Kraaft Media"
                required
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL *</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleChange('website_url', e.target.value)}
                placeholder="https://yourcompany.com"
                required
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry_vertical">Industry *</Label>
              <Select value={formData.industry_vertical} onValueChange={(value) => handleChange('industry_vertical', value)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full text-lg h-12 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Continue to Dashboard'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BrandOnboarding;
