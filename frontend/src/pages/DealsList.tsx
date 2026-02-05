import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/utils';

interface Deal {
  id: number;
  title: string;
  budget?: number;
  current_stage: string;
  status: string;
  brand: {
    name: string;
  };
  creator: {
    name: string;
  };
  created_at: string;
}

const STAGE_COLORS = {
  AGREEMENT_SIGNED: 'bg-blue-100 text-blue-800',
  SHIPPING_LOGISTICS: 'bg-yellow-100 text-yellow-800',
  SCRIPT_APPROVAL: 'bg-orange-100 text-orange-800',
  DRAFT_REVIEW: 'bg-purple-100 text-purple-800',
  GO_LIVE: 'bg-green-100 text-green-800',
  PAYMENT_RELEASE: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
};

export default function DealsList() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['user-deals'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/deals/user`);
      if (!res.ok) throw new Error('Failed to load deals');
      return res.json() as Promise<{ deals: Deal[] }>;
    },
  });

  if (isLoading) return <div className="p-10 text-center">Loading deals...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Deals</h1>
      
      {deals?.deals?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No deals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals?.deals?.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`p-4 ${STAGE_COLORS[deal.current_stage as keyof typeof STAGE_COLORS] || 'bg-gray-100'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    deal.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                    deal.status === 'DISPUTE' ? 'bg-orange-500 text-white' :
                    deal.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {deal.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Brand:</strong> {deal.brand?.name}</p>
                  <p><strong>Creator:</strong> {deal.creator?.name}</p>
                  <p><strong>Stage:</strong> {deal.current_stage.replace('_', ' ')}</p>
                  {deal.budget && <p><strong>Budget:</strong> ${deal.budget.toLocaleString()}</p>}
                  <p><strong>Created:</strong> {new Date(deal.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-4">
                  <a
                    href={`/deals/${deal.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
