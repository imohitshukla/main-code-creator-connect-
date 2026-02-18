import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import ActiveCampaignsTable from '../components/dashboard/ActiveCampaignsTable';
import CreateCampaignModal from '../components/dashboard/CreateCampaignModal';
import { apiCall } from '@/utils/apiHelper';

const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeCount: 0,
    totalApplicants: 0,
    totalSpent: 0
  });

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await apiCall(`/api/campaigns/${id}`, { method: 'DELETE' });
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
                Across all campaigns
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
                Lifetime spend
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
