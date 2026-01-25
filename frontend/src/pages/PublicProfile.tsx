import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SmartAvatar from '@/components/SmartAvatar'; // Keeping this as it's nice

export default function PublicProfile() {
    const { id } = useParams();
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch from your API
        fetch(`/api/creators/${id}`) // Ensure this matches your route
            .then(res => {
                if (!res.ok) throw new Error("Creator not found");
                return res.json();
            })
            .then(data => {
                console.log("Frontend received:", data); // Debugging
                // Creator data is wrapped in { creator: ... } from backend
                setCreator(data.creator || data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Profile...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!creator) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-24">
            <Link to="/filter" className="text-gray-500 mb-4 block hover:text-black">← Back to Search</Link>

            <div className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-1/3 h-64 relative bg-gray-100">
                    {creator.avatar ? (
                        <SmartAvatar
                            src={creator.avatar}
                            name={creator.name}
                            email={creator.name}
                            type="creator"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={creator.image}
                            alt={creator.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Info */}
                <div className="p-8 w-full md:w-2/3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{creator.name}</h1>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mt-2 inline-block">
                                {creator.niche}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{creator.stats?.followers || creator.followers || '0'}</p>
                            <p className="text-gray-500 text-sm">Followers</p>
                        </div>
                    </div>

                    <p className="mt-4 text-gray-600">{creator.bio}</p>

                    <div className="mt-8 flex gap-4">
                        <button className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-bold">
                            Contact Creator
                        </button>
                        {creator.contact?.instagram && (
                            <a href={creator.contact.instagram} target="_blank" rel="noreferrer" className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                                Instagram
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
