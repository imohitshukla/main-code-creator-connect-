import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Layers, ArrowRight, Camera } from 'lucide-react';
import SmartAvatar from '@/components/SmartAvatar';
import SmartAvatar from '@/components/SmartAvatar';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';

const niches = ['Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology', 'Music', 'Lifestyle'];
const budgetRanges = ['₹10K - ₹25K', '₹25K - ₹75K', '₹75K - ₹150K', '₹150K+', 'Open to discussion'];

const buildInitialProfile = (profile: UserProfile | null, userNameFallback: string): UserProfile => ({
  name: profile?.name || userNameFallback,
  avatar: profile?.avatar || '',
  phoneNumber: profile?.phoneNumber || '',
  email: profile?.email || '',
  followers: profile?.followers || '',
  instagram: profile?.instagram || '',
  youtube: profile?.youtube || '',
  portfolio: profile?.portfolio || '',
  niche: profile?.niche || '',
  bio: profile?.bio || '',
  audience: profile?.audience || '',
  budgetRange: profile?.budgetRange || '',
  location: profile?.location || '',
  campaignGoals: profile?.campaignGoals || '',
});

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fallbackName = useMemo(
    () => profile?.name || user?.name || user?.username || user?.email?.split('@')[0] || 'Creator',
    [profile?.name, user?.name, user?.username, user?.email]
  );

  const [formState, setFormState] = useState<UserProfile>(() => buildInitialProfile(profile, fallbackName));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    setFormState(buildInitialProfile(profile, fallbackName));
  }, [isAuthenticated, profile, navigate, fallbackName]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      // Append all text fields
      Object.entries(formState).forEach(([key, value]) => {
        if (key !== 'avatar') { // We handle avatar separately via file
          formData.append(key === 'name' ? 'displayName' : key === 'phoneNumber' ? 'phone_number' : key === 'location' ? 'primary_location' : key === 'niche' ? 'primary_niche' : key === 'followers' ? 'total_followers' : key === 'instagram' ? 'instagram_link' : key === 'youtube' ? 'youtube_link' : key === 'portfolio' ? 'portfolio_link' : key === 'audience' ? 'audience_breakdown' : key === 'budgetRange' ? 'budget_range' : key === 'campaignGoals' ? 'collaboration_goals' : key, value || '');
        }
      });

      // Append file if exists
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (formState.avatar && formState.avatar.startsWith('http')) {
        // If it's an existing URL, pass it? or just let backend keep existing?
        // Backend handles "string" avatar too.
        formData.append('avatar', formState.avatar);
      }

      const token = localStorage.getItem('token');
      // Direct API call to bypass JSON-only context
      import { getApiUrl } from '@/lib/utils'; // Ensure import exists or add it

      // ... inside component ...
      const response = await fetch(`${getApiUrl()}/api/creators/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // No Content-Type for FormData, browser sets boundary
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();

      // Sync Context
      updateProfile({
        ...formState,
        avatar: data.profile?.avatar || formState.avatar // Update with new URL or keep old
      });

      toast({
        title: 'Profile saved',
        description: 'Your creator profile is now ready.',
      });
      navigate('/filter');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: 'File too large',
        description: 'Please upload an image under 2MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarFile(file); // Store file for upload
      handleChange('avatar', base64String); // Update local preview

      // Auto-upload logic removed for now in favor of explicit save, 
      // or we could implement auto-upload here too using same FormData logic.
      // For simplicity/safety, let's just preview. User hits "Save Profile".

      toast({
        title: 'Profile Picture Selected',
        description: 'Click "Save profile" to apply changes.',
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20">Step 2 · Profile Setup</Badge>
          <h1 className="text-4xl font-bold text-foreground">Tell Brands About You</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete your Creator Connect profile so you show up in Filters and receive accurate AI matches.
            Share your niche, audience, and platform stats to unlock better collaborations.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                    <SmartAvatar
                      src={formState.avatar}
                      type="creator"
                      name={fallbackName}
                      email={formState.email}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Overlay */}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer">
                    <div className="flex flex-col items-center text-white">
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-xs font-medium">Upload Photo</span>
                    </div>
                  </label>

                  {/* Hidden Input */}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Add button for mobile/better UX */}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors md:hidden">
                    <Camera className="w-4 h-4" />
                  </label>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formState.avatar ? 'Click to change your profile picture' : 'Click to upload your profile picture'}
                </p>
              </div>

              <Card className="bg-card/90 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Creator Basics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="setup-name">Display Name</Label>
                      <Input
                        id="setup-name"
                        value={formState.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setup-email">Professional Email</Label>
                      <Input
                        id="setup-email"
                        type="email"
                        value={formState.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setup-phone">Phone / WhatsApp</Label>
                      <Input
                        id="setup-phone"
                        value={formState.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setup-location">Primary Location</Label>
                      <Input
                        id="setup-location"
                        value={formState.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Niche</Label>
                    <div className="flex flex-wrap gap-2">
                      {niches.map((niche) => (
                        <Button
                          key={niche}
                          type="button"
                          variant={formState.niche === niche ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleChange('niche', niche)}
                          className={formState.niche === niche ? 'bg-gradient-hero' : ''}
                        >
                          {niche}
                        </Button>
                      ))}
                      <Input
                        placeholder="Custom niche"
                        value={formState.niche && !niches.includes(formState.niche) ? formState.niche : ''}
                        onChange={(e) => handleChange('niche', e.target.value)}
                        className="w-full mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup-followers">Total Followers</Label>
                    <Input
                      id="setup-followers"
                      value={formState.followers}
                      onChange={(e) => handleChange('followers', e.target.value)}
                      placeholder="e.g. 220K across Instagram + YouTube"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup-bio">Elevator Pitch / Bio</Label>
                    <Textarea
                      id="setup-bio"
                      rows={4}
                      value={formState.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      placeholder="Describe your content style, signature formats, and collaborations you love."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/90 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Platforms & Audience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="setup-instagram">Instagram</Label>
                      <Input
                        id="setup-instagram"
                        type="url"
                        placeholder="https://instagram.com/you"
                        value={formState.instagram}
                        onChange={(e) => handleChange('instagram', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setup-youtube">YouTube</Label>
                      <Input
                        id="setup-youtube"
                        type="url"
                        placeholder="https://youtube.com/@you"
                        value={formState.youtube}
                        onChange={(e) => handleChange('youtube', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="setup-portfolio">Portfolio / Media Kit</Label>
                      <Input
                        id="setup-portfolio"
                        type="url"
                        placeholder="https://yourwebsite.com/portfolio"
                        value={formState.portfolio}
                        onChange={(e) => handleChange('portfolio', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setup-audience">Audience Breakdown</Label>
                    <Textarea
                      id="setup-audience"
                      rows={4}
                      value={formState.audience}
                      onChange={(e) => handleChange('audience', e.target.value)}
                      placeholder="Share top cities, age groups, interests, or audience insights brands should know."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/90 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Collaboration Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Budget Range</Label>
                    <div className="flex flex-wrap gap-2">
                      {budgetRanges.map((range) => (
                        <Button
                          key={range}
                          type="button"
                          variant={formState.budgetRange === range ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleChange('budgetRange', range)}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setup-goals">Collaboration Goals</Label>
                    <Textarea
                      id="setup-goals"
                      rows={4}
                      value={formState.campaignGoals}
                      onChange={(e) => handleChange('campaignGoals', e.target.value)}
                      placeholder="Share campaign types, deliverables, or industries you are excited to work with."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  Skip for now
                </Button>
                <Button type="submit" size="lg" className="gap-2 bg-gradient-hero hover:shadow-glow">
                  Save profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-gradient-card border-0 shadow-hover">
                <CardHeader>
                  <CardTitle>Why complete this?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary text-primary-foreground">1</Badge>
                    <p>Creators with complete profiles appear higher in Filters and search results.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary text-primary-foreground">2</Badge>
                    <p>AI Match uses your niche, audience, and pricing to recommend the best campaigns.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary text-primary-foreground">3</Badge>
                    <p>Brands can fast-track approvals when they see platform links and audience stats upfront.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ProfileSetup;

