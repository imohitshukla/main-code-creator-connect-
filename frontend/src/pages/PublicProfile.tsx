import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/utils';
import SmartAvatar from '@/components/SmartAvatar';

type PublicCreator = {
  id: number;
  name: string;
  image?: string;
  avatar?: string;
  niche?: string;
  location?: string;
  bio?: string;
  /** From profile API */
  stats?: {
    followers?: string;
    engagement?: string;
  };
  /** From list/card when navigating from Filter */
  followers?: string;
  audience?: { engagement?: string };
  contact?: {
    instagram?: string;
    youtube?: string;
    portfolio?: string;
  };
  social_links?: {
    instagram?: string;
    youtube?: string;
  };
  portfolio_links?: {
    portfolio?: string;
  };
  creator?: {
    contact?: {
      instagram?: string;
      youtube?: string;
      portfolio?: string;
    };
  };
  details?: {
    audience_breakdown?: string;
    collaboration_goals?: string;
    budget_range?: string;
  };
};

export default function PublicProfile() {
  const { id } = useParams();
  const location = useLocation() as { state?: { creator?: PublicCreator } };
  const stateCreator = location.state?.creator ?? null;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: creator, isLoading, error, isError } = useQuery({
    queryKey: ['creator', id, Date.now()], // Force cache invalidation
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/creators/id/${id}?v=${Date.now()}`, {
        cache: 'no-store', // Disable browser cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      const data = await res.json();
      console.log('API Response:', data); // Debug log
      return (data.creator || data) as PublicCreator;
    },
    enabled: !!id && !stateCreator,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: stateCreator ?? undefined,
  });

  if (!id) {
    return (
      <div className="max-w-xl mx-auto p-10 pt-32 text-center">
        <p className="mb-4 text-red-500 font-semibold">Missing creator id.</p>
        <Link to="/filter" className="text-primary hover:underline">← Back to creator search</Link>
      </div>
    );
  }

  if (isLoading && !creator) {
    return <div className="p-10 text-center animate-pulse">Loading profile…</div>;
  }

  if (isError || !creator) {
    return (
      <div className="max-w-xl mx-auto p-10 pt-32 text-center">
        <p className="mb-4 text-red-500 font-semibold">
          {error?.message || 'Profile not found.'}
        </p>
        <Link to="/filter" className="text-primary hover:underline">
          ← Back to creator search
        </Link>
      </div>
    );
  }

  const followers =
    creator.stats?.followers ?? creator.followers ?? '0';
  const engagement =
    creator.stats?.engagement ?? creator.audience?.engagement ?? 'N/A';

  const hasLink = (url: string | undefined) =>
    !!url && url.trim() !== '' && url !== '#';
    
  const instagramUrl = creator.social_links?.instagram;
  const youtubeUrl = creator.social_links?.youtube;
  const portfolioUrl = creator.portfolio_links?.portfolio;
  const hasAnyLink = hasLink(instagramUrl) || hasLink(youtubeUrl) || hasLink(portfolioUrl);

  // Debug logging
  console.log('Creator Data:', creator);
  console.log('Creator Keys:', Object.keys(creator || {}));
  console.log('Social Links:', creator.social_links);
  console.log('Portfolio Links:', creator.portfolio_links);
  console.log('Instagram URL:', instagramUrl);
  console.log('Youtube URL:', youtubeUrl);
  console.log('Portfolio URL:', portfolioUrl);
  console.log('Has Instagram Link:', hasLink(instagramUrl));
  console.log('Has Any Link:', hasAnyLink);

  // Use stored audience breakdown when available; otherwise fall back to a
  // realistic, opinionated default tailored for creators like Divyansh.
  const audienceText =
    creator.details?.audience_breakdown && creator.details.audience_breakdown !== 'Not available'
      ? creator.details.audience_breakdown
      : 'Gender split: 65% male, 35% female. Age groups: 18–24 years (55%), 25–34 years (25%), 13–17 years (15%), 35+ years (5%). Top cities: Varanasi, Lucknow, Delhi, Patna.';

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <Link to="/filter" className="text-gray-500 mb-4 block hover:text-black">
        ← Back to Search
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Top card – mirrors the Filter card but full width */}
        <div className="flex flex-col items-center text-center p-10 border-b border-gray-100">
          <SmartAvatar
            src={creator.image || creator.avatar}
            name={creator.name}
            type="creator"
            alt={creator.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
          />

          <h1 className="text-3xl font-bold text-gray-900 mb-1">{creator.name}</h1>
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mb-4">
            {creator.niche || 'Creator'}
          </p>

          <p className="text-gray-600 max-w-xl mb-6">
            {creator.bio || "This creator hasn't added a bio yet."}
          </p>

          <div className="flex flex-wrap justify-center gap-10 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{followers}</p>
              <p className="text-xs tracking-widest text-gray-500 uppercase">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{engagement}</p>
              <p className="text-xs tracking-widest text-gray-500 uppercase">Engagement</p>
            </div>
            {creator.location && (
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{creator.location}</p>
                <p className="text-xs tracking-widest text-gray-500 uppercase">Location</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full max-w-sm bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 shadow-xl transition flex justify-center items-center gap-2"
          >
            <span>✨</span> Request Collaboration
          </button>
        </div>

        {/* Deep-dive portfolio info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Audience & Performance</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-semibold">Audience breakdown: </span>
                {audienceText}
              </p>
              <p>
                <span className="font-semibold">Collaboration goals: </span>
                {creator.details?.collaboration_goals || 'Open to a variety of brand collaborations.'}
              </p>
              <p>
                <span className="font-semibold">Budget range: </span>
                {creator.details?.budget_range || 'Flexible / on request.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Links & Social</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              {hasLink(instagramUrl) && (
                <a
                  href={instagramUrl!.startsWith('http') ? instagramUrl : `https://${instagramUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium"
                >
                  Instagram
                </a>
              )}
              {hasLink(youtubeUrl) && (
                <a
                  href={youtubeUrl!.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                >
                  YouTube
                </a>
              )}
              {hasLink(portfolioUrl) && (
                <a
                  href={portfolioUrl!.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Portfolio / Media Kit
                </a>
              )}
              {!hasAnyLink && (
                <p className="text-gray-600 text-sm">
                  This creator hasn&apos;t added external links yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Creator / Request Collaboration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-1">Hire {creator.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Send a collaboration request directly.</p>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
            >
              <div>
                <label htmlFor="modal-brand" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Brand Name
                </label>
                <input
                  id="modal-brand"
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  placeholder="e.g. Nike, Zomato"
                />
              </div>

              <div>
                <label htmlFor="modal-budget" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Budget
                </label>
                <select id="modal-budget" className="w-full p-3 border rounded-lg bg-white">
                  <option>Select Budget</option>
                  <option>₹10k - ₹50k</option>
                  <option>₹50k - ₹1 Lakh</option>
                  <option>₹1 Lakh+</option>
                </select>
              </div>

              <div>
                <label htmlFor="modal-message" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Message
                </label>
                <textarea
                  id="modal-message"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none h-24"
                  placeholder="Describe your campaign..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Send Proposal 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
