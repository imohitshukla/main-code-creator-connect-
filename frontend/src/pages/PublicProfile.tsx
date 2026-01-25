import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MapPin, CheckCircle2, Instagram, Youtube, Globe, Mail, ArrowLeft, Star } from 'lucide-react';
import SmartAvatar from '@/components/SmartAvatar';
import { getApiUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PublicCreatorProfile {
    id: number;
    name: string;
    avatar: string;
    email: string; // for avatar fallback
    niche: string;
    bio: string;
    location: string;
    is_verified: boolean;
    follower_count: string;
    engagement_rate: number;
    instagram_link: string;
    youtube_link: string;
    portfolio_link: string;
    collaboration_goals: string;
    audience_breakdown: string;
    budget_range: string;
}

const PublicProfile = () => {
    const { id } = useParams();
    const [creator, setCreator] = useState<PublicCreatorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCreator = async () => {
            try {
                const response = await fetch(`${getApiUrl()}/api/creators/${id}`);
                if (!response.ok) throw new Error('Creator not found');
                const data = await response.json();
                setCreator(data.creator);
            } catch (error) {
                console.error(error);
                toast({
                    title: 'Error',
                    description: 'Could not load creator profile.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCreator();
    }, [id, toast]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto space-y-8">
                <Skeleton className="h-12 w-48" />
                <div className="grid md:grid-cols-3 gap-8">
                    <Skeleton className="h-[400px] rounded-xl" />
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <h1 className="text-3xl font-bold">Creator Not Found</h1>
                <Button asChild className="mt-4" variant="outline">
                    <Link to="/filter">Back to Discovery</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-subtle pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                    <Link to="/filter" className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Search</Link>
                </Button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: sticky visual */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-card rounded-2xl p-6 border shadow-sm sticky top-24">
                            <div className="aspect-square rounded-xl overflow-hidden mb-6 border-4 border-background shadow-inner relative">
                                <SmartAvatar
                                    src={creator.avatar}
                                    name={creator.name}
                                    email={creator.email}
                                    className="w-full h-full object-cover"
                                    type="creator"
                                />
                                {creator.is_verified && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg" title="Verified Creator">
                                        <CheckCircle2 className="w-5 h-5 fill-current" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{creator.location || 'Remote / Global'}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-primary/5 p-3 rounded-lg">
                                        <p className="text-xl font-bold text-primary">{creator.follower_count || '0'}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Followers</p>
                                    </div>
                                    <div className="bg-primary/5 p-3 rounded-lg">
                                        <p className="text-xl font-bold text-primary">{creator.engagement_rate ? `${creator.engagement_rate}%` : 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Engagement</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium mb-3 text-center">Social Profiles</p>
                                    <div className="flex justify-center gap-4">
                                        {creator.instagram_link && (
                                            <a href={creator.instagram_link} target="_blank" rel="noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {creator.youtube_link && (
                                            <a href={creator.youtube_link} target="_blank" rel="noreferrer" className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                                                <Youtube className="w-5 h-5" />
                                            </a>
                                        )}
                                        {creator.portfolio_link && (
                                            <a href={creator.portfolio_link} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Action */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Header section */}
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">{creator.niche || 'General Creator'}</Badge>
                                    <h1 className="text-4xl font-bold text-foreground mb-2">{creator.name}</h1>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />)}
                                        <span className="text-muted-foreground text-sm ml-2">(42 Reviews)</span>
                                    </div>
                                </div>
                                {/* Action Card for Desktop */}
                                <Card className="hidden md:block w-72 border-2 border-primary/10 shadow-lg ml-4">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Starting from</p>
                                            <p className="text-2xl font-bold text-foreground">{creator.budget_range || 'Contact for rates'}</p>
                                        </div>
                                        <Button className="w-full gap-2 bg-gradient-hero hover:shadow-glow" size="lg">
                                            <Mail className="w-4 h-4" /> Contact Creator
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Separator />

                        {/* Main Content */}
                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-bold mb-3">About {creator.name}</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {creator.bio || 'No bio available for this creator matching your search criteria.'}
                                </p>
                            </section>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Audience</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{creator.audience_breakdown || 'No specific audience breakdown provided.'}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Campaign Goals</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{creator.collaboration_goals || 'Open to all types of ethical collaborations.'}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Mobile Action Button */}
                            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                                <Button className="w-full gap-2 bg-gradient-hero" size="lg">
                                    <Mail className="w-4 h-4" /> Contact {creator.name}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
