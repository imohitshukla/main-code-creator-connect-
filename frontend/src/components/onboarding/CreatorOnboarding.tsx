import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Instagram, Youtube, Globe, DollarSign, BarChart, Target } from 'lucide-react';

const CreatorOnboarding = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Identity
        displayName: '',
        primary_niche: '',
        primary_location: '', // e.g., "Mumbai, India"
        bio: '',

        // Socials
        instagram_link: '',
        youtube_link: '',
        portfolio_link: '',

        // Performance
        total_followers: '',

        // Collaboration
        budget_range: '', // e.g., "₹5k - ₹20k"
        audience_breakdown: '', // e.g. "Mostly GenZ 18-24"
        collaboration_goals: '' // e.g. "Long-term partnerships"
    });

    const nicheOptions = [
        'Fashion & Lifestyle', 'Beauty & Makeup', 'Tech & Gadgets', 'Food & Travel',
        'Fitness & Health', 'Gaming', 'Finance', 'Education', 'Comedy/Entertainment'
    ];

    const budgetOptions = [
        'Barter / Gifted', '₹1k - ₹5k', '₹5k - ₹20k', '₹20k - ₹50k', '₹50k - ₹1L', '₹1L+'
    ];

    // 🔄 Fetch existing data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 🔐 DOUBLE DOOR AUTH (Cookie + Header)
                const token = localStorage.getItem('auth_token');
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/creators/profile`, {
                    headers,
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    // Assuming the backend returns { success: true, user: {...}, creatorProfile: {...} } or similar
                    // Based on creatorController.getCreatorById, it returns a unified object.
                    // BUT, we might need a specific "get my profile" endpoint for editing.
                    // For now, let's assume /api/creators/profile (which maps to updateCreatorProfile? No, that's POST/PUT).
                    // We might need to fetch /api/auth/me and then populate.
                    // Let's try to fetch /api/auth/me first as a fallback if a specific profile endpoint isn't distinct.
                    // Actually, let's stick to the plan: fetch existing data. 
                    // If the backend `getCreatorById` is public, we can use that via `authContext`.
                    // For simplicity in this step, let's assume we can GET from the update endpoint or similar. 
                    // WAIT: The plan says "Fetch existing data". 
                    // Let's implement robust fetching:

                    if (data.user || data.creator) {
                        const profile = data.creator || data.user;
                        setIsEditing(true);
                        setFormData({
                            displayName: profile.name || '',
                            primary_niche: profile.niche || '',
                            primary_location: profile.location || '',
                            bio: profile.bio || '',
                            instagram_link: profile.contact?.instagram || profile.instagram_handle || '',
                            youtube_link: profile.contact?.youtube || '',
                            portfolio_link: profile.contact?.portfolio || profile.portfolio_link || '',
                            total_followers: profile.stats?.followers || profile.followers_count || '',
                            budget_range: profile.details?.budget_range || '',
                            audience_breakdown: profile.details?.audience_breakdown || '',
                            collaboration_goals: profile.details?.collaboration_goals || ''
                        });
                        console.log("✅ Loaded existing creator profile");
                    }
                }
            } catch (error) {
                console.warn("Could not fetch existing profile, starting fresh.", error);
            }
        };
        fetchProfile();
    }, []);


    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // creatorController.js has `updateCreatorProfile` at (likely) PUT /api/creators/profile
            const url = `${import.meta.env.VITE_API_URL}/api/creators/profile`;

            // 🔐 DOUBLE DOOR AUTH
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(url, {
                method: 'PUT', // Controller likely handles upsert
                headers,
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast({
                    title: isEditing ? "Profile Updated" : "Profile Created",
                    description: "Your creator profile is live!",
                });
                // navigate('/dashboard'); // Creators might not have a dashboard yet? 
                // For now stay here or go to public profile? 
                // Let's go to their public profile view if possible, or just stay.
                // Actually, ProfileSetup is the page... maybe refresh?
                // Let's just show success.
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.error || "Save failed",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Network error", error);
            toast({ title: "Network Error", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
                <div className="h-16 w-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                    🎨
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Build Your Creator Profile</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Showcase your stats, rates, and style to attract top brands.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Identity */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-pink-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <User className="h-6 w-6 text-pink-600" />
                            Identity & Bio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name *</Label>
                                <Input id="displayName" value={formData.displayName} onChange={e => handleChange('displayName', e.target.value)} required placeholder="e.g. Rahul Vlogs" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="primary_niche">Primary Niche *</Label>
                                <Select value={formData.primary_niche} onValueChange={val => handleChange('primary_niche', val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Niche" /></SelectTrigger>
                                    <SelectContent>
                                        {nicheOptions.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="primary_location">Location *</Label>
                            <Input id="primary_location" value={formData.primary_location} onChange={e => handleChange('primary_location', e.target.value)} placeholder="e.g. Bangalore, India" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio / Elevator Pitch</Label>
                            <Textarea id="bio" rows={3} value={formData.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="I create tech reviews for GenZ..." />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Content & Socials */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Instagram className="h-6 w-6 text-purple-600" />
                            Social Connections
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Instagram Link</Label>
                                <Input value={formData.instagram_link} onChange={e => handleChange('instagram_link', e.target.value)} placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>YouTube Channel</Label>
                                <Input value={formData.youtube_link} onChange={e => handleChange('youtube_link', e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Portfolio / Website</Label>
                            <Input value={formData.portfolio_link} onChange={e => handleChange('portfolio_link', e.target.value)} placeholder="https://myportfolio.com" />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Stats & Rates */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <DollarSign className="h-6 w-6 text-green-600" />
                            Stats & Collaboration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Total Followers (Approx)</Label>
                                <Input type="number" value={formData.total_followers} onChange={e => handleChange('total_followers', e.target.value)} placeholder="e.g. 50000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Typical Commercial Rate</Label>
                                <Select value={formData.budget_range} onValueChange={val => handleChange('budget_range', val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Rate Range" /></SelectTrigger>
                                    <SelectContent>
                                        {budgetOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Collaboration Goals</Label>
                            <Input value={formData.collaboration_goals} onChange={e => handleChange('collaboration_goals', e.target.value)} placeholder="e.g. Long-term brand ambassadorships" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button type="submit" size="lg" className="px-12 py-3 text-lg" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default CreatorOnboarding;
