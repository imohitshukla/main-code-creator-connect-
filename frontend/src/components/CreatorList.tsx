import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

// Deterministic color for initials placeholder
function getColorFromString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return { bg: `hsl(${hue}, 45%, 80%)`, text: `hsl(${hue}, 40%, 25%)` };
}
function getInitials(name: string) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name || '?').slice(0, 2).toUpperCase();
}

export const CreatorList = () => {
    const [creators, setCreators] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/api/creators?limit=6`);
                if (res.ok) {
                    const data = await res.json();
                    setCreators(data.creators || []);
                }
            } catch (error) {
                console.error("Error fetching creators:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCreators();
    }, []);

    if (isLoading) {
        return (
            <div className="py-20 bg-gray-50 text-center">
                <p className="text-gray-500">Loading creator directory...</p>
            </div>
        );
    }

    if (creators.length === 0) {
        return (
            <div className="py-20 bg-gray-50 text-center">
                <p className="text-gray-500">No creators found in the directory.</p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section className="py-24 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Featured Creators
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover authentic voices driving real engagement. Browse our network of talented creators.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {creators.map((creator) => {
                        // Extract tags from niche
                        const tags = creator.niche
                            ? creator.niche.split(/[|,]/).map((t: string) => t.trim()).filter(Boolean)
                            : ['Creator'];

                        // Only use a real uploaded image — no external fallbacks
                        const imageUrl = creator.image && !creator.image.includes('pravatar') && !creator.image.includes('unsplash') ? creator.image : null;

                        return (
                            <motion.div key={creator.id} variants={itemVariants}>
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white rounded-2xl group">
                                    {/* Large Image Header */}
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10" />
                                        {creator.image ? (
                                            <img
                                                src={creator.image}
                                                alt={creator.name || 'Creator'}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    // On load failure, hide the img and show initials placeholder
                                                    const parent = (e.target as HTMLImageElement).parentElement;
                                                    if (parent) {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        const placeholder = parent.querySelector('.initials-placeholder') as HTMLElement;
                                                        if (placeholder) placeholder.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        {/* Initials placeholder — shown when no image */}
                                        <div
                                            className="initials-placeholder absolute inset-0 flex items-center justify-center text-5xl font-bold select-none"
                                            style={{
                                                ...getColorFromString(creator.name || ''),
                                                display: creator.image ? 'none' : 'flex',
                                                backgroundColor: getColorFromString(creator.name || '').bg,
                                                color: getColorFromString(creator.name || '').text,
                                            }}
                                        >
                                            {getInitials(creator.name || '')}
                                        </div>
                                    </div>

                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        {/* Name & Tags */}
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                {creator.name || creator.email?.split('@')[0] || `Creator #${creator.id}`}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.slice(0, 3).map((tag: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {tags.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-100">
                                                        +{tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quote / Bio */}
                                        <div className="flex-1 bg-gray-50/50 rounded-xl p-4 mb-6 relative">
                                            <Quote className="absolute top-2 left-2 text-gray-200 w-8 h-8 -z-10 transform -rotate-12" />
                                            <p className="text-gray-600 text-sm italic leading-relaxed line-clamp-3 relative z-10 pt-1">
                                                "{creator.bio || 'Passionate about creating authentic content that resonates with my audience and builds real communities.'}"
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-auto">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Followers</p>
                                                <p className="font-bold text-gray-900 text-lg">
                                                    {creator.followers || creator.follower_count || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Engagement</p>
                                                <p className="font-bold text-gray-900 text-lg">
                                                    {creator.engagement_rate ? `${creator.engagement_rate}%` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
