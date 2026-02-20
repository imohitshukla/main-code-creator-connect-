import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Users, Instagram, Youtube, Globe, DollarSign, BarChart, Target } from 'lucide-react';

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
        primary_location: '',
        bio: '',
        avatar: '', // New field for profile picture
        professional_email: '', // New field
        phone_number: '',       // New field

        // Socials (Hidden for now based on design focus, but keeping in state)
        instagram_link: '',
        youtube_link: '',
        portfolio_link: '',

        // Performance
        total_followers: '',

        // Collaboration
        budget_range: '',
        audience_breakdown: '',
        collaboration_goals: ''
    });

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const nicheOptions = [
        'Fitness', 'Nutrition', 'Photography', 'Gaming', 'Fashion', 'Technology', 'Music', 'Lifestyle', 'Travel', 'Food'
    ];

    // ... (keep useEffect for fetching existing data, but update to populate new fields)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/creators/profile`, {
                    headers,
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.user || data.creator) {
                        const profile = data.creator || data.user;
                        setIsEditing(true);
                        setFormData(prev => ({
                            ...prev,
                            displayName: profile.name || '',
                            professional_email: profile.email || '', // Pre-fill with auth email
                            phone_number: profile.phone_number || '',
                            primary_niche: profile.niche || '',
                            primary_location: profile.location || '',
                            bio: profile.bio || '',
                            avatar: profile.avatar || profile.image || '', // Populate avatar
                            // ... other fields
                        }));
                    }
                }
            } catch (error) {
                console.warn("Could not fetch existing profile", error);
            }
        };
        fetchProfile();
    }, []);


    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNicheSelect = (niche: string) => {
        setFormData(prev => ({ ...prev, primary_niche: niche }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show loading state or toast
        const loadingToast = toast({
            title: "Uploading...",
            description: "Please wait while we upload your image.",
        });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const url = `${import.meta.env.VITE_API_URL || ''}/api/upload/image`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, avatar: data.url }));
                toast({
                    title: "Success",
                    description: "Profile picture uploaded!",
                });
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error("Upload error", error);
            toast({
                title: "Error",
                description: "Failed to upload image. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = `${import.meta.env.VITE_API_URL}/api/creators/profile`;
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast({
                    title: isEditing ? "Profile Updated" : "Profile Created",
                    description: "Your creator profile is live!",
                });
                navigate('/dashboard');
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
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
                <div className="inline-block px-4 py-1.5 rounded-full bg-gray-200 text-sm font-medium text-gray-600 mb-4">
                    Step 2 · Profile Setup
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Tell Brands About You</h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Complete your Creator Connect profile so you show up in Filters and receive accurate AI matches.
                    Share your niche, audience, and platform stats to unlock better collaborations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Avatar Upload Placeholder */}
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center relative">
                                {formData.avatar ? (
                                    <img
                                        src={formData.avatar.startsWith('/') ? `${import.meta.env.VITE_API_URL}${formData.avatar}` : formData.avatar}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-16 w-16 text-gray-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">Upload</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Click to upload your profile picture</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card className="border-0 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="border-b border-gray-100 pb-6">
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                    <span className="text-2xl">✨</span> Creator Basics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">

                                {/* Row 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName" className="font-medium text-gray-700">Display Name</Label>
                                        <Input
                                            id="displayName"
                                            value={formData.displayName}
                                            onChange={e => handleChange('displayName', e.target.value)}
                                            required
                                            placeholder="e.g. KraaftMedia"
                                            className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="professional_email" className="font-medium text-gray-700">Professional Email</Label>
                                        <Input
                                            id="professional_email"
                                            type="email"
                                            value={formData.professional_email}
                                            onChange={e => handleChange('professional_email', e.target.value)}
                                            required
                                            placeholder="e.g. contact@kraaftmedia.com"
                                            className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number" className="font-medium text-gray-700">Phone / WhatsApp</Label>
                                        <Input
                                            id="phone_number"
                                            value={formData.phone_number}
                                            onChange={e => handleChange('phone_number', e.target.value)}
                                            placeholder="e.g. +91 9876543210"
                                            className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="primary_location" className="font-medium text-gray-700">Primary Location</Label>
                                        <Input
                                            id="primary_location"
                                            value={formData.primary_location}
                                            onChange={e => handleChange('primary_location', e.target.value)}
                                            placeholder="e.g. Mumbai, Maharashtra"
                                            required
                                            className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Niche Selection */}
                                <div className="space-y-4 pt-2">
                                    <Label className="font-medium text-gray-700 block">Primary Niche</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {nicheOptions.map(niche => (
                                            <button
                                                key={niche}
                                                type="button"
                                                onClick={() => handleNicheSelect(niche)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.primary_niche === niche
                                                    ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {niche}
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="Custom niche"
                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all max-w-md mt-3"
                                        value={!nicheOptions.includes(formData.primary_niche) ? formData.primary_niche : ''}
                                        onChange={e => handleChange('primary_niche', e.target.value)}
                                    />
                                </div>

                                {/* Bio Section */}
                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                    <Label htmlFor="bio" className="font-medium text-gray-700">Creator Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={e => handleChange('bio', e.target.value)}
                                        placeholder="Tell brands a little bit about yourself and your content style..."
                                        className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social & Performance Data */}
                        <Card className="border-0 shadow-sm bg-white overflow-hidden mt-8">
                            <CardHeader className="border-b border-gray-100 pb-6">
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                    <Globe className="w-5 h-5 text-indigo-500" /> Links & Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="total_followers" className="font-medium text-gray-700">Total Followers</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Users className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="total_followers"
                                                type="number"
                                                value={formData.total_followers}
                                                onChange={e => handleChange('total_followers', e.target.value)}
                                                placeholder="e.g. 15000"
                                                className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instagram_link" className="font-medium text-gray-700">Instagram Handle / URL</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Instagram className="h-5 w-5 text-pink-500" />
                                            </div>
                                            <Input
                                                id="instagram_link"
                                                value={formData.instagram_link}
                                                onChange={e => handleChange('instagram_link', e.target.value)}
                                                placeholder="@kraaftmedia or https://..."
                                                className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="youtube_link" className="font-medium text-gray-700">YouTube Channel URL</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Youtube className="h-5 w-5 text-red-500" />
                                            </div>
                                            <Input
                                                id="youtube_link"
                                                value={formData.youtube_link}
                                                onChange={e => handleChange('youtube_link', e.target.value)}
                                                placeholder="https://youtube.com/..."
                                                className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="portfolio_link" className="font-medium text-gray-700">Portfolio / Media Kit URL</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Globe className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <Input
                                                id="portfolio_link"
                                                type="url"
                                                value={formData.portfolio_link}
                                                onChange={e => handleChange('portfolio_link', e.target.value)}
                                                placeholder="Link to your past collaborations"
                                                className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Collaboration Details */}
                        <Card className="border-0 shadow-sm bg-white overflow-hidden mt-8">
                            <CardHeader className="border-b border-gray-100 pb-6">
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                    <Target className="w-5 h-5 text-indigo-500" /> Audience & Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <Label htmlFor="audience_breakdown" className="font-medium text-gray-700">Audience Breakdown</Label>
                                    <Textarea
                                        id="audience_breakdown"
                                        value={formData.audience_breakdown}
                                        onChange={e => handleChange('audience_breakdown', e.target.value)}
                                        placeholder="e.g., 65% Female, Age 18-24, Top Cities: Mumbai, Delhi..."
                                        className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="collaboration_goals" className="font-medium text-gray-700">Collaboration Goals</Label>
                                    <Textarea
                                        id="collaboration_goals"
                                        value={formData.collaboration_goals}
                                        onChange={e => handleChange('collaboration_goals', e.target.value)}
                                        placeholder="What kind of brands are you looking to work with?"
                                        className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget_range" className="font-medium text-gray-700">Expected Pricing / Budget Range</Label>
                                    <div className="relative max-w-md">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <Input
                                            id="budget_range"
                                            value={formData.budget_range}
                                            onChange={e => handleChange('budget_range', e.target.value)}
                                            placeholder="e.g. ₹10K - ₹25K or Flexible"
                                            className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-8 flex justify-end">
                            <Button type="submit" size="lg" className="px-8 h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Continue'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        <Card className="border-0 shadow-lg bg-white p-6 relative overflow-hidden">
                            {/* Decorative Element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-50"></div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Creators with complete profiles appear higher in Filters and search results.
                                    </p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        AI Match uses your niche, audience, and pricing to recommend the best campaigns.
                                    </p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">3</div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Brands can fast-track approvals when they see platform links and audience stats upfront.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreatorOnboarding;
