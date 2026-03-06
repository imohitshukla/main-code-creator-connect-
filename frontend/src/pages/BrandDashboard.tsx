import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import ActiveCampaignsTable from '../components/dashboard/ActiveCampaignsTable';
import CreateCampaignModal from '../components/dashboard/CreateCampaignModal';
import { apiCall } from '@/utils/apiHelper';
import RazorpayCheckout from '@/components/RazorpayCheckout';

interface EscrowDeal {
  id: number;
  title?: string;
  deliverables?: string;
  amount: number;
  currency: string;
  status: string;
  payment_status: string;
  creator_name?: string;
}

const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeCount: 0,
    totalApplicants: 0,
    totalSpent: 0
  });
  // Deals needing escrow funding
  const [pendingEscrowDeals, setPendingEscrowDeals] = useState<EscrowDeal[]>([]);
  const [escrowLoading, setEscrowLoading] = useState(true);
  const [fundingDealId, setFundingDealId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall('/api/dashboard/brand');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        if (data.stats) {
          setMetrics({
            activeCount: data.stats.active_campaigns,
            totalApplicants: data.stats.pending_applicants,
            totalSpent: data.stats.total_spent
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch deals awaiting escrow from the brand
  const fetchPendingEscrowDeals = async () => {
    setEscrowLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/my-deals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const pending = (data.deals || []).filter(
          (d: EscrowDeal) =>
            d.payment_status === 'PENDING' &&
            ['SIGNING', 'LOGISTICS', 'PRODUCTION', 'REVIEW', 'APPROVED'].includes(d.status)
        );
        setPendingEscrowDeals(pending);
      }
    } catch (e) {
      console.error('Escrow deals fetch error:', e);
    } finally {
      setEscrowLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await apiCall(`/api/campaigns/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPendingEscrowDeals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || user?.email}!</p>
          </div>
          <CreateCampaignModal onCampaignCreated={fetchDashboardData} />
        </div>

        {/* ── Escrow Vault Panel ── */}
        {pendingEscrowDeals.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <span className="text-3xl">🔐</span>
              <div>
                <h2 className="text-lg font-bold text-amber-900">Escrow Vault — Action Required</h2>
                <p className="text-sm text-amber-700 mt-1">
                  The creators below are waiting to start. Fund escrow upfront to unlock their priority slot and give them confidence to begin.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {pendingEscrowDeals.map(deal => (
                <div key={deal.id} className="bg-white rounded-xl border border-amber-100 p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                          {deal.status}
                        </span>
                        <span className="text-xs text-gray-400">Deal #{deal.id}</span>
                      </div>
                      <p className="font-semibold text-gray-900">Creator: {deal.creator_name || 'Assigned Creator'}</p>
                      {deal.deliverables && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{deal.deliverables}</p>}
                      <p className="text-sm font-bold text-indigo-700 mt-2">
                        {deal.currency || '₹'} {Number(deal.amount).toLocaleString('en-IN')} — awaiting escrow
                      </p>
                    </div>

                    <div className="shrink-0">
                      {fundingDealId === deal.id ? (
                        <RazorpayCheckout
                          dealId={deal.id}
                          amount={deal.amount}
                          currency={deal.currency || 'INR'}
                          onSuccess={() => {
                            setFundingDealId(null);
                            fetchPendingEscrowDeals();
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => setFundingDealId(deal.id)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200 flex items-center gap-2"
                        >
                          <span>💳</span> Add Funds to Escrow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-amber-700">
              <span>✅ You hold all control — funds only release after your approval</span>
              <span>✅ Creators prioritize funded campaigns</span>
              <span>✅ Zero administrative friction — one transfer, we handle payouts</span>
            </div>
          </div>
        )}

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalApplicants}</div>
              <p className="text-xs text-muted-foreground mt-1 text-gray-400">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Number(metrics.totalSpent).toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground mt-1 text-gray-400">Lifetime spend</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Escrow Guarantee Banner (static info) ── */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">🚀 Escrow-First Advantage</h3>
              <p className="text-sm text-indigo-100">
                Fund your campaign upfront and <strong className="text-white">jump to the front of the creator queue</strong>. Top creators prioritize funded deals for faster turnaround.
                Your money is safe — released <em>only</em> after you approve the final content.
              </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-3 text-sm">
              {[
                ['🔒', 'Risk-Free', 'Approve before release'],
                ['⚡', 'Priority Queue', 'Funded = faster delivery'],
                ['📋', 'Zero Invoices', 'One transfer, we handle rest'],
                ['✅', '0% Fees', 'Net payout to creator'],
              ].map(([icon, title, desc]) => (
                <div key={title as string} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="font-semibold text-xs">{title as string}</div>
                  <div className="text-indigo-200 text-[10px] mt-0.5">{desc as string}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Campaigns Table ── */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveCampaignsTable
              campaigns={campaigns}
              isLoading={isLoading}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandDashboard;
