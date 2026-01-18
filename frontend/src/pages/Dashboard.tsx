import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import AnalyticsChart from '../components/AnalyticsChart';
import { useAuth } from '../contexts/AuthContext';

interface DashboardData {
  id: number;
  title: string;
  status: string;
  proposal_count?: number;
  avg_engagement?: number;
  avg_roi?: number;
  proposal_status?: string;
  engagement_rate?: number;
  roi?: number;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/campaigns/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDashboardData(data.dashboard || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {user?.role === 'brand' ? 'Brand Dashboard' : 'Creator Dashboard'}
        {user?.role === 'creator' && (
          <Button variant="outline" size="sm" className="ml-4 gap-2" onClick={() => window.location.href = '/profile-setup'}>
            ✏️ Edit Profile
          </Button>
        )}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {user?.role === 'brand' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.length > 0
                    ? (dashboardData.reduce((sum, item) => sum + (item.avg_engagement || 0), 0) / dashboardData.length).toFixed(2)
                    : '0.00'}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData.length > 0
                    ? (dashboardData.reduce((sum, item) => sum + (item.avg_roi || 0), 0) / dashboardData.length).toFixed(2)
                    : '0.00'}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Applied Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Accepted Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.filter(item => item.proposal_status === 'accepted').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.length > 0
                    ? (dashboardData.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / dashboardData.length).toFixed(2)
                    : '0.00'}%
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(item.status || item.proposal_status || '')}>
                        {item.status || item.proposal_status}
                      </Badge>
                      {user?.role === 'brand' && item.proposal_count !== undefined && (
                        <span className="text-sm text-gray-600">
                          {item.proposal_count} proposals
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.engagement_rate && (
                      <div className="text-sm text-gray-600">
                        Engagement: {item.engagement_rate.toFixed(2)}%
                      </div>
                    )}
                    {item.roi && (
                      <div className="text-sm text-gray-600">
                        ROI: ${item.roi.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AnalyticsChart data={dashboardData} />
      </div>
    </div>
  );
};

export default Dashboard;
