import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FraudDetection from '@/components/FraudDetection';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface CreatorProfile {
  id: number;
  user_id: number;
  name?: string;
  bio: string;
  niche: string;
  followers: number;
  engagement_rate: number;
  fraud_score?: number;
  last_fraud_check?: string;
  verified?: boolean;
}

interface AdminStats {
  totalCreators: number;
  verifiedCreators: number;
  pendingVerification: number;
  highRiskCreators: number;
  totalCampaigns: number;
  activeCampaigns: number;
}

const AdminDashboard = () => {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [creatorsRes, statsRes] = await Promise.all([
        fetch('/api/admin/creators', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (creatorsRes.ok) {
        const creatorsData = await creatorsRes.json();
        setCreators(creatorsData.creators || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (fraudScore?: number) => {
    if (!fraudScore) return 'Unknown';
    if (fraudScore < 0.3) return 'Low';
    if (fraudScore < 0.7) return 'Medium';
    return 'High';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerificationComplete = (verified: boolean) => {
    if (selectedCreator) {
      setCreators(prev => prev.map(creator =>
        creator.id === selectedCreator.id
          ? { ...creator, verified, fraud_score: verified ? 0.1 : 0.8 }
          : creator
      ));
      setSelectedCreator(null);
      fetchAdminData(); // Refresh stats
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading admin dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCreators}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Creators</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedCreators}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highRiskCreators}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="creators" className="space-y-6">
        <TabsList>
          <TabsTrigger value="creators">Creator Management</TabsTrigger>
          <TabsTrigger value="fraud-detection">Fraud Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator Profiles</CardTitle>
              <CardDescription>
                Manage and monitor creator accounts, verification status, and risk levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creators.map((creator) => (
                  <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Creator {creator.id}</h3>
                        <Badge className={getRiskColor(getRiskLevel(creator.fraud_score))}>
                          {getRiskLevel(creator.fraud_score)} Risk
                        </Badge>
                        {creator.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {creator.niche} • {creator.followers?.toLocaleString() || 0} followers • {creator.engagement_rate}% engagement
                      </p>
                      {creator.last_fraud_check && (
                        <p className="text-xs text-muted-foreground">
                          Last checked: {new Date(creator.last_fraud_check).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCreator(creator)}
                      >
                        Run Fraud Check
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud-detection" className="space-y-6">
          {selectedCreator ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Fraud Detection for Creator {selectedCreator.id}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCreator(null)}
                >
                  Back to List
                </Button>
              </div>
              <FraudDetection
                creatorId={selectedCreator.id}
                creatorName={`Creator ${selectedCreator.id}`}
                onVerificationComplete={handleVerificationComplete}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a Creator</h3>
                <p className="text-muted-foreground">
                  Choose a creator from the management tab to run fraud detection analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
