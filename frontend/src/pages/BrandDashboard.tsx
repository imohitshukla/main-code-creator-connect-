import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CampaignData {
  id: number;
  title: string;
  status: string;
  creator_name?: string;
  creator_status?: string;
  content_approved?: boolean;
  views?: number;
  ctr?: number;
  roi?: number;
}

const BrandDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBrandDashboardData();
  }, []);

  const fetchBrandDashboardData = async () => {
    try {
      const response = await fetch('/api/campaigns/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      // Transform data to include creator info and approvals
      const transformedData = data.dashboard?.map((item: any) => ({
        ...item,
        creator_name: 'Creator Name', // Placeholder
        creator_status: 'Active', // Placeholder
        content_approved: Math.random() > 0.5, // Placeholder
        views: Math.floor(Math.random() * 10000),
        ctr: Math.random() * 5,
        roi: Math.random() * 200
      })) || [];
      setCampaigns(transformedData);
    } catch (error) {
      console.error('Failed to fetch brand dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pastCampaigns = campaigns.filter(c => c.status === 'completed');

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Brand Campaign Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(campaigns.reduce((sum, c) => sum + (c.ctr || 0), 0) / campaigns.length).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / campaigns.length.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeCampaigns.length === 0 ? (
              <p className="text-muted-foreground">No active campaigns</p>
            ) : (
              activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Creator:</span>
                        <span className="text-sm font-medium">{campaign.creator_name}</span>
                        <Badge className={getStatusColor(campaign.creator_status || '')}>
                          {campaign.creator_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Content:</span>
                        <Badge variant={campaign.content_approved ? 'default' : 'secondary'}>
                          {campaign.content_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/messages?campaign=${campaign.id}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Past Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastCampaigns.length === 0 ? (
              <p className="text-muted-foreground">No past campaigns</p>
            ) : (
              pastCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Creator:</span>
                        <span className="text-sm font-medium">{campaign.creator_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Performance:</span>
                        <span className="text-sm">Views: {campaign.views?.toLocaleString()}</span>
                        <span className="text-sm">CTR: {campaign.ctr?.toFixed(2)}%</span>
                        <span className="text-sm">ROI: ${campaign.roi?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/messages?campaign=${campaign.id}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandDashboard;
