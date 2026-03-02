import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SmartAvatar from '@/components/SmartAvatar';

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

    return (
        <section className="py-24 bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Creator Directory
                    </h2>
                    <p className="text-gray-600">
                        Real data from our platform. Browse our growing list of authentic creators.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.map((creator) => (
                        <Card key={creator.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <SmartAvatar
                                    src={creator.avatar}
                                    type="creator"
                                    name={creator.name || creator.email?.split('@')[0]}
                                    email={creator.email}
                                    className="h-12 w-12 border border-gray-100"
                                />
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                        {creator.name || creator.email?.split('@')[0] || `Creator #${creator.id}`}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 font-medium">{creator.niche || 'General Content'}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Followers</p>
                                        <p className="font-semibold text-gray-800">
                                            {creator.follower_count ? creator.follower_count.toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Engagement</p>
                                        <p className="font-semibold text-gray-800">
                                            {creator.engagement_rate ? `${creator.engagement_rate}%` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {creator.bio && (
                                    <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                                        {creator.bio}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
