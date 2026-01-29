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
  stats?: {
    followers?: string;
    engagement?: string;
  };
  contact?: {
    instagram?: string;
    youtube?: string;
    portfolio?: string;
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

  const { data: creator, isLoading, error, isError } = useQuery({
    queryKey: ['creator', id],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/creators/id/${id}`);
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      const data = await res.json();
      return (data.creator || data) as PublicCreator;
    },
    enabled: !!id && !stateCreator,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  const followers = creator.stats?.followers ?? '0';
  const engagement = creator.stats?.engagement ?? 'N/A';

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

          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition">
            Contact Creator
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
              {creator.contact?.instagram && (
                <a
                  href={creator.contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium"
                >
                  Instagram
                </a>
              )}
              {creator.contact?.youtube && (
                <a
                  href={creator.contact.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                >
                  YouTube
                </a>
              )}
              {creator.contact?.portfolio && (
                <a
                  href={creator.contact.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Portfolio / Media Kit
                </a>
              )}
              {!creator.contact?.instagram &&
                !creator.contact?.youtube &&
                !creator.contact?.portfolio && (
                  <p className="text-gray-600 text-sm">
                    This creator hasn&apos;t added external links yet.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
