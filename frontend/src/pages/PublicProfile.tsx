import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/utils';
import SmartAvatar from '@/components/SmartAvatar';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
}

export default function PublicProfile() {
  const { id } = useParams();
  const location = useLocation() as { state?: { creator?: PublicCreator } };
  const [creator, setCreator] = useState<PublicCreator | null>(location.state?.creator || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have full creator data from navigation state (clicked card),
    // show the page immediately without waiting for API and skip the network call.
    if (location.state?.creator) {
      setLoading(false);
      return;
    }

    if (!id) {
      setError('Missing creator id');
      setLoading(false);
      return;
    }

    // Use the explicit /id/:id route on the backend to avoid any ambiguity
    // with the generic "/:identifier" route.
    fetch(`${getApiUrl()}/api/creators/id/${id}`)
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
  }, [id, location.state?.creator]);

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

  const numericFollowers = useMemo(() => {
    const value = typeof followers === 'string' ? followers : String(followers ?? '0');
    const cleaned = value.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [followers]);

  const engagementRate = useMemo(() => {
    const raw = creator?.stats?.engagement ?? '';
    const cleaned = String(raw).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [creator?.stats?.engagement]);

  const growthData = useMemo(() => {
    const base = numericFollowers || 10000;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      followers: Math.round(base * (0.45 + index * 0.1)),
    }));
  }, [numericFollowers]);

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 space-y-8">
      <Link to="/filter" className="text-gray-500 mb-4 block hover:text-black">
        ← Back to Search
      </Link>

      {/* Portfolio Hero */}
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

          {/* Contact / Links */}
          {(creator.contact?.instagram || creator.contact?.youtube || creator.contact?.portfolio) && (
            <div className="border-t border-gray-100 pt-4 mb-4 flex flex-wrap gap-3">
              {creator.contact.instagram && (
                <a
                  href={creator.contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 text-sm font-medium rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                >
                  Instagram
                </a>
              )}
              {creator.contact.youtube && (
                <a
                  href={creator.contact.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 text-sm font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  YouTube
                </a>
              )}
              {creator.contact.portfolio && (
                <a
                  href={creator.contact.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 text-sm font-medium rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
                >
                  Portfolio / Media Kit
                </a>
              )}
            </div>
          )}

          <div className="mt-auto">
            <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Contact & Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Analytics + Deep-Dive Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              Live snapshot
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Followers</p>
              <p className="text-2xl font-bold text-slate-900">{followers}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {engagementRate ? `${engagementRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Est. Monthly Reach</p>
              <p className="text-2xl font-bold text-slate-900">
                {numericFollowers ? `${Math.round(numericFollowers * 1.8).toLocaleString()}+` : '—'}
              </p>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.06)' }}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#E5E7EB',
                    boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
                  }}
                />
                <Bar dataKey="followers" fill="#6366F1" radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audience / Collaboration Snapshot */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Audience & Collaboration</h2>

          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Audience Breakdown</p>
              <p>{creator.details?.audience_breakdown || 'Creator has not shared detailed audience insights yet.'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Preferred Budget Range</p>
              <p>{creator.details?.budget_range || 'Flexible / not specified.'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Collaboration Goals</p>
              <p>{creator.details?.collaboration_goals || 'Open to exploring a range of campaign formats.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
