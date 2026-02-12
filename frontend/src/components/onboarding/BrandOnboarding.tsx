
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandOnboarding() {
  const { user, login } = useAuth(); // We need login to update the local user state after save
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill data from user context if available
  const [formData, setFormData] = useState({
    company_name: (user as any)?.company_name || '', // valuable for brand
    website: (user as any)?.website || (user as any)?.website_url || '',
    industry: (user as any)?.industry || '',
    company_size: (user as any)?.company_size || '',
  });



  // Update form data if user context loads later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        company_name: (user as any).company_name || prev.company_name,
        website: (user as any).website || (user as any).website_url || prev.website,
        industry: (user as any).industry || prev.industry,
        company_size: (user as any).company_size || prev.company_size,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/brands/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save profile');

      // ✅ Update Local User Context
      // The backend returns the updated user object with brand_details
      if (data.user) {
        login(data.user);
      }

      toast.success('Profile setup complete!');
      navigate('/dashboard'); // Go to the Brand Dashboard
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-indigo-600">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="text-indigo-600" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">Setup Brand Profile</CardTitle>
          <CardDescription>Tell creators about your company.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="company_name"
                  name="company_name"
                  placeholder="Acme Corp"
                  className="pl-10"
                  required
                  value={formData.company_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://acme.com"
                  className="pl-10"
                  required
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Industry Dropdown */}
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select onValueChange={(val) => handleSelectChange('industry', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-commerce & D2C</SelectItem>
                  <SelectItem value="tech">SaaS & Tech</SelectItem>
                  <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                  <SelectItem value="health">Health & Wellness</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select onValueChange={(val) => handleSelectChange('company_size', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="How many employees?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 (Startup)</SelectItem>
                  <SelectItem value="11-50">11-50 (Small Business)</SelectItem>
                  <SelectItem value="51-200">51-200 (Mid-Size)</SelectItem>
                  <SelectItem value="200+">200+ (Enterprise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Complete Setup
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
