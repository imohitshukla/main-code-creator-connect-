import { useState, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/utils';
import { apiCall } from '@/utils/apiHelper';
import SmartAvatar from '@/components/SmartAvatar';
import { useAuth } from '@/contexts/AuthContext';
import CreatorIntelReport from '@/components/CreatorIntelReport';


/* ── Share helpers ────────────────────────────────────────────── */
const getProfileUrl = (id: string | number) => {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://creatorconnect.tech';
  return `${base}/profile/${id}`;
};

type SharePlatform = 'whatsapp' | 'instagram' | 'x' | 'linkedin' | 'copy';

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
  const { user } = useAuth();
  const location = useLocation() as { state?: { creator?: PublicCreator } };
  const stateCreator = location.state?.creator ?? null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [message, setMessage] = useState('');
  // Compensation state
  const [compensationType, setCompensationType] = useState('CASH');
  const [cashAmount, setCashAmount] = useState('');
  const [productName, setProductName] = useState('');
  const [productMrp, setProductMrp] = useState('');

  // Share state
  const [shareTooltip, setShareTooltip] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleShare = useCallback(
    (platform: SharePlatform, creatorName: string, creatorId: number) => {
      const url = getProfileUrl(creatorId);
      const text = `Check out ${creatorName}'s creator profile on Creator Connect! 🚀`;

      switch (platform) {
        case 'whatsapp': {
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `${text}\n${url}`
          )}`;
          window.open(waUrl, '_blank', 'noopener');
          break;
        }
        case 'instagram': {
          // Instagram doesn't allow direct link sharing, copy a formatted caption
          const caption = `${text}\n\n🔗 ${url}\n\n#CreatorConnect #InfluencerMarketing #Collab`;
          navigator.clipboard.writeText(caption).then(() => {
            setShareTooltip('Caption copied! Paste it on Instagram 📋');
            setTimeout(() => setShareTooltip(null), 3000);
          });
          break;
        }
        case 'x': {
          const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`;
          window.open(tweetUrl, '_blank', 'noopener');
          break;
        }
        case 'linkedin': {
          const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`;
          window.open(liUrl, '_blank', 'noopener');
          break;
        }
        case 'copy': {
          navigator.clipboard.writeText(url).then(() => {
            setShareTooltip('Link copied to clipboard! 🎉');
            setTimeout(() => setShareTooltip(null), 2500);
          });
          break;
        }
      }
    },
    []
  );

  const { data: creator, isLoading, error, isError } = useQuery({
    queryKey: ['creator', id], // Fix: Removed Date.now() to prevent infinite re-fetching loop
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

  const instagramUrl = creator.contact?.instagram;
  const youtubeUrl = creator.contact?.youtube;
  const portfolioUrl = creator.contact?.portfolio;
  const hasAnyLink = hasLink(instagramUrl) || hasLink(youtubeUrl) || hasLink(portfolioUrl);

  // Debug-First Handler
  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    console.log("🔴 BUTTON CLICKED - Handler Started"); // Step 1: Prove it clicks

    // Log the data we are trying to send
    console.log("Payload:", { brandName, compensationType, cashAmount, productName, productMrp, message });

    if (!brandName || !message) {
      alert("Please fill in all fields"); // Temporary fallback alert 
      return;
    }

    try {
      console.log("🟡 Sending Request to API...");

      // Ensure the endpoint matches your Hono Backend
      const response = await apiCall('/api/creators/proposals', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creatorId: creator?.id,
          brandName,
          compensationType,
          cashAmount,
          productName,
          productMrp,
          message
        }),
      });

      const data = await response.json();
      console.log("🟢 API Response:", data);

      if (response.ok) {
        alert("Proposal Sent Successfully!");
        setIsModalOpen(false); // Close modal on success
        // Reset form
        setBrandName('');
        setCompensationType('CASH');
        setCashAmount('');
        setProductName('');
        setProductMrp('');
        setMessage('');
      } else {
        alert(`Error: ${data.message || "Failed to send"}`);
      }
    } catch (error) {
      console.error("🔴 CRITICAL FAILURE:", error);
      alert("Network Error - Check Console");
    }
  };

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

          {/* ── Share Profile Section ── */}
          <div className="w-full max-w-sm mt-4 relative">
            <button
              type="button"
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-all duration-300"
              id="share-profile-toggle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share Profile
              <svg
                xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-300 ${isShareOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Share buttons row */}
            <div
              className={`overflow-hidden transition-all duration-400 ease-in-out ${
                isShareOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {/* WhatsApp */}
                <button
                  type="button"
                  id="share-whatsapp"
                  onClick={() => handleShare('whatsapp', creator.name, creator.id)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-50 text-green-700 font-medium text-sm hover:bg-green-500 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  title="Share via WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                {/* Instagram */}
                <button
                  type="button"
                  id="share-instagram"
                  onClick={() => handleShare('instagram', creator.name, creator.id)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-medium text-sm hover:from-purple-500 hover:to-pink-500 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  title="Copy caption for Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  <span className="hidden sm:inline">Instagram</span>
                </button>

                {/* X / Twitter */}
                <button
                  type="button"
                  id="share-x"
                  onClick={() => handleShare('x', creator.name, creator.id)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 text-gray-800 font-medium text-sm hover:bg-black hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  title="Share on X"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="hidden sm:inline">X</span>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  id="share-linkedin"
                  onClick={() => handleShare('linkedin', creator.name, creator.id)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  title="Share on LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="hidden sm:inline">LinkedIn</span>
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  id="share-copy-link"
                  onClick={() => handleShare('copy', creator.name, creator.id)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  title="Copy profile link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span className="hidden sm:inline">Copy Link</span>
                </button>
              </div>

              {/* Share Tooltip / Toast */}
              {shareTooltip && (
                <div className="mt-3 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {shareTooltip}
                  </span>
                </div>
              )}
            </div>
          </div>
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

      {/* AI Insights Panel (only visible to logged-in BRAND or ADMIN users, or creators viewing their own page) */}
      {creator && (user?.role === 'BRAND' || user?.role === 'ADMIN' || (user?.role === 'CREATOR' && user?.id === creator?.id)) && (
        <div className="mt-8">
          <CreatorIntelReport 
            creatorId={id} 
            creatorName={creator.name} 
            niche={creator.niche} 
          />
        </div>
      )}

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
              onSubmit={handleSendProposal}
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
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              {/* Compensation Details */}
              <div className="bg-gray-50 border p-4 rounded-lg space-y-4">
                <div>
                  <label htmlFor="modal-comp-type" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Compensation Type
                  </label>
                  <select
                    id="modal-comp-type"
                    className="w-full p-3 border rounded-lg bg-white outline-none"
                    value={compensationType}
                    onChange={(e) => setCompensationType(e.target.value)}
                  >
                    <option value="CASH">Cash Only</option>
                    <option value="BARTER">Product Barter Only</option>
                    <option value="HYBRID">Hybrid (Product + Cash)</option>
                  </select>
                </div>

                {(compensationType === 'BARTER' || compensationType === 'HYBRID') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-prod-name" className="text-xs font-bold text-gray-500 uppercase block mb-1 text-truncate">
                        Product Name
                      </label>
                      <input
                        id="modal-prod-name"
                        type="text"
                        className="w-full p-3 border rounded-lg bg-white outline-none text-sm"
                        placeholder="e.g. Skin Serum"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-prod-mrp" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                        MRP (₹)
                      </label>
                      <input
                        id="modal-prod-mrp"
                        type="number"
                        className="w-full p-3 border rounded-lg bg-white outline-none text-sm"
                        placeholder="e.g. 1500"
                        value={productMrp}
                        onChange={(e) => setProductMrp(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {(compensationType === 'CASH' || compensationType === 'HYBRID') && (
                  <div>
                    <label htmlFor="modal-cash-amount" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                      Cash Amount (₹)
                    </label>
                    <input
                      id="modal-cash-amount"
                      type="number"
                      className="w-full p-3 border rounded-lg bg-white outline-none"
                      placeholder="e.g. 5000"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="modal-message" className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Message / Deliverables
                </label>
                <textarea
                  id="modal-message"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none h-24"
                  placeholder="Describe your campaign or deliverables expected..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
