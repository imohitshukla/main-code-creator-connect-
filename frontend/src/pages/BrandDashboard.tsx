import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const pastCampaigns: any[] = []; // Mock data to prevent build error

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name || user?.email}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">186%</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Summer Collection Launch</h3>
                  <p className="text-sm text-gray-600">5 creators engaged</p>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Brand Awareness Campaign</h3>
                  <p className="text-sm text-gray-600">8 creators engaged</p>
                </div>
                <Badge className="bg-yellow-500">Pending</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Product Launch Campaign</h3>
                  <p className="text-sm text-gray-600">3 creators engaged</p>
                </div>
                <Badge className="bg-blue-500">Planning</Badge>
              </div>
            </div>

            <Button className="w-full mt-4">View All Campaigns</Button>
          </CardContent>
        </Card>
      </div>


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
