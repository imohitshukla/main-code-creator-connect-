import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import ActiveCampaignsTable from '../components/dashboard/ActiveCampaignsTable';
import CreateCampaignModal from '../components/dashboard/CreateCampaignModal';
import { getApiUrl } from '@/lib/utils';

const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeCount: 0,
    totalApplicants: 0,
    totalSpent: 0
  });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${getApiUrl()}/api/campaigns/my-campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        // Calculate simple metrics
        const active = data.campaigns.filter((c: any) => c.status === 'ACTIVE').length;
        setMetrics(prev => ({ ...prev, activeCount: active }));
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${getApiUrl()}/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCampaigns(); // Refresh
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || user?.email}!</p>
          </div>
          <CreateCampaignModal onCampaignCreated={fetchCampaigns} />
        </div>

        {/* Quick Stats */}
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
              <p className="text-xs text-muted-foreground mt-1 text-gray-400">
                (Coming in Phase 2)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalSpent}</div>
              <p className="text-xs text-muted-foreground mt-1 text-gray-400">
                (Coming in Phase 4)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns Table */}
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
