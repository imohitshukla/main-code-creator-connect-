import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, TrendingUp, Activity, DollarSign, Eye, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

const AUTH_HEADERS = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
});

// ── Types ──
interface PlatformMetrics {
  totalBrands: number; totalCreators: number; totalDeals: number;
  activeDeals: number; completedDeals: number; totalPlatformVolume: number;
  avgDealSize: number; sessionsLast24h: number;
}
interface AuditLog {
  id: number; user_id: number; user_email: string; role: string;
  ip_address: string; device_info: string; logged_in_at: string;
}
interface PitchItem {
  deal_id: number; status: string; fixed_amount: number; currency: string;
  created_at: string; updated_at: string; payment_type: string;
  product_name: string; product_mrp: number; brand_name: string;
  creator_name: string; brand_email: string; creator_email: string;
  current_stage_metadata: any;
}
interface Financials {
  totalVolume: number; activeValue: number; avgDealSize: number;
  totalDeals: number; completedDeals: number;
}

const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const formatTime = (s: string) => new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusColors: Record<string, string> = {
  OFFER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SIGNING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOGISTICS: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  PRODUCTION: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  REVIEW: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const roleColors: Record<string, string> = {
  brand: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  creator: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

// ── Stat Card ──
function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card className="relative overflow-hidden border-0" style={{ background: 'linear-gradient(135deg, rgba(15,15,25,0.95), rgba(25,25,45,0.95))', borderLeft: `3px solid ${color}` }}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </div>
          <div className="p-3 rounded-xl" style={{ background: `${color}22` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ──
const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pitchMatrix, setPitchMatrix] = useState<PitchItem[]>([]);
  const [financials, setFinancials] = useState<Financials | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [overviewRes, logsRes, pitchRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/admin/platform-overview`, { headers: AUTH_HEADERS() }),
        fetch(`${getApiUrl()}/api/admin/audit-logs`, { headers: AUTH_HEADERS() }),
        fetch(`${getApiUrl()}/api/admin/pitch-matrix`, { headers: AUTH_HEADERS() }),
      ]);
      if (overviewRes.ok) { const d = await overviewRes.json(); setMetrics(d.metrics); }
      if (logsRes.ok) { const d = await logsRes.json(); setAuditLogs(d.sessions || []); }
      if (pitchRes.ok) { const d = await pitchRes.json(); setPitchMatrix(d.pitchMatrix || []); setFinancials(d.financials || null); }
    } catch (e) {
      console.error('Admin fetch error:', e);
      if (!silent) toast({ title: 'Error', description: 'Failed to load admin data', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
        <p className="text-gray-400 text-sm animate-pulse">Loading Admin Oversight Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #0f0f1e 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Shield className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Oversight</h1>
              <p className="text-xs text-gray-500">Real-time platform intelligence</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchAll(true)} disabled={refreshing}
            className="border-gray-700 text-gray-400 hover:text-white hover:border-indigo-500/50 bg-transparent">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>

        {/* Stat Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Brands" value={metrics.totalBrands} color="#818cf8" />
            <StatCard icon={Users} label="Total Creators" value={metrics.totalCreators} color="#a78bfa" />
            <StatCard icon={Activity} label="Active Deals" value={metrics.activeDeals} sub={`${metrics.totalDeals} total`} color="#34d399" />
            <StatCard icon={DollarSign} label="Platform Volume" value={formatINR(metrics.totalPlatformVolume)} sub={`Avg ${formatINR(metrics.avgDealSize)}/deal`} color="#fbbf24" />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="traffic" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800 p-1">
            <TabsTrigger value="traffic" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-gray-400">
              <Eye className="h-4 w-4 mr-2" /> Live Traffic
            </TabsTrigger>
            <TabsTrigger value="pitch" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400 text-gray-400">
              <ArrowRightLeft className="h-4 w-4 mr-2" /> Pitch Matrix
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-gray-400">
              <DollarSign className="h-4 w-4 mr-2" /> Financial
            </TabsTrigger>
            <TabsTrigger value="creators" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-gray-400">
              <Users className="h-4 w-4 mr-2" /> Creators
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Live Traffic Monitor ── */}
          <TabsContent value="traffic">
            <Card className="border-0" style={{ background: 'rgba(15,15,25,0.9)' }}>
              <CardHeader className="border-b border-gray-800/50 pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Live Login Sessions
                  <span className="text-xs font-normal text-gray-500 ml-2">Auto-refreshes every 30s</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {auditLogs.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No login sessions recorded yet. Sessions will appear here as users log in.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800/50">
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Timestamp</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">User Email</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Role</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">IP Address</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                            <td className="p-4 text-gray-300 font-mono text-xs">{formatTime(log.logged_in_at)}</td>
                            <td className="p-4 text-white font-medium">{log.user_email}</td>
                            <td className="p-4">
                              <Badge className={`${roleColors[log.role.toLowerCase()] || 'bg-gray-500/20 text-gray-400'} border text-xs`}>
                                {log.role.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-400 font-mono text-xs">{log.ip_address}</td>
                            <td className="p-4 text-gray-500 text-xs max-w-[200px] truncate">{log.device_info}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: Pitch Matrix ── */}
          <TabsContent value="pitch">
            <Card className="border-0" style={{ background: 'rgba(15,15,25,0.9)' }}>
              <CardHeader className="border-b border-gray-800/50 pb-4">
                <CardTitle className="text-white">Active Pitch Matrix — Brand ↔ Creator Connections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pitchMatrix.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No deals created yet. Pitches will appear here when brands reach out to creators.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800/50">
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Date</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Brand</th>
                          <th className="text-center p-4 text-gray-500 font-medium text-xs uppercase">→</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Creator</th>
                          <th className="text-right p-4 text-gray-500 font-medium text-xs uppercase">Amount</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Type</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pitchMatrix.map((p) => (
                          <tr key={p.deal_id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                            <td className="p-4 text-gray-300 font-mono text-xs">{formatTime(p.created_at)}</td>
                            <td className="p-4">
                              <p className="text-white font-medium">{p.brand_name || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">{p.brand_email}</p>
                            </td>
                            <td className="text-center p-4 text-gray-600">→</td>
                            <td className="p-4">
                              <p className="text-white font-medium">{p.creator_name || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">{p.creator_email}</p>
                            </td>
                            <td className="p-4 text-right text-white font-mono">{formatINR(p.fixed_amount)}</td>
                            <td className="p-4">
                              <span className="text-gray-400 text-xs">{p.payment_type || 'CASH'}</span>
                              {p.product_name && <p className="text-gray-500 text-xs mt-0.5">🎁 {p.product_name}</p>}
                            </td>
                            <td className="p-4">
                              <Badge className={`${statusColors[p.status] || 'bg-gray-500/20 text-gray-400'} border text-xs`}>
                                {p.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: Financial Oversight ── */}
          <TabsContent value="finance">
            {financials && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard icon={DollarSign} label="Total Contract Value" value={formatINR(financials.totalVolume)} color="#fbbf24" />
                <StatCard icon={TrendingUp} label="Active Pipeline Value" value={formatINR(financials.activeValue)} color="#34d399" />
                <StatCard icon={Activity} label="Avg Deal Size" value={formatINR(financials.avgDealSize)} sub={`${financials.completedDeals} completed`} color="#818cf8" />
              </div>
            )}
            <Card className="border-0" style={{ background: 'rgba(15,15,25,0.9)' }}>
              <CardHeader className="border-b border-gray-800/50 pb-4">
                <CardTitle className="text-white">Per-Deal Financial Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pitchMatrix.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No financial data available yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800/50">
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Deal #</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Parties</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Payment Type</th>
                          <th className="text-right p-4 text-gray-500 font-medium text-xs uppercase">Fixed Amount</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Product (Barter)</th>
                          <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase">Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pitchMatrix.map((p) => (
                          <tr key={`fin-${p.deal_id}`} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                            <td className="p-4 text-indigo-400 font-mono">#{p.deal_id}</td>
                            <td className="p-4">
                              <span className="text-white">{p.brand_name}</span>
                              <span className="text-gray-600 mx-2">→</span>
                              <span className="text-white">{p.creator_name}</span>
                            </td>
                            <td className="p-4">
                              <Badge className="bg-gray-800 text-gray-300 border border-gray-700 text-xs">{p.payment_type || 'CASH'}</Badge>
                            </td>
                            <td className="p-4 text-right text-emerald-400 font-mono font-bold">{formatINR(p.fixed_amount)}</td>
                            <td className="p-4 text-gray-400 text-xs">
                              {p.product_name ? `${p.product_name} (MRP: ${formatINR(p.product_mrp)})` : '—'}
                            </td>
                            <td className="p-4">
                              <Badge className={`${statusColors[p.status] || 'bg-gray-500/20 text-gray-400'} border text-xs`}>{p.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 4: Creators (preserved) ── */}
          <TabsContent value="creators">
            <CreatorManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ── Creator Management Sub-Component ──
function CreatorManagement() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiUrl()}/api/admin/creators`, { headers: AUTH_HEADERS() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setCreators(d.creators || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-gray-400 py-12">Loading creators...</div>;

  return (
    <Card className="border-0" style={{ background: 'rgba(15,15,25,0.9)' }}>
      <CardHeader className="border-b border-gray-800/50 pb-4">
        <CardTitle className="text-white">Creator Profiles ({creators.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-800/30">
          {creators.map((c: any) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors">
              <div>
                <p className="text-white font-medium">{c.name || c.email || `Creator #${c.id}`}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {c.niche || 'General'} • {Number(c.followers || 0).toLocaleString()} followers
                  {c.engagement_rate ? ` • ${Number(c.engagement_rate).toFixed(1)}% engagement` : ''}
                </p>
                <p className="text-gray-600 text-xs">{c.email}</p>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">ID: {c.user_id}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
