import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/utils';
import SmartAvatar from '@/components/SmartAvatar';

interface PublicCreator {
  id: number;
  name: string;
  image?: string;
  avatar?: string;
  niche?: string;
  location?: string;
  bio?: string;
  followers?: string;
  stats?: {
    followers?: string;
    engagement?: string;
  };
}

export default function PublicProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState<PublicCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Missing creator id');
      setLoading(false);
      return;
    }

    fetch(`${getApiUrl()}/api/creators/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
        return res.json();
      })
      .then((data) => {
        // Handle wrapped { creator: ... } or flat object
        const payload = (data.creator || data) as PublicCreator;
        setCreator(payload);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load this creator profile right now.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Profile...</div>;

  if (error || !creator || !creator.name) {
    return (
      <div className="max-w-xl mx-auto p-10 pt-32 text-center">
        <p className="mb-4 text-red-500 font-semibold">
          {error || 'Profile not found.'}
        </p>
        <Link to="/filter" className="text-primary hover:underline">
          ← Back to creator search
        </Link>
      </div>
    );
  }

  const followers =
    creator.stats?.followers ??
    creator.followers ??
    '0';

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <Link to="/filter" className="text-gray-500 mb-4 block hover:text-black">
        ← Back to Search
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* IMAGE SECTION */}
        <div className="w-full md:w-1/3 h-80 md:h-auto bg-gray-200 flex items-center justify-center">
          <SmartAvatar
            src={creator.image || creator.avatar}
            name={creator.name}
            type="creator"
            alt={creator.name}
            className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
          />
        </div>

        {/* DETAILS SECTION */}
        <div className="w-full md:w-2/3 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{creator.name}</h1>
              <p className="text-purple-600 font-medium text-lg mt-1">
                {creator.niche || 'Creator'} • {creator.location || 'Global'}
              </p>
            </div>

            {/* FOLLOWER COUNT */}
            <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-3xl font-extrabold text-gray-900">
                {followers}
              </span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                Followers
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 py-6 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              About Creator
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {creator.bio ||
                "This creator hasn't added a bio yet."}
            </p>
          </div>

          <div className="mt-auto">
            <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Contact & Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
