import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/utils';

interface Deal {
  id: number;
  brand_id: number;
  creator_id: number;
  title: string;
  description?: string;
  budget?: number;
  current_stage: 'AGREEMENT_SIGNED' | 'SHIPPING_LOGISTICS' | 'SCRIPT_APPROVAL' | 'DRAFT_REVIEW' | 'GO_LIVE' | 'PAYMENT_RELEASE' | 'COMPLETED';
  stage_metadata: Record<string, any>;
  status: 'ACTIVE' | 'CANCELLED' | 'DISPUTE';
  cancellation_reason?: string;
  cancelled_by?: number;
  agreement_signed_at?: string;
  completed_at?: string;
  created_at: string;
  brand: {
    id: number;
    name: string;
    email: string;
  };
  creator: {
    id: number;
    name: string;
    email: string;
  };
}

const STAGES = [
  { key: 'AGREEMENT_SIGNED', label: 'Agreement Signed', description: 'Both parties sign digital contract' },
  { key: 'SHIPPING_LOGISTICS', label: 'Shipping Logistics', description: 'Brand sends product, Creator confirms receipt' },
  { key: 'SCRIPT_APPROVAL', label: 'Script Approval', description: 'Creator submits concept, Brand approves' },
  { key: 'DRAFT_REVIEW', label: 'Draft Review', description: 'Video upload, feedback loop, final approval' },
  { key: 'GO_LIVE', label: 'Go Live', description: 'Link verification of social post' },
  { key: 'PAYMENT_RELEASE', label: 'Payment Release', description: 'Escrow release & Rating' },
  { key: 'COMPLETED', label: 'Completed', description: 'Deal successfully finished' }
];

export default function DealTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const { data: deal, isLoading, error } = useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/deals/${id}`);
      if (!res.ok) throw new Error(`Failed to load deal (${res.status})`);
      return res.json() as Promise<Deal>;
    },
    enabled: !!id,
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ stage, metadata }: { stage: string; metadata?: Record<string, any> }) => {
      const res = await fetch(`${getApiUrl()}/api/deals/${id}/update-stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, metadata })
      });
      if (!res.ok) throw new Error('Failed to update stage');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
    },
  });

  const cancelDealMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/deals/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_reason: cancellationReason })
      });
      if (!res.ok) throw new Error('Failed to cancel deal');
      return res.json();
    },
    onSuccess: () => {
      setIsCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      navigate('/deals');
    },
  });

  const currentStageIndex = STAGES.findIndex(s => s.key === deal?.current_stage);
  const isEarlyStage = ['AGREEMENT_SIGNED', 'SHIPPING_LOGISTICS', 'SCRIPT_APPROVAL'].includes(deal?.current_stage);

  const handleStageUpdate = (stage: string) => {
    updateStageMutation.mutate({ stage });
  };

  const handleCancel = () => {
    if (cancellationReason.trim()) {
      cancelDealMutation.mutate();
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading deal...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error loading deal</div>;
  if (!deal) return <div className="p-10 text-center">Deal not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">{deal.title}</h1>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Brand: {deal.brand?.name}</p>
              <p className="text-sm opacity-90">Creator: {deal.creator?.name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              deal.status === 'CANCELLED' ? 'bg-red-500' :
              deal.status === 'DISPUTE' ? 'bg-orange-500' :
              deal.status === 'COMPLETED' ? 'bg-green-500' :
              'bg-blue-500'
            }`}>
              {deal.status}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {STAGES.map((stage, index) => (
              <div key={stage.key} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  index < currentStageIndex ? 'bg-blue-600 text-white' :
                  index === currentStageIndex ? 'bg-green-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 h-1 bg-gray-300 relative">
                  {index < currentStageIndex && <div className="absolute inset-0 h-1 bg-green-600" />}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">{stage.label}</p>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Current Stage Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Current Stage: {STAGES[currentStageIndex]?.label}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Stage Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Started:</strong> {new Date(deal.created_at).toLocaleDateString()}</p>
                  {deal.agreement_signed_at && (
                    <p><strong>Agreement Signed:</strong> {new Date(deal.agreement_signed_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(deal.stage_metadata || {}).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {JSON.stringify(value)}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {deal.budget && <p>Budget: ${deal.budget.toLocaleString()}</p>}
            </div>
            
            <div className="space-x-4">
              {/* Previous Stage Button */}
              {currentStageIndex > 0 && (
                <button
                  onClick={() => handleStageUpdate(STAGES[currentStageIndex - 1].key)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Previous Stage
                </button>
              )}
              
              {/* Next Stage Button */}
              {currentStageIndex < STAGES.length - 1 && deal.status === 'ACTIVE' && (
                <button
                  onClick={() => handleStageUpdate(STAGES[currentStageIndex + 1].key)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next Stage
                </button>
              )}
              
              {/* Cancel Deal Button - Always Visible */}
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isEarlyStage 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {deal.status === 'CANCELLED' || deal.status === 'DISPUTE' 
                  ? 'Deal Closed' 
                  : 'Terminate Contract'
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              {isEarlyStage ? 'Cancel Deal' : 'Request Dispute Resolution'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {isEarlyStage 
                ? 'This will end the deal immediately with no penalties.'
                : 'This will mark the deal for admin review due to work already completed.'
              }
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for {isEarlyStage ? 'Cancellation' : 'Dispute'}:
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder={isEarlyStage 
                  ? 'Please provide a reason for cancellation...'
                  : 'Please describe the dispute details...'
                }
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isEarlyStage ? 'Cancel Deal' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
